'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'
import GridLayer from './GridLayer'
import EquipmentLayer from './EquipmentLayer'
import BackgroundLayer, { BackgroundImage } from './BackgroundLayer'
import BackgroundImageManager from './BackgroundImageManager'
import ScaleBar from './ScaleBar'
import MeasurementTool, { type Measurement } from './MeasurementTool'
import DistanceInputModal from './DistanceInputModal'
import SimpleMeasurementTool, { SimpleMeasurement } from './SimpleMeasurementTool'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'

interface CanvasEditorProps {
  width?: number
  height?: number
  className?: string
  onEquipmentAdd?: (equipment: EquipmentItem, x: number, y: number) => void
  placedEquipment?: PlacedEquipment[]
  equipmentDefinitions?: EquipmentItem[]
  onEquipmentSelect?: (equipment: PlacedEquipment | null) => void
  onEquipmentMove?: (equipmentId: string, x: number, y: number) => void
  onEquipmentRotate?: (equipmentId: string, rotation: number) => void
  onEquipmentDelete?: (equipmentId: string) => void
  selectedEquipmentId?: string
  backgroundImages?: BackgroundImage[]
  onBackgroundImageAdd?: (image: Omit<BackgroundImage, 'id'>) => void
  onBackgroundImageUpdate?: (imageId: string, updates: Partial<BackgroundImage>) => void
  onBackgroundImageDelete?: (imageId: string) => void
  onCanvasReady?: (canvasElement: HTMLElement) => void
}

interface CanvasState {
  scale: number
  x: number
  y: number
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  width = 1200,
  height = 800,
  className = '',
  onEquipmentAdd,
  placedEquipment = [],
  equipmentDefinitions,
  onEquipmentSelect,
  onEquipmentMove,
  onEquipmentRotate,
  onEquipmentDelete,
  selectedEquipmentId,
  backgroundImages = [],
  onBackgroundImageAdd,
  onBackgroundImageUpdate,
  onBackgroundImageDelete,
  onCanvasReady
}) => {
  const stageRef = useRef<Konva.Stage>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Canvas configuration for 250,000 sq ft (500ft x 500ft)
  const CANVAS_AREA_SQ_FT = 250000
  const CANVAS_SIDE_FT = Math.sqrt(CANVAS_AREA_SQ_FT) // 500 feet
  const PIXELS_PER_FOOT = 10 // Reduced from 50 to 10 for better performance with large areas
  const CANVAS_SIZE_PIXELS = CANVAS_SIDE_FT * PIXELS_PER_FOOT // 5000 pixels
  
  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 0.2, // Start zoomed out to see more of the large area
    x: 0,
    y: 0
  })
  const [stageSize, setStageSize] = useState({ width, height })
  const [gridVisible, setGridVisible] = useState(true)
  const [backgroundManagerOpen, setBackgroundManagerOpen] = useState(false)
  const [selectedBackgroundImageId, setSelectedBackgroundImageId] = useState<string | null>(null)
  const [scaleBarVisible, setScaleBarVisible] = useState(true)
  const [measurementToolActive, setMeasurementToolActive] = useState(false)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [activeMeasurementTool, setActiveMeasurementTool] = useState<'area' | 'perimeter' | 'distance' | null>(null)
  const [simpleMeasurements, setSimpleMeasurements] = useState<SimpleMeasurement[]>([])
  const [showDistanceInput, setShowDistanceInput] = useState(false)
  const [distanceInputData, setDistanceInputData] = useState<{
    calculatedDistance: number;
    onSubmit: (actualDistance: number) => void;
    onCancel: () => void;
  } | null>(null)

  // Handle canvas ready callback
  useEffect(() => {
    if (isClient && onCanvasReady) {
      // Use a timeout to ensure the stage is fully mounted
      const timeout = setTimeout(() => {
        if (stageRef.current) {
          const container = stageRef.current.container()
          if (container) {
            console.log('Canvas ready, calling onCanvasReady with container:', container)
            onCanvasReady(container)
          }
        }
      }, 100) // Small delay to ensure stage is mounted
      
      return () => clearTimeout(timeout)
    }
  }, [onCanvasReady, isClient])

  // Handle window resize to make canvas responsive
  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) {
        const container = stageRef.current.container()
        const containerWidth = container.offsetWidth
        const containerHeight = container.offsetHeight
        
        setStageSize({
          width: containerWidth,
          height: containerHeight
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial call

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    const stage = e.target.getStage()
    if (!stage) return

    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // Zoom sensitivity
    const scaleBy = 1.1
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

    // Limit zoom range
    const minScale = 0.1
    const maxScale = 5
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale))

    // Calculate new position to zoom towards mouse pointer
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    }

    stage.scale({ x: clampedScale, y: clampedScale })
    stage.position(newPos)
    stage.batchDraw()

    setCanvasState({
      scale: clampedScale,
      x: newPos.x,
      y: newPos.y
    })
  }, [])

  // Handle panning with mouse drag
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target as Konva.Stage
    setCanvasState(prev => ({
      ...prev,
      x: stage.x(),
      y: stage.y()
    }))
  }, [])

  // Reset canvas to center and default zoom for 250k sq ft canvas
  const resetCanvas = useCallback(() => {
    const defaultScale = 0.2 // 20% zoom for large canvas overview
    const centerX = (stageSize.width / 2) - (CANVAS_SIZE_PIXELS / 2 * defaultScale)
    const centerY = (stageSize.height / 2) - (CANVAS_SIZE_PIXELS / 2 * defaultScale)
    
    if (stageRef.current) {
      stageRef.current.scale({ x: defaultScale, y: defaultScale })
      stageRef.current.position({ x: centerX, y: centerY })
      stageRef.current.batchDraw()
    }
    
    setCanvasState({
      scale: defaultScale,
      x: centerX,
      y: centerY
    })
  }, [stageSize, CANVAS_SIZE_PIXELS])

  // Fit canvas to show all equipment with proper centering and zoom
  const fitToContent = useCallback(() => {
    console.log('=== FIT TO CONTENT CALLED ===')
    console.log('placedEquipment:', placedEquipment)
    
    if (!placedEquipment || placedEquipment.length === 0) {
      console.log('No equipment to fit to, resetting canvas')
      resetCanvas()
      return
    }

    // Calculate bounding box of all equipment including their clearance zones
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity

    placedEquipment.forEach(equipment => {
      const equipmentDef = equipmentDefinitions?.find(def => def.id === equipment.equipmentId)
      if (!equipmentDef) return

      const dimensions = equipment.dimensions
      const isCircular = dimensions.shape === 'circle'
      
      // Calculate equipment bounds including clearance
      const clearance = equipmentDef.rideClearing || 0
      const clearancePixels = clearance * PIXELS_PER_FOOT
      
      let equipmentMinX, equipmentMaxX, equipmentMinY, equipmentMaxY
      
      if (isCircular) {
        const radius = (dimensions as any).radius * PIXELS_PER_FOOT
        equipmentMinX = equipment.x - radius - clearancePixels
        equipmentMaxX = equipment.x + radius + clearancePixels
        equipmentMinY = equipment.y - radius - clearancePixels
        equipmentMaxY = equipment.y + radius + clearancePixels
      } else {
        const width = (dimensions as any).width * PIXELS_PER_FOOT
        const height = (dimensions as any).height * PIXELS_PER_FOOT
        equipmentMinX = equipment.x - width/2 - clearancePixels
        equipmentMaxX = equipment.x + width/2 + clearancePixels
        equipmentMinY = equipment.y - height/2 - clearancePixels
        equipmentMaxY = equipment.y + height/2 + clearancePixels
      }
      
      minX = Math.min(minX, equipmentMinX)
      maxX = Math.max(maxX, equipmentMaxX)
      minY = Math.min(minY, equipmentMinY)
      maxY = Math.max(maxY, equipmentMaxY)
    })

    // Add padding around the bounding box
    const padding = 100 // 100 pixels padding
    minX -= padding
    maxX += padding
    minY -= padding
    maxY += padding

    // Calculate the center of all equipment
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // Calculate required scale to fit all equipment in viewport
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const scaleX = stageSize.width / contentWidth
    const scaleY = stageSize.height / contentHeight
    const optimalScale = Math.min(scaleX, scaleY, 2) // Cap at 2x zoom

    // Calculate the position to center the content
    const newX = (stageSize.width / 2) - (centerX * optimalScale)
    const newY = (stageSize.height / 2) - (centerY * optimalScale)

    // Apply the new view settings to both stage and state
    console.log('Applying new canvas state:', {
      scale: optimalScale,
      x: newX,
      y: newY,
      contentBounds: { minX, maxX, minY, maxY },
      center: { centerX, centerY }
    })
    
    if (stageRef.current) {
      stageRef.current.scale({ x: optimalScale, y: optimalScale })
      stageRef.current.position({ x: newX, y: newY })
      stageRef.current.batchDraw()
    }
    
    setCanvasState({
      scale: optimalScale,
      x: newX,
      y: newY
    })
  }, [placedEquipment, equipmentDefinitions, stageSize, resetCanvas])

  // Calculate visible bounds for performance optimization
  const getVisibleBounds = useCallback(() => {
    const buffer = 1000 // pixels buffer for smooth scrolling
    return {
      minX: (-canvasState.x / canvasState.scale) - buffer,
      maxX: ((-canvasState.x + stageSize.width) / canvasState.scale) + buffer,
      minY: (-canvasState.y / canvasState.scale) - buffer,
      maxY: ((-canvasState.y + stageSize.height) / canvasState.scale) + buffer
    }
  }, [canvasState.x, canvasState.y, canvasState.scale, stageSize])

  // Handle measurement tool clicks
  const handleMeasurementToolClick = useCallback((x: number, y: number) => {
    console.log('handleMeasurementToolClick called:', { x, y, activeMeasurementTool })
    if (!activeMeasurementTool) return
    
    // Forward click to SimpleMeasurementTool via global handlers
    const handlers = (window as any).measurementToolHandlers
    console.log('Global handlers:', handlers)
    if (handlers && handlers.handleClick) {
      console.log('Calling handlers.handleClick')
      handlers.handleClick(x, y)
    } else {
      console.log('No global handlers found')
    }
  }, [activeMeasurementTool])

  // Handle double-click to complete area/perimeter measurements
  const handleMeasurementToolDoubleClick = useCallback((x: number, y: number) => {
    if (!activeMeasurementTool) return
    
    console.log('Double-click for measurement tool:', { x, y, activeMeasurementTool })
    
    // Find incomplete measurement
    const currentMeasurement = simpleMeasurements.find(m => !m.completed)
    if (!currentMeasurement || currentMeasurement.points.length < 2) return
    
    let value = 0
    let label = ''
    
    if (activeMeasurementTool === 'area') {
      // Calculate area using shoelace formula
      if (currentMeasurement.points.length < 3) return
      
      let area = 0
      const points = currentMeasurement.points
      const n = points.length
      
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        area += points[i].x * points[j].y
        area -= points[j].x * points[i].y
      }
      
      area = Math.abs(area) / 2
      value = area / (PIXELS_PER_FOOT * PIXELS_PER_FOOT) // Convert to square feet
      label = `Area: ${value.toFixed(0)} sq ft`
      
    } else if (activeMeasurementTool === 'perimeter') {
      // Calculate perimeter
      let perimeter = 0
      const points = currentMeasurement.points
      
      for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1].x - points[i].x
        const dy = points[i + 1].y - points[i].y
        perimeter += Math.sqrt(dx * dx + dy * dy)
      }
      
      // Close the perimeter (connect last point to first)
      if (points.length > 2) {
        const dx = points[0].x - points[points.length - 1].x
        const dy = points[0].y - points[points.length - 1].y
        perimeter += Math.sqrt(dx * dx + dy * dy)
      }
      
      value = perimeter / PIXELS_PER_FOOT // Convert to feet
      label = `Perimeter: ${value.toFixed(0)} ft`
    }
    
    // Complete the measurement
    const completedMeasurement: SimpleMeasurement = {
      ...currentMeasurement,
      value,
      label,
      completed: true
    }
    
    setSimpleMeasurements(prev => 
      prev.map(m => m.id === currentMeasurement.id ? completedMeasurement : m)
    )
    
    console.log('Measurement completed:', completedMeasurement)
  }, [activeMeasurementTool, simpleMeasurements, PIXELS_PER_FOOT])

  // Handle canvas clicks for measurement tools
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (!activeMeasurementTool) return
    
    console.log('Canvas click for measurement tool (raw):', { x, y, activeMeasurementTool })
    
    // Transform screen coordinates to canvas coordinates
    // Account for canvas zoom and pan
    const canvasX = (x - canvasState.x) / canvasState.scale
    const canvasY = (y - canvasState.y) / canvasState.scale
    
    console.log('Canvas click for measurement tool (transformed):', { canvasX, canvasY, canvasState })
    
    const newPoint = { x: canvasX, y: canvasY }
    
    if (simpleMeasurements.some(m => !m.completed)) {
      // Continue existing measurement
      const currentMeasurement = simpleMeasurements.find(m => !m.completed)
      if (currentMeasurement) {
        const updatedPoints = [...currentMeasurement.points, newPoint]
        
        // For distance tool, complete after 2 points
        if (activeMeasurementTool === 'distance' && updatedPoints.length === 2) {
          const distance = Math.sqrt(
            Math.pow(updatedPoints[1].x - updatedPoints[0].x, 2) + 
            Math.pow(updatedPoints[1].y - updatedPoints[0].y, 2)
          ) / PIXELS_PER_FOOT
          
          const completedMeasurement: SimpleMeasurement = {
            ...currentMeasurement,
            points: updatedPoints,
            value: distance,
            label: `Distance: ${distance.toFixed(0)} ft`,
            completed: true
          }
          
          setSimpleMeasurements(prev => 
            prev.map(m => m.id === currentMeasurement.id ? completedMeasurement : m)
          )
        } else {
          // Update current measurement with new point
          setSimpleMeasurements(prev => 
            prev.map(m => m.id === currentMeasurement.id ? { ...m, points: updatedPoints } : m)
          )
        }
      }
    } else {
      // Start new measurement
      const newMeasurement: SimpleMeasurement = {
        id: `${activeMeasurementTool}-${Date.now()}`,
        type: activeMeasurementTool,
        points: [newPoint],
        value: 0,
        label: '',
        completed: false
      }
      
      setSimpleMeasurements(prev => [...prev, newMeasurement])
    }
  }, [activeMeasurementTool, simpleMeasurements, PIXELS_PER_FOOT])
  
  // Handle stage click to deselect equipment when clicking on empty canvas
  const handleStageClick = useCallback((e: any) => {
    // Check if we clicked on the stage itself (not on any equipment)
    const clickedOnEmpty = e.target === e.target.getStage()
    
    if (clickedOnEmpty) {
      const stage = e.target.getStage()
      const pos = stage.getPointerPosition()
      
      // If a measurement tool is active, handle the click for measurement
      if (activeMeasurementTool && pos) {
        handleCanvasClick(pos.x, pos.y)
        return
      }
      
      // Otherwise, deselect equipment
      onEquipmentSelect?.(null)
      setSelectedBackgroundImageId(null)
    }
  }, [onEquipmentSelect, activeMeasurementTool, handleCanvasClick])
  
  // Handle stage double click for measurement tools
  const handleStageDoubleClick = useCallback((e: any) => {
    if (!activeMeasurementTool) return
    
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    
    if (pos) {
      // Transform screen coordinates to canvas coordinates
      const canvasX = (pos.x - canvasState.x) / canvasState.scale
      const canvasY = (pos.y - canvasState.y) / canvasState.scale
      
      console.log('Double-click for measurement tool:', { x: canvasX, y: canvasY, activeMeasurementTool })
      
      // Complete the current measurement
      setSimpleMeasurements(prev => {
        const currentMeasurement = prev.find(m => !m.completed)
        if (!currentMeasurement) return prev
        
        // Add the final point for area and perimeter measurements
        if (activeMeasurementTool === 'area' || activeMeasurementTool === 'perimeter') {
          const updatedPoints = [...currentMeasurement.points, { x: canvasX, y: canvasY }]
          
          // Calculate the measurement value
          let value = 0
          let label = ''
          
          if (activeMeasurementTool === 'area' && updatedPoints.length >= 3) {
            // Calculate area using shoelace formula
            let area = 0
            for (let i = 0; i < updatedPoints.length; i++) {
              const j = (i + 1) % updatedPoints.length
              area += updatedPoints[i].x * updatedPoints[j].y
              area -= updatedPoints[j].x * updatedPoints[i].y
            }
            area = Math.abs(area) / 2
            
            // Convert from pixels to square feet
            const areaInSqFt = area / (PIXELS_PER_FOOT * PIXELS_PER_FOOT)
            value = Math.round(areaInSqFt)
            label = `Area: ${value.toLocaleString()} sq ft`
          } else if (activeMeasurementTool === 'perimeter' && updatedPoints.length >= 2) {
            // Calculate perimeter (sum of all segments + closing segment)
            let perimeter = 0
            for (let i = 0; i < updatedPoints.length - 1; i++) {
              const dx = updatedPoints[i + 1].x - updatedPoints[i].x
              const dy = updatedPoints[i + 1].y - updatedPoints[i].y
              perimeter += Math.sqrt(dx * dx + dy * dy)
            }
            // Add closing segment
            const dx = updatedPoints[0].x - updatedPoints[updatedPoints.length - 1].x
            const dy = updatedPoints[0].y - updatedPoints[updatedPoints.length - 1].y
            perimeter += Math.sqrt(dx * dx + dy * dy)
            
            // Convert from pixels to feet
            const perimeterInFt = perimeter / PIXELS_PER_FOOT
            value = Math.round(perimeterInFt)
            label = `Perimeter: ${value.toLocaleString()} ft`
          }
          
          console.log('Measurement completed:', { id: currentMeasurement.id, value, label, completed: true })
          
          return prev.map(m => 
            m.id === currentMeasurement.id 
              ? { ...m, points: updatedPoints, value, label, completed: true }
              : m
          )
        }
        
        return prev
      })
      
      // Deactivate the measurement tool
      setActiveMeasurementTool(null)
    }
  }, [activeMeasurementTool, canvasState, PIXELS_PER_FOOT])

  // Background image management functions
  const handleBackgroundImageAdd = useCallback((image: Omit<BackgroundImage, 'id'>) => {
    const imageWithId = {
      ...image,
      id: `bg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    onBackgroundImageAdd?.(imageWithId)
  }, [onBackgroundImageAdd])

  const handleBackgroundImageSelect = (imageId: string | null) => {
    setSelectedBackgroundImageId(imageId)
  }

  const calibrateImageScale = (actualDistance: number, calculatedDistance: number) => {
    // Calculate the scale correction factor
    const scaleCorrection = actualDistance / calculatedDistance
    
    // Apply the correction to all background images
    backgroundImages.forEach(image => {
      if (onBackgroundImageUpdate) {
        onBackgroundImageUpdate(image.id, {
          scaleX: image.scaleX * scaleCorrection,
          scaleY: image.scaleY * scaleCorrection
        })
      }
    })
    
    console.log(`Scale calibrated: ${scaleCorrection.toFixed(3)}x correction applied to ${backgroundImages.length} background images`)
  }

  const handleShowDistanceInput = (
    calculatedDistance: number,
    onSubmit: (actualDistance: number) => void,
    onCancel: () => void
  ) => {
    setDistanceInputData({
      calculatedDistance,
      onSubmit: (actualDistance: number) => {
        // Calibrate the image scale automatically
        calibrateImageScale(actualDistance, calculatedDistance)
        
        onSubmit(actualDistance)
        setShowDistanceInput(false)
        setDistanceInputData(null)
      },
      onCancel: () => {
        onCancel()
        setShowDistanceInput(false)
        setDistanceInputData(null)
      }
    })
    setShowDistanceInput(true)
  }

  // Ensure client-side only rendering to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render canvas during SSR to prevent hydration mismatches
  if (!isClient) {
    return (
      <div className={`relative w-full h-full ${className} flex items-center justify-center bg-gray-50`}>
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={resetCanvas}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 text-sm"
          title="Reset View"
        >
          Reset
        </button>
        <button
          onClick={fitToContent}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 text-sm"
          title="Fit to Content"
        >
          Fit
        </button>
        <button
          onClick={() => setGridVisible(!gridVisible)}
          className={`px-3 py-1 border rounded shadow text-sm ${
            gridVisible 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          title="Toggle Grid"
        >
          Grid
        </button>
        <button
          onClick={() => setBackgroundManagerOpen(true)}
          className="px-3 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 text-sm"
          title="Manage Background Images"
        >
          Images
        </button>
        <button
          onClick={() => setScaleBarVisible(!scaleBarVisible)}
          className={`px-3 py-1 border rounded shadow text-sm ${
            scaleBarVisible 
              ? 'bg-green-500 text-white border-green-500' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          title="Toggle Scale Bar"
        >
          Scale
        </button>
        <button
          onClick={() => setMeasurementToolActive(!measurementToolActive)}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            measurementToolActive
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          title="Toggle Measurement Tool"
        >
          📏 Measure
        </button>
        
        {/* Advanced Measurement Tools */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveMeasurementTool(activeMeasurementTool === 'area' ? null : 'area')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              activeMeasurementTool === 'area'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            title="Area Measurement Tool"
          >
            📐 Area
          </button>
          
          <button
            onClick={() => setActiveMeasurementTool(activeMeasurementTool === 'perimeter' ? null : 'perimeter')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              activeMeasurementTool === 'perimeter'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            title="Perimeter Measurement Tool"
          >
            📏 Perimeter
          </button>
          
          <button
            onClick={() => setActiveMeasurementTool(activeMeasurementTool === 'distance' ? null : 'distance')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              activeMeasurementTool === 'distance'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            title="Distance Measurement Tool"
          >
            📏 Distance
          </button>
          

        </div>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 px-3 py-2 rounded shadow text-sm">
        <div className="font-medium text-gray-800 mb-1">Canvas: 250,000 sq ft (500&apos; × 500&apos;)</div>
        <div>Zoom: {Math.round(canvasState.scale * 100)}%</div>
        <div>Position: ({Math.round(canvasState.x / PIXELS_PER_FOOT)}&apos;&apos;, {Math.round(canvasState.y / PIXELS_PER_FOOT)}&apos;&apos;)</div>
        <div className="text-xs text-gray-600 mt-1">Scale: {PIXELS_PER_FOOT} px/ft</div>
      </div>

      {/* Konva Stage */}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        draggable={!measurementToolActive && !activeMeasurementTool}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
        onDblClick={handleStageDoubleClick}
        className="border border-gray-300 bg-gray-50"
        onContentMouseDown={() => {
          // Ensure canvas element is captured after stage is fully mounted
          if (stageRef.current && onCanvasReady) {
            const container = stageRef.current.container()
            if (container) {
              console.log('Stage mounted, capturing canvas element:', container)
              onCanvasReady(container)
            }
          }
        }}
      >
        <Layer>
          {/* Background Images Layer */}
          <BackgroundLayer
            images={backgroundImages}
            onImageUpdate={onBackgroundImageUpdate}
            onImageDelete={onBackgroundImageDelete}
            onImageSelect={handleBackgroundImageSelect}
            selectedImageId={selectedBackgroundImageId}
            scale={canvasState.scale}
            editable={true}
          />
          
          {/* Grid Layer */}
          <GridLayer
            width={CANVAS_SIZE_PIXELS}
            height={CANVAS_SIZE_PIXELS}
            scale={canvasState.scale}
            x={canvasState.x}
            y={canvasState.y}
            visible={gridVisible}
            gridSize={PIXELS_PER_FOOT} // 10 pixels = 1 foot for 250k sq ft canvas
          />
          
          {/* Equipment Layer */}
          <EquipmentLayer
            equipment={placedEquipment}
            equipmentDefinitions={equipmentDefinitions}
            scale={canvasState.scale}
            onEquipmentSelect={onEquipmentSelect}
            onEquipmentMove={onEquipmentMove}
            onEquipmentRotate={onEquipmentRotate}
            onEquipmentDelete={onEquipmentDelete}
            selectedEquipmentId={selectedEquipmentId}
            snapToGrid={true}
            gridSize={PIXELS_PER_FOOT}
          />
          
          {/* Measurement Tool */}
          <MeasurementTool
            isActive={measurementToolActive}
            scale={canvasState.scale}
            pixelsPerFoot={PIXELS_PER_FOOT}
            onMeasurementComplete={(measurement) => {
              setMeasurements(prev => [...prev, measurement]);
              console.log('New measurement:', measurement);
            }}
            onShowDistanceInput={handleShowDistanceInput}
          />
          
          {/* Simple Measurement Tools */}
          <SimpleMeasurementTool
            activeTool={activeMeasurementTool}
            scale={canvasState.scale}
            pixelsPerFoot={PIXELS_PER_FOOT}
            measurements={simpleMeasurements}
            onMeasurementComplete={(measurement) => {
              setSimpleMeasurements(prev => [...prev, measurement])
            }}
            onMeasurementDelete={(id) => {
              setSimpleMeasurements(prev => prev.filter(m => m.id !== id))
            }}
          />
          
          {/* Scale Bar Overlay */}
          {scaleBarVisible && (
            <ScaleBar
              scale={canvasState.scale}
              canvasWidth={stageSize.width}
              canvasHeight={stageSize.height}
              pixelsPerFoot={PIXELS_PER_FOOT}
            />
          )}
        </Layer>
      </Stage>
      
      {/* Background Image Manager Modal */}
      <BackgroundImageManager
        images={backgroundImages}
        onImageAdd={handleBackgroundImageAdd}
        onImageUpdate={onBackgroundImageUpdate || (() => {})}
        onImageDelete={onBackgroundImageDelete || (() => {})}
        onImageSelect={handleBackgroundImageSelect}
        selectedImageId={selectedBackgroundImageId}
        isOpen={backgroundManagerOpen}
        onClose={() => setBackgroundManagerOpen(false)}
      />
      
      {/* Distance Input Modal */}
      <DistanceInputModal
        isOpen={showDistanceInput}
        calculatedDistance={distanceInputData?.calculatedDistance || 0}
        onSubmit={distanceInputData?.onSubmit || (() => {})}
        onCancel={distanceInputData?.onCancel || (() => {})}
      />
    </div>
  )
}

export default CanvasEditor
