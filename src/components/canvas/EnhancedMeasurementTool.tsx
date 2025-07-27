'use client'

import React, { useEffect, useState } from 'react'
import { Group, Circle, Line, Text } from 'react-konva'

interface MeasurementPoint {
  x: number
  y: number
}

interface EnhancedMeasurementProps {
  isActive: boolean
  editMode: boolean
  scale: number
  pixelsPerFoot: number
  currentMeasurement: {
    id: string
    firstPoint: MeasurementPoint | null
    secondPoint: MeasurementPoint | null
    isComplete: boolean
    realWorldDistance?: number
  } | null
  onPointSet: (point: MeasurementPoint) => void
  onMeasurementComplete: (distance: number) => void
  onMeasurementEdit: (firstPoint: MeasurementPoint, secondPoint: MeasurementPoint) => void
}

const EnhancedMeasurementTool: React.FC<EnhancedMeasurementProps> = ({
  isActive,
  editMode,
  scale,
  pixelsPerFoot,
  currentMeasurement,
  onPointSet,
  onMeasurementComplete,
  onMeasurementEdit
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragTarget, setDragTarget] = useState<'first' | 'second' | null>(null)

  // Calculate distance in feet
  const calculateDistance = (p1: MeasurementPoint, p2: MeasurementPoint): number => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const pixelDistance = Math.sqrt(dx * dx + dy * dy)
    return pixelDistance / pixelsPerFoot
  }

  // Handle global canvas clicks when measurement tool is active
  useEffect(() => {
    if (!isActive || editMode) return

    const handleCanvasClick = (e: any) => {
      const stage = e.target.getStage()
      if (!stage) return

      const pointer = stage.getPointerPosition()
      if (!pointer) return

      // Convert screen coordinates to canvas coordinates
      const canvasX = (pointer.x - stage.x()) / scale
      const canvasY = (pointer.y - stage.y()) / scale

      onPointSet({ x: canvasX, y: canvasY })
    }

    // Register global handler
    const handlers = (window as any).enhancedMeasurementHandlers || {}
    handlers.handleClick = handleCanvasClick
    ;(window as any).enhancedMeasurementHandlers = handlers

    return () => {
      if ((window as any).enhancedMeasurementHandlers) {
        delete (window as any).enhancedMeasurementHandlers.handleClick
      }
    }
  }, [isActive, editMode, scale, onPointSet])

  if (!currentMeasurement) return null

  const { firstPoint, secondPoint, isComplete } = currentMeasurement

  // Calculate distance if both points exist
  const distance = firstPoint && secondPoint ? calculateDistance(firstPoint, secondPoint) : 0

  return (
    <Group>
      {/* First Point */}
      {firstPoint && (
        <Circle
          x={firstPoint.x}
          y={firstPoint.y}
          radius={8 / scale}
          fill={editMode ? "#3b82f6" : "#ef4444"}
          stroke="#ffffff"
          strokeWidth={2 / scale}
          draggable={editMode}
          onDragStart={() => {
            setIsDragging(true)
            setDragTarget('first')
          }}
          onDragEnd={(e) => {
            setIsDragging(false)
            setDragTarget(null)
            if (secondPoint) {
              const newFirstPoint = { x: e.target.x(), y: e.target.y() }
              onMeasurementEdit(newFirstPoint, secondPoint)
            }
          }}
        />
      )}

      {/* Second Point */}
      {secondPoint && (
        <Circle
          x={secondPoint.x}
          y={secondPoint.y}
          radius={8 / scale}
          fill={editMode ? "#3b82f6" : "#ef4444"}
          stroke="#ffffff"
          strokeWidth={2 / scale}
          draggable={editMode}
          onDragStart={() => {
            setIsDragging(true)
            setDragTarget('second')
          }}
          onDragEnd={(e) => {
            setIsDragging(false)
            setDragTarget(null)
            if (firstPoint) {
              const newSecondPoint = { x: e.target.x(), y: e.target.y() }
              onMeasurementEdit(firstPoint, newSecondPoint)
            }
          }}
        />
      )}

      {/* Line connecting points */}
      {firstPoint && secondPoint && (
        <Line
          points={[firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y]}
          stroke={editMode ? "#3b82f6" : "#ef4444"}
          strokeWidth={3 / scale}
          dash={editMode ? [10 / scale, 5 / scale] : undefined}
        />
      )}

      {/* Distance label */}
      {firstPoint && secondPoint && (
        <Text
          x={(firstPoint.x + secondPoint.x) / 2}
          y={(firstPoint.y + secondPoint.y) / 2 - 20 / scale}
          text={currentMeasurement.realWorldDistance 
            ? `${currentMeasurement.realWorldDistance.toFixed(1)}' (calibrated)`
            : `${distance.toFixed(1)}'`
          }
          fontSize={14 / scale}
          fill={editMode ? "#3b82f6" : "#ef4444"}
          fontStyle="bold"
          align="center"
          offsetX={50 / scale}
        />
      )}

      {/* Instructions text */}
      {isActive && !editMode && (
        <Text
          x={50}
          y={50}
          text={
            !firstPoint 
              ? "Click to set first measurement point"
              : !secondPoint 
              ? "Click to set second measurement point"
              : "Measurement complete"
          }
          fontSize={16}
          fill="#374151"
          fontStyle="bold"
        />
      )}

      {/* Edit mode instructions */}
      {editMode && isComplete && (
        <Text
          x={50}
          y={50}
          text="Drag the measurement points to adjust the line"
          fontSize={16}
          fill="#3b82f6"
          fontStyle="bold"
        />
      )}
    </Group>
  )
}

export default EnhancedMeasurementTool
