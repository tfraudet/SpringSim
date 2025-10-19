# Implementation Tasks: Mass-Spring Oscillation Simulator

**Feature**: Mass-Spring Oscillation Simulator  
**Branch**: `001-spring-oscillation-simulator`  
**Generated**: 2025-10-18  
**Based on**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md)

---

## Overview

This document provides a dependency-ordered, actionable task list for implementing the spring-mass oscillation simulator. Tasks are organized by user story priority to enable independent implementation and incremental delivery.

**Total Tasks**: 71  
**Parallelizable Tasks**: 38  
**User Stories**: 5 (P1-P5)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**User Story 1 only** delivers a complete, testable simulation:
- Configure parameters
- Start simulation (at rest)
- Drag mass to create initial displacement
- Visual oscillation animation
- Reset functionality
- Real-time displacement graph

This represents ~18 tasks and delivers end-to-end value.

### Incremental Delivery
Each subsequent user story adds independent functionality:
- **P2**: Pause/Resume (2 tasks)
- **P3**: Displacement graph already included in P1
- **P4**: Velocity & Acceleration graphs (4 tasks)
- **P5**: Energy graph (3 tasks)

---

## Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US4) → Phase 6 (US5)
                                              ↓
                                         (US3 included in US1)
```

**Notes**:
- User Story 3 (displacement graph) is implemented as part of User Story 1
- User Stories 2, 4, 5 are independent after US1 completes
- Most tasks within each user story can execute in parallel

---

## Phase 1: Project Setup

**Goal**: Initialize project structure and configuration files

**Duration Estimate**: 30 minutes

### Tasks

- [X] T001 Initialize Vite + React + TypeScript project with `npm create vite@latest . -- --template react-ts`
- [X] T002 Install core dependencies: `npm install react react-dom d3-scale d3-axis d3-shape d3-selection`
- [X] T003 Install dev dependencies: `npm install -D @vitejs/plugin-react vite typescript @types/react @types/react-dom tailwindcss autoprefixer postcss`
- [X] T004 Initialize Tailwind CSS with `npx tailwindcss init -p`
- [X] T005 Configure vite.config.ts with React plugin and build options per plan.md
- [X] T006 Configure tsconfig.json with strict mode and React JSX settings per plan.md
- [X] T007 Configure tailwind.config.js with content paths: `['./index.html', './src/**/*.{js,ts,jsx,tsx}']`
- [X] T008 Create src/index.css with Tailwind directives (@tailwind base, components, utilities)
- [X] T009 Create directory structure: src/components/, src/hooks/, src/lib/, src/types/
- [X] T010 Create public/index.html as single-page entry point
- [X] T011 Verify dev server starts successfully with `npm run dev`

---

## Phase 2: Foundation - Core Types & Physics

**Goal**: Implement foundational types and physics utilities (blocking for all user stories)

**Duration Estimate**: 2 hours

**Independent Test**: Physics functions return correct values for sample inputs, type-checking passes with `tsc --noEmit`

### Tasks

- [X] T012 [P] Create src/types/simulation.ts with SpringParameters interface per data-model.md
- [X] T013 [P] Add SimulationState interface to src/types/simulation.ts per data-model.md
- [X] T014 [P] Add DataPoint and TimeSeriesData interfaces to src/types/simulation.ts per data-model.md
- [X] T015 [P] Add GraphConfig interface to src/types/simulation.ts per data-model.md
- [X] T016 [P] Create src/lib/constants.ts with PHYSICS_CONSTANTS (gravity=9.81, MIN/MAX limits: MAX_MASS=100, MAX_SPRING_CONSTANT=1000, MAX_LENGTH=10, tolerances) per contracts/physics.md
- [X] T017 [P] Create src/lib/physics.ts with computeSpringForce function per contracts/physics.md
- [X] T018 [P] Add computeAcceleration function to src/lib/physics.ts per contracts/physics.md
- [X] T019 [P] Add computeKineticEnergy function to src/lib/physics.ts per contracts/physics.md
- [X] T020 [P] Add computePotentialEnergy function to src/lib/physics.ts per contracts/physics.md
- [X] T021 [P] Add computeTotalEnergy function to src/lib/physics.ts per contracts/physics.md
- [X] T022 [P] Add computeEquilibriumPosition function to src/lib/physics.ts per contracts/physics.md
- [X] T023 [P] Create src/lib/integration.ts with rk4Step function per contracts/physics.md and research.md
- [X] T024 [P] Create src/lib/validation.ts with validateParameters function per contracts/physics.md
- [X] T025 Verify all physics functions with manual tests in browser console (energy conservation, equilibrium calc)

---

## Phase 3: User Story 1 - Configure Parameters & Start Simulation (P1)

**Goal**: Implement core simulation with parameter configuration, drag interaction, visual animation, and displacement graph

**User Story**: A user wants to explore how different spring parameters affect oscillation behavior. They open the application, set the mass weight, spring constant, and initial length. When they click "Start simulation", the spring appears at rest at its equilibrium position. The user must then interact with the mass (e.g., click and drag it downward) to provide an initial displacement, which causes the spring to begin oscillating.

**Duration Estimate**: 6 hours

**Independent Test**: 
1. Load application, verify default parameters displayed
2. Change mass to 2kg, spring constant to 10 N/m, initial length to 1m
3. Click "Start simulation", verify spring at equilibrium with no motion
4. Drag mass downward 0.5m, release, verify oscillation begins
5. Observe displacement graph updates in real-time
6. Click "Reset", verify simulation stops and returns to initial state

**Acceptance Criteria**: FR-001, FR-002, FR-003, FR-007, FR-008, FR-009, FR-010, FR-011, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023

### Tasks

#### Physics Engine & Simulation Loop

- [X] T026 [P] [US1] Implement usePhysicsEngine hook in src/hooks/usePhysicsEngine.ts per contracts/hooks.md (computeNextState, computeAcceleration, computeTotalEnergy)
- [X] T027 [US1] Implement useSimulation hook in src/hooks/useSimulation.ts per contracts/hooks.md (RAF loop, state management, start/reset)
- [X] T028 [P] [US1] Implement useGraphData hook in src/hooks/useGraphData.ts per contracts/hooks.md (10Hz data collection, 15s rolling window)

#### UI Components - Parameters & Controls

- [X] T029 [P] [US1] Create ParameterPanel component in src/components/ParameterPanel.tsx per contracts/component-props.md
- [X] T030 [P] [US1] Implement real-time parameter validation in ParameterPanel with error messages and disabled state
- [X] T031 [P] [US1] Create ControlPanel component in src/components/ControlPanel.tsx with Start and Reset buttons per contracts/component-props.md
- [X] T032 [US1] Implement button state logic in ControlPanel (disable Start when invalid params, show tooltip per FR-020)

#### Spring Visualization & Drag Interaction

- [X] T033 [P] [US1] Create SpringVisualization component in src/components/SpringVisualization.tsx with SVG spring/mass rendering per contracts/component-props.md
- [X] T034 [US1] Implement equilibrium position calculation and visual display in SpringVisualization
- [X] T035 [P] [US1] Implement usePointerDrag hook in src/hooks/usePointerDrag.ts per contracts/hooks.md (unified mouse/touch)
- [X] T036 [US1] Integrate usePointerDrag with SpringVisualization to enable mass dragging and setInitialDisplacement callback

#### Graph Components

- [X] T037 [P] [US1] Create Graph component in src/components/Graph.tsx using D3.js hybrid pattern per contracts/component-props.md and research.md
- [X] T038 [US1] Implement D3 scales, axes, and line generator in Graph component with auto-scaling Y domain
- [X] T039 [P] [US1] Create GraphPanel component in src/components/GraphPanel.tsx as container for all graphs per plan.md structure
- [X] T040 [US1] Add displacement graph to GraphPanel with DisplacementGraph configuration

#### App Integration

- [X] T041 [US1] Create src/App.tsx with Tailwind CSS Grid layout (row 1: spring + displacement, row 2: placeholder for other graphs)
- [X] T042 [US1] Integrate ParameterPanel, ControlPanel, SpringVisualization, and GraphPanel into App.tsx
- [X] T043 [US1] Connect useSimulation hook to all components with proper state lifting
- [X] T044 [US1] Verify 30+ FPS performance with Chrome DevTools Performance panel per SC-002
- [X] T045 [US1] Verify energy conservation <1% over 10 cycles per SC-004 using browser console logging

---

## Phase 4: User Story 2 - Pause and Resume Simulation (P2)

**Goal**: Add pause/resume functionality to freeze and continue simulation

**User Story**: A user is observing a running simulation and wants to pause it at a specific moment to examine the current graph values or mass position more carefully. They click a "Pause" button to freeze the simulation, then click "Resume" to continue from the exact same state.

**Duration Estimate**: 30 minutes

**Independent Test**:
1. Start simulation with 1m displacement
2. Let oscillate for 5 cycles
3. Click "Pause", verify animation stops and graphs freeze
4. Verify "Pause" button changes to "Resume"
5. Click "Resume", verify animation continues from exact paused state
6. Observe no discontinuity in motion or graphs

**Acceptance Criteria**: FR-004, FR-005, FR-006, SC-007

### Tasks

- [X] T046 [US2] Add pause() and resume() functions to useSimulation hook per contracts/hooks.md
- [X] T047 [US2] Add Pause and Resume buttons to ControlPanel with visibility logic per contracts/component-props.md (showPause when running && !paused, showResume when running && paused)

---

## Phase 5: User Story 4 - Velocity and Acceleration Graphs (P4)

**Goal**: Display real-time velocity and acceleration graphs alongside displacement

**User Story**: A user wants to analyze the dynamics of the oscillation in detail. They observe velocity and acceleration graphs alongside the displacement graph to understand how these derived quantities change throughout the oscillation cycle.

**Duration Estimate**: 1 hour

**Independent Test**:
1. Start simulation with 1m displacement
2. Observe velocity graph shows maximum at equilibrium (position = 0)
3. Observe acceleration graph shows zero at equilibrium
4. Observe velocity graph shows zero at maximum displacement
5. Observe acceleration graph shows maximum at maximum displacement
6. Verify phase relationships: velocity leads displacement by 90°

**Acceptance Criteria**: FR-012, FR-013, FR-016, FR-023, SC-005

### Tasks

- [X] T048 [P] [US4] Add velocity data collection to useGraphData hook (already collecting, just expose)
- [X] T049 [P] [US4] Add acceleration data collection to useGraphData hook (already collecting, just expose)
- [X] T050 [P] [US4] Create velocity graph configuration constant in src/App.tsx or src/lib/constants.ts
- [X] T051 [P] [US4] Create acceleration graph configuration constant in src/App.tsx or src/lib/constants.ts
- [X] T052 [US4] Add velocity and acceleration Graph components to GraphPanel second row per FR-015
- [X] T053 [US4] Verify phase relationships manually per SC-005 (velocity peaks at x=0, acceleration peaks at x=max)

---

## Phase 6: User Story 5 - Total Energy Graph (P5)

**Goal**: Display total energy graph showing conservation principle

**User Story**: A user wants to verify energy conservation principles. They observe a total energy graph that should remain constant throughout the simulation, demonstrating that mechanical energy is conserved in an ideal spring system.

**Duration Estimate**: 45 minutes

**Independent Test**:
1. Start simulation with 1m displacement
2. Let oscillate for 10+ cycles
3. Observe total energy graph displays horizontal line (constant)
4. Verify energy variation <1% per SC-004
5. Change parameters, start new simulation
6. Verify different constant energy value (proportional to amplitude² and k)

**Acceptance Criteria**: FR-014, FR-016, FR-023, SC-004

### Tasks

- [X] T054 [P] [US5] Add totalEnergy data collection to useGraphData hook (computeTotalEnergy already available from usePhysicsEngine)
- [X] T055 [P] [US5] Create energy graph configuration constant with fixed Y domain [0, E_max * 1.1]
- [X] T056 [US5] Add total energy Graph component to GraphPanel second row per FR-015

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Accessibility, responsive design, bundle optimization, and final QA

**Duration Estimate**: 2 hours

### Tasks

#### Accessibility (WCAG 2.1 AA)

- [X] T057 [P] Add ARIA labels to all interactive elements (buttons, inputs) per contracts/component-props.md
- [X] T058 [P] Add keyboard navigation support (Tab, Enter, Arrow keys for displacement)
- [X] T059 [P] Add focus management (logical tab order, focus on first invalid input)
- [X] T060 [P] Add aria-live regions for error announcements and current state updates

#### Responsive Design & Touch Support

- [X] T061 [P] Test layout on tablet devices (768px width), adjust Grid if needed
- [X] T062 [P] Verify Pointer Events API works on touch devices (iPad, mobile)
- [X] T063 [P] Add responsive font sizes and spacing with Tailwind responsive classes

#### Performance & Bundle Optimization

- [X] T064 Add React.memo to Graph component to prevent unnecessary re-renders
- [X] T065 Add useMemo/useCallback optimization to expensive computations in useSimulation
- [X] T066 Run `npm run build` and verify bundle size ≤150KB gzipped per SC and constitution
- [X] T067 Run Lighthouse audit, verify FCP <1.5s and TTI <3s per plan.md performance goals

#### Final QA

- [X] T068 Test all success criteria (SC-001 through SC-009) manually per quickstart.md
- [X] T069 Test edge cases from spec.md (zero/negative inputs, rapid clicks, window resize)
- [X] T070 Verify constitution compliance (all 5 principles satisfied)
- [X] T071 Update README.md with installation instructions, usage guide, and screenshots

---

## Parallel Execution Opportunities

### Phase 2 (Foundation)
Can execute in parallel after Phase 1 completes:
- T012-T024 (all type definitions and pure functions are independent)

### Phase 3 (User Story 1)
After T026-T028 (hooks) complete, can execute in parallel:
- **Group A** (Components): T029-T032 (ParameterPanel + ControlPanel)
- **Group B** (Visualization): T033-T036 (SpringVisualization + drag)
- **Group C** (Graphs): T037-T040 (Graph components)

After all above complete:
- T041-T043 (App integration) must be sequential
- T044-T045 (verification) can execute in parallel

### Phase 5 (User Story 4)
All tasks T048-T051 can execute in parallel (different graph configs)

### Phase 6 (User Story 5)
T054-T055 can execute in parallel

### Phase 7 (Polish)
- T057-T060 (Accessibility) can execute in parallel
- T061-T063 (Responsive) can execute in parallel
- T064-T067 (Performance) must be sequential

---

## Task Summary by User Story

| User Story | Priority | Task Count | Parallelizable | Estimated Duration |
|------------|----------|------------|----------------|-------------------|
| Setup | - | 11 | 0 | 30 min |
| Foundation | - | 14 | 13 | 2 hours |
| US1: Configure & Start | P1 | 20 | 12 | 6 hours |
| US2: Pause/Resume | P2 | 2 | 0 | 30 min |
| US3: Displacement Graph | P3 | 0 | 0 | 0 (included in US1) |
| US4: Velocity/Acceleration | P4 | 6 | 4 | 1 hour |
| US5: Energy Graph | P5 | 3 | 2 | 45 min |
| Polish | - | 15 | 7 | 2 hours |
| **Total** | - | **71** | **38** | **~13 hours** |

---

## Validation Checklist

### Format Validation
- ✅ All tasks have checkboxes `- [ ]`
- ✅ All tasks have sequential IDs (T001-T071)
- ✅ All user story phase tasks have [US#] labels
- ✅ Parallelizable tasks have [P] marker
- ✅ All tasks include file paths where applicable

### Content Validation
- ✅ All 5 user stories from spec.md mapped to phases
- ✅ All entities from data-model.md covered in tasks
- ✅ All components from contracts/ mapped to tasks
- ✅ All hooks from contracts/ mapped to tasks
- ✅ All physics functions from contracts/ mapped to tasks
- ✅ Constitution principles addressed (accessibility, performance, minimal deps)
- ✅ Success criteria (SC-001 to SC-009) mapped to tasks
- ✅ Independent test criteria defined for each user story phase

### Completeness Validation
- ✅ Each user story independently testable
- ✅ MVP scope clearly defined (US1 only)
- ✅ Dependency graph shows clear progression
- ✅ Parallel opportunities identified and documented
- ✅ Implementation strategy explains incremental delivery

---

## Notes for Implementation

1. **Start with MVP**: Implement Phase 1-3 (Setup + Foundation + US1) for complete end-to-end functionality
2. **Constitution Compliance**: Every task should satisfy the 5 principles (user UX, modern design, performance, minimal deps, progressive enhancement)
3. **No Tests**: Per constitution ("don't implement test"), use manual QA with success criteria as test cases
4. **Type Safety**: Run `tsc --noEmit` after each phase to validate TypeScript contracts
5. **Performance Monitoring**: Keep Chrome DevTools Performance panel open during development to catch FPS drops early
6. **Energy Conservation**: Log energy values in console during development to validate <1% variation requirement

---

## Ready for Implementation

This tasks.md is immediately executable. Each task is specific enough for an LLM or developer to complete without additional context. Begin with Phase 1 (Setup) and proceed sequentially through phases, executing parallel tasks concurrently where marked [P].

**Suggested First Command**: `npm create vite@latest . -- --template react-ts` (Task T001)
