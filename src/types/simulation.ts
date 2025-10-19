/**
 * Core data structures for the spring-mass oscillation simulator
 * @see specs/001-spring-oscillation-simulator/data-model.md
 */

/**
 * User-configurable physical properties of the spring-mass system
 */
export interface SpringParameters {
  /** Mass of the weight attached to the spring (kg) */
  mass: number;
  /** Spring stiffness constant k (N/m) */
  springConstant: number;
  /** Natural/rest length of the spring (m) */
  initialLength: number;
  /** Damping coefficient c (N·s/m) - viscous damping proportional to velocity */
  dampingCoefficient: number;
}

/**
 * Current dynamic state of the simulation
 */
export interface SimulationState {
  /** Current displacement from equilibrium in meters (positive = downward) */
  position: number;
  /** Current velocity in m/s (positive = downward) */
  velocity: number;
  /** Current acceleration in m/s² (derived from Hooke's law) */
  acceleration: number;
  /** Elapsed simulation time since start (seconds) */
  time: number;
  /** True if simulation is active */
  isRunning: boolean;
  /** True if simulation is paused (preserves state for resume) */
  isPaused: boolean;
}

/**
 * Single data point for time-series graphs
 */
export interface DataPoint {
  /** Timestamp in seconds */
  time: number;
  /** Measured quantity (displacement, velocity, energy, etc.) */
  value: number;
}

/**
 * Historical time-series data for graph rendering (rolling window)
 */
export interface TimeSeriesData {
  displacement: DataPoint[];
  velocity: DataPoint[];
  acceleration: DataPoint[];
  totalEnergy: DataPoint[];
}

/**
 * Display configuration for individual graphs
 */
export interface GraphConfig {
  /** Graph title */
  title: string;
  /** X-axis label */
  xLabel: string;
  /** Y-axis label */
  yLabel: string;
  /** X-axis domain [min, max] */
  xDomain: [number, number];
  /** Y-axis domain [min, max] (or 'auto' for auto-scaling) */
  yDomain: [number, number] | 'auto';
  /** Line color (CSS color string) */
  color: string;
  /** Whether to show grid lines */
  showGrid: boolean;
}

/**
 * Y-axis domain type and locked domains for all graphs
 */
export type YDomain = [number, number] | 'auto';

export interface LockedYDomains {
  displacement: YDomain;
  velocity: YDomain;
  acceleration: YDomain;
  totalEnergy: YDomain;
}

/**
 * Validation result for spring parameters
 */
export interface ValidationResult {
  /** Whether parameters are valid */
  isValid: boolean;
  /** Error messages keyed by field name */
  errors: Record<string, string>;
}
