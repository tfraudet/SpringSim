# Implementation Plan: Mass-Spring Oscillation Simulator

**Branch**: `001-spring-oscillation-simulator` | **Date**: 2025-10-18 | **Spec**: [spec.md](./spec.md)  
**Status**: Phase 1 Complete - Ready for Task Generation (`/speckit.tasks`)  
**Input**: Feature specification from `/specs/001-spring-oscillation-simulator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a browser-based single-page application for simulating and visualizing spring-mass oscillation systems. Users configure spring parameters (mass, spring constant, initial length), interact with the mass to provide initial displacement via drag, and observe real-time animation alongside four synchronized graphs (displacement, velocity, acceleration, total energy). The application runs entirely client-side with no backend, using React + TypeScript + Vite for the framework, D3.js for graph rendering, and Tailwind CSS for styling. Focus is on smooth 30+ fps animation, accurate physics calculations (Runge-Kutta integration), and modern SPA performance optimization (code splitting, memoization, RAF-based rendering).

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled  
**Primary Dependencies**: 
- React 18.x (UI framework)
- Vite 5.x (build tool and dev server)
- D3.js 7.x (graph rendering and SVG manipulation)
- Tailwind CSS 4.x (utility-first styling)

**Storage**: Browser localStorage for optional parameter persistence (user preferences); no backend database  
**Testing**: Vitest for unit tests (optional per constitution - not mandatory)  
**Target Platform**: Modern browsers (last 2 major releases: Chrome, Firefox, Safari, Edge) and mobile webviews (iOS/Android)  
**Project Type**: Single-page web application (SPA) - frontend only  
**Performance Goals**: 
- 30+ FPS animation (requestAnimationFrame-based rendering)
- Initial bundle size <= 150KB gzipped
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s
- Graph updates every 100ms or less

**Constraints**: 
- Client-side only (no backend/API calls)
- Physics calculations must maintain <1% energy conservation error over 10 cycles
- Real-time graph rendering without dropped frames
- Responsive layout (desktop and tablet support)
- Keyboard accessibility (WCAG 2.1 AA)

**Scale/Scope**: 
- Single user per browser session
- Simulation runs indefinitely until paused/reset
- ~500-2000 data points per graph (15-second rolling window at ~30-100 Hz sampling)
- 5 user stories (P1-P5)
- ~23 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### User-Centered UX (NON-NEGOTIABLE)
- ✅ **Pass**: Clear parameter input controls with real-time validation and tooltip feedback
- ✅ **Pass**: Drag-and-drop interaction for mass displacement is discoverable and intuitive
- ✅ **Pass**: Pause/Resume/Reset buttons provide clear state control
- ✅ **Pass**: Keyboard accessibility for all interactive elements (tab navigation, ARIA labels)
- ✅ **Pass**: Visual layout groups related elements (spring animation with displacement graph)

### Modern Visual Design
- ✅ **Pass**: Tailwind CSS provides consistent design tokens (spacing, colors, typography)
- ✅ **Pass**: Subtle micro-interactions for button states and graph updates
- ✅ **Pass**: Cohesive visual hierarchy with clear primary/secondary actions
- ⚠️ **Review Needed**: Design review checklist for visual consistency (manual process)

### Performance & Efficiency (NON-NEGOTIABLE)
- ✅ **Pass**: Target 30+ FPS animation using requestAnimationFrame
- ✅ **Pass**: Code splitting planned (Vite's automatic chunking for D3.js)
- ✅ **Pass**: Bundle budget <= 150KB gzipped (React + D3 + Tailwind optimized)
- ✅ **Pass**: Memoization for expensive physics calculations
- ✅ **Pass**: RAF-based rendering loop to avoid layout thrashing
- ✅ **Pass**: Graph updates optimized with D3 data binding and transitions

### Minimal Dependencies & Simplicity
- ✅ **Pass**: Core dependencies justified:
  - React 18.x: ~45KB gzipped (industry standard, tree-shakeable)
  - D3.js 7.x: ~70KB gzipped (best-in-class for SVG graphs, modular imports)
  - Tailwind CSS 4.x: ~10KB gzipped (utility-first, minimal runtime)
  - Vite 5.x: dev-only (zero runtime overhead)
- ✅ **Pass**: Total bundle ~125KB gzipped (under 150KB budget)
- ✅ **Pass**: All dependencies actively maintained and widely adopted
- ✅ **Pass**: Lockfile (package-lock.json or pnpm-lock.yaml) ensures reproducible installs

### Progressive Enhancement & Resilience
- ⚠️ **Acceptable**: No SSR/prerendering (educational tool, requires JavaScript by nature)
- ✅ **Pass**: Clear error messaging for invalid parameter entry
- ✅ **Pass**: Handles edge cases (rapid button clicks, window resize)
- N/A: No network requests, so no offline/retry affordances needed

**Gate Decision**: ✅ **PROCEED** - All non-negotiable principles satisfied. Design review checklist to be applied during PR process.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/           # React UI components
│   ├── SpringVisualization.tsx    # Visual spring-mass rendering (SVG)
│   ├── ParameterPanel.tsx         # Input controls for mass, k, length
│   ├── ControlButtons.tsx         # Start/Pause/Resume/Reset buttons
│   ├── GraphPanel.tsx             # Container for all four graphs
│   └── Graph.tsx                  # Reusable D3-powered graph component
├── hooks/                # Custom React hooks
│   ├── useSimulation.ts       # Core simulation state and physics loop
│   ├── usePhysicsEngine.ts    # Runge-Kutta integration logic
│   └── useGraphData.ts        # Time series data management (rolling window)
├── lib/                  # Pure utility functions
│   ├── physics.ts             # Spring-mass equations (Hooke's law, energy calc)
│   ├── integration.ts         # Numerical integration (RK4)
│   └── validation.ts          # Parameter validation rules
├── types/                # TypeScript type definitions
│   ├── simulation.ts          # SimulationState, SpringParameters interfaces
│   └── graph.ts               # TimeSeriesData, GraphConfig types
├── App.tsx               # Root component with layout
├── main.tsx              # Vite entry point
└── index.css             # Tailwind imports and global styles

public/
└── index.html            # Single HTML entry point

vite.config.ts            # Vite configuration (build, dev server)
tsconfig.json             # TypeScript compiler options (strict mode)
tailwind.config.js        # Tailwind customization (colors, spacing)
package.json              # Dependencies and scripts
```

**Structure Decision**: Selected single-page web application structure (frontend only). No backend directory needed as this is a client-side-only educational tool. The `src/` folder follows React best practices: components for UI, hooks for stateful logic, lib for pure functions, and types for TypeScript definitions. Vite serves as both dev server and build tool, with Tailwind configured for utility-first styling.

## Complexity Tracking

No constitution violations detected. All principles satisfied within acceptable parameters.

---

## Phase 1 Artifacts Summary

**Phase 0 - Research** ✅ Complete
- `research.md`: 6 research areas with technical decisions (RK4 integration, React+D3 hybrid, RAF performance, CSS Grid layout, pointer events, bundle optimization)

**Phase 1 - Design** ✅ Complete
- `data-model.md`: Core entities (SpringParameters, SimulationState, TimeSeriesData, GraphConfig), state transitions, TypeScript interfaces
- `contracts/README.md`: Contract types overview and validation strategy
- `contracts/component-props.md`: All React component prop interfaces (6 components)
- `contracts/hooks.md`: Custom hook signatures (useSimulation, usePhysicsEngine, useGraphData, usePointerDrag)
- `contracts/physics.md`: Physics utility function APIs (8 pure functions)
- `quickstart.md`: Developer setup guide with implementation checklist
- `.github/copilot-instructions.md`: Updated with TypeScript/React/Vite/D3/Tailwind stack context

**Constitution Re-Check** ✅ Pass
All 5 principles remain satisfied after Phase 1 design:
1. User-Centered UX: Real-time validation, drag interaction, clear controls
2. Modern Visual Design: Tailwind CSS, smooth animations, SVG graphics
3. Performance & Efficiency: 30+ FPS target, ≤150KB bundle, RAF loop, throttled graph updates
4. Minimal Dependencies: Only 4 core deps (React, Vite, D3 modular, Tailwind)
5. Progressive Enhancement: Keyboard alternatives, touch support, semantic HTML

---

## Next Command

This completes the `/speckit.plan` workflow. To generate implementation tasks:

```bash
/speckit.tasks
```

This will:
1. Generate `tasks.md` with ordered implementation tasks
2. Create GitHub Issues (if repository connected)
3. Set up task tracking structure

