'use client'

import React, { useState } from 'react'

interface EnhancedCalibrateDialogProps {
  isOpen: boolean
  calculatedDistance: number
  onSubmit: (actualDistance: number) => void
  onEdit: () => void
  onCancel: () => void
}

const EnhancedCalibrateDialog: React.FC<EnhancedCalibrateDialogProps> = ({
  isOpen,
  calculatedDistance,
  onSubmit,
  onEdit,
  onCancel
}) => {
  const [realWorldDistance, setRealWorldDistance] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    const distance = parseFloat(realWorldDistance)
    if (!isNaN(distance) && distance > 0) {
      onSubmit(distance)
      setRealWorldDistance('')
    }
  }

  const handleEdit = () => {
    onEdit()
    setRealWorldDistance('')
  }

  const handleCancel = () => {
    onCancel()
    setRealWorldDistance('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Calibrate Measurement Scale
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Calculated distance: <span className="font-medium">{calculatedDistance.toFixed(1)} feet</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Enter the actual real-world distance to calibrate the scale:
          </p>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={realWorldDistance}
              onChange={(e) => setRealWorldDistance(e.target.value)}
              placeholder="Enter distance"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="0.1"
              min="0"
              autoFocus
            />
            <span className="text-sm text-gray-600 font-medium">feet</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Edit
          </button>
          <button
            onClick={handleSubmit}
            disabled={!realWorldDistance || parseFloat(realWorldDistance) <= 0}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Calibrate Scale
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedCalibrateDialog
