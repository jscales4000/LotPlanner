import { ClearancePoint, CustomClearance, RectangularClearance, EquipmentClearance, EquipmentDimensions } from './types'

// Convert rectangular clearance to custom clearance polygon
export function rectangularToCustomClearance(
  clearance: RectangularClearance,
  dimensions: EquipmentDimensions
): CustomClearance {
  // Calculate clearance values
  const front = clearance.front ?? clearance.all ?? 0
  const back = clearance.back ?? clearance.all ?? 0
  const left = clearance.left ?? clearance.all ?? 0
  const right = clearance.right ?? clearance.all ?? 0

  // Calculate equipment bounds
  let width: number, height: number
  if (dimensions.shape === 'rectangle') {
    width = dimensions.width
    height = dimensions.height
  } else {
    width = height = dimensions.radius * 2
  }

  const halfWidth = width / 2
  const halfHeight = height / 2

  // Create rectangular clearance polygon
  const points: ClearancePoint[] = [
    { x: -halfWidth - left, y: -halfHeight - front },      // Top-left
    { x: halfWidth + right, y: -halfHeight - front },      // Top-right
    { x: halfWidth + right, y: halfHeight + back },        // Bottom-right
    { x: -halfWidth - left, y: halfHeight + back }         // Bottom-left
  ]

  return {
    type: 'custom',
    points,
    closed: true
  }
}

// Create default rectangular clearance from equipment
export function createDefaultClearance(
  dimensions: EquipmentDimensions,
  rideClearing: number = 0
): CustomClearance {
  const defaultClearance: RectangularClearance = {
    type: 'rectangular',
    all: rideClearing
  }
  return rectangularToCustomClearance(defaultClearance, dimensions)
}

// Calculate curve points between two clearance points
export function calculateCurvePoints(
  point1: ClearancePoint,
  point2: ClearancePoint,
  segments: number = 8
): { x: number; y: number }[] {
  if (!point1.curveType || point1.curveType === 'none') {
    return [{ x: point1.x, y: point1.y }, { x: point2.x, y: point2.y }]
  }

  const curveAngle = point1.curveAngle ?? 90
  const direction = point1.curveDirection ?? 'clockwise'
  
  // Calculate midpoint
  const midX = (point1.x + point2.x) / 2
  const midY = (point1.y + point2.y) / 2
  
  // Calculate distance between points
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Calculate arc radius based on angle and distance
  const angleRad = (curveAngle * Math.PI) / 180
  const radius = distance / (2 * Math.sin(angleRad / 2))
  
  // Calculate arc center
  const perpX = -dy / distance
  const perpY = dx / distance
  const centerOffset = radius * Math.cos(angleRad / 2)
  const centerX = midX + perpX * centerOffset * (direction === 'clockwise' ? 1 : -1)
  const centerY = midY + perpY * centerOffset * (direction === 'clockwise' ? 1 : -1)
  
  // Generate arc points
  const startAngle = Math.atan2(point1.y - centerY, point1.x - centerX)
  const endAngle = Math.atan2(point2.y - centerY, point2.x - centerX)
  
  let angleStep = (endAngle - startAngle) / segments
  if (direction === 'clockwise' && angleStep > 0) angleStep -= 2 * Math.PI
  if (direction === 'counterclockwise' && angleStep < 0) angleStep += 2 * Math.PI
  
  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + angleStep * i
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    })
  }
  
  return points
}

// Generate all points for a custom clearance polygon including curves
export function generateClearancePolygonPoints(clearance: CustomClearance): { x: number; y: number }[] {
  if (clearance.points.length < 2) return []
  
  const allPoints: { x: number; y: number }[] = []
  
  for (let i = 0; i < clearance.points.length; i++) {
    const currentPoint = clearance.points[i]
    const nextPoint = clearance.points[(i + 1) % clearance.points.length]
    
    // Add curve points between current and next point
    const curvePoints = calculateCurvePoints(currentPoint, nextPoint)
    
    // Add all curve points except the last one (to avoid duplicates)
    for (let j = 0; j < curvePoints.length - 1; j++) {
      allPoints.push(curvePoints[j])
    }
  }
  
  // Add the last point if polygon is closed
  if (clearance.closed && clearance.points.length > 0) {
    const lastCurvePoints = calculateCurvePoints(
      clearance.points[clearance.points.length - 1],
      clearance.points[0]
    )
    if (lastCurvePoints.length > 1) {
      allPoints.push(lastCurvePoints[lastCurvePoints.length - 1])
    }
  }
  
  return allPoints
}

// Validate custom clearance polygon
export function validateCustomClearance(clearance: CustomClearance): string[] {
  const errors: string[] = []
  
  if (clearance.points.length < 3) {
    errors.push('Clearance polygon must have at least 3 points')
  }
  
  if (clearance.points.length > 20) {
    errors.push('Clearance polygon cannot have more than 20 points')
  }
  
  // Check for invalid curve angles
  for (const point of clearance.points) {
    if (point.curveAngle && ![45, 90, 180].includes(point.curveAngle)) {
      errors.push(`Invalid curve angle: ${point.curveAngle}. Must be 45, 90, or 180 degrees`)
    }
  }
  
  return errors
}

// Check if a point is inside a custom clearance polygon
export function isPointInClearance(
  x: number,
  y: number,
  clearance: CustomClearance,
  equipmentX: number,
  equipmentY: number,
  equipmentRotation: number = 0
): boolean {
  const polygonPoints = generateClearancePolygonPoints(clearance)
  if (polygonPoints.length < 3) return false
  
  // Transform point to equipment-relative coordinates
  const cos = Math.cos(-equipmentRotation * Math.PI / 180)
  const sin = Math.sin(-equipmentRotation * Math.PI / 180)
  const relX = (x - equipmentX) * cos - (y - equipmentY) * sin
  const relY = (x - equipmentX) * sin + (y - equipmentY) * cos
  
  // Ray casting algorithm for point-in-polygon test
  let inside = false
  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = polygonPoints[i].x
    const yi = polygonPoints[i].y
    const xj = polygonPoints[j].x
    const yj = polygonPoints[j].y
    
    if (((yi > relY) !== (yj > relY)) && (relX < (xj - xi) * (relY - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}
