/**
 * Graph data management hook - maintains rolling window of time-series data
 * @see specs/001-spring-oscillation-simulator/contracts/hooks.md
 */

import { useState, useCallback } from 'react';
import type { TimeSeriesData, DataPoint } from '../types/simulation';
import { PHYSICS_CONSTANTS } from '../lib/constants';

const { GRAPH_WINDOW_DURATION } = PHYSICS_CONSTANTS;

/**
 * Hook that manages time-series data for graphs with rolling window
 * 
 * @returns Time-series data and functions to add/clear data
 */
export function useGraphData() {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({
    displacement: [],
    velocity: [],
    acceleration: [],
    totalEnergy: [],
  });
  
  /**
   * Add a new data point for all series
   * Automatically prunes points older than GRAPH_WINDOW_DURATION
   */
  const addDataPoint = useCallback((
    time: number,
    displacement: number,
    velocity: number,
    acceleration: number,
    totalEnergy: number
  ) => {
    setTimeSeriesData((prev) => {
      const cutoffTime = time - GRAPH_WINDOW_DURATION;
      
      // Prune old data and add new point
      const pruneAndAdd = (data: DataPoint[], value: number): DataPoint[] => {
        const filtered = data.filter(point => point.time >= cutoffTime);
        return [...filtered, { time, value }];
      };
      
      return {
        displacement: pruneAndAdd(prev.displacement, displacement),
        velocity: pruneAndAdd(prev.velocity, velocity),
        acceleration: pruneAndAdd(prev.acceleration, acceleration),
        totalEnergy: pruneAndAdd(prev.totalEnergy, totalEnergy),
      };
    });
  }, []);
  
  /**
   * Clear all time-series data (reset)
   */
  const clearData = useCallback(() => {
    setTimeSeriesData({
      displacement: [],
      velocity: [],
      acceleration: [],
      totalEnergy: [],
    });
  }, []);
  
  return {
    timeSeriesData,
    addDataPoint,
    clearData,
  };
}
