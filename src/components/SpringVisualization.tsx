/**
 * SVG spring-mass visualization with drag interaction
 * @see specs/001-spring-oscillation-simulator/contracts/component-props.md
 */

import { memo } from 'react';
import type { SpringParameters } from '../types/simulation.js';
import { usePointerDrag } from '../hooks/usePointerDrag.js';
import { computeEquilibriumPosition } from '../lib/physics.js';
import { PHYSICS_CONSTANTS } from '../lib/constants.js';

interface SpringVisualizationProps {
  position: number;
  parameters: SpringParameters;
  isRunning: boolean;
  onDrag: (displacement: number) => void;
}

function SpringVisualizationComponent({
  position,
  parameters,
  onDrag,
}: SpringVisualizationProps) {
  const { mass, springConstant, initialLength } = parameters;
  
  // SVG dimensions
  const width = 300;
  const ceilingY = 10;
  
  // Calculate equilibrium position
  const equilibrium = computeEquilibriumPosition(mass, springConstant, PHYSICS_CONSTANTS.GRAVITY);
  const springVisualLength = initialLength + equilibrium;
  
  // Scale position to pixels (1m = 50px)
  const scale = 50;
  const massY = ceilingY + (springVisualLength + position) * scale;
  const massRadius = Math.sqrt(mass) * 8;
  
  // Drag interaction - accumulate deltas to update absolute position
  const { ref, isDragging } = usePointerDrag({
    onDrag: (deltaY: number) => {
      // Convert delta pixels to meters and add to current position
      const deltaMeters = deltaY / scale;
      const newPosition = position + deltaMeters;
      onDrag(newPosition);
    },
    enabled: true, // Always allow dragging to set displacement
  });
  
  return (
	<div className="bg-neutral-800 p-6 rounded-lg h-full">
      <svg
        className="mx-auto  h-full"
        role="img"
        aria-label="Spring-mass system visualization"
      >
        {/* Ceiling */}
        <line x1={0} y1={ceilingY} x2={width} y2={ceilingY} stroke="#9ca3af" strokeWidth={4} />
        
        {/* Spring (zigzag) */}
        <SpringPath
          x={width / 2}
          y1={ceilingY}
          y2={massY - massRadius}
          coils={10}
        />
        
        {/* Mass */}
        <circle
          ref={ref}
          cx={width / 2}
          cy={massY}
          r={massRadius}
          fill="#ef4444"
          stroke="#dc2626"
          strokeWidth={2}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
        
        {/* Position label */}
        <text
          x={width / 2 + massRadius + 10}
          y={massY + 5}
          fontSize={14}
          fill="#e5e7eb"
        >
          {position.toFixed(3)} m
        </text>
      </svg>
    </div>
  );
}

// Helper component for spring zigzag path
function SpringPath({ x, y1, y2, coils }: { x: number; y1: number; y2: number; coils: number }) {
  const length = y2 - y1;
  const segmentHeight = length / (coils * 2);
  const width = 20;
  
  let d = `M ${x} ${y1}`;
  for (let i = 0; i < coils * 2; i++) {
    const y = y1 + segmentHeight * (i + 1);
    const offsetX = i % 2 === 0 ? width : -width;
    d += ` L ${x + offsetX} ${y}`;
  }
  d += ` L ${x} ${y2}`;
  
  return <path d={d} stroke="#9ca3af" strokeWidth={3} fill="none" />;
}

// Memoize to prevent unnecessary re-renders
export const SpringVisualization = memo(SpringVisualizationComponent, (prevProps, nextProps) => {
  // Only re-render if position changed significantly (> 0.001m) or parameters changed
  const positionDiff = Math.abs(prevProps.position - nextProps.position);
  return (
    positionDiff < 0.001 &&
    prevProps.parameters.mass === nextProps.parameters.mass &&
    prevProps.parameters.springConstant === nextProps.parameters.springConstant &&
    prevProps.parameters.initialLength === nextProps.parameters.initialLength
  );
});
