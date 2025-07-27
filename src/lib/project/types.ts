import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'
import { BackgroundImage } from '@/components/canvas/BackgroundLayer'

export interface ProjectMetadata {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  version: string
  author?: string
}

export interface CanvasSettings {
  width: number
  height: number
  pixelsPerFoot: number
  gridSize: number
  gridVisible: boolean
  scaleBarVisible: boolean
  measurementToolActive: boolean
}

export interface ProjectData {
  metadata: ProjectMetadata
  canvasSettings: CanvasSettings
  placedEquipment: PlacedEquipment[]
  backgroundImages: BackgroundImage[]
  equipmentDefinitions: EquipmentItem[]
  customEquipmentCount: number
}

export interface ExportOptions {
  includeBackgroundImages: boolean
  includeCustomEquipment: boolean
  compressionLevel: 'none' | 'low' | 'high'
  format: 'json' | 'compressed'
}

export interface ImportResult {
  success: boolean
  data?: ProjectData
  error?: string
  warnings?: string[]
}

export interface SaveResult {
  success: boolean
  projectId?: string
  error?: string
}

// Project file format constants
export const PROJECT_FILE_VERSION = '1.0.0'
export const PROJECT_FILE_EXTENSION = '.lotplan'
export const PROJECT_MIME_TYPE = 'application/json'
