import { 
  ProjectData, 
  ProjectMetadata, 
  CanvasSettings, 
  ExportOptions, 
  ImportResult, 
  SaveResult,
  PROJECT_FILE_VERSION,
  PROJECT_FILE_EXTENSION,
  PROJECT_MIME_TYPE
} from './types'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'
import { BackgroundImage } from '@/components/canvas/BackgroundLayer'

export class ProjectManager {
  private static readonly STORAGE_KEY = 'lotplanner_projects'
  private static readonly AUTOSAVE_KEY = 'lotplanner_autosave'
  private static readonly AUTOSAVE_INTERVAL = 30000 // 30 seconds

  /**
   * Create a new project with default settings
   */
  static createNewProject(name: string, description?: string): ProjectData {
    const now = new Date().toISOString()
    
    return {
      metadata: {
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        createdAt: now,
        updatedAt: now,
        version: PROJECT_FILE_VERSION,
        author: 'Lot Planner User'
      },
      canvasSettings: {
        width: 5000, // 500ft at 10px/ft
        height: 5000,
        pixelsPerFoot: 10,
        gridSize: 50,
        gridVisible: true,
        scaleBarVisible: true,
        measurementToolActive: false
      },
      placedEquipment: [],
      backgroundImages: [],
      equipmentDefinitions: [],
      customEquipmentCount: 0
    }
  }

  /**
   * Export project data to JSON string
   */
  static exportProject(
    placedEquipment: PlacedEquipment[],
    backgroundImages: BackgroundImage[],
    equipmentDefinitions: EquipmentItem[],
    customEquipmentCount: number,
    projectName: string,
    options: Partial<ExportOptions> = {}
  ): string {
    const exportOptions: ExportOptions = {
      includeBackgroundImages: true,
      includeCustomEquipment: true,
      compressionLevel: 'none',
      format: 'json',
      ...options
    }

    const now = new Date().toISOString()
    
    const projectData: ProjectData = {
      metadata: {
        id: `export_${Date.now()}`,
        name: projectName,
        description: 'Exported Lot Planner project',
        createdAt: now,
        updatedAt: now,
        version: PROJECT_FILE_VERSION
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
      backgroundImages: exportOptions.includeBackgroundImages ? backgroundImages : [],
      equipmentDefinitions: exportOptions.includeCustomEquipment ? equipmentDefinitions : [],
      customEquipmentCount
    }

    return JSON.stringify(projectData, null, 2)
  }

  /**
   * Import project data from JSON string
   */
  static importProject(jsonData: string): ImportResult {
    try {
      const data = JSON.parse(jsonData) as ProjectData
      
      // Validate required fields
      if (!data.metadata || !data.placedEquipment || !data.backgroundImages) {
        return {
          success: false,
          error: 'Invalid project file format: missing required fields'
        }
      }

      // Version compatibility check
      const warnings: string[] = []
      if (data.metadata.version !== PROJECT_FILE_VERSION) {
        warnings.push(`Project was created with version ${data.metadata.version}, current version is ${PROJECT_FILE_VERSION}`)
      }

      // Ensure all required fields have defaults
      const defaultCanvasSettings = {
        width: 5000,
        height: 5000,
        pixelsPerFoot: 10,
        gridSize: 50,
        gridVisible: true,
        scaleBarVisible: true,
        measurementToolActive: false
      }
      
      const importedData: ProjectData = {
        ...data,
        canvasSettings: {
          ...defaultCanvasSettings,
          ...data.canvasSettings
        },
        equipmentDefinitions: data.equipmentDefinitions || [],
        customEquipmentCount: data.customEquipmentCount || 0
      }

      return {
        success: true,
        data: importedData,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse project file: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Save project to local storage
   */
  static saveProject(projectData: ProjectData): SaveResult {
    try {
      const projects = this.getSavedProjects()
      const existingIndex = projects.findIndex(p => p.metadata.id === projectData.metadata.id)
      
      // Update timestamp
      projectData.metadata.updatedAt = new Date().toISOString()
      
      if (existingIndex >= 0) {
        projects[existingIndex] = projectData
      } else {
        projects.push(projectData)
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects))
      
      return {
        success: true,
        projectId: projectData.metadata.id
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Load project from local storage
   */
  static loadProject(projectId: string): ProjectData | null {
    try {
      const projects = this.getSavedProjects()
      return projects.find(p => p.metadata.id === projectId) || null
    } catch (error) {
      console.error('Failed to load project:', error)
      return null
    }
  }

  /**
   * Get all saved projects
   */
  static getSavedProjects(): ProjectData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get saved projects:', error)
      return []
    }
  }

  /**
   * Delete a saved project
   */
  static deleteProject(projectId: string): boolean {
    try {
      const projects = this.getSavedProjects()
      const filteredProjects = projects.filter(p => p.metadata.id !== projectId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects))
      return true
    } catch (error) {
      console.error('Failed to delete project:', error)
      return false
    }
  }

  /**
   * Auto-save current project state
   */
  static autoSave(
    placedEquipment: PlacedEquipment[],
    backgroundImages: BackgroundImage[],
    equipmentDefinitions: EquipmentItem[],
    customEquipmentCount: number
  ): void {
    try {
      const autoSaveData = {
        timestamp: new Date().toISOString(),
        placedEquipment,
        backgroundImages,
        equipmentDefinitions,
        customEquipmentCount
      }
      
      localStorage.setItem(this.AUTOSAVE_KEY, JSON.stringify(autoSaveData))
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  /**
   * Load auto-saved data
   */
  static loadAutoSave(): {
    placedEquipment: PlacedEquipment[]
    backgroundImages: BackgroundImage[]
    equipmentDefinitions: EquipmentItem[]
    customEquipmentCount: number
    timestamp: string
  } | null {
    try {
      const stored = localStorage.getItem(this.AUTOSAVE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to load auto-save:', error)
      return null
    }
  }

  /**
   * Clear auto-save data
   */
  static clearAutoSave(): void {
    try {
      localStorage.removeItem(this.AUTOSAVE_KEY)
    } catch (error) {
      console.error('Failed to clear auto-save:', error)
    }
  }

  /**
   * Download project as file
   */
  static downloadProject(projectData: string, filename: string): void {
    const blob = new Blob([projectData], { type: PROJECT_MIME_TYPE })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith(PROJECT_FILE_EXTENSION) 
      ? filename 
      : `${filename}${PROJECT_FILE_EXTENSION}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Read project file from user input
   */
  static readProjectFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          resolve(result)
        } else {
          reject(new Error('Failed to read file as text'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file)
    })
  }
}
