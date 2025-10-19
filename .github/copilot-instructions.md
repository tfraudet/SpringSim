# SpingSim2 Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-18

## Project Overview

Single-page application (SPA) for simulating spring-mass oscillation systems. Client-side only, no backend.

## Active Technologies

### Core Stack (001-spring-oscillation-simulator)
- **TypeScript 5.x**: Strict mode enabled, no implicit any
- **React 18.x**: UI framework with hooks-based architecture
- **Vite 5.x**: Build tool and dev server (HMR enabled)
- **D3.js 7.x**: Modular imports for graph rendering (scales, axes, shapes, selection)
- **Tailwind CSS 4.x**: Utility-first styling with JIT mode

### Storage & State
- **Browser localStorage**: Optional parameter persistence (user preferences)
- **React state**: Primary state management (no Redux/Zustand)
- **No backend database**: Client-side only application

### Testing Strategy
- **Manual QA**: Primary validation method per constitution
- **TypeScript**: Compile-time validation with strict mode
- **No test frameworks**: Constitution explicitly states "don't implement test"

## Project Structure

```
src/
├── components/           # React UI components
│   ├── SpringAnimation.tsx    # SVG spring-mass visualization with drag
│   ├── ParameterPanel.tsx     # Input controls (mass, k, length)
│   ├── ControlButtons.tsx     # Start/Pause/Resume/Reset
│   ├── GraphPanel.tsx         # Container for 4 graphs
│   └── Graph.tsx              # Reusable D3 graph component
├── hooks/                # Custom React hooks
│   ├── useSimulation.ts       # Main simulation loop (RAF)
│   ├── usePhysicsEngine.ts    # RK4 numerical integration
│   ├── useGraphData.ts        # Time-series data management
│   └── usePointerDrag.ts      # Mouse/touch drag interaction
├── lib/                  # Pure utility functions
│   ├── physics.ts             # Hooke's law, energy calculations
│   ├── integration.ts         # Runge-Kutta 4th order algorithm
│   ├── validation.ts          # Parameter validation rules
│   └── constants.ts           # Physical constants (g, limits)
├── types/                # TypeScript definitions
│   └── simulation.ts          # Core interfaces (SpringParameters, SimulationState, etc.)
├── App.tsx               # Root component with layout
├── main.tsx              # Vite entry point
└── index.css             # Tailwind imports + global styles

specs/001-spring-oscillation-simulator/
├── spec.md               # Feature specification
├── plan.md               # Implementation plan
├── research.md           # Technical research decisions
├── data-model.md         # Data structures & state transitions
├── quickstart.md         # Developer setup guide
└── contracts/            # Component/hook/function contracts
    ├── component-props.md
    ├── hooks.md
    └── physics.md

vite.config.ts            # Vite config (React plugin, build options)
tsconfig.json             # TS compiler (strict mode, React JSX)
tailwind.config.js        # Tailwind customization
package.json              # Dependencies and scripts
```

## Development Commands

```bash
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Production build → dist/ folder
npm run preview          # Preview production build locally
tsc --noEmit            # Type-check without emitting files
```

## Code Style & Architecture

### TypeScript Guidelines
- **Strict mode**: All compiler strict options enabled
- **No implicit any**: Explicit types required
- **Interfaces over types**: Use `interface` for object shapes
- **Readonly where possible**: Immutable data structures
- **Pure functions**: Prefer pure functions in `lib/` directory

### React Patterns
- **Functional components**: No class components
- **Hooks**: useState, useEffect, useCallback, useMemo, useRef
- **Custom hooks**: Extract reusable stateful logic
- **Memo optimization**: Use React.memo for expensive components
- **Prop drilling**: Acceptable for small component tree (no Context needed)

### D3.js Integration (Hybrid Pattern)
- **React owns SVG structure**: JSX creates `<svg>` elements
- **D3 manipulates DOM**: Uses `useRef` to access SVG and update via D3 selections
- **Modular imports**: Import only needed D3 modules (tree-shaking)
- **Example**: `import { scaleLinear } from 'd3-scale';`

### Performance Requirements
- **30+ FPS animation**: Use `requestAnimationFrame` for physics loop
- **Bundle size ≤150KB gzipped**: Monitor with `npm run build`
- **Graph updates**: Throttle to 10 Hz (100ms intervals)
- **Data window**: 15-second rolling window (~150 data points per graph)
- **Memory management**: Auto-prune old data points

### Physics Implementation
- **Numerical integration**: Runge-Kutta 4th order (RK4) method
- **Fixed timestep**: 1/60 second (16.67ms) per physics step
- **Energy conservation**: <1% error over 10 oscillation cycles
- **Hooke's law**: F = -k * x (spring force)
- **Equations of motion**: a = F/m, v = ∫a dt, x = ∫v dt

### Accessibility (WCAG 2.1 AA)
- **Keyboard navigation**: Tab, Enter, Arrow keys
- **ARIA labels**: All interactive elements labeled
- **Focus management**: Logical tab order
- **Touch support**: Pointer Events API (unified mouse/touch)
- **Semantic HTML**: Use appropriate elements (`<button>`, `<input>`, etc.)

## Constitution Principles

All code must satisfy these 5 principles:

1. **User-Centered UX** (NON-NEGOTIABLE)
   - Real-time parameter validation with clear error messages
   - Smooth animations (30+ FPS minimum)
   - Responsive feedback to all user interactions

2. **Modern Visual Design**
   - Tailwind CSS for consistent styling
   - SVG graphics for spring visualization
   - 4 synchronized graphs with auto-scaling axes

3. **Performance & Efficiency** (NON-NEGOTIABLE)
   - Bundle size ≤150KB gzipped
   - FCP <1.5s, TTI <3s
   - RAF-based rendering loop
   - Throttled graph updates (10 Hz)

4. **Minimal Dependencies & Simplicity**
   - Only 4 core dependencies (React, Vite, D3, Tailwind)
   - No testing frameworks (manual QA only)
   - No state management libraries
   - Pure TypeScript for validation (no Zod/Yup)

5. **Progressive Enhancement & Resilience**
   - Keyboard alternatives to drag interaction
   - Touch + mouse support unified
   - Semantic HTML for screen readers
   - localStorage for preference persistence (optional)

## Common Tasks

### Adding a new component
1. Create in `src/components/[ComponentName].tsx`
2. Define prop interface in `contracts/component-props.md`
3. Use TypeScript strict typing
4. Export from component file

### Adding a custom hook
1. Create in `src/hooks/use[HookName].ts`
2. Document signature in `contracts/hooks.md`
3. Return memoized values (useCallback/useMemo)
4. Clean up side effects in useEffect

### Adding physics calculations
1. Add pure function to `src/lib/physics.ts`
2. Document in `contracts/physics.md`
3. Include JSDoc comments with formula
4. Add unit type comments (m, kg, N, J, etc.)

### Validating parameters
1. Use `validateParameters()` from `lib/validation.ts`
2. Show real-time errors in UI
3. Disable Start button if invalid
4. Accept only positive non-zero values

## Recent Changes
- 001-spring-oscillation-simulator: Full technical stack defined (React 18, Vite 5, TypeScript 5, D3 7, Tailwind 4)
- Constitution v1.0.0 ratified with 5 SPA-focused principles
- Phase 0 research: RK4 integration, React+D3 hybrid pattern, RAF animation
- Phase 1 design: Data model, component contracts, hooks contracts, physics API

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
