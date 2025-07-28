'use client'

import React from 'react'

interface PropertiesModalProps {
  isOpen: boolean
  onClose: () => void
}

const PropertiesModal: React.FC<PropertiesModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Canvas Properties & Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Canvas Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Canvas Info</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div><span className="font-medium">Size:</span> 250,000 sq ft</div>
              <div><span className="font-medium">Dimensions:</span> 500' × 500'</div>
              <div><span className="font-medium">Scale:</span> 10 px/ft</div>
            </div>
          </div>
          
          {/* Canvas Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canvas Scale
            </label>
            <div className="text-sm text-gray-600">10 pixels = 1 foot</div>
          </div>

          {/* Grid Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grid Size
            </label>
            <input 
              type="number" 
              defaultValue={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Grid size in pixels"
            />
          </div>

          {/* Background Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background
            </label>
            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Upload Image
            </button>
          </div>

          {/* Display Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Display Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm text-gray-600">Show grid</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm text-gray-600">Show equipment labels</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm text-gray-600">Show clearance zones</span>
              </label>
            </div>
          </div>

          {/* Measurement Units */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Measurement Units
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="feet">Feet</option>
              <option value="meters">Meters</option>
              <option value="yards">Yards</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertiesModal
