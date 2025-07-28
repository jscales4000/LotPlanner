'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'
import { BackgroundImage } from '@/components/canvas/BackgroundLayer'
import { ProjectData, ImportResult, EquipmentLibraryState } from '@/lib/project/types'
import { ProjectManager } from '@/lib/project/projectManager'
import EquipmentLibrary from '@/components/equipment/EquipmentLibrary'
import ProjectManagerModal from '@/components/project/ProjectManagerModal'
import ExportImportModal from '@/components/project/ExportImportModal'
import PDFExportModal from '@/components/export/PDFExportModal'
import PropertiesModal from '@/components/canvas/PropertiesModal'

// Dynamically import CanvasEditor to avoid SSR issues with Konva
const CanvasEditor = dynamic(
  () => import('@/components/canvas/CanvasEditor'),
  { ssr: false }
)

const KeyboardHandler = dynamic(
  () => import('@/components/canvas/KeyboardHandler'),
  { ssr: false }
)

export default function CanvasPage() {
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([])
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([])
  const [equipmentDefinitions, setEquipmentDefinitions] = useState<EquipmentItem[]>([])
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImage[]>([])
  
  // Project management state
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null)
  const [projectManagerModalOpen, setProjectManagerModalOpen] = useState(false)
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false)
  const [pdfExportModalOpen, setPdfExportModalOpen] = useState(false)
  const [customEquipmentCount, setCustomEquipmentCount] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [canvasElement, setCanvasElement] = useState<HTMLElement | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false)
  const [equipmentLibraryState, setEquipmentLibraryState] = useState<EquipmentLibraryState | null>(null)

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        ProjectManager.autoSave(
          placedEquipment,
          backgroundImages,
          equipmentDefinitions,
          customEquipmentCount
        )
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [placedEquipment, backgroundImages, equipmentDefinitions, customEquipmentCount, hasUnsavedChanges])

  // Mark as having unsaved changes when data changes
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [placedEquipment, backgroundImages, equipmentDefinitions])

  // Load auto-save on component mount
  useEffect(() => {
    const autoSaveData = ProjectManager.loadAutoSave()
    if (autoSaveData && autoSaveData.placedEquipment.length > 0) {
      const shouldRestore = confirm(
        `Auto-saved data found from ${new Date(autoSaveData.timestamp).toLocaleString()}. Would you like to restore it?`
      )
      if (shouldRestore) {
        setPlacedEquipment(autoSaveData.placedEquipment)
        setBackgroundImages(autoSaveData.backgroundImages)
        setEquipmentDefinitions(autoSaveData.equipmentDefinitions)
        setCustomEquipmentCount(autoSaveData.customEquipmentCount)
        setHasUnsavedChanges(true)
      }
    }
  }, [])

  // Project management handlers
  const handleNewProject = (name: string, description?: string) => {
    const newProject = ProjectManager.createNewProject(name, description)
    setCurrentProject(newProject)
    setPlacedEquipment([])
    setBackgroundImages([])
    setEquipmentDefinitions([])
    setCustomEquipmentCount(0)
    setEquipmentLibraryState(null)
    setSelectedEquipmentIds([])
    setHasUnsavedChanges(false)
    ProjectManager.clearAutoSave()
  }

  const handleSaveProject = (name: string, description?: string) => {
    const projectData: ProjectData = {
      metadata: {
        id: currentProject?.metadata.id || `project_${Date.now()}`,
        name,
        description,
        createdAt: currentProject?.metadata.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        author: 'Lot Planner User'
      },
      canvasSettings: {
        width: 5000,
        height: 5000,
        pixelsPerFoot: 10,
        gridSize: 50,
        gridVisible: true,
        scaleBarVisible: true,
        measurementToolActive: false
      },
      placedEquipment,
      backgroundImages,
      equipmentDefinitions,
      customEquipmentCount,
      equipmentLibraryState: equipmentLibraryState || undefined
    }

    const result = ProjectManager.saveProject(projectData)
    if (result.success) {
      setCurrentProject(projectData)
      setHasUnsavedChanges(false)
      alert('Project saved successfully!')
    } else {
      alert(`Failed to save project: ${result.error}`)
    }
  }

  const handleLoadProject = (projectData: ProjectData) => {
    setCurrentProject(projectData)
    setPlacedEquipment(projectData.placedEquipment)
    setBackgroundImages(projectData.backgroundImages)
    setEquipmentDefinitions(projectData.equipmentDefinitions)
    setCustomEquipmentCount(projectData.customEquipmentCount)
    setEquipmentLibraryState(projectData.equipmentLibraryState || null)
    setSelectedEquipmentIds([])
    setHasUnsavedChanges(false)
    ProjectManager.clearAutoSave()
  }

  const handleImportProject = (result: ImportResult) => {
    if (result.success && result.data) {
      handleLoadProject(result.data)
      if (result.warnings && result.warnings.length > 0) {
        alert(`Project imported with warnings:\n${result.warnings.join('\n')}`)
      } else {
        alert('Project imported successfully!')
      }
    } else {
      alert(`Import failed: ${result.error}`)
    }
  }

  // Handle equipment definitions changes
  const handleEquipmentDefinitionsChange = (definitions: EquipmentItem[]) => {
    setEquipmentDefinitions(definitions)
    // Count custom equipment (those with IDs starting with 'custom_')
    const customCount = definitions.filter(eq => eq.id.startsWith('custom_')).length
    setCustomEquipmentCount(customCount)
  }

  // Handle adding equipment to canvas
  const handleEquipmentSelect = (equipment: EquipmentItem) => {
    // Calculate placement position - prefer satellite image center, fallback to canvas center
    let placementX = 5000 // Default canvas center for 1000' x 1000' canvas (10000px / 2 = 5000px)
    let placementY = 5000
    
    // If there are background images (satellite images), place at the center of the largest one
    if (backgroundImages && backgroundImages.length > 0) {
      // Find the largest background image (by area)
      let largestImage = backgroundImages[0]
      let largestArea = 0
      
      backgroundImages.forEach(img => {
        const imgWidth = (img.width || 0) * (img.scaleX || 1)
        const imgHeight = (img.height || 0) * (img.scaleY || 1)
        const area = imgWidth * imgHeight
        
        if (area > largestArea) {
          largestArea = area
          largestImage = img
        }
      })
      
      // Calculate center of the largest satellite image
      const imgWidth = (largestImage.width || 0) * (largestImage.scaleX || 1)
      const imgHeight = (largestImage.height || 0) * (largestImage.scaleY || 1)
      placementX = (largestImage.x || 0) + imgWidth / 2
      placementY = (largestImage.y || 0) + imgHeight / 2
      
      console.log(`Placing equipment at satellite image center: (${Math.round(placementX)}, ${Math.round(placementY)})`, {
        imageSize: `${Math.round(imgWidth)}x${Math.round(imgHeight)}`,
        imagePosition: `(${largestImage.x}, ${largestImage.y})`
      })
    } else {
      console.log(`No satellite images found, placing equipment at canvas center: (${placementX}, ${placementY})`)
    }
    
    const newEquipment: PlacedEquipment = {
      id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      equipmentId: equipment.id,
      x: placementX, // Center of satellite image or canvas center as fallback
      y: placementY,
      rotation: 0,
      dimensions: equipment.dimensions, // Store the actual dimensions used (including custom ones)
      clearance: equipment.clearance, // Store the clearance data from the equipment definition
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

  // Background image management functions
  const handleBackgroundImageAdd = (image: Omit<BackgroundImage, 'id'>) => {
    const imageWithId: BackgroundImage = {
      ...image,
      id: `bg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    setBackgroundImages(prev => [...prev, imageWithId])
  }

  const handleBackgroundImageUpdate = (imageId: string, updates: Partial<BackgroundImage>) => {
    setBackgroundImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, ...updates }
          : img
      )
    )
  }

  const handleBackgroundImageDelete = (imageId: string) => {
    setBackgroundImages(prev => prev.filter(img => img.id !== imageId))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🦎</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lot Lizard</h1>
                <p className="text-sm text-gray-600">
                  {currentProject ? currentProject.metadata.name : 'Carnival Lot Planning'}
                  {hasUnsavedChanges && <span className="text-orange-500 ml-2">• Unsaved changes</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPropertiesModalOpen(true)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                title="Canvas Properties & Settings"
              >
                ⚙️ Settings
              </button>
              <button 
                onClick={() => setProjectManagerModalOpen(true)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                📁 Projects
              </button>
              <button
                onClick={() => setExportImportModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                📁 Export/Import
              </button>
              <button
                onClick={() => setPdfExportModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                📄 Export PDF
              </button>
              <button 
                onClick={() => {
                  if (currentProject) {
                    handleSaveProject(currentProject.metadata.name, currentProject.metadata.description)
                  } else {
                    setProjectManagerModalOpen(true)
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  hasUnsavedChanges 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                💾 {currentProject ? 'Save' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Equipment Library */}
        <div className={`relative transition-all duration-300 ${sidebarExpanded ? 'w-[340px]' : 'w-12'}`}>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="absolute top-4 -right-3 z-20 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            title={sidebarExpanded ? 'Collapse Equipment Library' : 'Expand Equipment Library'}
          >
            <span className="text-xs text-gray-600">
              {sidebarExpanded ? '◀' : '▶'}
            </span>
          </button>
          
          {/* Equipment Library */}
          <EquipmentLibrary
            key="equipment-library"
            onEquipmentSelect={handleEquipmentSelect}
            onEquipmentDefinitionsChange={handleEquipmentDefinitionsChange}
            onLibraryStateChange={setEquipmentLibraryState}
            initialLibraryState={equipmentLibraryState || undefined}
            className={`h-full transition-all duration-300 ${sidebarExpanded ? 'w-[340px]' : 'w-12 overflow-hidden'}`}
            isCollapsed={!sidebarExpanded}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative flex flex-col">
          <CanvasEditor 
            className="w-full h-full flex-1"
            placedEquipment={placedEquipment}
            equipmentDefinitions={equipmentDefinitions}
            onEquipmentSelect={handleCanvasEquipmentSelect}
            onEquipmentMove={handleEquipmentMove}
            onEquipmentRotate={handleEquipmentRotate}
            onEquipmentDelete={handleEquipmentDelete}
            selectedEquipmentId={selectedEquipmentIds[0] || undefined}
            backgroundImages={backgroundImages}
            onBackgroundImageAdd={handleBackgroundImageAdd}
            onBackgroundImageUpdate={handleBackgroundImageUpdate}
            onBackgroundImageDelete={handleBackgroundImageDelete}
            onCanvasReady={(element) => {
              console.log('Canvas element received in parent:', element)
              setCanvasElement(element)
            }}
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


      </div>

      {/* Project Management Modals */}
      <ProjectManagerModal
        isOpen={projectManagerModalOpen}
        onClose={() => setProjectManagerModalOpen(false)}
        onNewProject={handleNewProject}
        onLoadProject={handleLoadProject}
        onSaveProject={handleSaveProject}
        currentProjectName={currentProject?.metadata.name}
      />

      <ExportImportModal
        isOpen={exportImportModalOpen}
        onClose={() => setExportImportModalOpen(false)}
        onImport={handleImportProject}
        placedEquipment={placedEquipment}
        backgroundImages={backgroundImages}
        equipmentDefinitions={equipmentDefinitions}
        customEquipmentCount={customEquipmentCount}
        projectName={currentProject?.metadata.name || 'lot-planner-project'}
      />

      <PDFExportModal
        isOpen={pdfExportModalOpen}
        onClose={() => setPdfExportModalOpen(false)}
        canvasElement={canvasElement}
        placedEquipment={placedEquipment}
        backgroundImages={backgroundImages}
        equipmentDefinitions={equipmentDefinitions}
        projectName={currentProject?.metadata.name || 'lot-planner-layout'}
      />

      <PropertiesModal
        isOpen={propertiesModalOpen}
        onClose={() => setPropertiesModalOpen(false)}
      />
    </div>
  )
}
