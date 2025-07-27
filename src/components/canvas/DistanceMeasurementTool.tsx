'use client'

import React, { useState, useCallback } from 'react'
import { Line, Circle, Text, Group, Arrow } from 'react-konva'
import Konva from 'konva'

export interface DistancePoint {
  x: number
  y: number
}

export interface DistanceMeasurement {
  id: string
  startPoint: DistancePoint
  endPoint: DistancePoint
  distance: number // in feet
  label: string
  color: string
  completed: boolean
}

interface DistanceMeasurementToolProps {
  isActive: boolean
  scale: number
  pixelsPerFoot: number
  onMeasurementComplete: (measurement: DistanceMeasurement) => void
  measurements: DistanceMeasurement[]
  onMeasurementDelete: (id: string) => void
}

const DistanceMeasurementTool: React.FC<DistanceMeasurementToolProps> = ({
  isActive,
  scale,
  pixelsPerFoot,
  onMeasurementComplete,
  measurements,
  onMeasurementDelete
}) => {
  const [startPoint, setStartPoint] = useState<DistancePoint | null>(null)
  const [currentPoint, setCurrentPoint] = useState<DistancePoint | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Calculate distance between two points in feet
  const calculateDistance = useCallback((p1: DistancePoint, p2: DistancePoint): number => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const distanceInPixels = Math.sqrt(dx * dx + dy * dy)
    return distanceInPixels / pixelsPerFoot
  }, [pixelsPerFoot])

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    const clickPoint: DistancePoint = {
      x: pos.x,
      y: pos.y
    }

    if (!isDrawing) {
      // Start new distance measurement
      setStartPoint(clickPoint)
      setCurrentPoint(clickPoint)
      setIsDrawing(true)
    } else {
      // Complete the distance measurement
      if (startPoint) {
        const distance = calculateDistance(startPoint, clickPoint)
        
        const measurement: DistanceMeasurement = {
          id: `distance-${Date.now()}`,
          startPoint,
          endPoint: clickPoint,
          distance,
          label: `${distance.toFixed(1)} ft`,
          color: '#F59E0B', // Amber
          completed: true
        }

        onMeasurementComplete(measurement)
      }
      
      setStartPoint(null)
      setCurrentPoint(null)
      setIsDrawing(false)
    }
  }, [isActive, isDrawing, startPoint, calculateDistance, onMeasurementComplete])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || !isDrawing || !startPoint) return

    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    setCurrentPoint({
      x: pos.x,
      y: pos.y
    })
  }, [isActive, isDrawing, startPoint])

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDrawing) {
      setStartPoint(null)
      setCurrentPoint(null)
      setIsDrawing(false)
    }
  }, [isDrawing])

  React.useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isActive, handleEscapeKey])

  // Render completed measurements
  const renderCompletedMeasurements = () => {
    return measurements.map((measurement) => {
      const midX = (measurement.startPoint.x + measurement.endPoint.x) / 2
      const midY = (measurement.startPoint.y + measurement.endPoint.y) / 2
      
      // Calculate angle for label rotation
      const dx = measurement.endPoint.x - measurement.startPoint.x
      const dy = measurement.endPoint.y - measurement.startPoint.y
      const angle = Math.atan2(dy, dx) * 180 / Math.PI
      
      return (
        <Group key={measurement.id}>
          {/* Distance line with arrow */}
          <Arrow
            points={[
              measurement.startPoint.x, measurement.startPoint.y,
              measurement.endPoint.x, measurement.endPoint.y
            ]}
            stroke={measurement.color}
            strokeWidth={2 / scale}
            fill={measurement.color}
            pointerLength={8 / scale}
            pointerWidth={6 / scale}
            pointerAtBeginning={true}
          />
          
          {/* Start point */}
          <Circle
            x={measurement.startPoint.x}
            y={measurement.startPoint.y}
            radius={4 / scale}
            fill={measurement.color}
            stroke="white"
            strokeWidth={1 / scale}
          />
          
          {/* End point */}
          <Circle
            x={measurement.endPoint.x}
            y={measurement.endPoint.y}
            radius={4 / scale}
            fill={measurement.color}
            stroke="white"
            strokeWidth={1 / scale}
          />
          
          {/* Distance label */}
          <Text
            x={midX}
            y={midY - 15 / scale}
            text={measurement.label}
            fontSize={12 / scale}
            fill={measurement.color}
            fontStyle="bold"
            align="center"
            rotation={Math.abs(angle) > 90 ? angle + 180 : angle}
            offsetX={measurement.label.length * 3 / scale}
            shadowColor="white"
            shadowBlur={3}
            shadowOffset={{ x: 1, y: 1 }}
          />
          
          {/* Delete button */}
          <Circle
            x={midX + 30 / scale}
            y={midY - 30 / scale}
            radius={8 / scale}
            fill="red"
            opacity={0.8}
            onClick={() => onMeasurementDelete(measurement.id)}
            onTap={() => onMeasurementDelete(measurement.id)}
          />
          <Text
            x={midX + 30 / scale}
            y={midY - 30 / scale}
            text="×"
            fontSize={12 / scale}
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={3 / scale}
            offsetY={6 / scale}
            onClick={() => onMeasurementDelete(measurement.id)}
            onTap={() => onMeasurementDelete(measurement.id)}
          />
        </Group>
      )
    })
  }

  // Render current drawing
  const renderCurrentDrawing = () => {
    if (!isDrawing || !startPoint || !currentPoint) return null

    const distance = calculateDistance(startPoint, currentPoint)
    const midX = (startPoint.x + currentPoint.x) / 2
    const midY = (startPoint.y + currentPoint.y) / 2
    
    // Calculate angle for label rotation
    const dx = currentPoint.x - startPoint.x
    const dy = currentPoint.y - startPoint.y
    const angle = Math.atan2(dy, dx) * 180 / Math.PI

    return (
      <Group>
        {/* Current distance line with arrow */}
        <Arrow
          points={[startPoint.x, startPoint.y, currentPoint.x, currentPoint.y]}
          stroke="#F59E0B"
          strokeWidth={2 / scale}
          fill="#F59E0B"
          pointerLength={8 / scale}
          pointerWidth={6 / scale}
          pointerAtBeginning={true}
          opacity={0.8}
          dash={[5 / scale, 5 / scale]}
        />
        
        {/* Start point */}
        <Circle
          x={startPoint.x}
          y={startPoint.y}
          radius={4 / scale}
          fill="#F59E0B"
          stroke="white"
          strokeWidth={1 / scale}
          opacity={0.8}
        />
        
        {/* Current end point */}
        <Circle
          x={currentPoint.x}
          y={currentPoint.y}
          radius={4 / scale}
          fill="#F59E0B"
          stroke="white"
          strokeWidth={1 / scale}
          opacity={0.8}
        />
        
        {/* Current distance label */}
        <Text
          x={midX}
          y={midY - 15 / scale}
          text={`${distance.toFixed(1)} ft`}
          fontSize={12 / scale}
          fill="#F59E0B"
          fontStyle="bold"
          align="center"
          rotation={Math.abs(angle) > 90 ? angle + 180 : angle}
          offsetX={`${distance.toFixed(1)} ft`.length * 3 / scale}
          shadowColor="white"
          shadowBlur={3}
          shadowOffset={{ x: 1, y: 1 }}
        />
        
        {/* Instructions */}
        <Text
          x={startPoint.x}
          y={startPoint.y - 30 / scale}
          text="Click to set end point, ESC to cancel"
          fontSize={10 / scale}
          fill="#F59E0B"
          fontStyle="bold"
          shadowColor="white"
          shadowBlur={2}
          shadowOffset={{ x: 1, y: 1 }}
        />
      </Group>
    )
  }

  if (!isActive && measurements.length === 0) return null

  return (
    <Group
      onClick={handleStageClick}
      onMouseMove={handleMouseMove}
    >
      {renderCompletedMeasurements()}
      {renderCurrentDrawing()}
    </Group>
  )
}

export default DistanceMeasurementTool
