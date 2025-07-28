'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { EquipmentItem, EquipmentCategory, EquipmentDimensions, EquipmentShape, RectangularDimensions, CircularDimensions, EquipmentClearance } from '@/lib/equipment/types'
import { organizedLibrary, searchEquipment } from '@/lib/equipment/library'
import { EquipmentLibraryState } from '@/lib/project/types'
import ClearanceEditor from '@/components/canvas/ClearanceEditor'
import EquipmentLibraryManager from './EquipmentLibraryManager'

interface EquipmentLibraryProps {
  onEquipmentSelect: (equipment: EquipmentItem) => void
  onEquipmentDefinitionsChange?: (definitions: EquipmentItem[]) => void
  onLibraryStateChange?: (state: EquipmentLibraryState) => void
  initialLibraryState?: EquipmentLibraryState
  className?: string
  style?: React.CSSProperties
  isCollapsed?: boolean
}

const categoryLabels: Record<EquipmentCategory, string> = {
  'mega-rides': 'Mega Rides',
  'rides': 'Rides',
  'kiddy-rides': 'Kiddy Rides',
  'food': 'Food',
  'games': 'Games',
  'equipment': 'Equipment',
  'office': 'Office',
  'home': 'Home',
  'bunks': 'Bunks'
}

const categoryIcons: Record<EquipmentCategory, string> = {
  'mega-rides': '🎢',
  'rides': '🎠',
  'kiddy-rides': '🎪',
  'food': '🍔',
  'games': '🎯',
  'equipment': '⚙️',
  'office': '🏢',
  'home': '🏠',
  'bunks': '🛏️'
}

const EquipmentLibrary: React.FC<EquipmentLibraryProps> = ({
  onEquipmentSelect,
  onEquipmentDefinitionsChange,
  onLibraryStateChange,
  initialLibraryState,
  className = '',
  style,
  isCollapsed = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingDimensions, setEditingDimensions] = useState<Set<string>>(new Set())
  const [customDimensions, setCustomDimensions] = useState<Record<string, EquipmentDimensions>>({})
  const [customCategories, setCustomCategories] = useState<Record<string, EquipmentCategory>>({})
  const [customNames, setCustomNames] = useState<Record<string, string>>({})
  // New operational specifications state
  const [customWeight, setCustomWeight] = useState<Record<string, number>>({})
  const [customCapacity, setCustomCapacity] = useState<Record<string, number>>({})
  const [customTurnAroundTime, setCustomTurnAroundTime] = useState<Record<string, number>>({})
  const [customVerticalHeight, setCustomVerticalHeight] = useState<Record<string, number>>({})
  const [customRideClearing, setCustomRideClearing] = useState<Record<string, number>>({})
  const [customClearances, setCustomClearances] = useState<Record<string, EquipmentClearance>>({})
  const [clearanceEditorOpen, setClearanceEditorOpen] = useState<string | null>(null)
  const [newEquipmentItems, setNewEquipmentItems] = useState<EquipmentItem[]>([])
  const [newEquipmentCounter, setNewEquipmentCounter] = useState(0)
  const [libraryManagerOpen, setLibraryManagerOpen] = useState(false)

  // Initialize state from saved project data
  useEffect(() => {
    if (initialLibraryState) {
      setCustomDimensions(initialLibraryState.customDimensions || {})
      setCustomCategories(initialLibraryState.customCategories || {})
      setCustomNames(initialLibraryState.customNames || {})
      setCustomWeight(initialLibraryState.customWeight || {})
      setCustomCapacity(initialLibraryState.customCapacity || {})
      setCustomTurnAroundTime(initialLibraryState.customTurnAroundTime || {})
      setCustomVerticalHeight(initialLibraryState.customVerticalHeight || {})
      setCustomRideClearing(initialLibraryState.customRideClearing || {})
      setCustomClearances(initialLibraryState.customClearances || {})
      setNewEquipmentItems(initialLibraryState.newEquipmentItems || [])
      setNewEquipmentCounter(initialLibraryState.newEquipmentCounter || 0)
    }
  }, [initialLibraryState])

  // Notify parent component when library state changes
  useEffect(() => {
    if (onLibraryStateChange) {
      const currentState: EquipmentLibraryState = {
        customDimensions,
        customCategories,
        customNames,
        customWeight,
        customCapacity,
        customTurnAroundTime,
        customVerticalHeight,
        customRideClearing,
        customClearances,
        newEquipmentItems,
        newEquipmentCounter
      }
      onLibraryStateChange(currentState)
    }
  }, [
    customDimensions,
    customCategories,
    customNames,
    customWeight,
    customCapacity,
    customTurnAroundTime,
    customVerticalHeight,
    customRideClearing,
    customClearances,
    newEquipmentItems,
    newEquipmentCounter,
    onLibraryStateChange
  ])

  // Memoize all equipment definitions to prevent unnecessary updates
  const allEquipmentDefinitions = useMemo(() => {
    return [...Object.values(organizedLibrary).flat(), ...newEquipmentItems]
  }, [newEquipmentItems])

  // Notify parent component when equipment definitions change
  useEffect(() => {
    if (onEquipmentDefinitionsChange) {
      onEquipmentDefinitionsChange(allEquipmentDefinitions)
    }
  }, [allEquipmentDefinitions, onEquipmentDefinitionsChange])

  const filteredEquipment = useMemo(() => {
    let items: EquipmentItem[] = []

    if (searchQuery.trim()) {
      items = searchEquipment(searchQuery)
    } else {
      // Get all equipment from organized library and new equipment
      items = [...Object.values(organizedLibrary).flat(), ...newEquipmentItems]
    }

    // Filter by selected category if not 'all'
    if (selectedCategory !== 'all') {
      items = items.filter(item => {
        const category = customCategories[item.id] || item.category
        return category === selectedCategory
      })
    }

    return items
  }, [selectedCategory, searchQuery, newEquipmentItems, customCategories, customNames])

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
            [itemId]: { ...equipment.dimensions }
          }))
        }
      }
    }
    setEditingDimensions(newEditing)
  }

  const updateCustomDimension = (itemId: string, field: string, value: number) => {
    setCustomDimensions(prev => {
      const current = prev[itemId]
      if (!current) return prev
      
      return {
        ...prev,
        [itemId]: {
          ...current,
          [field]: value
        } as EquipmentDimensions
      }
    })
  }

  const updateCustomShape = (itemId: string, shape: EquipmentShape) => {
    const equipment = filteredEquipment.find(eq => eq.id === itemId)
    if (!equipment) return

    setCustomDimensions(prev => {
      const current = prev[itemId] || equipment.dimensions
      
      if (shape === 'rectangle') {
        // Convert to rectangle
        const newDims: RectangularDimensions = {
          shape: 'rectangle',
          width: current.shape === 'circle' ? current.radius * 2 : (current as RectangularDimensions).width,
          height: current.shape === 'circle' ? current.radius * 2 : (current as RectangularDimensions).height,
          depth: current.depth
        }
        return { ...prev, [itemId]: newDims }
      } else {
        // Convert to circle
        const newDims: CircularDimensions = {
          shape: 'circle',
          radius: current.shape === 'rectangle' ? Math.max((current as RectangularDimensions).width, (current as RectangularDimensions).height) / 2 : (current as CircularDimensions).radius,
          depth: current.depth
        }
        return { ...prev, [itemId]: newDims }
      }
    })
  }

  const updateCustomCategory = (itemId: string, category: EquipmentCategory) => {
    setCustomCategories(prev => ({
      ...prev,
      [itemId]: category
    }))
  }

  const updateCustomName = (itemId: string, name: string) => {
    setCustomNames(prev => ({
      ...prev,
      [itemId]: name
    }))
  }

  const resetDimensions = (itemId: string) => {
    const equipment = filteredEquipment.find(eq => eq.id === itemId)
    if (equipment) {
      setCustomDimensions(prev => ({
        ...prev,
        [itemId]: { ...equipment.dimensions }
      }))
      setCustomCategories(prev => {
        const { [itemId]: removed, ...rest } = prev
        return rest
      })
      setCustomNames(prev => {
        const { [itemId]: removed, ...rest } = prev
        return rest
      })
    }
  }

  const addNewEquipment = () => {
    const newCounter = newEquipmentCounter + 1
    const newId = `custom-${newCounter}`
    const newEquipment: EquipmentItem = {
      id: newId,
      name: 'New Equipment',
      category: 'equipment',
      dimensions: { shape: 'rectangle', width: 4, height: 4 },
      clearance: { type: 'rectangular', all: 2 },
      color: '#6B7280',
      description: 'Custom equipment item',
      specifications: { capacity: 1 },
      tags: ['custom']
    }
    
    // Update counter
    setNewEquipmentCounter(newCounter)
    
    // Add to custom dimensions for editing
    setCustomDimensions(prev => ({
      ...prev,
      [newId]: newEquipment.dimensions
    }))
    
    // Start editing dimensions immediately
    setEditingDimensions(prev => new Set([...prev, newId]))
    
    // Add to the new equipment items state
    setNewEquipmentItems(prev => [...prev, newEquipment])
    
    // Don't automatically select the equipment - let user click to place it
  }

  // Handle equipment library updates from import/export
  const handleEquipmentLibraryUpdate = (newDefinitions: EquipmentItem[], importedCustomSettings?: any) => {
    // Clear existing custom state
    setNewEquipmentItems([])
    setCustomDimensions({})
    setCustomCategories({})
    setCustomNames({})
    setCustomWeight({})
    setCustomCapacity({})
    setCustomTurnAroundTime({})
    setCustomVerticalHeight({})
    setCustomRideClearing({})
    setCustomClearances({})
    
    // Set new equipment items (filter out base library items)
    const baseLibraryIds = new Set(Object.values(organizedLibrary).flat().map(eq => eq.id))
    const customEquipment = newDefinitions.filter(eq => !baseLibraryIds.has(eq.id))
    setNewEquipmentItems(customEquipment)
    
    // Restore custom settings if they were imported
    if (importedCustomSettings) {
      if (importedCustomSettings.customDimensions) {
        setCustomDimensions(importedCustomSettings.customDimensions)
      }
      if (importedCustomSettings.customCategories) {
        setCustomCategories(importedCustomSettings.customCategories)
      }
      if (importedCustomSettings.customNames) {
        setCustomNames(importedCustomSettings.customNames)
      }
      if (importedCustomSettings.customWeight) {
        setCustomWeight(importedCustomSettings.customWeight)
      }
      if (importedCustomSettings.customCapacity) {
        setCustomCapacity(importedCustomSettings.customCapacity)
      }
      if (importedCustomSettings.customTurnAroundTime) {
        setCustomTurnAroundTime(importedCustomSettings.customTurnAroundTime)
      }
      if (importedCustomSettings.customVerticalHeight) {
        setCustomVerticalHeight(importedCustomSettings.customVerticalHeight)
      }
      if (importedCustomSettings.customRideClearing) {
        setCustomRideClearing(importedCustomSettings.customRideClearing)
      }
      if (importedCustomSettings.customClearances) {
        setCustomClearances(importedCustomSettings.customClearances)
      }
      
      console.log('Custom settings restored:', importedCustomSettings)
    }
    
    console.log('Equipment library updated:', {
      total: newDefinitions.length,
      custom: customEquipment.length,
      base: newDefinitions.length - customEquipment.length,
      customSettingsRestored: !!importedCustomSettings
    })
  }

  const handleEquipmentClick = (equipment: EquipmentItem) => {
    // Create equipment with custom dimensions, category, name, operational specs, and clearance if they exist
    const customDims = customDimensions[equipment.id]
    const customCategory = customCategories[equipment.id]
    const customName = customNames[equipment.id]
    const customWeightValue = customWeight[equipment.id]
    const customCapacityValue = customCapacity[equipment.id]
    const customTurnAroundTimeValue = customTurnAroundTime[equipment.id]
    const customVerticalHeightValue = customVerticalHeight[equipment.id]
    const customRideClearingValue = customRideClearing[equipment.id]
    const customClearanceValue = customClearances[equipment.id]
    
    // Debug logging for clearance data
    console.log('Equipment Library - handleEquipmentClick:', {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      customClearanceValue,
      hasCustomClearance: !!customClearanceValue
    })
    
    const equipmentToPlace = {
      ...equipment,
      ...(customDims && { dimensions: customDims }),
      ...(customCategory && { category: customCategory }),
      ...(customName && { name: customName }),
      ...(customWeightValue !== undefined && { weight: customWeightValue }),
      ...(customCapacityValue !== undefined && { capacity: customCapacityValue }),
      ...(customTurnAroundTimeValue !== undefined && { turnAroundTime: customTurnAroundTimeValue }),
      ...(customVerticalHeightValue !== undefined && { verticalHeight: customVerticalHeightValue }),
      ...(customRideClearingValue !== undefined && { rideClearing: customRideClearingValue }),
      ...(customClearanceValue && { clearance: customClearanceValue })
    }
    
    console.log('Equipment Library - equipmentToPlace:', {
      id: equipmentToPlace.id,
      name: equipmentToPlace.name,
      clearance: equipmentToPlace.clearance
    })
    
    onEquipmentSelect(equipmentToPlace)
  }

  const categories = Object.keys(organizedLibrary) as EquipmentCategory[]
  
  // Get dynamic categories from current equipment (including custom categories)
  const dynamicCategories = useMemo(() => {
    const categorySet = new Set<EquipmentCategory>()
    
    // Add categories from organized library
    categories.forEach(cat => categorySet.add(cat))
    
    // Add custom categories from equipment
    Object.values(customCategories).forEach(cat => categorySet.add(cat))
    
    // Add categories from new equipment items
    newEquipmentItems.forEach(item => {
      const category = customCategories[item.id] || item.category
      categorySet.add(category)
    })
    
    return Array.from(categorySet).sort()
  }, [categories, customCategories, newEquipmentItems])

  // If collapsed, show minimal category icon view
  if (isCollapsed) {
    return (
      <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
        <div className="p-2">
          <div className="text-center mb-2">
            <span className="text-lg">🦎</span>
          </div>
          <div className="space-y-1">
            {/* All categories button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full p-2 rounded text-xs transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="All Equipment"
            >
              📦
            </button>
            
            {/* Dynamic category icons */}
            {dynamicCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full p-2 rounded text-xs transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={categoryLabels[category]}
              >
                {categoryIcons[category]}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`} style={style}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Equipment Library</h3>
        
        {/* Equipment Management Buttons */}
        <div className="mb-3 space-y-2">
          <button
            onClick={addNewEquipment}
            className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            ➕ Add New Equipment
          </button>
          <button
            onClick={() => setLibraryManagerOpen(true)}
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            📚 Manage Library
          </button>
        </div>
        
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
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
          {dynamicCategories.map(category => (
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
              const customCategory = customCategories[equipment.id]
              const customName = customNames[equipment.id]
              const currentDims = customDims || equipment.dimensions
              const currentCategory = customCategory || equipment.category
              const currentName = customName || equipment.name
              const hasCustomizations = customDims || customCategory || customName
              
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
                            {categoryIcons[currentCategory]}
                          </span>
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {currentName}
                              {hasCustomizations && <span className="text-blue-600 ml-1">*</span>}
                            </div>
                            <div className="text-xs text-gray-500">
                              {currentDims.shape === 'circle' 
                                ? `⭕ ${(currentDims as CircularDimensions).radius}&apos; radius${currentDims.depth ? ` × ${currentDims.depth}&apos;` : ''}`
                                : `⬜ ${(currentDims as RectangularDimensions).width}&apos; × ${(currentDims as RectangularDimensions).height}&apos;${currentDims.depth ? ` × ${currentDims.depth}&apos;` : ''}`
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Auto-open dropdown if not already expanded
                            if (!isExpanded) {
                              toggleItemExpanded(equipment.id)
                            }
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
                          className={`p-1 rounded transition-colors ${
                            isExpanded 
                              ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' 
                              : 'hover:bg-gray-200 text-gray-700'
                          }`}
                          title="Toggle details"
                        >
                          <svg
                            className={`w-4 h-4 transform transition-all duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
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
                            
                            {/* Name Input */}
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-blue-900 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={customNames[equipment.id] || equipment.name}
                                onChange={(e) => updateCustomName(equipment.id, e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                                placeholder="Equipment name"
                              />
                            </div>
                            
                            {/* Shape Toggle */}
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-blue-900 mb-1">
                                Shape
                              </label>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateCustomShape(equipment.id, 'rectangle')
                                  }}
                                  className={`px-3 py-1 text-xs rounded ${
                                    currentDims.shape === 'rectangle'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  ⬜ Rectangle
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateCustomShape(equipment.id, 'circle')
                                  }}
                                  className={`px-3 py-1 text-xs rounded ${
                                    currentDims.shape === 'circle'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  ⭕ Circle
                                </button>
                              </div>
                            </div>

                            {/* Category Dropdown */}
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-blue-900 mb-1">
                                Category
                              </label>
                              <select
                                value={customCategories[equipment.id] || equipment.category}
                                onChange={(e) => updateCustomCategory(equipment.id, e.target.value as EquipmentCategory)}
                                className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                              >
                                <option value="mega-rides">🎢 Mega Rides</option>
                                <option value="rides">🎠 Rides</option>
                                <option value="kiddy-rides">🎪 Kiddy Rides</option>
                                <option value="food">🍔 Food</option>
                                <option value="games">🎯 Games</option>
                                <option value="equipment">⚙️ Equipment</option>
                                <option value="office">🏢 Office</option>
                                <option value="home">🏠 Home</option>
                                <option value="bunks">🛏️ Bunks</option>
                              </select>
                            </div>

                            {/* Conditional Dimension Controls */}
                            {currentDims.shape === 'rectangle' ? (
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-blue-900 mb-1">
                                    Width (ft)
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={(currentDims as any).width || 0}
                                    onChange={(e) => updateCustomDimension(equipment.id, 'width', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
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
                                    value={(currentDims as any).height || 0}
                                    onChange={(e) => updateCustomDimension(equipment.id, 'height', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {currentDims.depth !== undefined && (
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
                                      className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-blue-900 mb-1">
                                    Radius (ft)
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={(currentDims as any).radius || 0}
                                    onChange={(e) => updateCustomDimension(equipment.id, 'radius', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {currentDims.depth !== undefined && (
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
                                      className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Operational Specifications Section */}
                            <div className="mt-4 pt-3 border-t border-blue-200">
                              <h4 className="text-xs font-medium text-blue-900 mb-3">Operational Specifications</h4>
                              
                              <div className="grid grid-cols-2 gap-3">
                                {/* Weight */}
                                <div>
                                  <label className="block text-xs font-medium text-blue-900 mb-1">
                                    Weight (lbs)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={customWeight[equipment.id] || equipment.weight || ''}
                                    onChange={(e) => setCustomWeight(prev => ({
                                      ...prev,
                                      [equipment.id]: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Equipment weight"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                
                                {/* Ride Capacity */}
                                <div>
                                  <label className="block text-xs font-medium text-blue-900 mb-1">
                                    Ride Capacity
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={customCapacity[equipment.id] || equipment.capacity || ''}
                                    onChange={(e) => setCustomCapacity(prev => ({
                                      ...prev,
                                      [equipment.id]: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Number of riders"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                
                                {/* Turn Around Time */}
                                <div>
                                  <label className="block text-xs font-medium text-blue-900 mb-1">
                                    Turn Around Time (min)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={customTurnAroundTime[equipment.id] || equipment.turnAroundTime || ''}
                                    onChange={(e) => setCustomTurnAroundTime(prev => ({
                                      ...prev,
                                      [equipment.id]: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Loading time"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                
                                {/* Vertical Height */}
                                <div>
                                  <label className="block text-xs font-medium text-blue-900 mb-1">
                                    Vertical Height (ft)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={customVerticalHeight[equipment.id] || equipment.verticalHeight || ''}
                                    onChange={(e) => setCustomVerticalHeight(prev => ({
                                      ...prev,
                                      [equipment.id]: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Height above ground"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                
                                {/* Ride Clearance */}
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-blue-900 mb-1">
                                    Ride Clearance (ft)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={customRideClearing[equipment.id] || equipment.rideClearing || ''}
                                    onChange={(e) => setCustomRideClearing(prev => ({
                                      ...prev,
                                      [equipment.id]: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Required clearance around ride"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              
                              {/* Custom Clearance Editor Button */}
                              <div className="mt-4 pt-3 border-t border-blue-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setClearanceEditorOpen(equipment.id)
                                  }}
                                  className="w-full px-3 py-2 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                                >
                                  🎯 Edit Custom Clearance Zone
                                </button>
                                <p className="text-xs text-blue-600 mt-1">
                                  Create polygonal clearance zones with curves
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-xs text-blue-700 mt-3">
                              * Custom specifications will be applied when placed on canvas
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="font-medium">Category:</span>
                            <br />
                            {categoryLabels[customCategories[equipment.id] || equipment.category]}
                            {customCategories[equipment.id] && <span className="text-blue-600"> (custom)</span>}
                          </div>
                          <div>
                            <span className="font-medium">Dimensions:</span>
                            <br />
                            {currentDims.shape === 'circle' 
                              ? `⭕ ${(currentDims as CircularDimensions).radius}&apos; radius${currentDims.depth ? ` × ${currentDims.depth}&apos;` : ''}`
                              : `⬜ ${(currentDims as RectangularDimensions).width}&apos; × ${(currentDims as RectangularDimensions).height}&apos;${currentDims.depth ? ` × ${currentDims.depth}&apos;` : ''}`
                            }
                            {customDims && <span className="text-blue-600"> (custom)</span>}
                          </div>
                          {/* Display custom or original capacity */}
                          {(customCapacity[equipment.id] || equipment.capacity) && (
                            <div>
                              <span className="font-medium">Capacity:</span>
                              <br />
                              {customCapacity[equipment.id] || equipment.capacity} riders
                              {customCapacity[equipment.id] && <span className="text-blue-600"> (custom)</span>}
                            </div>
                          )}
                          
                          {/* Display custom or original weight */}
                          {(customWeight[equipment.id] || equipment.weight) && (
                            <div>
                              <span className="font-medium">Weight:</span>
                              <br />
                              {customWeight[equipment.id] || equipment.weight} lbs
                              {customWeight[equipment.id] && <span className="text-blue-600"> (custom)</span>}
                            </div>
                          )}
                          
                          {/* Display turn around time */}
                          {(customTurnAroundTime[equipment.id] || equipment.turnAroundTime) && (
                            <div>
                              <span className="font-medium">Turn Around:</span>
                              <br />
                              {customTurnAroundTime[equipment.id] || equipment.turnAroundTime} min
                              {customTurnAroundTime[equipment.id] && <span className="text-blue-600"> (custom)</span>}
                            </div>
                          )}
                          
                          {/* Display vertical height */}
                          {(customVerticalHeight[equipment.id] || equipment.verticalHeight) && (
                            <div>
                              <span className="font-medium">Height:</span>
                              <br />
                              {customVerticalHeight[equipment.id] || equipment.verticalHeight}&apos; tall
                              {customVerticalHeight[equipment.id] && <span className="text-blue-600"> (custom)</span>}
                            </div>
                          )}
                          
                          {/* Display ride clearance */}
                          {(customRideClearing[equipment.id] || equipment.rideClearing) && (
                            <div>
                              <span className="font-medium">Ride Clearance:</span>
                              <br />
                              {customRideClearing[equipment.id] || equipment.rideClearing}&apos; clearance
                              {customRideClearing[equipment.id] && <span className="text-blue-600"> (custom)</span>}
                            </div>
                          )}
                          {equipment.clearance && (
                            <div>
                              <span className="font-medium">Clearance:</span>
                              <br />
                              {equipment.clearance.type === 'rectangular' && equipment.clearance.all ? 
                                `${equipment.clearance.all}' all sides` :
                                equipment.clearance.type === 'custom' ? 'Custom polygon' : 'Custom'
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
      
      {/* Clearance Editor Modal */}
      {clearanceEditorOpen && (() => {
        const equipment = filteredEquipment.find((eq: EquipmentItem) => eq.id === clearanceEditorOpen)
        if (!equipment) return null
        
        const currentDims = customDimensions[equipment.id] || equipment.dimensions
        const currentRideClearing = customRideClearing[equipment.id] || equipment.rideClearing || 0
        const currentClearance = customClearances[equipment.id] || equipment.clearance
        
        return (
          <ClearanceEditor
            clearance={currentClearance}
            dimensions={currentDims}
            rideClearing={currentRideClearing}
            onChange={(newClearance) => {
              setCustomClearances(prev => ({
                ...prev,
                [equipment.id]: newClearance
              }))
            }}
            onClose={() => setClearanceEditorOpen(null)}
          />
        )
      })()}
      
      {/* Equipment Library Manager Modal */}
      <EquipmentLibraryManager
        equipmentDefinitions={allEquipmentDefinitions}
        onEquipmentDefinitionsUpdate={handleEquipmentLibraryUpdate}
        customSettings={{
          customDimensions,
          customCategories,
          customNames,
          customWeight,
          customCapacity,
          customTurnAroundTime,
          customVerticalHeight,
          customRideClearing,
          customClearances
        }}
        isOpen={libraryManagerOpen}
        onClose={() => setLibraryManagerOpen(false)}
      />
    </div>
  )
}

export default EquipmentLibrary
