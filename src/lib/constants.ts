/**
 * Physical constants and limits for the spring-mass oscillation simulator
 * @see specs/001-spring-oscillation-simulator/contracts/physics.md
 */

/**
 * Physical constants
 */
export const PHYSICS_CONSTANTS = {
  /** Gravitational acceleration (m/s²) */
  GRAVITY: 9.81,
  
  /** Numerical integration timestep (seconds) */
  TIMESTEP: 1 / 60, // 16.67ms per physics step
  
  /** Graph update interval (milliseconds) */
  GRAPH_UPDATE_INTERVAL: 100, // 10 Hz
  
  /** Graph rolling window duration (seconds) */
  GRAPH_WINDOW_DURATION: 15,
} as const;

/**
 * Parameter validation limits
 */
export const PARAMETER_LIMITS = {
  /** Minimum mass value (kg) */
  MIN_MASS: 0.01,
  /** Maximum mass value (kg) */
  MAX_MASS: 100,
  
  /** Minimum spring constant (N/m) */
  MIN_SPRING_CONSTANT: 0.1,
  /** Maximum spring constant (N/m) */
  MAX_SPRING_CONSTANT: 1000,
  
  /** Minimum initial length (m) */
  MIN_LENGTH: 0.1,
  /** Maximum initial length (m) */
  MAX_LENGTH: 10,
} as const;

/**
 * Numerical tolerances for physics calculations
 */
export const TOLERANCES = {
  /** Energy conservation error threshold (1%) */
  ENERGY_CONSERVATION: 0.01,
  
  /** Floating point comparison epsilon */
  EPSILON: 1e-10,
} as const;
