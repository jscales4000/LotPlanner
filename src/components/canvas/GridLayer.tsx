'use client'

import React from 'react'
import { Group, Line } from 'react-konva'

interface GridLayerProps {
  width: number
  height: number
  gridSize?: number
  scale: number
  x: number
  y: number
  visible?: boolean
}

const GridLayer: React.FC<GridLayerProps> = ({
  width,
  height,
  gridSize = 50, // Default grid size in pixels (represents feet)
  scale,
  x,
  y,
  visible = true
}) => {
  if (!visible) return null

  const lines: JSX.Element[] = []
  
  // Calculate visible area with some padding
  const padding = 100
  const startX = Math.floor((-x - padding) / (gridSize * scale)) * gridSize
  const endX = Math.ceil((width - x + padding) / (gridSize * scale)) * gridSize
  const startY = Math.floor((-y - padding) / (gridSize * scale)) * gridSize
  const endY = Math.ceil((height - y + padding) / (gridSize * scale)) * gridSize

  // Create vertical lines
  for (let i = startX; i <= endX; i += gridSize) {
    const isMainLine = i % (gridSize * 5) === 0 // Every 5th line is thicker (major grid)
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, startY, i, endY]}
        stroke={isMainLine ? '#94a3b8' : '#e2e8f0'}
        strokeWidth={isMainLine ? 1 : 0.5}
        listening={false}
        perfectDrawEnabled={false}
      />
    )
  }

  // Create horizontal lines
  for (let i = startY; i <= endY; i += gridSize) {
    const isMainLine = i % (gridSize * 5) === 0 // Every 5th line is thicker (major grid)
    lines.push(
      <Line
        key={`h-${i}`}
        points={[startX, i, endX, i]}
        stroke={isMainLine ? '#94a3b8' : '#e2e8f0'}
        strokeWidth={isMainLine ? 1 : 0.5}
        listening={false}
        perfectDrawEnabled={false}
      />
    )
  }

  return (
    <Group listening={false}>
      {lines}
    </Group>
  )
}

export default GridLayer
