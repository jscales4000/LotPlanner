'use client'

import React from 'react'
import { Group, Rect, Circle, Text } from 'react-konva'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'
import { equipmentLibrary } from '@/lib/equipment/library'

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
          item => item.id === placedEquipment.equipmentId
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
            offsetX={isCircular ? 0 : width / 2}
            offsetY={isCircular ? 0 : height / 2}
            draggable
            onClick={(e) => handleEquipmentClick(placedEquipment, e)}
            onDragEnd={(e) => handleDragEnd(placedEquipment.id, e)}
            onKeyDown={(e: any) => handleKeyDown(placedEquipment.id, e)}
            tabIndex={0}
          >
            {/* Equipment Shape - Rectangle or Circle */}
            {isCircular ? (
              <Circle
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

            {/* Ride Clearance Zone - Always visible if rideClearing is set */}
            {equipmentDef.rideClearing && equipmentDef.rideClearing > 0 && (
              isCircular ? (
                <Circle
                  radius={radius + (equipmentDef.rideClearing * pixelsPerFoot)}
                  fill="rgba(255, 165, 0, 0.1)" // Light orange fill for clearance area
                  stroke="#ff8c00" // Orange stroke
                  strokeWidth={2}
                  dash={[8, 4]} // Dashed line to distinguish from main equipment
                  opacity={0.6}
                  listening={false}
                />
              ) : (
                <Rect
                  x={-width / 2 - (equipmentDef.rideClearing * pixelsPerFoot)} // Center around rotation origin
                  y={-height / 2 - (equipmentDef.rideClearing * pixelsPerFoot)}
                  width={width + (equipmentDef.rideClearing * 2 * pixelsPerFoot)}
                  height={height + (equipmentDef.rideClearing * 2 * pixelsPerFoot)}
                  fill="rgba(255, 165, 0, 0.1)" // Light orange fill for clearance area
                  stroke="#ff8c00" // Orange stroke
                  strokeWidth={2}
                  dash={[8, 4]} // Dashed line to distinguish from main equipment
                  opacity={0.6}
                  listening={false}
                />
              )
            )}

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
                  <Rect
                    x={-4} // Center the rotation handle
                    y={isCircular ? -radius - 20 : -height / 2 - 20} // Position above the equipment
                    width={8}
                    height={8}
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
                      
                      // With centered rotation origin, the group position IS the center
                      const centerX = group.x()
                      const centerY = group.y()
                      
                      const angle = Math.atan2(pointer.y - centerY, pointer.x - centerX)
                      const degrees = (angle * 180) / Math.PI + 90
                      
                      handleRotation(placedEquipment.id, degrees)
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
                  x={width - 9}
                  y={-9}
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

export default EquipmentLayer
