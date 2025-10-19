# Component Props Contracts

**Date**: 2025-10-18  
**Purpose**: Define TypeScript interfaces for all React component props

---

## 1. App (Root Component)

**File**: `src/App.tsx`

**Props**: None (root component)

**Responsibilities**:
- Top-level layout orchestration
- Initialize simulation state
- Coordinate child component interactions

---

## 2. ParameterPanel

**File**: `src/components/ParameterPanel.tsx`

**Purpose**: Display and edit spring-mass system parameters

**Props Interface**:

```typescript
interface ParameterPanelProps {
  parameters: SpringParameters;
  onChange: (params: SpringParameters) => void;
  disabled: boolean;
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `parameters` | `SpringParameters` | Yes | Current parameter values to display |
| `onChange` | `(params: SpringParameters) => void` | Yes | Callback when user changes any parameter |
| `disabled` | `boolean` | Yes | If true, disable all inputs (simulation running) |

**Behavior Guarantees**:
- `onChange` fires **only** when user commits a change (blur or Enter key)
- `onChange` receives **validated** parameters (all positive, non-zero)
- If invalid input detected, input field shows error state, `onChange` not called
- When `disabled=true`, all input fields are visually disabled and non-interactive

**Accessibility Requirements** (WCAG 2.1 AA per constitution):
- All inputs have associated `<label>` elements
- Error messages announced via `aria-live="polite"`
- Focus management: first invalid field receives focus on validation failure

---

## 3. ControlPanel

**File**: `src/components/ControlPanel.tsx`

**Purpose**: Start, Pause, Resume, Reset simulation controls

**Props Interface**:

```typescript
interface ControlPanelProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  disabled: boolean;
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isRunning` | `boolean` | Yes | True if simulation is active (started) |
| `isPaused` | `boolean` | Yes | True if simulation is paused |
| `onStart` | `() => void` | Yes | Callback to start simulation |
| `onPause` | `() => void` | Yes | Callback to pause simulation |
| `onResume` | `() => void` | Yes | Callback to resume simulation |
| `onReset` | `() => void` | Yes | Callback to reset simulation |
| `disabled` | `boolean` | Yes | If true, disable Start button (invalid params) |

**Button Visibility Logic**:

```typescript
// Start button: visible when NOT running
showStart = !isRunning

// Pause button: visible when running AND not paused
showPause = isRunning && !isPaused

// Resume button: visible when running AND paused
showResume = isRunning && isPaused

// Reset button: always visible
showReset = true
```

**Behavior Guarantees**:
- Only one primary action button visible at a time (Start | Pause | Resume)
- Reset button always available (even during simulation)
- Start button disabled when `disabled=true` (invalid parameters)
- Pause/Resume buttons never disabled (always functional during simulation)

**Accessibility Requirements**:
- Buttons use semantic `<button>` elements
- Clear labels: "Start Simulation", "Pause", "Resume", "Reset"
- Focus management: next relevant button receives focus after click (Start → Pause → Resume)

---

## 4. SpringVisualization

**File**: `src/components/SpringVisualization.tsx`

**Purpose**: Render animated spring-mass system with drag interaction

**Props Interface**:

```typescript
interface SpringVisualizationProps {
  springLength: number;
  position: number;
  parameters: SpringParameters;
  isRunning: boolean;
  onDrag: (displacement: number) => void;
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `springLength` | `number` | Yes | Current visual length of spring (meters) |
| `position` | `number` | Yes | Current displacement from equilibrium (meters, +down) |
| `parameters` | `SpringParameters` | Yes | Spring parameters for rendering scale |
| `isRunning` | `boolean` | Yes | If true, disable drag interaction |
| `onDrag` | `(displacement: number) => void` | Yes | Callback when user drags mass (fires continuously) |

**Rendering Specifications**:
- SVG canvas size: 300px × 400px (aspect ratio 3:4)
- Ceiling: Fixed at y=50px
- Spring coils: 10 coils, width proportional to `springLength`
- Mass: Circle with radius proportional to `sqrt(mass)` for realistic visual mass perception
- Equilibrium position: Calculated as `initialLength + (mass * g) / springConstant`

**Drag Interaction**:
- **Enabled when**: `isRunning=true` AND `isPaused=false` OR `!isRunning`
- **Disabled when**: Simulation running and not paused
- Drag constrains: Vertical only (no horizontal movement)
- `onDrag` receives displacement relative to equilibrium (meters)
- Visual feedback: Cursor changes to `grab`/`grabbing`

**Performance Guarantees**:
- RAF-based rendering (60 FPS target per SC-002)
- Pointer events (mouse + touch unified)
- No D3 for SVG manipulation (React-controlled for simpler state management)

**Accessibility Requirements**:
- Keyboard alternative: Arrow keys to adjust displacement when focused
- `role="img"` with `aria-label="Spring-mass system visualization"`
- Current displacement announced via `aria-live` region

---

## 5. Graph

**File**: `src/components/Graph.tsx`

**Purpose**: Render time-series line graph using D3.js

**Props Interface**:

```typescript
interface GraphProps {
  data: DataPoint[];
  config: GraphConfig;
  width: number;
  height: number;
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | `DataPoint[]` | Yes | Time-series data points to plot |
| `config` | `GraphConfig` | Yes | Graph configuration (title, labels, colors, domains) |
| `width` | `number` | Yes | Graph width in pixels |
| `height` | `number` | Yes | Graph height in pixels |

**Rendering Behavior**:
- Uses D3.js for scales, axes, and line generators
- React controls SVG creation (via `useRef`)
- D3 updates DOM directly within ref (hybrid pattern per research.md)
- X-axis: Time in seconds, domain `[currentTime - 15, currentTime]`
- Y-axis: Auto-scaled to data min/max (with 10% padding) unless fixed by config

**Update Frequency**:
- Re-renders when `data` array reference changes (React memo optimization)
- Throttled to 10 Hz (100ms intervals) per SC-003
- Smooth line interpolation (D3 `curveMonotoneX`)

**Performance Guarantees**:
- O(n) rendering complexity where n = data.length (max 150 points)
- Uses `React.memo` to prevent unnecessary re-renders
- D3 transitions disabled (performance over animation smoothness)

**Accessibility Requirements**:
- `role="img"` with descriptive `aria-label` (e.g., "Displacement over time graph")
- Data table alternative provided via `<details>` element (hidden by default)
- Axis labels readable at 16px minimum font size

---

## 6. DisplacementGraph (Specialized)

**File**: `src/components/DisplacementGraph.tsx`

**Purpose**: Graph with real-time displacement indicator on spring visualization

**Props Interface**:

```typescript
interface DisplacementGraphProps {
  data: DataPoint[];
  currentDisplacement: number;
  width: number;
  height: number;
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | `DataPoint[]` | Yes | Displacement time-series data |
| `currentDisplacement` | `number` | Yes | Current displacement value for indicator |
| `width` | `number` | Yes | Graph width in pixels |
| `height` | `number` | Yes | Graph height in pixels |

**Unique Features**:
- Displays vertical crosshair at current time
- Highlights current displacement on Y-axis
- Configuration inherited from predefined `DISPLACEMENT_CONFIG` constant

---

## Shared Type Imports

All components import types from `src/types/simulation.ts`:

```typescript
import {
  SpringParameters,
  SimulationState,
  DataPoint,
  TimeSeriesData,
  GraphConfig,
  GraphType
} from '../types/simulation';
```

---

## Prop Validation Strategy

**Compile-Time** (TypeScript):
- All props strictly typed
- Required props enforced at compile time
- Union types for state variants (e.g., `isRunning` + `isPaused` combinations)

**Runtime** (Development Only):
- PropTypes removed (TypeScript sufficient per constitution's minimal dependencies principle)
- Development mode warnings via React strict mode (double render detection)

**No Runtime Validation Libraries**:
- No Zod, Yup, or similar (constitution principle #4: minimize dependencies)
- Validation logic implemented as pure TypeScript functions

---

## Next Steps

With component contracts defined:
1. Implement hooks contracts (useSimulation, usePhysicsEngine, useGraphData)
2. Document physics utility function APIs
3. Create quickstart guide for developers
