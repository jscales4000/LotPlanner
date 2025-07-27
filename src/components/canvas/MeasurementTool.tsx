/**
 * Measurement Tool Component
 * Two-click measurement system: click first point, click second point, enter real-world distance
 */

import React, { useState } from 'react';
import { Group, Line, Circle, Text, Rect } from 'react-konva';
import Konva from 'konva';

interface MeasurementPoint {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  calculatedDistance: number;
  actualDistance?: number;
  scaleAccuracy?: number; // Ratio of actual to calculated
}

interface MeasurementToolProps {
  isActive: boolean;
  scale: number;
  pixelsPerFoot: number;
  onMeasurementComplete?: (measurement: Measurement) => void;
  onShowDistanceInput?: (calculatedDistance: number, onSubmit: (actualDistance: number) => void, onCancel: () => void) => void;
}

export default function MeasurementTool({ 
  isActive, 
  scale, 
  pixelsPerFoot, 
  onMeasurementComplete,
  onShowDistanceInput 
}: MeasurementToolProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [firstPoint, setFirstPoint] = useState<MeasurementPoint | null>(null);
  const [pendingMeasurement, setPendingMeasurement] = useState<{
    start: MeasurementPoint;
    end: MeasurementPoint;
    calculatedDistance: number;
  } | null>(null);
  const [showDistanceInput, setShowDistanceInput] = useState(false);
  const [inputDistance, setInputDistance] = useState('');

  const calculateDistance = React.useCallback((start: MeasurementPoint, end: MeasurementPoint): number => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    return pixelDistance / pixelsPerFoot;
  }, [pixelsPerFoot]);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (!firstPoint) {
      // First click - set start point
      setFirstPoint({ x: pos.x, y: pos.y });
    } else {
      // Second click - set end point and show distance input
      const secondPoint = { x: pos.x, y: pos.y };
      const calculatedDistance = calculateDistance(firstPoint, secondPoint);
      
      // Only proceed if distance is reasonable (> 5 feet)
      if (calculatedDistance > 5) {
        const tempMeasurement = {
          start: firstPoint,
          end: secondPoint,
          calculatedDistance
        };
        
        // Show the distance input modal
        if (onShowDistanceInput) {
          onShowDistanceInput(
            calculatedDistance,
            (actualDistance: number) => {
              // Handle distance submission
              const scaleAccuracy = actualDistance / calculatedDistance;
              
              const measurement: Measurement = {
                id: `measurement-${Date.now()}`,
                start: tempMeasurement.start,
                end: tempMeasurement.end,
                calculatedDistance: tempMeasurement.calculatedDistance,
                actualDistance,
                scaleAccuracy
              };

              setMeasurements(prev => [...prev, measurement]);
              onMeasurementComplete?.(measurement);
            },
            () => {
              // Handle cancellation - no action needed
            }
          );
        }
      }
      
      // Reset first point for next measurement
      setFirstPoint(null);
    }
  };

  const handleDistanceSubmit = () => {
    if (!pendingMeasurement || !inputDistance.trim()) return;

    const actualDistance = parseFloat(inputDistance);
    if (isNaN(actualDistance) || actualDistance <= 0) {
      alert('Please enter a valid distance in feet');
      return;
    }

    const scaleAccuracy = actualDistance / pendingMeasurement.calculatedDistance;
    
    const measurement: Measurement = {
      id: `measurement-${Date.now()}`,
      start: pendingMeasurement.start,
      end: pendingMeasurement.end,
      calculatedDistance: pendingMeasurement.calculatedDistance,
      actualDistance,
      scaleAccuracy
    };

    setMeasurements(prev => [...prev, measurement]);
    onMeasurementComplete?.(measurement);

    // Reset state
    setPendingMeasurement(null);
    setShowDistanceInput(false);
    setInputDistance('');
  };

  const handleDistanceCancel = () => {
    setPendingMeasurement(null);
    setShowDistanceInput(false);
    setInputDistance('');
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setFirstPoint(null);
    setPendingMeasurement(null);
    setShowDistanceInput(false);
    setInputDistance('');
  };

  const renderMeasurementLine = (
    start: MeasurementPoint,
    end: MeasurementPoint,
    calculatedDistance: number,
    actualDistance?: number,
    scaleAccuracy?: number,
    isTemporary = false
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    const color = isTemporary ? "#ff6b6b" : (scaleAccuracy && Math.abs(scaleAccuracy - 1) > 0.1 ? "#ffa500" : "#4dabf7");
    
    return (
      <Group key={isTemporary ? 'temp' : `${start.x}-${start.y}`}>
        {/* Measurement line */}
        <Line
          points={[start.x, start.y, end.x, end.y]}
          stroke={color}
          strokeWidth={2 / scale}
          dash={[5 / scale, 5 / scale]}
        />
        
        {/* Start point */}
        <Circle
          x={start.x}
          y={start.y}
          radius={4 / scale}
          fill={color}
          stroke="#fff"
          strokeWidth={1 / scale}
        />
        
        {/* End point */}
        <Circle
          x={end.x}
          y={end.y}
          radius={4 / scale}
          fill={color}
          stroke="#fff"
          strokeWidth={1 / scale}
        />
        
        {/* Distance label background */}
        <Rect
          x={midX - 40 / scale}
          y={midY - 15 / scale}
          width={80 / scale}
          height={30 / scale}
          fill="rgba(255, 255, 255, 0.9)"
          stroke={color}
          strokeWidth={1 / scale}
          cornerRadius={4 / scale}
        />
        
        {/* Distance labels */}
        <Text
          x={midX}
          y={midY - 8 / scale}
          text={`Calc: ${calculatedDistance.toFixed(1)}'`}
          fontSize={10 / scale}
          fill="#333"
          align="center"
          offsetX={25 / scale}
        />
        
        {actualDistance && (
          <Text
            x={midX}
            y={midY + 2 / scale}
            text={`Real: ${actualDistance.toFixed(1)}'`}
            fontSize={10 / scale}
            fill="#333"
            align="center"
            offsetX={25 / scale}
          />
        )}
      </Group>
    );
  };

  return (
    <Group>
      {/* Transparent overlay to capture clicks when measurement tool is active */}
      {isActive && (
        <Rect
          x={0}
          y={0}
          width={10000}
          height={10000}
          fill="transparent"
          onClick={handleClick}
          listening={true}
        />
      )}
      
      {/* Render saved measurements */}
      {measurements.map((measurement, index) => 
        renderMeasurementLine(
          measurement.start,
          measurement.end,
          measurement.calculatedDistance,
          measurement.actualDistance,
          measurement.scaleAccuracy,
          false
        )
      )}
      
      {/* Render first point if set */}
      {firstPoint && (
        <Circle
          x={firstPoint.x}
          y={firstPoint.y}
          radius={6 / scale}
          fill="#ff6b6b"
          stroke="#fff"
          strokeWidth={2 / scale}
        />
      )}
      
      {/* Render pending measurement */}
      {pendingMeasurement && renderMeasurementLine(
        pendingMeasurement.start,
        pendingMeasurement.end,
        pendingMeasurement.calculatedDistance,
        undefined,
        undefined,
        true
      )}
      
      {/* Distance input modal overlay */}
      {showDistanceInput && pendingMeasurement && (
        <Group>
          {/* Modal background */}
          <Rect
            x={pendingMeasurement.end.x + 20 / scale}
            y={pendingMeasurement.end.y - 40 / scale}
            width={200 / scale}
            height={80 / scale}
            fill="white"
            stroke="#ccc"
            strokeWidth={1 / scale}
            cornerRadius={8 / scale}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.3}
          />
          
          {/* Modal text */}
          <Text
            x={pendingMeasurement.end.x + 30 / scale}
            y={pendingMeasurement.end.y - 30 / scale}
            text={`Calculated: ${pendingMeasurement.calculatedDistance.toFixed(1)}'`}
            fontSize={12 / scale}
            fill="#333"
          />
          
          <Text
            x={pendingMeasurement.end.x + 30 / scale}
            y={pendingMeasurement.end.y - 15 / scale}
            text="Enter actual distance (feet):"
            fontSize={10 / scale}
            fill="#666"
          />
        </Group>
      )}
    </Group>
  );
}

export { type Measurement };
