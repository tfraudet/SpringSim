/**
 * Numerical integration methods for the spring-mass system
 * @see specs/001-spring-oscillation-simulator/contracts/physics.md
 * @see specs/001-spring-oscillation-simulator/research.md
 */

/**
 * State vector for the spring-mass system
 */
interface State {
  position: number;
  velocity: number;
}

/**
 * Runge-Kutta 4th order (RK4) integration step
 * 
 * Advances the state of the system by one time step using the RK4 method.
 * This provides O(dt⁴) global accuracy with good energy conservation.
 * 
 * @param state - Current state { position, velocity }
 * @param dt - Time step in seconds
 * @param accelerationFunc - Function to compute acceleration from position and velocity: a(x, v)
 * @returns Next state after time step dt
 * 
 * Algorithm:
 * For state vector [x, v] with derivatives [dx/dt = v, dv/dt = a(x, v)]:
 * 
 * k1 = f(x, v)
 * k2 = f(x + k1.dx*dt/2, v + k1.dv*dt/2)
 * k3 = f(x + k2.dx*dt/2, v + k2.dv*dt/2)
 * k4 = f(x + k3.dx*dt, v + k3.dv*dt)
 * 
 * x_new = x + dt/6 * (k1.dx + 2*k2.dx + 2*k3.dx + k4.dx)
 * v_new = v + dt/6 * (k1.dv + 2*k2.dv + 2*k3.dv + k4.dv)
 */
export function rk4Step(
  state: State,
  dt: number,
  accelerationFunc: (position: number, velocity: number) => number
): State {
  const { position: x, velocity: v } = state;
  
  // Validate inputs
  if (!Number.isFinite(x) || !Number.isFinite(v) || !Number.isFinite(dt)) {
    throw new Error('Invalid input: position, velocity, and dt must be finite numbers');
  }
  
  // k1: derivatives at current state
  const k1_dx = v;
  const k1_dv = accelerationFunc(x, v);
  
  if (!Number.isFinite(k1_dv)) {
    throw new Error('Acceleration function returned non-finite value');
  }
  
  // k2: derivatives at midpoint using k1
  const k2_dx = v + k1_dv * dt / 2;
  const k2_dv = accelerationFunc(x + k1_dx * dt / 2, v + k1_dv * dt / 2);
  
  if (!Number.isFinite(k2_dv)) {
    throw new Error('Acceleration function returned non-finite value at k2');
  }
  
  // k3: derivatives at midpoint using k2
  const k3_dx = v + k2_dv * dt / 2;
  const k3_dv = accelerationFunc(x + k2_dx * dt / 2, v + k2_dv * dt / 2);
  
  if (!Number.isFinite(k3_dv)) {
    throw new Error('Acceleration function returned non-finite value at k3');
  }
  
  // k4: derivatives at endpoint using k3
  const k4_dx = v + k3_dv * dt;
  const k4_dv = accelerationFunc(x + k3_dx * dt, v + k3_dv * dt);
  
  if (!Number.isFinite(k4_dv)) {
    throw new Error('Acceleration function returned non-finite value at k4');
  }
  
  // Weighted average of slopes
  const dx = (k1_dx + 2 * k2_dx + 2 * k3_dx + k4_dx) / 6;
  const dv = (k1_dv + 2 * k2_dv + 2 * k3_dv + k4_dv) / 6;
  
  // Compute new state
  const newPosition = x + dx * dt;
  const newVelocity = v + dv * dt;
  
  // Final validation
  if (!Number.isFinite(newPosition) || !Number.isFinite(newVelocity)) {
    throw new Error('RK4 integration produced non-finite values');
  }
  
  return {
    position: newPosition,
    velocity: newVelocity,
  };
}
