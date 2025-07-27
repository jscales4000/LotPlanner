/**
 * Scale Bar Component
 * Displays a visual scale bar overlay on the canvas to show distance measurements
 */

import React from 'react';
import { Group, Rect, Line, Text } from 'react-konva';

interface ScaleBarProps {
  scale: number; // Current canvas scale (zoom level)
  canvasWidth: number;
  canvasHeight: number;
  pixelsPerFoot: number; // 10 pixels per foot for our canvas
}

export default function ScaleBar({ scale, canvasWidth, canvasHeight, pixelsPerFoot }: ScaleBarProps) {
  // Calculate scale bar dimensions
  const scaleBarWidth = 200; // pixels at 100% zoom
  const scaleBarHeight = 8;
  const tickHeight = 12;
  
  // Position scale bar in bottom-left corner with padding
  const padding = 20;
  const x = padding / scale;
  const y = (canvasHeight - padding - 40) / scale;
  
  // Calculate the actual distance represented by the scale bar
  const actualPixelWidth = scaleBarWidth / scale;
  const distanceInFeet = actualPixelWidth / pixelsPerFoot;
  
  // Round to nice increments (50, 100, 200, 500, etc.)
  let roundedDistance: number;
  let segments: number;
  
  if (distanceInFeet <= 50) {
    roundedDistance = 50;
    segments = 5; // 10' increments
  } else if (distanceInFeet <= 100) {
    roundedDistance = 100;
    segments = 4; // 25' increments
  } else if (distanceInFeet <= 200) {
    roundedDistance = 200;
    segments = 4; // 50' increments
  } else if (distanceInFeet <= 500) {
    roundedDistance = 500;
    segments = 5; // 100' increments
  } else {
    roundedDistance = Math.ceil(distanceInFeet / 100) * 100;
    segments = 4;
  }
  
  // Calculate actual scale bar width based on rounded distance
  const actualScaleBarWidth = (roundedDistance * pixelsPerFoot) / scale;
  const segmentWidth = actualScaleBarWidth / segments;
  
  // Generate tick marks and labels
  const ticks = [];
  const labels = [];
  
  for (let i = 0; i <= segments; i++) {
    const tickX = x + (i * segmentWidth);
    const labelValue = (roundedDistance / segments) * i;
    
    // Tick mark
    ticks.push(
      <Line
        key={`tick-${i}`}
        points={[tickX, y, tickX, y - tickHeight / scale]}
        stroke="#333"
        strokeWidth={1 / scale}
      />
    );
    
    // Label
    labels.push(
      <Text
        key={`label-${i}`}
        x={tickX}
        y={y - (tickHeight + 5) / scale}
        text={`${labelValue}'`}
        fontSize={10 / scale}
        fill="#333"
        align="center"
        offsetX={10 / scale} // Center the text
      />
    );
  }
  
  return (
    <Group>
      {/* Background rectangle */}
      <Rect
        x={x - 10 / scale}
        y={y - (tickHeight + 20) / scale}
        width={actualScaleBarWidth + 20 / scale}
        height={(tickHeight + 30) / scale}
        fill="rgba(255, 255, 255, 0.9)"
        stroke="#ccc"
        strokeWidth={1 / scale}
        cornerRadius={4 / scale}
      />
      
      {/* Main scale bar */}
      <Rect
        x={x}
        y={y - scaleBarHeight / scale}
        width={actualScaleBarWidth}
        height={scaleBarHeight / scale}
        fill="#333"
      />
      
      {/* Alternating segments for better visibility */}
      {Array.from({ length: segments }, (_, i) => (
        <Rect
          key={`segment-${i}`}
          x={x + (i * segmentWidth)}
          y={y - scaleBarHeight / scale}
          width={segmentWidth}
          height={scaleBarHeight / scale}
          fill={i % 2 === 0 ? "#333" : "#fff"}
          stroke="#333"
          strokeWidth={0.5 / scale}
        />
      ))}
      
      {/* Tick marks */}
      {ticks}
      
      {/* Labels */}
      {labels}
      
      {/* Title */}
      <Text
        x={x + actualScaleBarWidth / 2}
        y={y + 15 / scale}
        text="Scale"
        fontSize={12 / scale}
        fill="#333"
        align="center"
        fontStyle="bold"
        offsetX={15 / scale} // Center the text
      />
    </Group>
  );
}
