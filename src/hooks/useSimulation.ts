/**
 * Main simulation orchestration hook
 * @see specs/001-spring-oscillation-simulator/contracts/hooks.md
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SpringParameters, SimulationState, LockedYDomains } from '../types/simulation';
import { usePhysicsEngine } from './usePhysicsEngine';
import { useGraphData } from './useGraphData';
import { PHYSICS_CONSTANTS } from '../lib/constants';

const { TIMESTEP, GRAPH_UPDATE_INTERVAL } = PHYSICS_CONSTANTS;

/**
 * Main simulation hook - orchestrates RAF loop, physics, and data collection
 * 
 * @param parameters - Spring-mass system configuration
 * @returns Simulation state, time-series data, and control functions
 */
export function useSimulation(parameters: SpringParameters) {
  // Initial state
  const [state, setState] = useState<SimulationState>({
    position: 0,
    velocity: 0,
    acceleration: 0,
    time: 0,
    isRunning: false,
    isPaused: false,
  });
  
  // Keep a ref to the latest state for RAF loop (avoid re-triggering useEffect)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Physics engine
  const { computeNextState, computeTotalEnergy } = usePhysicsEngine(parameters);
  
  // Graph data management
  const { timeSeriesData, addDataPoint, clearData } = useGraphData();
  // Locked Y domains (computed at start) - stored in state so components re-render
  const [lockedYDomains, setLockedYDomains] = useState<LockedYDomains | null>(null);
  
  // RAF and timing refs
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const lastDataUpdateRef = useRef<number>(0);
  
  /**
   * Set initial displacement (for drag interaction)
   */
  const setInitialDisplacement = useCallback((displacement: number) => {
    setState((prev) => {
      // Allow setting displacement anytime to create oscillations
      return {
        ...prev,
        position: displacement,
        velocity: 0,
        acceleration: 0,
      };
    });
  }, []);
  
  /**
   * Start simulation
   */
  const start = useCallback(() => {
    // Start the simulation loop; Y domains will be computed when first data arrives
    setState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
    lastFrameTimeRef.current = performance.now();
    lastDataUpdateRef.current = 0;
  }, []);

  /**
   * Compute and lock Y domains on first arrival of graph data.
   * This runs once when the time series becomes non-empty.
   */
  useEffect(() => {
    if (lockedYDomains) return; // already computed
    // Trigger only when we have at least one data point in displacement (use first series as indicator)
    if (!timeSeriesData || timeSeriesData.displacement.length === 0) return;

    const k = parameters.springConstant;
    const m = parameters.mass;
    const omega = Math.sqrt(Math.max(1e-9, k / m));

    const maxAbs = (series: { time: number; value: number }[]) => {
      if (!series || series.length === 0) return 0;
      return Math.max(...series.map(d => Math.abs(d.value)));
    };

    const observedA = maxAbs(timeSeriesData.displacement);
    const observedV = maxAbs(timeSeriesData.velocity);

    const A_from_v_obs = observedV / (omega || 1);

    let A = Math.max(Math.abs(state.position), observedA, A_from_v_obs);
    if (A === 0) A = 0.5;

    const vmax = A * omega;
    const amax = A * omega * omega;
    const energyMax = 0.5 * k * A * A;

    const padFactor = 1.15;

    const dispDomain: [number, number] = [-A * padFactor, A * padFactor];
    const velDomain: [number, number] = [-vmax * padFactor, vmax * padFactor];
    const accDomain: [number, number] = [-amax * padFactor, amax * padFactor];
    const energyDomain: [number, number] = [0, Math.max(energyMax * padFactor, 1)];

    setLockedYDomains({
      displacement: dispDomain,
      velocity: velDomain,
      acceleration: accDomain,
      totalEnergy: energyDomain,
    });
  // run when timeSeriesData first gets points or parameters/state change before lock
  }, [timeSeriesData, lockedYDomains, parameters, state.position]);
  
  /**
   * Pause simulation (preserves state)
   */
  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  }, []);
  
  /**
   * Resume from paused state
   */
  const resume = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: false,
    }));
    lastFrameTimeRef.current = performance.now();
  }, []);
  
  /**
   * Reset simulation to initial state
   */
  const reset = useCallback(() => {
    setState({
      position: 0,
      velocity: 0,
      acceleration: 0,
      time: 0,
      isRunning: false,
      isPaused: false,
    });
    clearData();
  // Clear locked domains on reset
  setLockedYDomains(null);
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, [clearData]);
  
  /**
   * RAF loop - runs physics and updates state
   */
  useEffect(() => {
    const currentState = stateRef.current;
    if (!currentState.isRunning || currentState.isPaused) {
      return;
    }
    
    const animate = (_currentTime: number) => {
      // Get current state from ref
      const current = stateRef.current;
      
      // Check if still running
      if (!current.isRunning || current.isPaused) {
        return;
      }
      
      // Compute next physics state
      try {
        const nextState = computeNextState(
          { position: current.position, velocity: current.velocity },
          TIMESTEP
        );
        
        const newTime = current.time + TIMESTEP;
        
        // Update simulation state
        setState({
          position: nextState.position,
          velocity: nextState.velocity,
          acceleration: nextState.acceleration,
          time: newTime,
          isRunning: true,
          isPaused: false,
        });
        
        // Update graph data at 10 Hz (every 100ms)
        const timeSinceLastUpdate = (newTime - lastDataUpdateRef.current) * 1000; // Convert to ms
        if (timeSinceLastUpdate >= GRAPH_UPDATE_INTERVAL) {
          const energy = computeTotalEnergy(nextState.position, nextState.velocity);
          addDataPoint(
            newTime,
            nextState.position,
            nextState.velocity,
            nextState.acceleration,
            energy
          );
          lastDataUpdateRef.current = newTime;
        }
        
        // Schedule next frame
        rafIdRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Physics simulation error:', error);
        // Pause on error
        setState((prev) => ({
          ...prev,
          isPaused: true,
        }));
      }
    };
    
    rafIdRef.current = requestAnimationFrame(animate);
    
    // Cleanup on unmount or when running state changes
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [state.isRunning, state.isPaused, computeNextState, computeTotalEnergy, addDataPoint]);
  
  return {
    state,
    timeSeriesData,
  lockedYDomains,
    start,
    pause,
    resume,
    reset,
    setInitialDisplacement,
  };
}
