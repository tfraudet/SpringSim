/**
 * Pure functions for spring-mass system physics calculations
 * @see specs/001-spring-oscillation-simulator/contracts/physics.md
 */

/**
 * Calculate spring force using Hooke's Law
 * 
 * @param displacement - Displacement from equilibrium in meters (positive = stretched/downward)
 * @param springConstant - Spring stiffness constant k (N/m)
 * @returns Spring force in Newtons (negative = restoring force upward)
 * 
 * Formula: F = -k * x
 */
export function computeSpringForce(
  displacement: number,
  springConstant: number
): number {
  if (!Number.isFinite(displacement) || !Number.isFinite(springConstant)) {
    throw new Error('Invalid input: displacement and springConstant must be finite numbers');
  }
  return -springConstant * displacement;
}

/**
 * Calculate damping force (viscous damping proportional to velocity)
 * 
 * @param velocity - Velocity in m/s (positive = downward)
 * @param dampingCoefficient - Damping coefficient c (N·s/m)
 * @returns Damping force in Newtons (opposes motion)
 * 
 * Formula: F_damping = -c * v
 */
export function computeDampingForce(
  velocity: number,
  dampingCoefficient: number
): number {
  if (!Number.isFinite(velocity) || !Number.isFinite(dampingCoefficient)) {
    throw new Error('Invalid input: velocity and dampingCoefficient must be finite numbers');
  }
  if (dampingCoefficient < 0) {
    throw new Error('Invalid input: dampingCoefficient must be non-negative');
  }
  return -dampingCoefficient * velocity;
}

/**
 * Calculate acceleration from net force using Newton's 2nd Law
 * 
 * @param force - Net force acting on mass (N)
 * @param mass - Mass of object (kg)
 * @returns Acceleration in m/s² (positive = downward)
 * 
 * Formula: a = F / m
 */
export function computeAcceleration(
  force: number,
  mass: number
): number {
  if (!Number.isFinite(force) || !Number.isFinite(mass)) {
    throw new Error('Invalid input: force and mass must be finite numbers');
  }
  if (mass <= 0) {
    throw new Error('Invalid input: mass must be positive');
  }
  return force / mass;
}

/**
 * Calculate kinetic energy of the mass
 * 
 * @param mass - Mass of object (kg)
 * @param velocity - Velocity of object (m/s)
 * @returns Kinetic energy in Joules
 * 
 * Formula: KE = 0.5 * m * v²
 */
export function computeKineticEnergy(
  mass: number,
  velocity: number
): number {
  if (!Number.isFinite(mass) || !Number.isFinite(velocity)) {
    throw new Error('Invalid input: mass and velocity must be finite numbers');
  }
  if (mass <= 0) {
    throw new Error('Invalid input: mass must be positive');
  }
  return 0.5 * mass * velocity * velocity;
}

/**
 * Calculate elastic potential energy stored in the spring
 * 
 * @param springConstant - Spring stiffness constant k (N/m)
 * @param displacement - Displacement from equilibrium (m)
 * @returns Potential energy in Joules
 * 
 * Formula: PE = 0.5 * k * x²
 */
export function computePotentialEnergy(
  springConstant: number,
  displacement: number
): number {
  if (!Number.isFinite(springConstant) || !Number.isFinite(displacement)) {
    throw new Error('Invalid input: springConstant and displacement must be finite numbers');
  }
  if (springConstant <= 0) {
    throw new Error('Invalid input: springConstant must be positive');
  }
  return 0.5 * springConstant * displacement * displacement;
}

/**
 * Calculate total mechanical energy (kinetic + potential)
 * 
 * @param mass - Mass of object (kg)
 * @param velocity - Velocity of object (m/s)
 * @param springConstant - Spring stiffness constant k (N/m)
 * @param displacement - Displacement from equilibrium (m)
 * @returns Total energy in Joules
 * 
 * Formula: E = KE + PE = 0.5 * m * v² + 0.5 * k * x²
 */
export function computeTotalEnergy(
  mass: number,
  velocity: number,
  springConstant: number,
  displacement: number
): number {
  const kineticEnergy = computeKineticEnergy(mass, velocity);
  const potentialEnergy = computePotentialEnergy(springConstant, displacement);
  return kineticEnergy + potentialEnergy;
}

/**
 * Calculate equilibrium position (where spring force balances gravity)
 * 
 * For a vertical spring-mass system:
 * At equilibrium: k * x_eq = m * g
 * 
 * @param mass - Mass of object (kg)
 * @param springConstant - Spring stiffness constant k (N/m)
 * @param gravity - Gravitational acceleration (m/s²), default 9.81
 * @returns Equilibrium displacement from natural length (m)
 * 
 * Formula: x_eq = (m * g) / k
 */
export function computeEquilibriumPosition(
  mass: number,
  springConstant: number,
  gravity: number = 9.81
): number {
  if (!Number.isFinite(mass) || !Number.isFinite(springConstant) || !Number.isFinite(gravity)) {
    throw new Error('Invalid input: all parameters must be finite numbers');
  }
  if (mass <= 0 || springConstant <= 0) {
    throw new Error('Invalid input: mass and springConstant must be positive');
  }
  return (mass * gravity) / springConstant;
}
