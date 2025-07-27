'use client'

import React, { useState, useEffect } from 'react'
import { PDFExportOptions, PDFMetadata, PDFExporter } from '@/lib/export/pdfExport'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'
import { BackgroundImage } from '@/components/canvas/BackgroundLayer'

interface PDFExportModalProps {
  isOpen: boolean
  onClose: () => void
  canvasElement: HTMLElement | null
  placedEquipment: PlacedEquipment[]
  equipmentDefinitions: EquipmentItem[]
  backgroundImages: BackgroundImage[]
  projectName: string
}

export default function PDFExportModal({
  isOpen,
  onClose,
  canvasElement,
  placedEquipment,
  equipmentDefinitions,
  backgroundImages,
  projectName
}: PDFExportModalProps) {
  const [exporting, setExporting] = useState(false)
  const [actualCanvasElement, setActualCanvasElement] = useState<HTMLElement | null>(canvasElement)

  // Fallback: Try to find canvas element directly when modal opens
  useEffect(() => {
    if (isOpen && !actualCanvasElement) {
      console.log('Modal opened, trying to find canvas element directly')
      // Try to find the canvas element in the DOM
      const canvasContainer = document.querySelector('.konvajs-content')
      if (canvasContainer) {
        console.log('Found canvas container directly:', canvasContainer)
        setActualCanvasElement(canvasContainer as HTMLElement)
      } else {
        console.log('Canvas container not found in DOM')
      }
    }
  }, [isOpen, actualCanvasElement])

  // Update actualCanvasElement when canvasElement prop changes
  useEffect(() => {
    if (canvasElement) {
      console.log('Canvas element prop updated:', canvasElement)
      setActualCanvasElement(canvasElement)
    }
  }, [canvasElement])
  const [exportOptions, setExportOptions] = useState<PDFExportOptions>({
    includeBackground: true,
    includeEquipmentLabels: true,
    includeClearanceZones: true,
    includeDimensions: true,
    includeScale: true,
    paperSize: 'letter',
    orientation: 'landscape',
    title: `${projectName} Layout`,
    subtitle: 'Carnival/Fair Site Plan',
    showGrid: false,
    quality: 'medium'
  })

  const [metadata, setMetadata] = useState<PDFMetadata>({
    projectName,
    createdBy: 'Lot Planner User',
    createdDate: new Date().toLocaleDateString(),
    scale: '1" = 10 feet',
    totalArea: '250,000 sq ft (500\' × 500\')',
    equipmentCount: placedEquipment.length
  })

  const handleExport = async () => {
    console.log('PDF Export - Canvas element:', actualCanvasElement)
    if (!actualCanvasElement) {
      console.log('PDF Export failed - no canvas element available')
      alert('Canvas not available for export. Please try again.')
      return
    }

    setExporting(true)
    try {
      await PDFExporter.exportToPDF(
        actualCanvasElement,
        placedEquipment,
        equipmentDefinitions,
        backgroundImages,
        exportOptions,
        { ...metadata, equipmentCount: placedEquipment.length }
      )
      onClose()
    } catch (error) {
      console.error('PDF export failed:', error)
      alert(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Export to PDF</h2>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Export Options */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
                
                {/* Paper Settings */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Size
                    </label>
                    <select
                      value={exportOptions.paperSize}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        paperSize: e.target.value as PDFExportOptions['paperSize']
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      aria-label="Paper size selection"
                    >
                      <option value="letter">Letter (8.5&quot; × 11&quot;)</option>
                      <option value="legal">Legal (8.5&quot; × 14&quot;)</option>
                      <option value="a4">A4 (8.27&quot; × 11.69&quot;)</option>
                      <option value="a3">A3 (11.69&quot; × 16.53&quot;)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      value={exportOptions.orientation}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        orientation: e.target.value as PDFExportOptions['orientation']
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      aria-label="Page orientation selection"
                    >
                      <option value="landscape">Landscape (Recommended)</option>
                      <option value="portrait">Portrait</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality
                    </label>
                    <select
                      value={exportOptions.quality}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        quality: e.target.value as PDFExportOptions['quality']
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    >
                      <option value="low">Low (Faster, Smaller File)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Best Quality, Larger File)</option>
                    </select>
                  </div>
                </div>

                {/* Content Options */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Include in PDF</h4>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeBackground}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeBackground: e.target.checked 
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      🖼️ Background Images ({backgroundImages.length} images)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeEquipmentLabels}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeEquipmentLabels: e.target.checked 
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      🏷️ Equipment Labels & Legend
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeClearanceZones}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeClearanceZones: e.target.checked 
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      ⚠️ Clearance Zones
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDimensions}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeDimensions: e.target.checked 
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      📏 Equipment Dimensions
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeScale}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeScale: e.target.checked 
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      📐 Scale Bar
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.showGrid}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        showGrid: e.target.checked 
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      ⊞ Grid Lines
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Document Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Document Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={exportOptions.title}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        title: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      aria-label="Document title"
                      placeholder="Enter document title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={exportOptions.subtitle || ''}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        subtitle: e.target.value || undefined 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="e.g., Carnival/Fair Site Plan"
                      aria-label="Document subtitle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created By
                    </label>
                    <input
                      type="text"
                      value={metadata.createdBy}
                      onChange={(e) => setMetadata(prev => ({ 
                        ...prev, 
                        createdBy: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      aria-label="Author name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scale
                    </label>
                    <input
                      type="text"
                      value={metadata.scale}
                      onChange={(e) => setMetadata(prev => ({ 
                        ...prev, 
                        scale: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Project Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Project Summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Project Name:</span>
                    <span className="font-medium">{projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment Count:</span>
                    <span className="font-medium">{placedEquipment.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Background Images:</span>
                    <span className="font-medium">{backgroundImages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Area:</span>
                    <span className="font-medium">{metadata.totalArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Export Date:</span>
                    <span className="font-medium">{metadata.createdDate}</span>
                  </div>
                </div>
              </div>

              {/* Export Preview */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📄 Export Preview</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Title page with project information</p>
                  <p>• Layout diagram with {exportOptions.includeBackground ? 'background images' : 'white background'}</p>
                  {exportOptions.includeEquipmentLabels && <p>• Equipment legend and labels</p>}
                  {exportOptions.includeScale && <p>• Scale bar for measurements</p>}
                  <p>• Equipment details page with specifications</p>
                  <p>• Professional formatting for permits/presentations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={exporting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || !actualCanvasElement}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  📄 Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
