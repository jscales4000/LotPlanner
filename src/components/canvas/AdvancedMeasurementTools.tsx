'use client'

import React, { useState, useCallback } from 'react'
import { Group } from 'react-konva'
import AreaMeasurementTool, { AreaMeasurement } from './AreaMeasurementTool'
import PerimeterMeasurementTool, { PerimeterMeasurement } from './PerimeterMeasurementTool'
import DistanceMeasurementTool, { DistanceMeasurement } from './DistanceMeasurementTool'
import ClearanceVerificationTool, { ClearanceViolation } from './ClearanceVerificationTool'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'

export type MeasurementToolType = 'area' | 'perimeter' | 'distance' | 'clearance' | null

export interface AllMeasurements {
  areas: AreaMeasurement[]
  perimeters: PerimeterMeasurement[]
  distances: DistanceMeasurement[]
}

interface AdvancedMeasurementToolsProps {
  activeTool: MeasurementToolType
  scale: number
  pixelsPerFoot: number
  placedEquipment: PlacedEquipment[]
  equipmentDefinitions: EquipmentItem[]
  measurements: AllMeasurements
  onMeasurementsChange: (measurements: AllMeasurements) => void
  onViolationSelect?: (violation: ClearanceViolation) => void
  onCanvasClick?: (x: number, y: number) => void
  onCanvasDoubleClick?: (x: number, y: number) => void
}

const AdvancedMeasurementTools: React.FC<AdvancedMeasurementToolsProps> = ({
  activeTool,
  scale,
  pixelsPerFoot,
  placedEquipment,
  equipmentDefinitions,
  measurements,
  onMeasurementsChange,
  onViolationSelect,
  onCanvasClick,
  onCanvasDoubleClick
}) => {
  // Handle area measurement completion
  const handleAreaMeasurementComplete = useCallback((measurement: AreaMeasurement) => {
    const updatedMeasurements = {
      ...measurements,
      areas: [...measurements.areas, measurement]
    }
    onMeasurementsChange(updatedMeasurements)
  }, [measurements, onMeasurementsChange])

  // Handle area measurement deletion
  const handleAreaMeasurementDelete = useCallback((id: string) => {
    const updatedMeasurements = {
      ...measurements,
      areas: measurements.areas.filter(m => m.id !== id)
    }
    onMeasurementsChange(updatedMeasurements)
  }, [measurements, onMeasurementsChange])

  // Handle perimeter measurement completion
  const handlePerimeterMeasurementComplete = useCallback((measurement: PerimeterMeasurement) => {
    const updatedMeasurements = {
      ...measurements,
      perimeters: [...measurements.perimeters, measurement]
    }
    onMeasurementsChange(updatedMeasurements)
  }, [measurements, onMeasurementsChange])

  // Handle perimeter measurement deletion
  const handlePerimeterMeasurementDelete = useCallback((id: string) => {
    const updatedMeasurements = {
      ...measurements,
      perimeters: measurements.perimeters.filter(m => m.id !== id)
    }
    onMeasurementsChange(updatedMeasurements)
  }, [measurements, onMeasurementsChange])

  // Handle distance measurement completion
  const handleDistanceMeasurementComplete = useCallback((measurement: DistanceMeasurement) => {
    const updatedMeasurements = {
      ...measurements,
      distances: [...measurements.distances, measurement]
    }
    onMeasurementsChange(updatedMeasurements)
  }, [measurements, onMeasurementsChange])

  // Handle distance measurement deletion
  const handleDistanceMeasurementDelete = useCallback((id: string) => {
    const updatedMeasurements = {
      ...measurements,
      distances: measurements.distances.filter(m => m.id !== id)
    }
    onMeasurementsChange(updatedMeasurements)
  }, [measurements, onMeasurementsChange])

  return (
    <Group>
      {/* Area Measurement Tool */}
      <AreaMeasurementTool
        isActive={activeTool === 'area'}
        scale={scale}
        pixelsPerFoot={pixelsPerFoot}
        onMeasurementComplete={handleAreaMeasurementComplete}
        measurements={measurements.areas}
        onMeasurementDelete={handleAreaMeasurementDelete}
      />

      {/* Perimeter Measurement Tool */}
      <PerimeterMeasurementTool
        isActive={activeTool === 'perimeter'}
        scale={scale}
        pixelsPerFoot={pixelsPerFoot}
        onMeasurementComplete={handlePerimeterMeasurementComplete}
        measurements={measurements.perimeters}
        onMeasurementDelete={handlePerimeterMeasurementDelete}
      />

      {/* Distance Measurement Tool */}
      <DistanceMeasurementTool
        isActive={activeTool === 'distance'}
        scale={scale}
        pixelsPerFoot={pixelsPerFoot}
        onMeasurementComplete={handleDistanceMeasurementComplete}
        measurements={measurements.distances}
        onMeasurementDelete={handleDistanceMeasurementDelete}
      />

      {/* Clearance Verification Tool */}
      <ClearanceVerificationTool
        isActive={activeTool === 'clearance'}
        scale={scale}
        pixelsPerFoot={pixelsPerFoot}
        placedEquipment={placedEquipment}
        equipmentDefinitions={equipmentDefinitions}
        onViolationSelect={onViolationSelect}
      />
    </Group>
  )
}

export default AdvancedMeasurementTools
