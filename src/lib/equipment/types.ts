export type EquipmentShape = 'rectangle' | 'circle'

export interface RectangularDimensions {
  shape: 'rectangle'
  width: number  // in feet
  height: number // in feet
  depth?: number // in feet (for 3D items)
}

export interface CircularDimensions {
  shape: 'circle'
  radius: number // in feet
  depth?: number // in feet (for 3D items)
}

export type EquipmentDimensions = RectangularDimensions | CircularDimensions

// Point in a custom clearance polygon
export interface ClearancePoint {
  x: number        // relative to equipment center (feet)
  y: number        // relative to equipment center (feet)
  curveType?: 'none' | 'arc'  // type of curve to next point
  curveAngle?: 45 | 90 | 180  // curve angle in degrees
  curveDirection?: 'clockwise' | 'counterclockwise'
}

// Custom polygonal clearance zone
export interface CustomClearance {
  type: 'custom'
  points: ClearancePoint[]     // up to 20 points
  closed: boolean              // whether polygon is closed
}

// Traditional rectangular clearance
export interface RectangularClearance {
  type: 'rectangular'
  front?: number  // clearance in feet
  back?: number   // clearance in feet
  left?: number   // clearance in feet
  right?: number  // clearance in feet
  all?: number    // uniform clearance in feet
}

export type EquipmentClearance = RectangularClearance | CustomClearance

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
  // Operational specifications
  capacity?: number           // ride capacity (number of riders)
  weight?: number            // weight in pounds
  turnAroundTime?: number    // time in minutes for riders to get on/off
  verticalHeight?: number    // height in feet
  rideClearing?: number      // ride clearance in feet (different from safety clearance)
  cost?: number              // estimated cost
}

export type EquipmentCategory = 
  | 'mega-rides'
  | 'rides'
  | 'kiddy-rides'
  | 'food'
  | 'games'
  | 'equipment'
  | 'office'
  | 'home'
  | 'bunks'

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
  clearance?: EquipmentClearance   // Custom or default clearance
  customLabel?: string
  metadata?: Record<string, any>
}
