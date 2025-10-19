# Research: Mass-Spring Oscillation Simulator

**Feature**: Mass-Spring Oscillation Simulator  
**Branch**: `001-spring-oscillation-simulator`  
**Date**: 2025-10-18  
**Phase**: Phase 0 - Technical Research

## Overview

This document consolidates technical research for implementing a browser-based spring-mass oscillation simulator as a single-page application. The primary unknowns resolved here include: numerical integration method selection, D3.js integration patterns with React, performance optimization strategies for real-time animation, and Tailwind CSS configuration for the defined layout.

---

## Research Areas

### 1. Numerical Integration Method for Physics Simulation

**Unknown**: Which numerical integration method provides the best balance of accuracy and performance for spring-mass oscillation?

**Decision**: **Runge-Kutta 4th order (RK4)** method

**Rationale**:
- **Accuracy**: RK4 provides excellent accuracy for smooth functions like sinusoidal oscillations with minimal energy drift (<0.1% per cycle for typical time steps)
- **Stability**: More stable than Euler or Verlet for stiff spring systems (high spring constants)
- **Performance**: Moderate computational cost (4 function evaluations per step) is acceptable for single-mass system running at 60 Hz
- **Energy Conservation**: Maintains <1% energy variation over 10 cycles as required by SC-004

**Alternatives Considered**:
- **Euler Method**: Simpler (1 evaluation/step) but accumulates energy error rapidly (~5-10% per 10 cycles). Rejected due to accuracy requirements.
- **Verlet/Leapfrog**: Excellent energy conservation and performance, but more complex state management (stores previous positions). Rejected for simplicity given RK4 meets requirements.
- **Adaptive RK45**: Higher accuracy with variable step size, but overkill for this use case and adds complexity. Rejected.

**Implementation Notes**:
- Fixed time step: 1/60 second (16.67ms) aligns with 60 FPS target
- State vector: `[position, velocity]`
- Derivatives computed from: `dv/dt = -k/m * x` (Hooke's law) and `dx/dt = v`

**References**:
- *Numerical Recipes* (Press et al.) - Chapter 16 on ODEs
- Physics simulation tutorials: [Gaffer on Games - Integration Basics](https://gafferongames.com/post/integration_basics/)

---

### 2. D3.js Integration with React

**Unknown**: What is the best pattern for integrating D3.js graph rendering within React components without conflicts?

**Decision**: **React for structure, D3 for rendering** (hybrid approach)

**Rationale**:
- React manages component lifecycle and props (graph data, config)
- D3 handles SVG rendering via `useRef` + `useEffect` to directly manipulate DOM
- Avoids React re-rendering SVG on every data update (performance bottleneck)
- Leverages D3's efficient data binding and enter/exit/update pattern for smooth transitions

**Pattern**:
```typescript
function Graph({ data, config }: GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    // D3 rendering logic here (scales, axes, line generators)
    // Use data binding: svg.selectAll('.data-point').data(data)
  }, [data, config]);

  return <svg ref={svgRef} />;
}
```

**Alternatives Considered**:
- **React-only SVG rendering**: Simpler but re-renders entire SVG on every update, causing jank. Rejected for performance reasons.
- **Full D3 component (no React)**: More idiomatic D3 but loses React's declarative structure and state management. Rejected for maintainability.
- **Victory.js or Recharts**: React-friendly charting libs but larger bundle size (~100KB+) and less customization. Rejected to stay under bundle budget.

**Implementation Notes**:
- Import only needed D3 modules: `d3-selection`, `d3-scale`, `d3-axis`, `d3-shape` (~25KB total)
- Use `d3.transition()` for smooth graph updates (100ms duration)
- Memoize scales in `useMemo` to avoid recalculation

**References**:
- [React + D3 Best Practices](https://2019.wattenberger.com/blog/react-and-d3)
- [Amelia Wattenberger's Guide](https://wattenberger.com/blog/react-and-d3)

---

### 3. Performance Optimization for Real-Time Animation

**Unknown**: How to achieve 30+ FPS animation with real-time graph updates without dropped frames?

**Decision**: **requestAnimationFrame (RAF) loop with batched state updates**

**Rationale**:
- RAF synchronizes with browser repaint (~60 FPS) for smooth animation
- Batch React state updates to minimize re-renders (single `setState` per frame)
- Decouple physics calculation frequency (60 Hz) from graph rendering frequency (10 Hz)
- Use `React.memo` and `useMemo` to prevent unnecessary component re-renders

**Strategy**:
1. **Animation Loop**: Single RAF loop in `useSimulation` hook updates physics state
2. **State Management**: Accumulate position/velocity changes, flush once per frame
3. **Graph Updates**: Throttle graph data updates to every 100ms (10 Hz) via timestamp check
4. **Component Optimization**:
   - Memoize expensive calculations (natural frequency, energy)
   - `React.memo` for Graph components to prevent re-render when data unchanged
   - Lazy load D3.js code with dynamic import (code splitting)

**Alternatives Considered**:
- **setInterval**: Not synced with repaint, causes jank. Rejected.
- **Web Workers for physics**: Adds complexity of message passing overhead. Rejected as RK4 is fast enough on main thread for single mass.
- **Canvas instead of SVG**: Faster for large datasets (>1000 points) but less accessible and harder to style. Rejected; SVG sufficient for 500-2000 points per graph.

**Implementation Notes**:
```typescript
useEffect(() => {
  let animationId: number;
  let lastGraphUpdate = 0;
  
  const loop = (timestamp: number) => {
    // Run physics at 60 Hz
    const newState = runPhysicsStep(currentState, dt);
    setSimulationState(newState);
    
    // Update graphs at 10 Hz
    if (timestamp - lastGraphUpdate > 100) {
      appendGraphData(newState);
      lastGraphUpdate = timestamp;
    }
    
    animationId = requestAnimationFrame(loop);
  };
  
  animationId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animationId);
}, [currentState]);
```

**References**:
- [JavaScript requestAnimationFrame Guide](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Optimizing React Performance](https://react.dev/reference/react/memo)

---

### 4. Tailwind CSS Configuration for Defined Layout

**Unknown**: How to configure Tailwind for the two-row layout (spring + displacement on row 1, three graphs on row 2)?

**Decision**: **CSS Grid with Tailwind utility classes**

**Rationale**:
- Grid provides explicit two-row layout control
- Tailwind utilities avoid custom CSS (keeps bundle small)
- Responsive breakpoints for tablet/desktop (mobile not required per spec)

**Layout Structure**:
```tsx
<div className="grid grid-rows-2 gap-4 h-screen p-4">
  {/* Row 1: Spring animation + Displacement graph */}
  <div className="grid grid-cols-2 gap-4">
    <SpringAnimation />
    <Graph type="displacement" />
  </div>
  
  {/* Row 2: Velocity, Acceleration, Energy graphs */}
  <div className="grid grid-cols-3 gap-4">
    <Graph type="velocity" />
    <Graph type="acceleration" />
    <Graph type="energy" />
  </div>
</div>
```

**Tailwind Config Customization**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        spring: '#3b82f6',  // Blue for spring
        mass: '#ef4444',    // Red for mass
      },
      spacing: {
        '128': '32rem',  // For large canvas if needed
      },
    },
  },
};
```

**Alternatives Considered**:
- **Flexbox**: Less explicit for two-row layout, requires more manual sizing. Rejected for Grid's simplicity.
- **Custom CSS**: More control but increases bundle size and maintenance. Rejected to stay within constitution's preference for utility-first.

**Implementation Notes**:
- Use `aspect-ratio` utilities for graphs to maintain proportions
- `gap-4` provides 1rem spacing between elements
- Responsive: `md:grid-cols-3` for mobile fallback (optional stretch goal)

**References**:
- [Tailwind CSS Grid Documentation](https://tailwindcss.com/docs/grid-template-columns)
- [CSS Grid Layout Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

### 5. Drag Interaction for Initial Displacement

**Unknown**: How to implement intuitive click-and-drag interaction for setting initial mass displacement?

**Decision**: **React pointer events with position delta calculation**

**Rationale**:
- Pointer events unify mouse/touch input (mobile webview support)
- Calculate displacement from drag distance in pixels, convert to meters using spring scale factor
- Visual feedback: mass follows pointer during drag, spring visual updates dynamically

**Pattern**:
```typescript
function SpringAnimation({ onDisplacementChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaPixels = e.clientY - dragStartY;
    const deltaMeters = deltaPixels / pixelsPerMeter;
    onDisplacementChange(deltaMeters);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Spring and mass SVG rendering */}
    </svg>
  );
}
```

**Alternatives Considered**:
- **Mouse events only**: Excludes touch devices. Rejected for mobile webview requirement.
- **Slider input**: Less intuitive than direct manipulation. Rejected per UX principle.
- **Drag library (react-draggable)**: Adds unnecessary dependency (~15KB). Rejected for simplicity.

**Implementation Notes**:
- Constrain drag to vertical axis only (ignore horizontal movement)
- Set maximum displacement limit (e.g., 2x initial spring length) to prevent numerical instability
- Provide visual cue (cursor: grab/grabbing)

**References**:
- [MDN Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [React Drag Interaction Patterns](https://codesandbox.io/examples/package/react-draggable)

---

### 6. Bundle Size Optimization Strategy

**Unknown**: How to ensure final bundle stays under 150KB gzipped while including React + D3 + Tailwind?

**Decision**: **Vite code splitting + tree shaking + PurgeCSS (Tailwind automatic)**

**Rationale**:
- Vite automatically code-splits dynamic imports
- Import only specific D3 modules (not full `d3` package)
- Tailwind's JIT mode only includes used utilities in production build
- Minification + gzip compression built into Vite production build

**Estimated Bundle Breakdown**:
- React 18 (production): ~42KB gzipped
- D3 modules (selection, scale, axis, shape): ~25KB gzipped
- Tailwind CSS (JIT, used classes only): ~8-12KB gzipped
- Application code (TypeScript compiled): ~30-40KB gzipped
- **Total**: ~105-119KB gzipped ✅ (under 150KB budget)

**Optimization Techniques**:
1. **Tree Shaking**:
   ```typescript
   // Import specific D3 modules
   import { select } from 'd3-selection';
   import { scaleLinear } from 'd3-scale';
   // NOT: import * as d3 from 'd3'; (pulls in entire library)
   ```

2. **Code Splitting**:
   ```typescript
   // Lazy load graph component
   const GraphPanel = lazy(() => import('./components/GraphPanel'));
   ```

3. **Production Build**:
   ```bash
   vite build  # Automatic minification + gzip
   ```

4. **Bundle Analysis**:
   ```bash
   npx vite-bundle-visualizer  # Verify bundle size
   ```

**Alternatives Considered**:
- **Preact instead of React**: Saves ~25KB but lacks some React 18 features (Suspense). Rejected as React fits within budget.
- **Custom charting (no D3)**: Saves ~25KB but requires rewriting axis/scale logic. Rejected for time/complexity tradeoff.

**Implementation Notes**:
- Run `vite build --mode production` to test final bundle size
- Set `build.target: 'es2020'` in vite.config.ts for modern bundle (smaller)

**References**:
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [D3 Modular Imports](https://github.com/d3/d3/blob/main/CHANGES.md#major-changes)

---

## Summary

All technical unknowns resolved:
- ✅ RK4 integration method selected for physics accuracy
- ✅ React + D3 hybrid pattern for performant graph rendering
- ✅ RAF-based animation loop with batched updates for 30+ FPS
- ✅ Tailwind CSS Grid layout for two-row structure
- ✅ Pointer events for drag interaction
- ✅ Bundle optimization strategy ensures <150KB gzipped

**Next Phase**: Generate data model and contracts (Phase 1).
