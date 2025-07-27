'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Line, Circle, Text, Group, Rect } from 'react-konva'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'

export interface ClearanceViolation {
  id: string
  equipment1: PlacedEquipment
  equipment2: PlacedEquipment
  actualDistance: number
  requiredDistance: number
  severity: 'warning' | 'critical'
  description: string
}

interface ClearanceVerificationToolProps {
  isActive: boolean
  scale: number
  pixelsPerFoot: number
  placedEquipment: PlacedEquipment[]
  equipmentDefinitions: EquipmentItem[]
  onViolationSelect?: (violation: ClearanceViolation) => void
}

const ClearanceVerificationTool: React.FC<ClearanceVerificationToolProps> = ({
  isActive,
  scale,
  pixelsPerFoot,
  placedEquipment,
  equipmentDefinitions,
  onViolationSelect
}) => {
  const [selectedViolation, setSelectedViolation] = useState<string | null>(null)

  // Get equipment definition by ID
  const getEquipmentDefinition = useCallback((equipmentId: string): EquipmentItem | undefined => {
    return equipmentDefinitions.find(def => def.id === equipmentId)
  }, [equipmentDefinitions])

  // Calculate distance between two equipment centers
  const calculateDistance = useCallback((eq1: PlacedEquipment, eq2: PlacedEquipment): number => {
    const dx = eq2.x - eq1.x
    const dy = eq2.y - eq1.y
    const distanceInPixels = Math.sqrt(dx * dx + dy * dy)
    return distanceInPixels / pixelsPerFoot
  }, [pixelsPerFoot])

  // Calculate minimum required clearance between two equipment items
  const calculateRequiredClearance = useCallback((eq1: PlacedEquipment, eq2: PlacedEquipment): number => {
    const def1 = getEquipmentDefinition(eq1.equipmentId)
    const def2 = getEquipmentDefinition(eq2.equipmentId)
    
    if (!def1 || !def2) return 0

    // Use the larger of the two clearance requirements
    const clearance1 = typeof def1.clearance === 'number' ? def1.clearance : 0
    const clearance2 = typeof def2.clearance === 'number' ? def2.clearance : 0
    const rideClearance1 = def1.rideClearing || 0
    const rideClearance2 = def2.rideClearing || 0
    
    // Total required clearance is the sum of both equipment's clearance requirements
    const totalClearance = Math.max(clearance1, rideClearance1) + Math.max(clearance2, rideClearance2)
    
    // Add equipment dimensions (half of each equipment's largest dimension)
    const getMaxDimension = (def: EquipmentItem): number => {
      if (!def.dimensions) return 0
      if (def.dimensions.shape === 'circle') {
        return def.dimensions.radius
      } else {
        return Math.max(def.dimensions.width || 0, def.dimensions.height || 0) / 2
      }
    }
    
    const maxDim1 = getMaxDimension(def1)
    const maxDim2 = getMaxDimension(def2)
    
    return totalClearance + maxDim1 + maxDim2
  }, [getEquipmentDefinition])

  // Find all clearance violations
  const violations = useMemo((): ClearanceViolation[] => {
    const foundViolations: ClearanceViolation[] = []
    
    for (let i = 0; i < placedEquipment.length; i++) {
      for (let j = i + 1; j < placedEquipment.length; j++) {
        const eq1 = placedEquipment[i]
        const eq2 = placedEquipment[j]
        
        const actualDistance = calculateDistance(eq1, eq2)
        const requiredDistance = calculateRequiredClearance(eq1, eq2)
        
        if (actualDistance < requiredDistance) {
          const def1 = getEquipmentDefinition(eq1.equipmentId)
          const def2 = getEquipmentDefinition(eq2.equipmentId)
          
          const shortfall = requiredDistance - actualDistance
          const severity: 'warning' | 'critical' = shortfall > 10 ? 'critical' : 'warning'
          
          foundViolations.push({
            id: `${eq1.id}-${eq2.id}`,
            equipment1: eq1,
            equipment2: eq2,
            actualDistance,
            requiredDistance,
            severity,
            description: `${def1?.name || 'Equipment'} and ${def2?.name || 'Equipment'} are ${shortfall.toFixed(1)} ft too close`
          })
        }
      }
    }
    
    return foundViolations
  }, [placedEquipment, calculateDistance, calculateRequiredClearance, getEquipmentDefinition])

  const handleViolationClick = useCallback((violation: ClearanceViolation) => {
    setSelectedViolation(violation.id === selectedViolation ? null : violation.id)
    if (onViolationSelect) {
      onViolationSelect(violation)
    }
  }, [selectedViolation, onViolationSelect])

  // Render clearance violations
  const renderViolations = () => {
    return violations.map((violation) => {
      const isSelected = selectedViolation === violation.id
      const color = violation.severity === 'critical' ? '#EF4444' : '#F59E0B' // Red for critical, amber for warning
      
      // Calculate midpoint for label
      const midX = (violation.equipment1.x + violation.equipment2.x) / 2
      const midY = (violation.equipment1.y + violation.equipment2.y) / 2
      
      return (
        <Group key={violation.id}>
          {/* Connection line */}
          <Line
            points={[
              violation.equipment1.x, violation.equipment1.y,
              violation.equipment2.x, violation.equipment2.y
            ]}
            stroke={color}
            strokeWidth={isSelected ? 4 / scale : 2 / scale}
            dash={[8 / scale, 4 / scale]}
            opacity={0.8}
            onClick={() => handleViolationClick(violation)}
            onTap={() => handleViolationClick(violation)}
          />
          
          {/* Warning/Error indicators at equipment positions */}
          <Circle
            x={violation.equipment1.x}
            y={violation.equipment1.y}
            radius={8 / scale}
            fill={color}
            opacity={0.7}
            onClick={() => handleViolationClick(violation)}
            onTap={() => handleViolationClick(violation)}
          />
          <Text
            x={violation.equipment1.x}
            y={violation.equipment1.y}
            text="!"
            fontSize={12 / scale}
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={3 / scale}
            offsetY={6 / scale}
            onClick={() => handleViolationClick(violation)}
            onTap={() => handleViolationClick(violation)}
          />
          
          <Circle
            x={violation.equipment2.x}
            y={violation.equipment2.y}
            radius={8 / scale}
            fill={color}
            opacity={0.7}
            onClick={() => handleViolationClick(violation)}
            onTap={() => handleViolationClick(violation)}
          />
          <Text
            x={violation.equipment2.x}
            y={violation.equipment2.y}
            text="!"
            fontSize={12 / scale}
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={3 / scale}
            offsetY={6 / scale}
            onClick={() => handleViolationClick(violation)}
            onTap={() => handleViolationClick(violation)}
          />
          
          {/* Violation details (shown when selected or always for critical) */}
          {(isSelected || violation.severity === 'critical') && (
            <Group>
              {/* Background for text */}
              <Rect
                x={midX - 80 / scale}
                y={midY - 40 / scale}
                width={160 / scale}
                height={60 / scale}
                fill="white"
                stroke={color}
                strokeWidth={1 / scale}
                cornerRadius={4 / scale}
                opacity={0.95}
                shadowColor="black"
                shadowBlur={4}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.3}
              />
              
              {/* Violation description */}
              <Text
                x={midX}
                y={midY - 25 / scale}
                text={violation.description}
                fontSize={10 / scale}
                fill={color}
                fontStyle="bold"
                align="center"
                width={150 / scale}
                wrap="word"
              />
              
              {/* Distance info */}
              <Text
                x={midX}
                y={midY - 5 / scale}
                text={`Actual: ${violation.actualDistance.toFixed(1)} ft`}
                fontSize={9 / scale}
                fill="#666"
                align="center"
              />
              
              <Text
                x={midX}
                y={midY + 8 / scale}
                text={`Required: ${violation.requiredDistance.toFixed(1)} ft`}
                fontSize={9 / scale}
                fill="#666"
                align="center"
              />
              
              {/* Severity indicator */}
              <Text
                x={midX}
                y={midY + 21 / scale}
                text={violation.severity.toUpperCase()}
                fontSize={8 / scale}
                fill={color}
                fontStyle="bold"
                align="center"
              />
            </Group>
          )}
        </Group>
      )
    })
  }

  // Render summary panel
  const renderSummary = () => {
    if (!isActive || violations.length === 0) return null

    const criticalCount = violations.filter(v => v.severity === 'critical').length
    const warningCount = violations.filter(v => v.severity === 'warning').length

    return (
      <Group>
        {/* Summary background */}
        <Rect
          x={20 / scale}
          y={20 / scale}
          width={200 / scale}
          height={80 / scale}
          fill="white"
          stroke="#E5E7EB"
          strokeWidth={1 / scale}
          cornerRadius={8 / scale}
          opacity={0.95}
          shadowColor="black"
          shadowBlur={4}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.2}
        />
        
        {/* Title */}
        <Text
          x={30 / scale}
          y={35 / scale}
          text="Clearance Violations"
          fontSize={14 / scale}
          fill="#374151"
          fontStyle="bold"
        />
        
        {/* Critical violations */}
        {criticalCount > 0 && (
          <Text
            x={30 / scale}
            y={55 / scale}
            text={`🔴 Critical: ${criticalCount}`}
            fontSize={12 / scale}
            fill="#EF4444"
            fontStyle="bold"
          />
        )}
        
        {/* Warning violations */}
        {warningCount > 0 && (
          <Text
            x={30 / scale}
            y={criticalCount > 0 ? 75 / scale : 55 / scale}
            text={`🟡 Warnings: ${warningCount}`}
            fontSize={12 / scale}
            fill="#F59E0B"
            fontStyle="bold"
          />
        )}
        
        {/* Instructions */}
        <Text
          x={30 / scale}
          y={85 / scale}
          text="Click violations for details"
          fontSize={10 / scale}
          fill="#6B7280"
        />
      </Group>
    )
  }

  if (!isActive) return null

  return (
    <Group>
      {renderViolations()}
      {renderSummary()}
    </Group>
  )
}

export default ClearanceVerificationTool
