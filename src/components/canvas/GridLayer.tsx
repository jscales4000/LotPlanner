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

  // Performance optimization: Adaptive grid density based on zoom level
  const getOptimalGridSize = (currentScale: number, baseGridSize: number) => {
    if (currentScale < 0.15) return baseGridSize * 8  // Very zoomed out: fewer lines
    if (currentScale < 0.3) return baseGridSize * 4   // Zoomed out: fewer lines
    if (currentScale < 0.6) return baseGridSize * 2   // Medium zoom: some lines
    return baseGridSize                               // Zoomed in: all lines
  }

  const optimizedGridSize = getOptimalGridSize(scale, gridSize)
  const lines: JSX.Element[] = []
  
  // Calculate visible area with optimized padding
  const padding = Math.min(200, width * 0.1) // Adaptive padding
  const startX = Math.floor((-x - padding) / (optimizedGridSize * scale)) * optimizedGridSize
  const endX = Math.ceil((width - x + padding) / (optimizedGridSize * scale)) * optimizedGridSize
  const startY = Math.floor((-y - padding) / (optimizedGridSize * scale)) * optimizedGridSize
  const endY = Math.ceil((height - y + padding) / (optimizedGridSize * scale)) * optimizedGridSize

  // Performance limit: Don't render more than 200 lines total
  const maxLines = 200
  const totalLinesX = Math.abs(endX - startX) / optimizedGridSize
  const totalLinesY = Math.abs(endY - startY) / optimizedGridSize
  
  if (totalLinesX + totalLinesY > maxLines) {
    // Skip rendering if too many lines would be created
    return null
  }

  // Create vertical lines
  for (let i = startX; i <= endX; i += optimizedGridSize) {
    const isMainLine = i % (optimizedGridSize * 5) === 0 // Every 5th line is thicker (major grid)
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
  for (let i = startY; i <= endY; i += optimizedGridSize) {
    const isMainLine = i % (optimizedGridSize * 5) === 0 // Every 5th line is thicker (major grid)
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

// Memoize the component to prevent unnecessary re-renders
export default React.memo(GridLayer, (prevProps, nextProps) => {
  // Custom comparison for grid performance optimization
  return (
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.gridSize === nextProps.gridSize &&
    prevProps.scale === nextProps.scale &&
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.visible === nextProps.visible
  )
})
