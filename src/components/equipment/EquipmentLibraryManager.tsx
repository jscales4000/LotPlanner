import React, { useState } from 'react'
import { EquipmentItem } from '@/lib/equipment/types'

interface EquipmentLibraryManagerProps {
  equipmentDefinitions: EquipmentItem[]
  onEquipmentDefinitionsUpdate: (definitions: EquipmentItem[], customSettings?: CustomSettings) => void
  customSettings?: CustomSettings
  isOpen: boolean
  onClose: () => void
}

interface CustomSettings {
  customDimensions: Record<string, any>
  customCategories: Record<string, any>
  customNames: Record<string, string>
  customWeight: Record<string, number>
  customCapacity: Record<string, number>
  customTurnAroundTime: Record<string, number>
  customVerticalHeight: Record<string, number>
  customRideClearing: Record<string, number>
  customClearances: Record<string, any>
}

interface EquipmentLibraryFile {
  version: string
  exportDate: string
  equipmentCount: number
  equipment: EquipmentItem[]
  customSettings?: CustomSettings
  metadata?: {
    description?: string
    author?: string
    tags?: string[]
  }
}

export default function EquipmentLibraryManager({
  equipmentDefinitions,
  onEquipmentDefinitionsUpdate,
  customSettings,
  isOpen,
  onClose
}: EquipmentLibraryManagerProps) {
  const [importMode, setImportMode] = useState<'replace' | 'merge' | 'append'>('merge')
  const [exportDescription, setExportDescription] = useState('')
  const [exportAuthor, setExportAuthor] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Export equipment library to JSON file
  const handleExport = () => {
    setIsExporting(true)
    
    try {
      const libraryData: EquipmentLibraryFile = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        equipmentCount: equipmentDefinitions.length,
        equipment: equipmentDefinitions,
        customSettings: customSettings,
        metadata: {
          description: exportDescription || 'Custom equipment library export',
          author: exportAuthor || 'Lot Planner User',
          tags: ['equipment', 'library', 'custom']
        }
      }

      const dataStr = JSON.stringify(libraryData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `equipment-library-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('Equipment library exported successfully:', libraryData)
    } catch (error) {
      console.error('Error exporting equipment library:', error)
      alert('Error exporting equipment library. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Import equipment library from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const libraryData: EquipmentLibraryFile = JSON.parse(content)
        
        // Validate the imported data
        if (!libraryData.equipment || !Array.isArray(libraryData.equipment)) {
          throw new Error('Invalid equipment library file format')
        }

        // Apply import mode
        let newEquipmentDefinitions: EquipmentItem[] = []
        
        switch (importMode) {
          case 'replace':
            newEquipmentDefinitions = libraryData.equipment
            break
          case 'merge':
            // Merge by replacing existing equipment with same ID, adding new ones
            const existingIds = new Set(equipmentDefinitions.map(eq => eq.id))
            const importedEquipment = libraryData.equipment.map(eq => ({
              ...eq,
              id: existingIds.has(eq.id) ? eq.id : eq.id // Keep original ID if exists
            }))
            
            // Start with existing equipment, update with imported ones
            newEquipmentDefinitions = [...equipmentDefinitions]
            importedEquipment.forEach(importedEq => {
              const existingIndex = newEquipmentDefinitions.findIndex(eq => eq.id === importedEq.id)
              if (existingIndex >= 0) {
                newEquipmentDefinitions[existingIndex] = importedEq
              } else {
                newEquipmentDefinitions.push(importedEq)
              }
            })
            break
          case 'append':
            // Add all imported equipment with new IDs to avoid conflicts
            const appendedEquipment = libraryData.equipment.map(eq => ({
              ...eq,
              id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }))
            newEquipmentDefinitions = [...equipmentDefinitions, ...appendedEquipment]
            break
        }

        onEquipmentDefinitionsUpdate(newEquipmentDefinitions, libraryData.customSettings)
        
        console.log('Equipment library imported successfully:', {
          mode: importMode,
          imported: libraryData.equipment.length,
          total: newEquipmentDefinitions.length,
          customSettings: libraryData.customSettings ? 'included' : 'none'
        })
        
        const customSettingsText = libraryData.customSettings ? '\nCustom settings restored!' : '\nNo custom settings found.'
        alert(`Equipment library imported successfully!\nMode: ${importMode}\nImported: ${libraryData.equipment.length} items\nTotal: ${newEquipmentDefinitions.length} items${customSettingsText}`)
        
        // Reset file input
        event.target.value = ''
      } catch (error) {
        console.error('Error importing equipment library:', error)
        alert('Error importing equipment library. Please check the file format and try again.')
      } finally {
        setIsImporting(false)
      }
    }
    
    reader.readAsText(file)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Equipment Library Manager</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-8">
            {/* Export Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Equipment Library</h3>
              <p className="text-gray-600 mb-4">
                Save your current equipment library ({equipmentDefinitions.length} items) to a file that can be imported into other projects.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="export-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    id="export-description"
                    type="text"
                    value={exportDescription}
                    onChange={(e) => setExportDescription(e.target.value)}
                    placeholder="e.g., My Custom Carnival Equipment Library"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="export-author" className="block text-sm font-medium text-gray-700 mb-1">
                    Author (Optional)
                  </label>
                  <input
                    id="export-author"
                    type="text"
                    value={exportAuthor}
                    onChange={(e) => setExportAuthor(e.target.value)}
                    placeholder="Your name or organization"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <span>📁</span>
                      <span>Export Library</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Import Equipment Library</h3>
              <p className="text-gray-600 mb-4">
                Load equipment definitions from a previously exported library file.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import Mode
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="merge"
                        checked={importMode === 'merge'}
                        onChange={(e) => setImportMode(e.target.value as 'merge')}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        <strong>Merge:</strong> Update existing equipment and add new ones (Recommended)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={(e) => setImportMode(e.target.value as 'append')}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        <strong>Append:</strong> Add all imported equipment as new items
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={(e) => setImportMode(e.target.value as 'replace')}
                        className="mr-2"
                      />
                      <span className="text-sm text-red-600">
                        <strong>Replace:</strong> Replace entire library (Warning: This will delete all current equipment)
                      </span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="import-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Equipment Library File
                  </label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={isImporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-gray-900 bg-white"
                  />
                  {isImporting && (
                    <div className="mt-2 flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Importing equipment library...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
