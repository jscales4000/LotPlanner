'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Line, Circle, Text, Group } from 'react-konva'

export interface MeasurementPoint {
  x: number
  y: number
}

export interface SimpleMeasurement {
  id: string
  type: 'area' | 'perimeter' | 'distance'
  points: MeasurementPoint[]
  value: number
  label: string
  completed: boolean
}

interface SimpleMeasurementToolProps {
  activeTool: 'area' | 'perimeter' | 'distance' | null
  scale: number
  pixelsPerFoot: number
  measurements: SimpleMeasurement[]
  onMeasurementComplete: (measurement: SimpleMeasurement) => void
  onMeasurementDelete: (id: string) => void
  onCanvasClick?: (x: number, y: number) => void
  onCanvasDoubleClick?: (x: number, y: number) => void
}

const SimpleMeasurementTool: React.FC<SimpleMeasurementToolProps> = ({
  activeTool,
  scale,
  pixelsPerFoot,
  measurements,
  onMeasurementComplete,
  onMeasurementDelete
}) => {
  const [currentPoints, setCurrentPoints] = useState<MeasurementPoint[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Calculate area using shoelace formula
  const calculateArea = useCallback((points: MeasurementPoint[]): number => {
    if (points.length < 3) return 0
    
    let area = 0
    const n = points.length
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    
    area = Math.abs(area) / 2
    return area / (pixelsPerFoot * pixelsPerFoot) // Convert to square feet
  }, [pixelsPerFoot])

  // Calculate perimeter/distance
  const calculateDistance = useCallback((points: MeasurementPoint[]): number => {
    if (points.length < 2) return 0
    
    let distance = 0
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x
      const dy = points[i + 1].y - points[i].y
      distance += Math.sqrt(dx * dx + dy * dy)
    }
    
    // For area tool, close the polygon
    if (activeTool === 'area' && points.length > 2) {
      const dx = points[0].x - points[points.length - 1].x
      const dy = points[0].y - points[points.length - 1].y
      distance += Math.sqrt(dx * dx + dy * dy)
    }
    
    return distance / pixelsPerFoot // Convert to feet
  }, [pixelsPerFoot, activeTool])

  // Handle canvas clicks (called from parent)
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (!activeTool) return

    const newPoint: MeasurementPoint = { x, y }

    if (!isDrawing) {
      // Start new measurement
      setCurrentPoints([newPoint])
      setIsDrawing(true)
    } else {
      // Add point to current measurement
      const updatedPoints = [...currentPoints, newPoint]
      setCurrentPoints(updatedPoints)

      // For distance tool, complete after 2 points
      if (activeTool === 'distance' && updatedPoints.length === 2) {
        completeMeasurement(updatedPoints)
      }
    }
  }, [activeTool, isDrawing, currentPoints])

  // Handle canvas double clicks (called from parent)
  const handleCanvasDoubleClick = useCallback(() => {
    if (!activeTool || !isDrawing || currentPoints.length < 2) return

    completeMeasurement(currentPoints)
  }, [activeTool, isDrawing, currentPoints])

  // Complete measurement
  const completeMeasurement = useCallback((points: MeasurementPoint[]) => {
    let value = 0
    let label = ''

    switch (activeTool) {
      case 'area':
        if (points.length < 3) return
        value = calculateArea(points)
        label = `Area: ${value.toFixed(0)} sq ft`
        break
      case 'perimeter':
        value = calculateDistance(points)
        label = `Perimeter: ${value.toFixed(0)} ft`
        break
      case 'distance':
        value = calculateDistance(points)
        label = `Distance: ${value.toFixed(0)} ft`
        break
      default:
        return
    }

    const measurement: SimpleMeasurement = {
      id: `${activeTool}-${Date.now()}`,
      type: activeTool,
      points,
      value,
      label,
      completed: true
    }

    onMeasurementComplete(measurement)
    setCurrentPoints([])
    setIsDrawing(false)
  }, [activeTool, calculateArea, calculateDistance, onMeasurementComplete])

  // Expose click handlers to parent
  useEffect(() => {
    // Store handlers on window for parent to access
    (window as any).measurementToolHandlers = {
      handleClick: handleCanvasClick,
      handleDoubleClick: handleCanvasDoubleClick
    }
  }, [handleCanvasClick, handleCanvasDoubleClick])

  // Reset when tool changes
  useEffect(() => {
    if (!activeTool) {
      setCurrentPoints([])
      setIsDrawing(false)
    }
  }, [activeTool])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        setCurrentPoints([])
        setIsDrawing(false)
      }
    }

    if (activeTool) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeTool, isDrawing])

  if (!activeTool && measurements.length === 0) return null

  return (
    <Group>
      {/* Render completed measurements */}
      {measurements.map((measurement) => (
        <Group key={measurement.id}>
          {/* Measurement lines/polygon */}
          <Line
            points={measurement.points.flatMap(p => [p.x, p.y])}
            closed={measurement.type === 'area'}
            fill={measurement.type === 'area' ? '#10B981' : undefined}
            fillOpacity={measurement.type === 'area' ? 0.1 : undefined}
            stroke={measurement.type === 'area' ? '#10B981' : measurement.type === 'perimeter' ? '#3B82F6' : '#F59E0B'}
            strokeWidth={2 / scale}
            dash={measurement.type === 'perimeter' ? [4 / scale, 4 / scale] : undefined}
          />
          
          {/* Measurement points */}
          {measurement.points.map((point, index) => (
            <Circle
              key={index}
              x={point.x}
              y={point.y}
              radius={3 / scale}
              fill={measurement.type === 'area' ? '#10B981' : measurement.type === 'perimeter' ? '#3B82F6' : '#F59E0B'}
              stroke="white"
              strokeWidth={1 / scale}
            />
          ))}
          
          {/* Measurement label */}
          <Text
            x={measurement.points[0].x}
            y={measurement.points[0].y - 25 / scale}
            text={measurement.label}
            fontSize={12 / scale}
            fill={measurement.type === 'area' ? '#10B981' : measurement.type === 'perimeter' ? '#3B82F6' : '#F59E0B'}
            fontStyle="bold"
            shadowColor="white"
            shadowBlur={2}
            shadowOffset={{ x: 1, y: 1 }}
          />
          
          {/* Delete button */}
          <Circle
            x={measurement.points[0].x + 40 / scale}
            y={measurement.points[0].y - 25 / scale}
            radius={8 / scale}
            fill="red"
            opacity={0.8}
            onClick={() => onMeasurementDelete(measurement.id)}
            onTap={() => onMeasurementDelete(measurement.id)}
          />
          <Text
            x={measurement.points[0].x + 40 / scale}
            y={measurement.points[0].y - 25 / scale}
            text="×"
            fontSize={10 / scale}
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={3 / scale}
            offsetY={5 / scale}
            onClick={() => onMeasurementDelete(measurement.id)}
            onTap={() => onMeasurementDelete(measurement.id)}
          />
        </Group>
      ))}

      {/* Render current drawing */}
      {isDrawing && currentPoints.length > 0 && (
        <Group>
          {/* Current lines */}
          {currentPoints.length > 1 && (
            <Line
              points={currentPoints.flatMap(p => [p.x, p.y])}
              closed={false}
              stroke={activeTool === 'area' ? '#10B981' : activeTool === 'perimeter' ? '#3B82F6' : '#F59E0B'}
              strokeWidth={2 / scale}
              dash={[3 / scale, 3 / scale]}
            />
          )}
          
          {/* Current points */}
          {currentPoints.map((point, index) => (
            <Circle
              key={index}
              x={point.x}
              y={point.y}
              radius={3 / scale}
              fill={activeTool === 'area' ? '#10B981' : activeTool === 'perimeter' ? '#3B82F6' : '#F59E0B'}
              stroke="white"
              strokeWidth={1 / scale}
            />
          ))}
          
          {/* Instructions */}
          <Text
            x={currentPoints[0].x}
            y={currentPoints[0].y - 40 / scale}
            text={
              activeTool === 'distance' 
                ? "Click second point to complete"
                : currentPoints.length < (activeTool === 'area' ? 3 : 2)
                ? `Click to add points (need ${activeTool === 'area' ? 3 : 2} minimum)`
                : "Double-click to complete, ESC to cancel"
            }
            fontSize={10 / scale}
            fill={activeTool === 'area' ? '#10B981' : activeTool === 'perimeter' ? '#3B82F6' : '#F59E0B'}
            fontStyle="bold"
            shadowColor="white"
            shadowBlur={2}
            shadowOffset={{ x: 1, y: 1 }}
          />
        </Group>
      )}
    </Group>
  )
}

export default SimpleMeasurementTool
