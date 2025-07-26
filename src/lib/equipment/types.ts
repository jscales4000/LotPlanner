export interface EquipmentDimensions {
  width: number  // in feet
  height: number // in feet
  depth?: number // in feet (for 3D items)
}

export interface EquipmentClearance {
  front?: number  // clearance in feet
  back?: number   // clearance in feet
  left?: number   // clearance in feet
  right?: number  // clearance in feet
  all?: number    // uniform clearance in feet
}

export interface EquipmentItem {
  id: string
  name: string
  category: EquipmentCategory
  dimensions: EquipmentDimensions
  clearance?: EquipmentClearance
  color: string
  description?: string
  specifications?: Record<string, string | number>
  icon?: string
  tags?: string[]
  capacity?: number
  weight?: number // in pounds
  cost?: number   // estimated cost
}

export type EquipmentCategory = 
  | 'seating'
  | 'barriers'
  | 'stages'
  | 'utilities'
  | 'vehicles'
  | 'structures'
  | 'lighting'
  | 'sound'

export interface EquipmentLibrary {
  categories: Record<EquipmentCategory, EquipmentItem[]>
  searchIndex: Map<string, EquipmentItem[]>
}

export interface PlacedEquipment {
  id: string
  equipmentId: string
  x: number
  y: number
  rotation: number
  dimensions: EquipmentDimensions  // Store actual dimensions used
  customLabel?: string
  metadata?: Record<string, any>
}
