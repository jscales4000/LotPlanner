'use client'

import React, { useState, useCallback } from 'react'
import { Line, Circle, Text, Group } from 'react-konva'
import Konva from 'konva'

export interface AreaPoint {
  x: number
  y: number
}

export interface AreaMeasurement {
  id: string
  points: AreaPoint[]
  area: number // in square feet
  perimeter: number // in feet
  label: string
  color: string
  completed: boolean
}

interface AreaMeasurementToolProps {
  isActive: boolean
  scale: number
  pixelsPerFoot: number
  onMeasurementComplete: (measurement: AreaMeasurement) => void
  measurements: AreaMeasurement[]
  onMeasurementDelete: (id: string) => void
  onCanvasClick?: (x: number, y: number) => void
  onCanvasDoubleClick?: (x: number, y: number) => void
}

const AreaMeasurementTool: React.FC<AreaMeasurementToolProps> = ({
  isActive,
  scale,
  pixelsPerFoot,
  onMeasurementComplete,
  measurements,
  onMeasurementDelete
}) => {
  const [currentPoints, setCurrentPoints] = useState<AreaPoint[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Calculate area using shoelace formula
  const calculateArea = useCallback((points: AreaPoint[]): number => {
    if (points.length < 3) return 0
    
    let area = 0
    const n = points.length
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    
    area = Math.abs(area) / 2
    
    // Convert from pixels squared to square feet
    const areaInFeet = area / (pixelsPerFoot * pixelsPerFoot)
    return areaInFeet
  }, [pixelsPerFoot])

  // Calculate perimeter
  const calculatePerimeter = useCallback((points: AreaPoint[]): number => {
    if (points.length < 2) return 0
    
    let perimeter = 0
    
    for (let i = 0; i < points.length; i++) {
      const current = points[i]
      const next = points[(i + 1) % points.length]
      
      const dx = next.x - current.x
      const dy = next.y - current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      perimeter += distance
    }
    
    // Convert from pixels to feet
    return perimeter / pixelsPerFoot
  }, [pixelsPerFoot])

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    const newPoint: AreaPoint = {
      x: pos.x,
      y: pos.y
    }

    if (!isDrawing) {
      // Start new area measurement
      setCurrentPoints([newPoint])
      setIsDrawing(true)
    } else {
      // Add point to current measurement
      const updatedPoints = [...currentPoints, newPoint]
      setCurrentPoints(updatedPoints)
    }
  }, [isActive, isDrawing, currentPoints])

  const handleDoubleClick = useCallback(() => {
    if (!isActive || !isDrawing || currentPoints.length < 3) return

    // Complete the area measurement
    const area = calculateArea(currentPoints)
    const perimeter = calculatePerimeter(currentPoints)
    
    const measurement: AreaMeasurement = {
      id: `area-${Date.now()}`,
      points: currentPoints,
      area,
      perimeter,
      label: `Area: ${area.toFixed(0)} sq ft`,
      color: '#10B981', // Green
      completed: true
    }

    onMeasurementComplete(measurement)
    setCurrentPoints([])
    setIsDrawing(false)
  }, [isActive, isDrawing, currentPoints, calculateArea, calculatePerimeter, onMeasurementComplete])

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
        {/* Area polygon */}
        <Line
          points={measurement.points.flatMap(p => [p.x, p.y])}
          closed={true}
          fill={measurement.color}
          fillOpacity={0.2}
          stroke={measurement.color}
          strokeWidth={2 / scale}
          dash={[5 / scale, 5 / scale]}
        />
        
        {/* Corner points */}
        {measurement.points.map((point, index) => (
          <Circle
            key={index}
            x={point.x}
            y={point.y}
            radius={4 / scale}
            fill={measurement.color}
            stroke="white"
            strokeWidth={1 / scale}
          />
        ))}
        
        {/* Area label */}
        <Text
          x={measurement.points[0].x}
          y={measurement.points[0].y - 20 / scale}
          text={measurement.label}
          fontSize={12 / scale}
          fill={measurement.color}
          fontStyle="bold"
          shadowColor="white"
          shadowBlur={2}
          shadowOffset={{ x: 1, y: 1 }}
        />
        
        {/* Perimeter label */}
        <Text
          x={measurement.points[0].x}
          y={measurement.points[0].y - 35 / scale}
          text={`Perimeter: ${measurement.perimeter.toFixed(0)} ft`}
          fontSize={10 / scale}
          fill={measurement.color}
          shadowColor="white"
          shadowBlur={2}
          shadowOffset={{ x: 1, y: 1 }}
        />
        
        {/* Delete button */}
        <Circle
          x={measurement.points[0].x + 50 / scale}
          y={measurement.points[0].y - 20 / scale}
          radius={8 / scale}
          fill="red"
          opacity={0.8}
          onClick={() => onMeasurementDelete(measurement.id)}
          onTap={() => onMeasurementDelete(measurement.id)}
        />
        <Text
          x={measurement.points[0].x + 50 / scale}
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
        {/* Current polygon (if more than 2 points) */}
        {currentPoints.length > 2 && (
          <Line
            points={currentPoints.flatMap(p => [p.x, p.y])}
            closed={false}
            fill="#10B981"
            fillOpacity={0.1}
            stroke="#10B981"
            strokeWidth={2 / scale}
            dash={[3 / scale, 3 / scale]}
          />
        )}
        
        {/* Lines between points */}
        {currentPoints.length > 1 && currentPoints.map((point, index) => {
          if (index === currentPoints.length - 1) return null
          const nextPoint = currentPoints[index + 1]
          return (
            <Line
              key={index}
              points={[point.x, point.y, nextPoint.x, nextPoint.y]}
              stroke="#10B981"
              strokeWidth={2 / scale}
            />
          )
        })}
        
        {/* Current points */}
        {currentPoints.map((point, index) => (
          <Circle
            key={index}
            x={point.x}
            y={point.y}
            radius={4 / scale}
            fill="#10B981"
            stroke="white"
            strokeWidth={1 / scale}
          />
        ))}
        
        {/* Instructions */}
        {currentPoints.length > 0 && (
          <Text
            x={currentPoints[0].x}
            y={currentPoints[0].y - 40 / scale}
            text={currentPoints.length < 3 ? 
              "Click to add points, need at least 3 points" : 
              "Double-click to complete area, ESC to cancel"}
            fontSize={10 / scale}
            fill="#10B981"
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

export default AreaMeasurementTool
