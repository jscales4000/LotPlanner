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
  width = 800,
  height = 600,
  className = '',
  onEquipmentAdd,
  placedEquipment = [],
  onEquipmentSelect,
  onEquipmentMove,
  onEquipmentRotate,
  onEquipmentDelete,
  selectedEquipmentId
}) => {
  const stageRef = useRef<Konva.Stage>(null)
  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
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

  // Reset canvas to center and default zoom
  const resetCanvas = useCallback(() => {
    if (stageRef.current) {
      stageRef.current.scale({ x: 1, y: 1 })
      stageRef.current.position({ x: 0, y: 0 })
      stageRef.current.batchDraw()
      
      setCanvasState({
        scale: 1,
        x: 0,
        y: 0
      })
    }
  }, [])

  // Fit canvas to show all content (placeholder for future use)
  const fitToContent = useCallback(() => {
    // This will be implemented when we have objects to fit to
    resetCanvas()
  }, [resetCanvas])

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
        <div>Zoom: {Math.round(canvasState.scale * 100)}%</div>
        <div>Position: ({Math.round(canvasState.x)}, {Math.round(canvasState.y)})</div>
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
            width={stageSize.width}
            height={stageSize.height}
            scale={canvasState.scale}
            x={canvasState.x}
            y={canvasState.y}
            visible={gridVisible}
            gridSize={50} // 50 pixels = 1 foot
          />
          
          {/* Equipment Layer */}
          <EquipmentLayer
            equipment={placedEquipment}
            scale={canvasState.scale}
            onEquipmentSelect={onEquipmentSelect}
            onEquipmentMove={onEquipmentMove}
            onEquipmentRotate={onEquipmentRotate}
            onEquipmentDelete={onEquipmentDelete}
            selectedEquipmentId={selectedEquipmentId}
            snapToGrid={true}
            gridSize={50}
          />
          
          {/* Measurement Layer - will be implemented in future */}
        </Layer>
      </Stage>
    </div>
  )
}

export default CanvasEditor
