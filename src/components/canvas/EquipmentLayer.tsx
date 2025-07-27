'use client'

import React from 'react'
import { Group, Rect, Circle, Text, Line } from 'react-konva'
import { PlacedEquipment, EquipmentItem, CustomClearance, RectangularClearance } from '@/lib/equipment/types'
import { equipmentLibrary } from '@/lib/equipment/library'
import { generateClearancePolygonPoints, createDefaultClearance } from '@/lib/equipment/clearanceUtils'

interface EquipmentLayerProps {
  equipment: PlacedEquipment[]
  equipmentDefinitions?: EquipmentItem[] // All equipment definitions (static + custom)
  scale: number
  onEquipmentSelect?: (equipment: PlacedEquipment) => void
  onEquipmentMove?: (equipmentId: string, x: number, y: number) => void
  onEquipmentRotate?: (equipmentId: string, rotation: number) => void
  onEquipmentDelete?: (equipmentId: string) => void
  selectedEquipmentId?: string
  snapToGrid?: boolean
  gridSize?: number
}

const EquipmentLayer: React.FC<EquipmentLayerProps> = ({
  equipment,
  equipmentDefinitions,
  scale,
  onEquipmentSelect,
  onEquipmentMove,
  onEquipmentRotate,
  onEquipmentDelete,
  selectedEquipmentId,
  snapToGrid = true,
  gridSize = 10
}) => {
  const pixelsPerFoot = 10 // 10 pixels = 1 foot for large 250k sq ft canvas

  // Snap position to grid
  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y }
    
    const snappedX = Math.round(x / gridSize) * gridSize
    const snappedY = Math.round(y / gridSize) * gridSize
    return { x: snappedX, y: snappedY }
  }

  const handleEquipmentClick = (placedEquipment: PlacedEquipment, e?: any) => {
    // Stop event propagation to prevent stage click handler from firing
    if (e) {
      e.cancelBubble = true
    }
    onEquipmentSelect?.(placedEquipment)
  }

  const handleDragEnd = (equipmentId: string, e: any) => {
    const rawX = e.target.x()
    const rawY = e.target.y()
    const { x, y } = snapToGridPosition(rawX, rawY)
    
    // Update the visual position immediately
    e.target.x(x)
    e.target.y(y)
    
    onEquipmentMove?.(equipmentId, x, y)
  }

  // Handle rotation
  const handleRotation = (equipmentId: string, rotation: number) => {
    onEquipmentRotate?.(equipmentId, rotation)
  }

  // Handle keyboard events for deletion
  const handleKeyDown = (equipmentId: string, e: any) => {
    if (e.evt.key === 'Delete' || e.evt.key === 'Backspace') {
      e.evt.preventDefault()
      onEquipmentDelete?.(equipmentId)
    }
  }

  // Combine static library with custom equipment definitions
  const allEquipmentDefinitions = equipmentDefinitions || equipmentLibrary

  return (
    <Group>
      {equipment.map(placedEquipment => {
        // Find the equipment definition in combined definitions
        const equipmentDef = allEquipmentDefinitions.find(
          (item: EquipmentItem) => item.id === placedEquipment.equipmentId
        )
        
        if (!equipmentDef) return null

        const isSelected = selectedEquipmentId === placedEquipment.id
        // Use the stored dimensions (which include custom dimensions) instead of library lookup
        const dimensions = placedEquipment.dimensions
        const isCircular = dimensions.shape === 'circle'
        
        // Calculate size based on shape
        const width = isCircular ? (dimensions as any).radius * 2 * pixelsPerFoot : (dimensions as any).width * pixelsPerFoot
        const height = isCircular ? (dimensions as any).radius * 2 * pixelsPerFoot : (dimensions as any).height * pixelsPerFoot
        const radius = isCircular ? (dimensions as any).radius * pixelsPerFoot : 0

        return (
          <Group
            key={placedEquipment.id}
            x={placedEquipment.x}
            y={placedEquipment.y}
            rotation={placedEquipment.rotation}
            // Set rotation origin to center of the equipment
            offsetX={isCircular ? radius : width / 2}
            offsetY={isCircular ? radius : height / 2}
            draggable
            onClick={(e) => handleEquipmentClick(placedEquipment, e)}
            onDragEnd={(e) => handleDragEnd(placedEquipment.id, e)}
            onKeyDown={(e: any) => handleKeyDown(placedEquipment.id, e)}
            tabIndex={0}
          >
            {/* Equipment Shape - Rectangle or Circle */}
            {isCircular ? (
              <Circle
                x={0} // Circle is centered at the Group's origin (which is offset)
                y={0}
                radius={radius}
                fill={equipmentDef.color}
                stroke={isSelected ? '#2563eb' : '#666666'}
                strokeWidth={isSelected ? 3 : 1}
                opacity={0.8}
              />
            ) : (
              <Rect
                x={-width / 2} // Center the rectangle around the rotation origin
                y={-height / 2}
                width={width}
                height={height}
                fill={equipmentDef.color}
                stroke={isSelected ? '#2563eb' : '#666666'}
                strokeWidth={isSelected ? 3 : 1}
                opacity={0.8}
                cornerRadius={2}
              />
            )}

            {/* Equipment Label */}
            <Text
              text={placedEquipment.customLabel || equipmentDef.name}
              x={isCircular ? -radius + 2 : -width / 2 + 2}
              y={isCircular ? -6 : -height / 2 + 2}
              fontSize={Math.max(10, 12 / scale)}
              fill={isSelected ? '#2563eb' : '#000000'}
              fontFamily="Arial"
              fontStyle="bold"
              wrap="word"
              width={isCircular ? (radius * 2) - 4 : width - 4}
              height={isCircular ? 12 : height - 4}
              align="center"
              verticalAlign="middle"
              listening={false}
            />

            {/* Custom Clearance Zone */}
            {(() => {
              // Get clearance from placed equipment or create default from equipment definition
              let clearance = placedEquipment.clearance
              if (!clearance && equipmentDef.rideClearing && equipmentDef.rideClearing > 0) {
                clearance = createDefaultClearance(dimensions, equipmentDef.rideClearing)
              }
              
              // Debug logging for clearance rendering
              console.log('EquipmentLayer - clearance rendering:', {
                equipmentId: placedEquipment.id,
                equipmentName: equipmentDef.name,
                placedEquipmentClearance: placedEquipment.clearance,
                finalClearance: clearance,
                clearanceType: clearance?.type,
                hasCustomClearance: clearance?.type === 'custom'
              })
              
              if (!clearance) return null
              
              if (clearance.type === 'custom') {
                // Render custom polygon clearance with curves
                const polygonPoints = generateClearancePolygonPoints(clearance)
                
                // Enhanced debug logging for custom clearance
                console.log('EquipmentLayer - custom clearance details:', {
                  clearanceData: clearance,
                  polygonPointsCount: polygonPoints.length,
                  polygonPoints: polygonPoints,
                  pixelsPerFoot,
                  equipmentPosition: { x: placedEquipment.x, y: placedEquipment.y },
                  equipmentRotation: placedEquipment.rotation
                })
                
                if (polygonPoints.length < 3) {
                  console.log('EquipmentLayer - insufficient polygon points:', polygonPoints.length)
                  return null
                }
                
                // Convert points to pixel coordinates relative to equipment center
                // The clearance points are in equipment-relative coordinates (feet)
                // We need to convert them to pixel coordinates and center them around the equipment's origin
                // This matches how the equipment shape is positioned (centered around rotation origin)
                const pixelPoints = polygonPoints.flatMap(point => [
                  (point.x * pixelsPerFoot) - (isCircular ? radius : width / 2),
                  (point.y * pixelsPerFoot) - (isCircular ? radius : height / 2)
                ])
                
                console.log('EquipmentLayer - rendering custom clearance Line with pixelPoints:', pixelPoints)
                
                return (
                  <Line
                    points={pixelPoints}
                    closed={clearance.closed}
                    fill="rgba(255, 0, 255, 0.3)" // Bright magenta fill for visibility
                    stroke="#ff00ff" // Bright magenta stroke
                    strokeWidth={4} // Thicker stroke for visibility
                    dash={[10, 5]} // More prominent dashes
                    opacity={1.0} // Full opacity for debugging
                    listening={false}
                  />
                )
              } else {
                // Render traditional rectangular clearance
                const front = clearance.front ?? clearance.all ?? 0
                const back = clearance.back ?? clearance.all ?? 0
                const left = clearance.left ?? clearance.all ?? 0
                const right = clearance.right ?? clearance.all ?? 0
                
                if (front === 0 && back === 0 && left === 0 && right === 0) return null
                
                return isCircular ? (
                  <Circle
                    radius={radius + (Math.max(front, back, left, right) * pixelsPerFoot)}
                    fill="rgba(255, 165, 0, 0.1)" // Light orange fill
                    stroke="#ff8c00" // Orange stroke
                    strokeWidth={2}
                    dash={[8, 4]} // Dashed line
                    opacity={0.6}
                    listening={false}
                  />
                ) : (
                  <Rect
                    x={-width / 2 - (left * pixelsPerFoot)}
                    y={-height / 2 - (front * pixelsPerFoot)}
                    width={width + ((left + right) * pixelsPerFoot)}
                    height={height + ((front + back) * pixelsPerFoot)}
                    fill="rgba(255, 165, 0, 0.1)" // Light orange fill
                    stroke="#ff8c00" // Orange stroke
                    strokeWidth={2}
                    dash={[8, 4]} // Dashed line
                    opacity={0.6}
                    listening={false}
                  />
                )
              }
            })()}

            {/* Selection Handles (when selected) */}
            {isSelected && (
              <>
                {/* Corner handles for resizing */}
                <Rect
                  x={isCircular ? radius - 4 : width / 2 - 4} // Adjust for centered rotation origin
                  y={isCircular ? radius - 4 : height / 2 - 4}
                  width={8}
                  height={8}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth={1}
                  draggable={false}
                />
                
                {/* Rotation handle */}
                <Group>
                  <Circle
                    x={0}
                    y={isCircular ? -radius - 15 : -height / 2 - 15}
                    radius={6}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={1}
                    draggable
                    onDragMove={(e) => {
                      const stage = e.target.getStage()
                      if (!stage) return
                      
                      const pointer = stage.getPointerPosition()
                      if (!pointer) return
                      
                      const group = e.target.getParent()?.getParent()
                      if (!group) return
                      
                      // Use the group's position as the center for rotation calculation
                      const centerX = group.x()
                      const centerY = group.y()
                      
                      const angle = Math.atan2(pointer.y - centerY, pointer.x - centerX)
                      const degrees = (angle * 180) / Math.PI + 90
                      
                      handleRotation(placedEquipment.id, degrees)
                      
                      // Reset the rotation handle position to prevent it from moving
                      e.target.x(0)
                      e.target.y(isCircular ? -radius - 15 : -height / 2 - 15)
                    }}
                  />
                  {/* Rotation line */}
                  <Rect
                    x={-0.5} // Center the rotation line
                    y={isCircular ? -radius - 20 : -height / 2 - 20}
                    width={1}
                    height={20}
                    fill="#10b981"
                    listening={false}
                  />
                </Group>
                
                {/* Delete button */}
                <Rect
                  x={isCircular ? radius - 6 : width / 2 - 6} // Adjust for centered rotation origin
                  y={isCircular ? -radius - 6 : -height / 2 - 6}
                  width={12}
                  height={12}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth={1}
                  cornerRadius={2}
                  onClick={(e) => {
                    e.cancelBubble = true
                    onEquipmentDelete?.(placedEquipment.id)
                  }}
                />
                <Text
                  x={isCircular ? radius - 3 : width / 2 - 3} // Center the delete button text
                  y={isCircular ? -radius - 3 : -height / 2 - 3}
                  text="×"
                  fontSize={8}
                  fill="white"
                  align="center"
                  listening={false}
                />
              </>
            )}
          </Group>
        )
      })}
    </Group>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(EquipmentLayer, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  return (
    prevProps.equipment.length === nextProps.equipment.length &&
    prevProps.scale === nextProps.scale &&
    prevProps.selectedEquipmentId === nextProps.selectedEquipmentId &&
    prevProps.snapToGrid === nextProps.snapToGrid &&
    prevProps.gridSize === nextProps.gridSize &&
    // Deep compare equipment array (only if lengths match)
    prevProps.equipment.every((prevEq, index) => {
      const nextEq = nextProps.equipment[index]
      return (
        prevEq.id === nextEq.id &&
        prevEq.x === nextEq.x &&
        prevEq.y === nextEq.y &&
        prevEq.rotation === nextEq.rotation &&
        prevEq.equipmentId === nextEq.equipmentId
      )
    })
  )
})
