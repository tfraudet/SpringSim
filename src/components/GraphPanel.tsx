/**
 * Container for all graph components
 * @see specs/001-spring-oscillation-simulator/contracts/component-props.md
 */

import { Graph } from './Graph';
import type { TimeSeriesData, GraphConfig } from '../types/simulation';

interface GraphPanelProps {
  timeSeriesData: TimeSeriesData;
  currentTime: number;
}

export function GraphPanel({ timeSeriesData, currentTime }: GraphPanelProps) {
  const graphWidth = 400;
  const graphHeight = 200;
  
  const xDomain: [number, number] = [Math.max(0, currentTime - 15), currentTime];
  
  // Displacement graph config
  const displacementConfig: GraphConfig = {
    title: 'Displacement',
    xLabel: 'Time (s)',
    yLabel: 'Position (m)',
    xDomain,
    yDomain: 'auto',
    color: '#3b82f6',
    showGrid: true,
  };
  
  // Velocity graph config
  const velocityConfig: GraphConfig = {
    title: 'Velocity',
    xLabel: 'Time (s)',
    yLabel: 'Velocity (m/s)',
    xDomain,
    yDomain: 'auto',
    color: '#10b981',
    showGrid: true,
  };
  
  // Acceleration graph config
  const accelerationConfig: GraphConfig = {
    title: 'Acceleration',
    xLabel: 'Time (s)',
    yLabel: 'Acceleration (m/s²)',
    xDomain,
    yDomain: 'auto',
    color: '#f59e0b',
    showGrid: true,
  };
  
  // Total energy graph config
  const energyConfig: GraphConfig = {
    title: 'Total Energy',
    xLabel: 'Time (s)',
    yLabel: 'Energy (J)',
    xDomain,
    yDomain: 'auto',
    color: '#8b5cf6',
    showGrid: true,
  };
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <Graph
        data={timeSeriesData.displacement}
        config={displacementConfig}
        width={graphWidth}
        height={graphHeight}
      />
      <Graph
        data={timeSeriesData.velocity}
        config={velocityConfig}
        width={graphWidth}
        height={graphHeight}
      />
      <Graph
        data={timeSeriesData.acceleration}
        config={accelerationConfig}
        width={graphWidth}
        height={graphHeight}
      />
      <Graph
        data={timeSeriesData.totalEnergy}
        config={energyConfig}
        width={graphWidth}
        height={graphHeight}
      />
    </div>
  );
}
