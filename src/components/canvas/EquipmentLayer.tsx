'use client'

import React from 'react'
import { Group, Rect, Text } from 'react-konva'
import { PlacedEquipment } from '@/lib/equipment/types'
import { equipmentLibrary } from '@/lib/equipment/library'

interface EquipmentLayerProps {
  equipment: PlacedEquipment[]
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
  scale,
  onEquipmentSelect,
  onEquipmentMove,
  onEquipmentRotate,
  onEquipmentDelete,
  selectedEquipmentId,
  snapToGrid = true,
  gridSize = 50
}) => {
  const pixelsPerFoot = 50 // 50 pixels = 1 foot

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

  return (
    <Group>
      {equipment.map(placedEquipment => {
        // Find the equipment definition
        const equipmentDef = equipmentLibrary.find(
          item => item.id === placedEquipment.equipmentId
        )
        
        if (!equipmentDef) return null

        const isSelected = selectedEquipmentId === placedEquipment.id
        // Use the stored dimensions (which include custom dimensions) instead of library lookup
        const width = placedEquipment.dimensions.width * pixelsPerFoot
        const height = placedEquipment.dimensions.height * pixelsPerFoot

        return (
          <Group
            key={placedEquipment.id}
            x={placedEquipment.x}
            y={placedEquipment.y}
            rotation={placedEquipment.rotation}
            draggable
            onClick={(e) => handleEquipmentClick(placedEquipment, e)}
            onDragEnd={(e) => handleDragEnd(placedEquipment.id, e)}
            onKeyDown={(e) => handleKeyDown(placedEquipment.id, e)}
            tabIndex={0}
          >
            {/* Equipment Rectangle */}
            <Rect
              width={width}
              height={height}
              fill={equipmentDef.color}
              stroke={isSelected ? '#2563eb' : '#666666'}
              strokeWidth={isSelected ? 3 : 1}
              opacity={0.8}
              cornerRadius={2}
            />

            {/* Equipment Label */}
            <Text
              text={placedEquipment.customLabel || equipmentDef.name}
              x={2}
              y={2}
              fontSize={Math.max(10, 12 / scale)}
              fill={isSelected ? '#2563eb' : '#000000'}
              fontFamily="Arial"
              wrap="word"
              width={width - 4}
              height={height - 4}
              align="center"
              verticalAlign="middle"
            />

            {/* Clearance Zone (when selected) */}
            {isSelected && equipmentDef.clearance && (
              <Rect
                x={-((equipmentDef.clearance.all || equipmentDef.clearance.left || 0) * pixelsPerFoot)}
                y={-((equipmentDef.clearance.all || equipmentDef.clearance.front || 0) * pixelsPerFoot)}
                width={width + ((equipmentDef.clearance.all || 0) * 2 * pixelsPerFoot) || 
                       width + ((equipmentDef.clearance.left || 0) + (equipmentDef.clearance.right || 0)) * pixelsPerFoot}
                height={height + ((equipmentDef.clearance.all || 0) * 2 * pixelsPerFoot) || 
                        height + ((equipmentDef.clearance.front || 0) + (equipmentDef.clearance.back || 0)) * pixelsPerFoot}
                fill="transparent"
                stroke="#ff6b6b"
                strokeWidth={1}
                dash={[5, 5]}
                opacity={0.5}
                listening={false}
              />
            )}

            {/* Selection Handles (when selected) */}
            {isSelected && (
              <>
                {/* Corner handles for resizing */}
                <Rect
                  x={width - 4}
                  y={height - 4}
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
                    x={width / 2 - 4}
                    y={-20}
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
                      
                      const centerX = group.x() + width / 2
                      const centerY = group.y() + height / 2
                      
                      const angle = Math.atan2(pointer.y - centerY, pointer.x - centerX)
                      const degrees = (angle * 180) / Math.PI + 90
                      
                      handleRotation(placedEquipment.id, degrees)
                    }}
                  />
                  {/* Rotation line */}
                  <Rect
                    x={width / 2 - 0.5}
                    y={-20}
                    width={1}
                    height={20}
                    fill="#10b981"
                    listening={false}
                  />
                </Group>
                
                {/* Delete button */}
                <Rect
                  x={width - 12}
                  y={-12}
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
