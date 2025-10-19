# Custom Hooks Contracts

**Date**: 2025-10-18  
**Purpose**: Define signatures and behavior guarantees for custom React hooks

---

## 1. useSimulation

**File**: `src/hooks/useSimulation.ts`

**Purpose**: Main simulation orchestration hook - manages state, RAF loop, and physics integration

### Signature

```typescript
function useSimulation(
  parameters: SpringParameters
): {
  state: SimulationState;
  timeSeriesData: TimeSeriesData;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setInitialDisplacement: (displacement: number) => void;
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `parameters` | `SpringParameters` | Spring-mass system configuration (mass, k, L0) |

### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `state` | `SimulationState` | Current simulation state (position, velocity, time, etc.) |
| `timeSeriesData` | `TimeSeriesData` | Historical data for graphs (15s rolling window) |
| `start` | `() => void` | Start simulation from current state |
| `pause` | `() => void` | Pause simulation (preserves state) |
| `resume` | `() => void` | Resume from paused state |
| `reset` | `() => void` | Reset to initial state (t=0, x=0, v=0) |
| `setInitialDisplacement` | `(displacement: number) => void` | Set position before start (drag interaction) |

### Behavior Guarantees

**State Initialization**:
- Initial state: `{ position: 0, velocity: 0, acceleration: 0, time: 0, isRunning: false, isPaused: false }`
- Parameters change while `isRunning=false`: Reset state immediately
- Parameters change while `isRunning=true`: Ignored (no mid-simulation changes)

**RAF Loop Management**:
- Loop starts on `start()`, stops on `pause()` or `reset()`
- Target frame rate: 60 FPS (16.67ms per frame)
- Uses `requestAnimationFrame` for smooth animation
- Cleanup: Cancels RAF on unmount or `reset()`

**Physics Integration**:
- Delegates to `usePhysicsEngine` for RK4 calculations
- Fixed timestep: 16.67ms (dt = 1/60 second)
- Accumulates time with frame delta (handles variable RAF timing)

**Data Collection**:
- Appends to `timeSeriesData` every 100ms (10 Hz per SC-003)
- Auto-prunes data older than 15 seconds (rolling window)
- Energy calculation: `E = 0.5 * m * v² + 0.5 * k * x²`

**Error Handling**:
- NaN/Infinity in physics output: Pause simulation, log error, show user alert
- Invalid parameters: Hook throws error (caller must validate)

### Performance Characteristics

- **Time Complexity**: O(1) per RAF frame (constant physics computation)
- **Space Complexity**: O(n) where n = data points in 15s window (~150 points max)
- **Memory Management**: Auto-prune old data, no memory leaks

### Dependencies

- `usePhysicsEngine` - Physics calculations
- `useState` - State management
- `useEffect` - RAF loop lifecycle
- `useCallback` - Memoized control functions

### Example Usage

```typescript
const {
  state,
  timeSeriesData,
  start,
  pause,
  resume,
  reset,
  setInitialDisplacement
} = useSimulation(parameters);

// Set initial displacement via drag
setInitialDisplacement(0.5); // 0.5m below equilibrium

// Start simulation
start();

// Later: pause
pause();

// Resume
resume();

// Reset everything
reset();
```

---

## 2. usePhysicsEngine

**File**: `src/hooks/usePhysicsEngine.ts`

**Purpose**: Encapsulate RK4 numerical integration and Hooke's law physics

### Signature

```typescript
function usePhysicsEngine(
  parameters: SpringParameters
): {
  computeNextState: (
    currentState: Pick<SimulationState, 'position' | 'velocity'>,
    dt: number
  ) => { position: number; velocity: number; acceleration: number };
  computeAcceleration: (position: number) => number;
  computeTotalEnergy: (position: number, velocity: number) => number;
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `parameters` | `SpringParameters` | System constants (mass, springConstant, initialLength) |

### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `computeNextState` | `Function` | RK4 integrator - computes next position/velocity/acceleration |
| `computeAcceleration` | `Function` | Calculates acceleration from Hooke's law |
| `computeTotalEnergy` | `Function` | Calculates total mechanical energy (kinetic + potential) |

### Function Contracts

#### `computeNextState`

**Signature**:
```typescript
(currentState: { position: number; velocity: number }, dt: number) => {
  position: number;
  velocity: number;
  acceleration: number;
}
```

**Algorithm**: Runge-Kutta 4th order (RK4)

**Physics Equations**:
```
F = -k * x                  (Hooke's law)
a = F / m                   (Newton's 2nd law)
v(t+dt) = v(t) + a * dt     (velocity update)
x(t+dt) = x(t) + v * dt     (position update)
```

**RK4 Steps**:
```
k1_v = a(x)
k1_x = v
k2_v = a(x + k1_x*dt/2)
k2_x = v + k1_v*dt/2
k3_v = a(x + k2_x*dt/2)
k3_x = v + k2_v*dt/2
k4_v = a(x + k3_x*dt)
k4_x = v + k3_v*dt

v_new = v + dt/6 * (k1_v + 2*k2_v + 2*k3_v + k4_v)
x_new = x + dt/6 * (k1_x + 2*k2_x + 2*k3_x + k4_x)
```

**Guarantees**:
- Energy conservation error < 1% over 10 oscillation cycles (SC-004)
- Stable for dt <= 0.05 seconds (verified in research.md)
- Returns finite numbers (throws if NaN/Infinity detected)

#### `computeAcceleration`

**Signature**:
```typescript
(position: number) => number
```

**Formula**:
```
a = -k/m * x
```

**Returns**: Acceleration in m/s² (positive = downward)

#### `computeTotalEnergy`

**Signature**:
```typescript
(position: number, velocity: number) => number
```

**Formula**:
```
E = KE + PE
KE = 0.5 * m * v²
PE = 0.5 * k * x²
```

**Returns**: Total energy in Joules

### Performance Characteristics

- **Time Complexity**: O(1) - constant time calculations
- **Memoization**: Functions memoized with `useCallback` (stable references)
- **Pure Functions**: No side effects, deterministic outputs

### Example Usage

```typescript
const { computeNextState, computeAcceleration, computeTotalEnergy } = usePhysicsEngine(parameters);

// Compute next state (called in RAF loop)
const nextState = computeNextState(
  { position: currentState.position, velocity: currentState.velocity },
  0.016667 // dt = 1/60 second
);

// Get current acceleration
const a = computeAcceleration(currentState.position);

// Calculate energy
const energy = computeTotalEnergy(currentState.position, currentState.velocity);
```

---

## 3. useGraphData

**File**: `src/hooks/useGraphData.ts`

**Purpose**: Manage time-series data for graph rendering with throttling and windowing

### Signature

```typescript
function useGraphData(
  state: SimulationState,
  parameters: SpringParameters,
  updateInterval: number = 100
): TimeSeriesData
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `state` | `SimulationState` | - | Current simulation state (source of data) |
| `parameters` | `SpringParameters` | - | System parameters (for energy calculation) |
| `updateInterval` | `number` | 100 | Data sampling interval in milliseconds (10 Hz default) |

### Return Value

| Field | Type | Description |
|-------|------|-------------|
| `TimeSeriesData` | Object | Contains displacement, velocity, acceleration, totalEnergy arrays |

### Behavior Guarantees

**Data Sampling**:
- Throttled to `updateInterval` (default 100ms = 10 Hz per SC-003)
- Uses `useEffect` with interval-based throttling
- Only appends when `state.isRunning=true` and `state.isPaused=false`

**Rolling Window**:
- Maintains exactly 15 seconds of data (per FR-017)
- Auto-prunes points where `time < currentTime - 15`
- Maximum ~150 data points per series (15s × 10 Hz)

**Data Structure**:
```typescript
{
  displacement: [{ time: 0.0, value: 0.5 }, ...],
  velocity: [{ time: 0.0, value: 0.0 }, ...],
  acceleration: [{ time: 0.0, value: -5.0 }, ...],
  totalEnergy: [{ time: 0.0, value: 1.25 }, ...]
}
```

**Reset Behavior**:
- Clears all arrays when `state.time === 0` (reset triggered)
- Re-initializes with first data point on next update

### Performance Characteristics

- **Time Complexity**: O(n) where n = points in 15s window (~150 max)
- **Update Frequency**: 10 Hz (configurable via `updateInterval`)
- **Memory**: Constant upper bound (~600 data points total across 4 series)

### Example Usage

```typescript
const timeSeriesData = useGraphData(state, parameters, 100);

// Pass to Graph components
<Graph data={timeSeriesData.displacement} config={displacementConfig} />
<Graph data={timeSeriesData.velocity} config={velocityConfig} />
<Graph data={timeSeriesData.acceleration} config={accelerationConfig} />
<Graph data={timeSeriesData.totalEnergy} config={energyConfig} />
```

---

## 4. usePointerDrag

**File**: `src/hooks/usePointerDrag.ts`

**Purpose**: Unified mouse + touch drag interaction for spring visualization

### Signature

```typescript
function usePointerDrag(
  svgRef: React.RefObject<SVGSVGElement>,
  onDrag: (displacement: number) => void,
  enabled: boolean,
  scale: { pixelsPerMeter: number; equilibriumY: number }
): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `svgRef` | `React.RefObject<SVGSVGElement>` | Reference to SVG element |
| `onDrag` | `(displacement: number) => void` | Callback with displacement in meters |
| `enabled` | `boolean` | If false, ignore pointer events |
| `scale` | `{ pixelsPerMeter, equilibriumY }` | Coordinate conversion factors |

### Return Value

None (void) - side effect hook

### Behavior Guarantees

**Event Handling**:
- Uses Pointer Events API (unified mouse + touch per research.md)
- Attaches `pointerdown`, `pointermove`, `pointerup` listeners
- Only fires when `enabled=true`

**Coordinate Transformation**:
```typescript
// Convert SVG Y coordinate to displacement (meters)
const displacement = (pointerY - equilibriumY) / pixelsPerMeter;
```

**Drag Constraints**:
- Vertical only (ignore horizontal movement)
- Clamp to reasonable range (e.g., ±3 meters from equilibrium)

**Cleanup**:
- Removes event listeners on unmount
- Cancels drag on pointer cancel/leave events

### Performance Characteristics

- **Update Frequency**: Throttled to RAF (60 Hz) even if pointermove fires faster
- **Memory**: No memory leaks (proper cleanup in useEffect)

### Example Usage

```typescript
const svgRef = useRef<SVGSVGElement>(null);

usePointerDrag(
  svgRef,
  (displacement) => setInitialDisplacement(displacement),
  !isRunning || isPaused, // enabled when simulation not actively running
  { pixelsPerMeter: 100, equilibriumY: 200 }
);

return <svg ref={svgRef}>...</svg>;
```

---

## Hook Dependencies Summary

```
useSimulation
  ├─ usePhysicsEngine (physics calculations)
  ├─ useGraphData (time-series data management)
  └─ useState, useEffect, useCallback (React primitives)

usePhysicsEngine
  └─ useCallback (memoization)

useGraphData
  └─ useState, useEffect (React primitives)

usePointerDrag
  └─ useEffect (event listener lifecycle)
```

---

## Testing Strategy

**Unit Testing** (NOT IMPLEMENTED per constitution principle #4):
- Constitution explicitly states: "Minimize dependencies, **don't implement test**"
- No Jest, Vitest, or testing libraries
- Validation via TypeScript compile-time checks and manual QA

**Type Safety Validation**:
- Run `tsc --noEmit` to validate all hook signatures
- Strict mode enabled (no implicit any, null checks)

---

## Next Steps

With hooks contracts defined:
1. Document physics utility function APIs
2. Create quickstart guide for developers
3. Update agent context with technical stack
