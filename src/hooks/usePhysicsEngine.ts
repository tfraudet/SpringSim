/**
 * Physics engine hook - encapsulates RK4 integration and Hooke's law
 * @see specs/001-spring-oscillation-simulator/contracts/hooks.md
 */

import { useMemo } from 'react';
import type { SpringParameters, SimulationState } from '../types/simulation';
import { rk4Step } from '../lib/integration';
import {
  computeSpringForce,
  computeDampingForce,
  computeAcceleration,
  computeTotalEnergy,
} from '../lib/physics';

/**
 * Hook that provides physics calculation functions for the spring-mass system
 * 
 * @param parameters - Spring-mass system configuration
 * @returns Physics calculation functions (memoized)
 */
export function usePhysicsEngine(parameters: SpringParameters) {
  const { mass, springConstant, dampingCoefficient } = parameters;
  
  /**
   * Compute acceleration from current position and velocity
   * Includes spring force (Hooke's law) and damping force (viscous damping)
   * a = F_total/m = (-kx - cv)/m
   */
  const computeAccelerationFromState = useMemo(() => {
    return (position: number, velocity: number): number => {
      const springForce = computeSpringForce(position, springConstant);
      const dampingForce = computeDampingForce(velocity, dampingCoefficient);
      const totalForce = springForce + dampingForce;
      return computeAcceleration(totalForce, mass);
    };
  }, [mass, springConstant, dampingCoefficient]);
  
  /**
   * Compute next state using RK4 numerical integration
   */
  const computeNextState = useMemo(() => {
    return (
      currentState: Pick<SimulationState, 'position' | 'velocity'>,
      dt: number
    ): { position: number; velocity: number; acceleration: number } => {
      const { position, velocity } = rk4Step(
        { position: currentState.position, velocity: currentState.velocity },
        dt,
        computeAccelerationFromState
      );
      
      const acceleration = computeAccelerationFromState(position, velocity);
      
      return { position, velocity, acceleration };
    };
  }, [computeAccelerationFromState]);
  
  /**
   * Compute total mechanical energy
   */
  const computeEnergy = useMemo(() => {
    return (position: number, velocity: number): number => {
      return computeTotalEnergy(mass, velocity, springConstant, position);
    };
  }, [mass, springConstant]);
  
  return {
    computeNextState,
    computeAcceleration: computeAccelerationFromState,
    computeTotalEnergy: computeEnergy,
  };
}
