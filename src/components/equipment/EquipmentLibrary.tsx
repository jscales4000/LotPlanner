'use client'

import React, { useState, useMemo } from 'react'
import { EquipmentItem, EquipmentCategory } from '@/lib/equipment/types'
import { organizedLibrary, searchEquipment } from '@/lib/equipment/library'

interface EquipmentLibraryProps {
  onEquipmentSelect: (equipment: EquipmentItem) => void
  className?: string
}

const categoryLabels: Record<EquipmentCategory, string> = {
  seating: 'Seating',
  barriers: 'Barriers',
  stages: 'Stages',
  utilities: 'Utilities',
  vehicles: 'Vehicles',
  structures: 'Structures',
  lighting: 'Lighting',
  sound: 'Sound'
}

const categoryIcons: Record<EquipmentCategory, string> = {
  seating: '🪑',
  barriers: '🚧',
  stages: '🎭',
  utilities: '⚡',
  vehicles: '🚛',
  structures: '🏗️',
  lighting: '💡',
  sound: '🔊'
}

const EquipmentLibrary: React.FC<EquipmentLibraryProps> = ({
  onEquipmentSelect,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingDimensions, setEditingDimensions] = useState<Set<string>>(new Set())
  const [customDimensions, setCustomDimensions] = useState<Record<string, { width: number; height: number; depth?: number }>>({})

  const filteredEquipment = useMemo(() => {
    let items: EquipmentItem[] = []

    if (searchQuery.trim()) {
      items = searchEquipment(searchQuery)
    } else if (selectedCategory === 'all') {
      items = Object.values(organizedLibrary).flat()
    } else {
      items = organizedLibrary[selectedCategory] || []
    }

    return items
  }, [selectedCategory, searchQuery])

  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const toggleDimensionEditing = (itemId: string) => {
    const newEditing = new Set(editingDimensions)
    if (newEditing.has(itemId)) {
      newEditing.delete(itemId)
    } else {
      newEditing.add(itemId)
      // Initialize custom dimensions with current values if not already set
      if (!customDimensions[itemId]) {
        const equipment = filteredEquipment.find(eq => eq.id === itemId)
        if (equipment) {
          setCustomDimensions(prev => ({
            ...prev,
            [itemId]: {
              width: equipment.dimensions.width,
              height: equipment.dimensions.height,
              depth: equipment.dimensions.depth
            }
          }))
        }
      }
    }
    setEditingDimensions(newEditing)
  }

  const updateCustomDimension = (itemId: string, field: 'width' | 'height' | 'depth', value: number) => {
    setCustomDimensions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const resetDimensions = (itemId: string) => {
    const equipment = filteredEquipment.find(eq => eq.id === itemId)
    if (equipment) {
      setCustomDimensions(prev => ({
        ...prev,
        [itemId]: {
          width: equipment.dimensions.width,
          height: equipment.dimensions.height,
          depth: equipment.dimensions.depth
        }
      }))
    }
  }

  const handleEquipmentClick = (equipment: EquipmentItem) => {
    // Create equipment with custom dimensions if they exist
    const customDims = customDimensions[equipment.id]
    const equipmentToPlace = customDims ? {
      ...equipment,
      dimensions: {
        width: customDims.width,
        height: customDims.height,
        depth: customDims.depth
      }
    } : equipment
    
    onEquipmentSelect(equipmentToPlace)
  }

  const categories = Object.keys(organizedLibrary) as EquipmentCategory[]

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Equipment Library</h3>
        
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 text-xs rounded ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-xs rounded ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={categoryLabels[category]}
            >
              {categoryIcons[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredEquipment.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No equipment found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredEquipment.map(equipment => {
              const isExpanded = expandedItems.has(equipment.id)
              const isEditingDims = editingDimensions.has(equipment.id)
              const customDims = customDimensions[equipment.id]
              const currentDims = customDims || equipment.dimensions
              
              return (
                <div
                  key={equipment.id}
                  className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="p-3 cursor-pointer"
                    onClick={() => handleEquipmentClick(equipment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {categoryIcons[equipment.category]}
                          </span>
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {equipment.name}
                              {customDims && <span className="text-blue-600 ml-1">*</span>}
                            </div>
                            <div className="text-xs text-gray-500">
                              {currentDims.width}&apos; × {currentDims.height}&apos;
                              {currentDims.depth && ` × ${currentDims.depth}&apos;`}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleDimensionEditing(equipment.id)
                          }}
                          className={`p-1 hover:bg-gray-200 rounded text-xs ${
                            isEditingDims ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                          }`}
                          title="Edit dimensions"
                        >
                          📏
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleItemExpanded(equipment.id)
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Toggle details"
                        >
                          <svg
                            className={`w-4 h-4 transform transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-gray-100">
                      <div className="text-xs text-gray-600 space-y-1 mt-2">
                        {equipment.description && (
                          <p>{equipment.description}</p>
                        )}
                        
                        {/* Dimension Editing Section */}
                        {isEditingDims && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-blue-900">Edit Dimensions</span>
                              <button
                                onClick={() => resetDimensions(equipment.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Reset
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-blue-900 mb-1">
                                  Width (ft)
                                </label>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={currentDims.width}
                                  onChange={(e) => updateCustomDimension(equipment.id, 'width', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-blue-900 mb-1">
                                  Height (ft)
                                </label>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={currentDims.height}
                                  onChange={(e) => updateCustomDimension(equipment.id, 'height', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              {equipment.dimensions.depth !== undefined && (
                                <div>
                                  <label className="block text-xs font-medium text-blue-900 mb-1">
                                    Depth (ft)
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={currentDims.depth || 0}
                                    onChange={(e) => updateCustomDimension(equipment.id, 'depth', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-blue-700 mt-2">
                              * Custom dimensions will be applied when placed on canvas
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="font-medium">Category:</span>
                            <br />
                            {categoryLabels[equipment.category]}
                          </div>
                          <div>
                            <span className="font-medium">Dimensions:</span>
                            <br />
                            {currentDims.width}&apos; × {currentDims.height}&apos;
                            {currentDims.depth && ` × ${currentDims.depth}&apos;`}
                            {customDims && <span className="text-blue-600"> (custom)</span>}
                          </div>
                          {equipment.specifications?.capacity && (
                            <div>
                              <span className="font-medium">Capacity:</span>
                              <br />
                              {equipment.specifications.capacity}
                            </div>
                          )}
                          {equipment.specifications?.weight && (
                            <div>
                              <span className="font-medium">Weight:</span>
                              <br />
                              {equipment.specifications.weight} lbs
                            </div>
                          )}
                          {equipment.clearance && (
                            <div>
                              <span className="font-medium">Clearance:</span>
                              <br />
                              {equipment.clearance.all ? 
                                `${equipment.clearance.all}&apos; all sides` :
                                'Custom'
                              }
                            </div>
                          )}
                        </div>

                        {equipment.tags && equipment.tags.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {equipment.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {filteredEquipment.length} item{filteredEquipment.length !== 1 ? 's' : ''} available
        </div>
      </div>
    </div>
  )
}

export default EquipmentLibrary
