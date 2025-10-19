# Data Model: Mass-Spring Oscillation Simulator

**Feature**: Mass-Spring Oscillation Simulator  
**Branch**: `001-spring-oscillation-simulator`  
**Date**: 2025-10-18  
**Phase**: Phase 1 - Design

## Overview

This document defines the core data structures and their relationships for the spring-mass oscillation simulator. Since this is a client-side SPA with no backend persistence, all entities represent in-memory state managed by React hooks. TypeScript interfaces provide compile-time type safety.

---

## Core Entities

### 1. SpringParameters

Represents the configurable physical properties of the spring-mass system.

**Purpose**: User-defined constants that determine oscillation behavior.

**Fields**:

| Field | Type | Unit | Constraints | Default | Description |
|-------|------|------|-------------|---------|-------------|
| `mass` | `number` | kg | > 0 | 1.0 | Mass of the weight attached to the spring |
| `springConstant` | `number` | N/m | > 0 | 10.0 | Spring stiffness (Hooke's law constant k) |
| `initialLength` | `number` | m | > 0 | 1.0 | Natural/rest length of the spring (unstretched) |

**Derived Properties** (computed, not stored):

```typescript
interface SpringParameters {
  mass: number;
  springConstant: number;
  initialLength: number;
  
  // Derived (computed on-demand)
  readonly naturalFrequency: number;  // ω = sqrt(k/m) in rad/s
  readonly period: number;            // T = 2π/ω in seconds
}
```

**Validation Rules**:
- All fields must be positive non-zero numbers
- Reject: negative values, zero, NaN, Infinity
- Validation triggers real-time button disable per FR-019

**Relationships**:
- **Used by**: SimulationState (to compute physics)
- **Modified by**: User input in ParameterPanel component

---

### 2. SimulationState

Represents the current dynamic state of the spring-mass system at any given moment.

**Purpose**: Tracks real-time position, velocity, and simulation control state.

**Fields**:

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `position` | `number` | m | Current displacement from equilibrium (positive = downward) |
| `velocity` | `number` | m/s | Current velocity of the mass (positive = downward) |
| `acceleration` | `number` | m/s² | Current acceleration (derived from Hooke's law) |
| `time` | `number` | s | Elapsed simulation time since start |
| `isRunning` | `boolean` | - | True if simulation is active, false if paused/stopped |
| `isPaused` | `boolean` | - | True if simulation is paused (preserves state for resume) |

**State Transitions**:

```
INITIAL (isRunning=false, isPaused=false)
   ↓ [User clicks "Start"]
READY (isRunning=true, isPaused=false, position=0, velocity=0)
   ↓ [User drags mass]
OSCILLATING (isRunning=true, isPaused=false, position≠0)
   ↓ [User clicks "Pause"]
PAUSED (isRunning=true, isPaused=true) ← state frozen
   ↓ [User clicks "Resume"]
OSCILLATING (resumed from exact paused state)
   ↓ [User clicks "Reset"]
INITIAL (reset to defaults)
```

**Validation Rules**:
- `position`, `velocity`, `acceleration` can be any finite number (including negative)
- `time` is always >= 0 and monotonically increasing (except on reset)
- State transitions enforced by control button logic

**Relationships**:
- **Updates**: TimeSeriesData (on every physics step)
- **Depends on**: SpringParameters (for physics calculations)
- **Modified by**: useSimulation hook (RAF loop)

---

### 3. TimeSeriesData

Represents historical measurements over time for graph rendering.

**Purpose**: Store rolling window of data points for the four graphs.

**Structure**:

```typescript
interface DataPoint {
  time: number;        // Timestamp in seconds
  value: number;       // Measured quantity (displacement, velocity, etc.)
}

interface TimeSeriesData {
  displacement: DataPoint[];
  velocity: DataPoint[];
  acceleration: DataPoint[];
  totalEnergy: DataPoint[];
}
```

**Fields per series**:

| Series | Value Unit | Calculation | Typical Range |
|--------|------------|-------------|---------------|
| `displacement` | m | `position` (from SimulationState) | -2 to +2 m |
| `velocity` | m/s | `velocity` (from SimulationState) | -5 to +5 m/s |
| `acceleration` | m/s² | `-k/m * position` (Hooke's law) | -50 to +50 m/s² |
| `totalEnergy` | J | `0.5 * m * v² + 0.5 * k * x²` | Constant (ideal) |

**Constraints**:
- **Rolling Window**: Maximum 15 seconds of data (per FR-017)
- **Sampling Rate**: New data point every 100ms (10 Hz per SC-003)
- **Max Data Points**: ~150 points per series (15s × 10 Hz)
- **Memory Management**: Oldest points removed when time window exceeded

**Validation Rules**:
- Each `DataPoint` array must maintain chronological order (ascending `time`)
- No duplicate timestamps
- Auto-prune points older than `currentTime - 15 seconds`

**Relationships**:
- **Populated by**: useGraphData hook (appends on every physics update)
- **Consumed by**: Graph components (D3 rendering)
- **Depends on**: SimulationState (source of values)

---

### 4. GraphConfig

Represents display configuration for individual graphs (not core state, but important for rendering).

**Purpose**: Define axis ranges, labels, and visual styling per graph type.

**Structure**:

```typescript
interface GraphConfig {
  title: string;
  xLabel: string;
  yLabel: string;
  xDomain: [number, number];  // [min, max] for x-axis (time)
  yDomain: [number, number];  // [min, max] for y-axis (value)
  color: string;              // Line color (Tailwind CSS class or hex)
  showGrid: boolean;
}
```

**Predefined Configs**:

| Graph Type | Title | X Label | Y Label | Y Domain | Color |
|------------|-------|---------|---------|----------|-------|
| Displacement | "Displacement" | "Time (s)" | "Position (m)" | Auto-scale | Blue (#3b82f6) |
| Velocity | "Velocity" | "Time (s)" | "Velocity (m/s)" | Auto-scale | Green (#10b981) |
| Acceleration | "Acceleration" | "Time (s)" | "Acceleration (m/s²)" | Auto-scale | Orange (#f59e0b) |
| Total Energy | "Total Energy" | "Time (s)" | "Energy (J)" | [0, E_max * 1.1] | Purple (#8b5cf6) |

**Notes**:
- X Domain always `[currentTime - 15, currentTime]` for rolling window
- Y Domain auto-scales based on min/max values in current window (except Energy)
- Energy Y Domain fixed to show conservation flatline clearly

**Relationships**:
- **Used by**: Graph component (configures D3 scales and axes)
- **Static**: Defined once per graph type, not modified during simulation

---

## Entity Relationships Diagram

```
┌─────────────────────┐
│ SpringParameters    │
│ - mass              │
│ - springConstant    │◄────┐
│ - initialLength     │     │ reads
└──────────┬──────────┘     │
           │ configures     │
           ▼                │
┌─────────────────────┐     │
│ SimulationState     │     │
│ - position          │     │
│ - velocity          │─────┘
│ - acceleration      │
│ - time              │
│ - isRunning         │
│ - isPaused          │
└──────────┬──────────┘
           │ appends to
           ▼
┌─────────────────────┐
│ TimeSeriesData      │
│ - displacement[]    │
│ - velocity[]        │
│ - acceleration[]    │───┐
│ - totalEnergy[]     │   │ consumed by
└─────────────────────┘   │
                          ▼
┌─────────────────────┐   ┌─────────────────────┐
│ GraphConfig         │──►│ Graph Component     │
│ (per graph type)    │   │ (D3 rendering)      │
└─────────────────────┘   └─────────────────────┘
```

---

## TypeScript Definitions

**File**: `src/types/simulation.ts`

```typescript
export interface SpringParameters {
  mass: number;               // kg
  springConstant: number;     // N/m
  initialLength: number;      // m
}

export interface SimulationState {
  position: number;           // m (displacement from equilibrium)
  velocity: number;           // m/s
  acceleration: number;       // m/s²
  time: number;               // s (elapsed since start)
  isRunning: boolean;
  isPaused: boolean;
}

export interface DataPoint {
  time: number;               // s
  value: number;              // unit varies by series
}

export interface TimeSeriesData {
  displacement: DataPoint[];
  velocity: DataPoint[];
  acceleration: DataPoint[];
  totalEnergy: DataPoint[];
}

export interface GraphConfig {
  title: string;
  xLabel: string;
  yLabel: string;
  xDomain: [number, number];
  yDomain: [number, number];
  color: string;
  showGrid: boolean;
}

// Helper type for graph types
export type GraphType = 'displacement' | 'velocity' | 'acceleration' | 'energy';
```

---

## Data Flow Summary

1. **User Input** → `SpringParameters` (ParameterPanel component)
2. **Parameter Change** → Validate → Enable/Disable Start button
3. **Start Button Click** → Initialize `SimulationState` (position=0, velocity=0, time=0)
4. **User Drag** → Update `SimulationState.position` (initial displacement)
5. **RAF Loop** → Compute next state via RK4 → Update `SimulationState`
6. **Every 100ms** → Append new `DataPoint` to `TimeSeriesData`
7. **TimeSeriesData Change** → Trigger D3 graph re-render (useEffect)
8. **Pause Button** → Set `isPaused=true`, preserve state
9. **Resume Button** → Set `isPaused=false`, continue from preserved state
10. **Reset Button** → Clear `TimeSeriesData`, reset `SimulationState` to initial

---

## Validation & Invariants

**Invariants** (always true during simulation):
- If `isRunning=false`, then `isPaused=false`
- If `isPaused=true`, then `isRunning=true`
- `time` never decreases (except on reset to 0)
- Energy variation < 1% over any 10-cycle window (numerical stability check)

**Runtime Checks**:
- Parameter validation on every input change (FR-019)
- NaN/Infinity checks in physics calculations (throw error to prevent silent corruption)
- Array length check on TimeSeriesData (auto-prune if exceeds 15s window)

---

## Next Steps

With data model defined, proceed to:
1. Generate API contracts (though minimal for client-only app)
2. Create quickstart guide for developers
3. Update agent context with technical stack
