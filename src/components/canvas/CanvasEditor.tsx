'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'
import GridLayer from './GridLayer'
import EquipmentLayer from './EquipmentLayer'
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
  selectedEquipmentId
}) => {
  const stageRef = useRef<Konva.Stage>(null)
  
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

  // Handle stage click to deselect equipment when clicking on empty canvas
  const handleStageClick = useCallback((e: any) => {
    // Check if we clicked on the stage itself (not on any equipment)
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      onEquipmentSelect?.(null)
    }
  }, [onEquipmentSelect])

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
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
        className="border border-gray-300 bg-gray-50"
      >
        <Layer>
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
          
          {/* Measurement Layer - will be implemented in future */}
        </Layer>
      </Stage>
    </div>
  )
}

export default CanvasEditor
