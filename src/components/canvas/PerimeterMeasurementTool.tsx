'use client'

import React, { useState, useCallback } from 'react'
import { Line, Circle, Text, Group } from 'react-konva'
import Konva from 'konva'

export interface PerimeterPoint {
  x: number
  y: number
}

export interface PerimeterMeasurement {
  id: string
  points: PerimeterPoint[]
  totalLength: number // in feet
  segments: number[] // length of each segment in feet
  label: string
  color: string
  completed: boolean
}

interface PerimeterMeasurementToolProps {
  isActive: boolean
  scale: number
  pixelsPerFoot: number
  onMeasurementComplete: (measurement: PerimeterMeasurement) => void
  measurements: PerimeterMeasurement[]
  onMeasurementDelete: (id: string) => void
}

const PerimeterMeasurementTool: React.FC<PerimeterMeasurementToolProps> = ({
  isActive,
  scale,
  pixelsPerFoot,
  onMeasurementComplete,
  measurements,
  onMeasurementDelete
}) => {
  const [currentPoints, setCurrentPoints] = useState<PerimeterPoint[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Calculate distance between two points in feet
  const calculateDistance = useCallback((p1: PerimeterPoint, p2: PerimeterPoint): number => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const distanceInPixels = Math.sqrt(dx * dx + dy * dy)
    return distanceInPixels / pixelsPerFoot
  }, [pixelsPerFoot])

  // Calculate total perimeter and segments
  const calculatePerimeter = useCallback((points: PerimeterPoint[]): { total: number, segments: number[] } => {
    if (points.length < 2) return { total: 0, segments: [] }
    
    const segments: number[] = []
    let total = 0
    
    for (let i = 0; i < points.length - 1; i++) {
      const segmentLength = calculateDistance(points[i], points[i + 1])
      segments.push(segmentLength)
      total += segmentLength
    }
    
    return { total, segments }
  }, [calculateDistance])

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    const newPoint: PerimeterPoint = {
      x: pos.x,
      y: pos.y
    }

    if (!isDrawing) {
      // Start new perimeter measurement
      setCurrentPoints([newPoint])
      setIsDrawing(true)
    } else {
      // Add point to current measurement
      const updatedPoints = [...currentPoints, newPoint]
      setCurrentPoints(updatedPoints)
    }
  }, [isActive, isDrawing, currentPoints])

  const handleDoubleClick = useCallback(() => {
    if (!isActive || !isDrawing || currentPoints.length < 2) return

    // Complete the perimeter measurement
    const { total, segments } = calculatePerimeter(currentPoints)
    
    const measurement: PerimeterMeasurement = {
      id: `perimeter-${Date.now()}`,
      points: currentPoints,
      totalLength: total,
      segments,
      label: `Perimeter: ${total.toFixed(1)} ft`,
      color: '#3B82F6', // Blue
      completed: true
    }

    onMeasurementComplete(measurement)
    setCurrentPoints([])
    setIsDrawing(false)
  }, [isActive, isDrawing, currentPoints, calculatePerimeter, onMeasurementComplete])

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDrawing) {
      setCurrentPoints([])
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
    return measurements.map((measurement) => (
      <Group key={measurement.id}>
        {/* Perimeter lines */}
        {measurement.points.map((point, index) => {
          if (index === measurement.points.length - 1) return null
          const nextPoint = measurement.points[index + 1]
          return (
            <Line
              key={index}
              points={[point.x, point.y, nextPoint.x, nextPoint.y]}
              stroke={measurement.color}
              strokeWidth={3 / scale}
              lineCap="round"
              lineJoin="round"
            />
          )
        })}
        
        {/* Corner points */}
        {measurement.points.map((point, index) => (
          <Circle
            key={index}
            x={point.x}
            y={point.y}
            radius={5 / scale}
            fill={measurement.color}
            stroke="white"
            strokeWidth={2 / scale}
          />
        ))}
        
        {/* Segment length labels */}
        {measurement.segments.map((segmentLength, index) => {
          if (index >= measurement.points.length - 1) return null
          const point1 = measurement.points[index]
          const point2 = measurement.points[index + 1]
          const midX = (point1.x + point2.x) / 2
          const midY = (point1.y + point2.y) / 2
          
          return (
            <Text
              key={`segment-${index}`}
              x={midX}
              y={midY - 10 / scale}
              text={`${segmentLength.toFixed(1)} ft`}
              fontSize={10 / scale}
              fill={measurement.color}
              fontStyle="bold"
              align="center"
              shadowColor="white"
              shadowBlur={2}
              shadowOffset={{ x: 1, y: 1 }}
            />
          )
        })}
        
        {/* Total length label */}
        <Text
          x={measurement.points[0].x}
          y={measurement.points[0].y - 25 / scale}
          text={measurement.label}
          fontSize={12 / scale}
          fill={measurement.color}
          fontStyle="bold"
          shadowColor="white"
          shadowBlur={2}
          shadowOffset={{ x: 1, y: 1 }}
        />
        
        {/* Delete button */}
        <Circle
          x={measurement.points[0].x + 80 / scale}
          y={measurement.points[0].y - 20 / scale}
          radius={8 / scale}
          fill="red"
          opacity={0.8}
          onClick={() => onMeasurementDelete(measurement.id)}
          onTap={() => onMeasurementDelete(measurement.id)}
        />
        <Text
          x={measurement.points[0].x + 80 / scale}
          y={measurement.points[0].y - 20 / scale}
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
    ))
  }

  // Render current drawing
  const renderCurrentDrawing = () => {
    if (!isDrawing || currentPoints.length === 0) return null

    return (
      <Group>
        {/* Current lines */}
        {currentPoints.length > 1 && currentPoints.map((point, index) => {
          if (index === currentPoints.length - 1) return null
          const nextPoint = currentPoints[index + 1]
          return (
            <Line
              key={index}
              points={[point.x, point.y, nextPoint.x, nextPoint.y]}
              stroke="#3B82F6"
              strokeWidth={3 / scale}
              lineCap="round"
              lineJoin="round"
              opacity={0.8}
            />
          )
        })}
        
        {/* Current points */}
        {currentPoints.map((point, index) => (
          <Circle
            key={index}
            x={point.x}
            y={point.y}
            radius={5 / scale}
            fill="#3B82F6"
            stroke="white"
            strokeWidth={2 / scale}
            opacity={0.8}
          />
        ))}
        
        {/* Current segment lengths */}
        {currentPoints.length > 1 && currentPoints.map((point, index) => {
          if (index === currentPoints.length - 1) return null
          const nextPoint = currentPoints[index + 1]
          const segmentLength = calculateDistance(point, nextPoint)
          const midX = (point.x + nextPoint.x) / 2
          const midY = (point.y + nextPoint.y) / 2
          
          return (
            <Text
              key={`current-segment-${index}`}
              x={midX}
              y={midY - 10 / scale}
              text={`${segmentLength.toFixed(1)} ft`}
              fontSize={10 / scale}
              fill="#3B82F6"
              fontStyle="bold"
              align="center"
              shadowColor="white"
              shadowBlur={2}
              shadowOffset={{ x: 1, y: 1 }}
            />
          )
        })}
        
        {/* Instructions */}
        {currentPoints.length > 0 && (
          <Text
            x={currentPoints[0].x}
            y={currentPoints[0].y - 40 / scale}
            text={currentPoints.length < 2 ? 
              "Click to add points for perimeter measurement" : 
              "Double-click to complete, ESC to cancel"}
            fontSize={10 / scale}
            fill="#3B82F6"
            fontStyle="bold"
            shadowColor="white"
            shadowBlur={2}
            shadowOffset={{ x: 1, y: 1 }}
          />
        )}
        
        {/* Running total */}
        {currentPoints.length > 1 && (
          <Text
            x={currentPoints[0].x}
            y={currentPoints[0].y - 55 / scale}
            text={`Total: ${calculatePerimeter(currentPoints).total.toFixed(1)} ft`}
            fontSize={11 / scale}
            fill="#3B82F6"
            fontStyle="bold"
            shadowColor="white"
            shadowBlur={2}
            shadowOffset={{ x: 1, y: 1 }}
          />
        )}
      </Group>
    )
  }

  if (!isActive && measurements.length === 0) return null

  return (
    <Group
      onClick={handleStageClick}
      onDblClick={handleDoubleClick}
    >
      {renderCompletedMeasurements()}
      {renderCurrentDrawing()}
    </Group>
  )
}

export default PerimeterMeasurementTool
