'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'

// Dynamically import CanvasEditor to avoid SSR issues with Konva
const CanvasEditor = dynamic(
  () => import('@/components/canvas/CanvasEditor'),
  { ssr: false }
)

const EquipmentLibrary = dynamic(
  () => import('@/components/equipment/EquipmentLibrary'),
  { ssr: false }
)

const KeyboardHandler = dynamic(
  () => import('@/components/canvas/KeyboardHandler'),
  { ssr: false }
)

export default function CanvasPage() {
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([])
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([])

  // Handle adding equipment to canvas
  const handleEquipmentSelect = (equipment: EquipmentItem) => {
    // Add equipment to center of current view
    const newEquipment: PlacedEquipment = {
      id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      equipmentId: equipment.id,
      x: 400, // Center of typical canvas view
      y: 300,
      rotation: 0,
      dimensions: equipment.dimensions, // Store the actual dimensions used (including custom ones)
      customLabel: undefined
    }
    
    setPlacedEquipment(prev => [...prev, newEquipment])
    setSelectedEquipmentIds([newEquipment.id])
  }

  // Handle equipment selection on canvas
  const handleCanvasEquipmentSelect = (equipment: PlacedEquipment | null) => {
    if (equipment) {
      setSelectedEquipmentIds([equipment.id])
    } else {
      setSelectedEquipmentIds([])
    }
  }

  // Handle equipment movement
  const handleEquipmentMove = (equipmentId: string, x: number, y: number) => {
    setPlacedEquipment(prev => 
      prev.map(eq => 
        eq.id === equipmentId 
          ? { ...eq, x, y }
          : eq
      )
    )
  }

  // Handle equipment rotation
  const handleEquipmentRotate = (equipmentId: string, rotation: number) => {
    setPlacedEquipment(prev => 
      prev.map(eq => 
        eq.id === equipmentId 
          ? { ...eq, rotation }
          : eq
      )
    )
  }

  // Handle equipment deletion
  const handleEquipmentDelete = (equipmentId: string) => {
    setPlacedEquipment(prev => prev.filter(eq => eq.id !== equipmentId))
    // Clear selection if deleted equipment was selected
    if (selectedEquipmentIds.includes(equipmentId)) {
      setSelectedEquipmentIds(prev => prev.filter(id => id !== equipmentId))
    }
  }

  // Handle multiple equipment deletion
  const handleMultipleEquipmentDelete = (equipmentIds: string[]) => {
    setPlacedEquipment(prev => prev.filter(eq => !equipmentIds.includes(eq.id)))
    setSelectedEquipmentIds([])
  }

  // Handle equipment duplication
  const handleEquipmentDuplicate = (equipmentIds: string[]) => {
    const equipmentToDuplicate = placedEquipment.filter(eq => equipmentIds.includes(eq.id))
    const duplicatedEquipment = equipmentToDuplicate.map(eq => ({
      ...eq,
      id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: eq.x + 50, // Offset duplicated equipment
      y: eq.y + 50,
      dimensions: eq.dimensions // Preserve the custom dimensions
    }))
    
    setPlacedEquipment(prev => [...prev, ...duplicatedEquipment])
    setSelectedEquipmentIds(duplicatedEquipment.map(eq => eq.id))
  }

  // Handle select all
  const handleSelectAll = () => {
    setSelectedEquipmentIds(placedEquipment.map(eq => eq.id))
  }

  // Handle deselect all
  const handleDeselectAll = () => {
    setSelectedEquipmentIds([])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Site Planner</h1>
              <p className="text-sm text-gray-600">Canvas Editor</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Project
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Equipment Library */}
        <EquipmentLibrary
          onEquipmentSelect={handleEquipmentSelect}
          className="w-64"
        />

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <CanvasEditor 
            className="w-full h-full"
            placedEquipment={placedEquipment}
            onEquipmentSelect={handleCanvasEquipmentSelect}
            onEquipmentMove={handleEquipmentMove}
            onEquipmentRotate={handleEquipmentRotate}
            onEquipmentDelete={handleEquipmentDelete}
            selectedEquipmentId={selectedEquipmentIds[0] || undefined}
          />
          
          {/* Keyboard Handler */}
          <KeyboardHandler
            selectedEquipmentIds={selectedEquipmentIds}
            placedEquipment={placedEquipment}
            onEquipmentDelete={handleMultipleEquipmentDelete}
            onEquipmentDuplicate={handleEquipmentDuplicate}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>

        {/* Right Sidebar - Properties (placeholder) */}
        <div className="w-64 bg-white border-l border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canvas Scale
              </label>
              <div className="text-sm text-gray-600">1 pixel = 1 foot</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grid Size
              </label>
              <input 
                type="number" 
                defaultValue={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Grid size in pixels"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background
              </label>
              <button className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Upload Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
