'use client'

import { useEffect } from 'react'
import { PlacedEquipment } from '@/lib/equipment/types'

interface KeyboardHandlerProps {
  selectedEquipmentIds: string[]
  placedEquipment: PlacedEquipment[]
  onEquipmentDelete: (equipmentIds: string[]) => void
  onEquipmentDuplicate: (equipmentIds: string[]) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onUndo?: () => void
  onRedo?: () => void
}

const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({
  selectedEquipmentIds,
  placedEquipment,
  onEquipmentDelete,
  onEquipmentDuplicate,
  onSelectAll,
  onDeselectAll,
  onUndo,
  onRedo
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedEquipmentIds.length > 0) {
            e.preventDefault()
            onEquipmentDelete(selectedEquipmentIds)
          }
          break

        case 'd':
        case 'D':
          if (isCtrlOrCmd && selectedEquipmentIds.length > 0) {
            e.preventDefault()
            onEquipmentDuplicate(selectedEquipmentIds)
          }
          break

        case 'a':
        case 'A':
          if (isCtrlOrCmd) {
            e.preventDefault()
            onSelectAll()
          }
          break

        case 'Escape':
          e.preventDefault()
          onDeselectAll()
          break

        case 'z':
        case 'Z':
          if (isCtrlOrCmd && !isShift && onUndo) {
            e.preventDefault()
            onUndo()
          } else if (isCtrlOrCmd && isShift && onRedo) {
            e.preventDefault()
            onRedo()
          }
          break

        case 'y':
        case 'Y':
          if (isCtrlOrCmd && onRedo) {
            e.preventDefault()
            onRedo()
          }
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedEquipmentIds, onEquipmentDelete, onEquipmentDuplicate, onSelectAll, onDeselectAll, onUndo, onRedo])

  return null // This component doesn't render anything
}

export default KeyboardHandler
