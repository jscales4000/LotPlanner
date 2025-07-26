'use client'

import React, { useState, useCallback } from 'react'
import { ClearancePoint, CustomClearance, RectangularClearance, EquipmentClearance, EquipmentDimensions } from '@/lib/equipment/types'
import { rectangularToCustomClearance, validateCustomClearance } from '@/lib/equipment/clearanceUtils'

interface ClearanceEditorProps {
  clearance: EquipmentClearance | undefined
  dimensions: EquipmentDimensions
  rideClearing?: number
  onChange: (clearance: EquipmentClearance) => void
  onClose: () => void
}

export default function ClearanceEditor({ 
  clearance, 
  dimensions, 
  rideClearing = 0, 
  onChange, 
  onClose 
}: ClearanceEditorProps) {
  const [editMode, setEditMode] = useState<'rectangular' | 'custom'>('rectangular')
  const [customClearance, setCustomClearance] = useState<CustomClearance>(() => {
    if (clearance?.type === 'custom') {
      return clearance
    }
    // Convert existing clearance to custom or create default
    const rectClearance: RectangularClearance = clearance?.type === 'rectangular' 
      ? clearance 
      : { type: 'rectangular', all: rideClearing }
    return rectangularToCustomClearance(rectClearance, dimensions)
  })

  const [rectangularClearance, setRectangularClearance] = useState<RectangularClearance>(() => {
    if (clearance?.type === 'rectangular') {
      return clearance
    }
    return { type: 'rectangular', all: rideClearing }
  })

  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null)
  const [errors, setErrors] = useState<string[]>(() => {
    // Validate initial custom clearance data
    if (clearance?.type === 'custom') {
      return validateCustomClearance(clearance)
    }
    // Convert existing clearance to custom or create default and validate
    const rectClearance: RectangularClearance = clearance?.type === 'rectangular' 
      ? clearance 
      : { type: 'rectangular', all: rideClearing }
    const initialCustomClearance = rectangularToCustomClearance(rectClearance, dimensions)
    return validateCustomClearance(initialCustomClearance)
  })

  // Validate and update custom clearance
  const updateCustomClearance = useCallback((newClearance: CustomClearance) => {
    const validationErrors = validateCustomClearance(newClearance)
    setErrors(validationErrors)
    setCustomClearance(newClearance)
    
    if (validationErrors.length === 0) {
      onChange(newClearance)
    }
  }, [onChange])

  // Add a new point to the polygon
  const addPoint = useCallback(() => {
    if (customClearance.points.length >= 20) return
    
    const newPoint: ClearancePoint = {
      x: 0,
      y: -20, // Default position above equipment
      curveType: 'none'
    }
    
    const newPoints = [...customClearance.points, newPoint]
    updateCustomClearance({ ...customClearance, points: newPoints })
  }, [customClearance, updateCustomClearance])

  // Remove a point from the polygon
  const removePoint = useCallback((index: number) => {
    if (customClearance.points.length <= 3) return
    
    const newPoints = customClearance.points.filter((_, i) => i !== index)
    updateCustomClearance({ ...customClearance, points: newPoints })
    setSelectedPointIndex(null)
  }, [customClearance, updateCustomClearance])

  // Update a specific point
  const updatePoint = useCallback((index: number, updates: Partial<ClearancePoint>) => {
    const newPoints = customClearance.points.map((point, i) => 
      i === index ? { ...point, ...updates } : point
    )
    updateCustomClearance({ ...customClearance, points: newPoints })
  }, [customClearance, updateCustomClearance])

  // Handle rectangular clearance changes
  const updateRectangularClearance = useCallback((updates: Partial<RectangularClearance>) => {
    const newClearance = { ...rectangularClearance, ...updates }
    setRectangularClearance(newClearance)
    onChange(newClearance)
  }, [rectangularClearance, onChange])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto text-gray-900" style={{color: '#111827'}}>
        <div className="p-6 text-gray-900" style={{color: '#111827'}}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Custom Clearance Zone</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setEditMode('rectangular')}
                className={`px-4 py-2 rounded ${
                  editMode === 'rectangular'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rectangular Clearance
              </button>
              <button
                onClick={() => setEditMode('custom')}
                className={`px-4 py-2 rounded ${
                  editMode === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Custom Polygon
              </button>
            </div>
          </div>

          {/* Rectangular Clearance Editor */}
          {editMode === 'rectangular' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900" style={{color: '#111827 !important'}}>Front (ft)</label>
                  <input
                    type="number"
                    value={rectangularClearance.front ?? ''}
                    onChange={(e) => updateRectangularClearance({ 
                      front: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900" style={{color: '#111827 !important'}}>Back (ft)</label>
                  <input
                    type="number"
                    value={rectangularClearance.back ?? ''}
                    onChange={(e) => updateRectangularClearance({ 
                      back: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900" style={{color: '#111827 !important'}}>Left (ft)</label>
                  <input
                    type="number"
                    value={rectangularClearance.left ?? ''}
                    onChange={(e) => updateRectangularClearance({ 
                      left: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900" style={{color: '#111827 !important'}}>Right (ft)</label>
                  <input
                    type="number"
                    value={rectangularClearance.right ?? ''}
                    onChange={(e) => updateRectangularClearance({ 
                      right: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900" style={{color: '#111827 !important'}}>All Sides (ft)</label>
                <input
                  type="number"
                  value={rectangularClearance.all ?? ''}
                  onChange={(e) => updateRectangularClearance({ 
                    all: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Setting this will override individual side values
                </p>
              </div>
            </div>
          )}

          {/* Custom Polygon Editor */}
          {editMode === 'custom' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium" style={{color: '#111827'}}>Polygon Points</h3>
                <button
                  onClick={addPoint}
                  disabled={customClearance.points.length >= 20}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-300"
                >
                  Add Point
                </button>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <h4 className="text-red-800 font-medium mb-1">Validation Errors:</h4>
                  <ul className="text-red-700 text-sm">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Points List */}
              <div className="max-h-60 overflow-y-auto space-y-3">
                {customClearance.points.map((point, index) => (
                  <div
                    key={index}
                    className={`border rounded p-3 ${
                      selectedPointIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium" style={{color: '#111827'}}>Point {index + 1}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPointIndex(
                            selectedPointIndex === index ? null : index
                          )}
                          className="text-blue-500 text-sm"
                        >
                          {selectedPointIndex === index ? 'Collapse' : 'Edit'}
                        </button>
                        <button
                          onClick={() => removePoint(index)}
                          disabled={customClearance.points.length <= 3}
                          className="text-red-500 text-sm disabled:text-gray-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {selectedPointIndex === index && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor={`point-${index}-x`} className="block text-sm font-medium mb-1 text-gray-900" style={{color: '#111827'}}>X Position (ft)</label>
                          <input
                            type="number"
                            id={`point-${index}-x`}
                            value={point.x}
                            onChange={(e) => updatePoint(index, { x: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                            step="0.5"
                            aria-label={`Point ${index + 1} X Position`}
                          />
                        </div>
                        <div>
                          <label htmlFor={`point-${index}-y`} className="block text-sm font-medium mb-1 text-gray-900" style={{color: '#111827'}}>Y Position (ft)</label>
                          <input
                            type="number"
                            id={`point-${index}-y`}
                            value={point.y}
                            onChange={(e) => updatePoint(index, { y: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                            step="0.5"
                            aria-label={`Point ${index + 1} Y Position`}
                          />
                        </div>
                        <div>
                          <label htmlFor={`point-${index}-curve-type`} className="block text-sm font-medium mb-1 text-gray-900" style={{color: '#111827'}}>Curve Type</label>
                          <select
                            id={`point-${index}-curve-type`}
                            value={point.curveType || 'none'}
                            onChange={(e) => updatePoint(index, { 
                              curveType: e.target.value as 'none' | 'arc'
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                            aria-label={`Point ${index + 1} Curve Type`}
                          >
                            <option value="none">Straight</option>
                            <option value="arc">Curved</option>
                          </select>
                        </div>
                        {point.curveType === 'arc' && (
                          <>
                            <div>
                              <label htmlFor={`point-${index}-curve-angle`} className="block text-sm font-medium mb-1 text-gray-900">Curve Angle</label>
                              <select
                                id={`point-${index}-curve-angle`}
                                value={point.curveAngle || 90}
                                onChange={(e) => updatePoint(index, { 
                                  curveAngle: parseInt(e.target.value) as 45 | 90 | 180
                                })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                                aria-label={`Point ${index + 1} Curve Angle`}
                              >
                                <option value={45}>45°</option>
                                <option value={90}>90°</option>
                                <option value={180}>180°</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor={`point-${index}-curve-direction`} className="block text-sm font-medium mb-1 text-gray-900">Direction</label>
                              <select
                                id={`point-${index}-curve-direction`}
                                value={point.curveDirection || 'clockwise'}
                                onChange={(e) => updatePoint(index, { 
                                  curveDirection: e.target.value as 'clockwise' | 'counterclockwise'
                                })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 bg-white"
                                aria-label={`Point ${index + 1} Curve Direction`}
                              >
                                <option value="clockwise">Clockwise</option>
                                <option value="counterclockwise">Counter-clockwise</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="closed"
                  checked={customClearance.closed}
                  onChange={(e) => updateCustomClearance({ 
                    ...customClearance, 
                    closed: e.target.checked 
                  })}
                />
                <label htmlFor="closed" className="text-sm text-gray-900">Close polygon</label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              disabled={errors.length > 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
