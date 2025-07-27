'use client'

import React, { useState, useRef } from 'react'
import { ExportOptions, ImportResult } from '@/lib/project/types'
import { ProjectManager } from '@/lib/project/projectManager'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'
import { BackgroundImage } from '@/components/canvas/BackgroundLayer'

interface ExportImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (result: ImportResult) => void
  placedEquipment: PlacedEquipment[]
  backgroundImages: BackgroundImage[]
  equipmentDefinitions: EquipmentItem[]
  customEquipmentCount: number
  projectName: string
}

export default function ExportImportModal({
  isOpen,
  onClose,
  onImport,
  placedEquipment,
  backgroundImages,
  equipmentDefinitions,
  customEquipmentCount,
  projectName
}: ExportImportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeBackgroundImages: true,
    includeCustomEquipment: true,
    compressionLevel: 'none',
    format: 'json'
  })
  const [exportFileName, setExportFileName] = useState(projectName || 'lot-planner-project')
  const [importStatus, setImportStatus] = useState<{
    loading: boolean
    result?: ImportResult
  }>({ loading: false })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const projectData = ProjectManager.exportProject(
        placedEquipment,
        backgroundImages,
        equipmentDefinitions,
        customEquipmentCount,
        exportFileName,
        exportOptions
      )
      
      ProjectManager.downloadProject(projectData, exportFileName)
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportStatus({ loading: true })

    try {
      const fileContent = await ProjectManager.readProjectFile(file)
      const result = ProjectManager.importProject(fileContent)
      
      setImportStatus({ loading: false, result })
      
      if (result.success) {
        onImport(result)
        onClose()
      }
    } catch (error) {
      setImportStatus({
        loading: false,
        result: {
          success: false,
          error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      })
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Export / Import Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'export', label: 'Export Project', icon: '📤' },
              { id: 'import', label: 'Import Project', icon: '📥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Current Project</h3>
                
                {/* File Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Enter file name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    File will be saved as: {exportFileName}.lotplan
                  </p>
                </div>

                {/* Export Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Export Options</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeBackgroundImages}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          includeBackgroundImages: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Include background images ({backgroundImages.length} images)
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeCustomEquipment}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          includeCustomEquipment: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Include custom equipment definitions ({customEquipmentCount} custom items)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Project Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Project Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>Equipment Items: {placedEquipment.length}</div>
                    <div>Background Images: {backgroundImages.length}</div>
                    <div>Custom Equipment: {customEquipmentCount}</div>
                    <div>Total Equipment Types: {equipmentDefinitions.length}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={!exportFileName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Export Project
                </button>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Import Project File</h3>
                
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Select a project file to import
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Choose a .lotplan file exported from Lot Planner
                  </p>
                  <button
                    onClick={triggerFileSelect}
                    disabled={importStatus.loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {importStatus.loading ? 'Loading...' : 'Choose File'}
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".lotplan,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                  title="Select project file"
                  aria-label="Select project file to import"
                />

                {/* Import Status */}
                {importStatus.result && (
                  <div className={`p-4 rounded-lg ${
                    importStatus.result.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {importStatus.result.success ? (
                      <div>
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium text-green-800">Import Successful</span>
                        </div>
                        {importStatus.result.data && (
                          <div className="text-sm text-green-700">
                            <p>Project: {importStatus.result.data.metadata.name}</p>
                            <p>Equipment: {importStatus.result.data.placedEquipment.length} items</p>
                            <p>Background Images: {importStatus.result.data.backgroundImages.length} images</p>
                          </div>
                        )}
                        {importStatus.result.warnings && (
                          <div className="mt-2 text-sm text-yellow-700">
                            <p className="font-medium">Warnings:</p>
                            <ul className="list-disc list-inside">
                              {importStatus.result.warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="font-medium text-red-800">Import Failed</span>
                        </div>
                        <p className="text-sm text-red-700">{importStatus.result.error}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Import Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Import Instructions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Select a .lotplan file exported from Lot Planner</li>
                    <li>• The import will replace your current project</li>
                    <li>• Make sure to save your current work before importing</li>
                    <li>• Large files with background images may take longer to load</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
