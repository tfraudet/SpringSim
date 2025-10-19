# Developer Quickstart Guide

**Feature**: Mass-Spring Oscillation Simulator  
**Branch**: `001-spring-oscillation-simulator`  
**Date**: 2025-10-18

---

## Prerequisites

Before starting development, ensure you have:

- **Node.js**: >= 18.0.0 (LTS recommended)
- **npm**: >= 9.0.0 (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended (TypeScript/React support)
- **Browser**: Chrome/Firefox/Safari latest version (for testing)

---

## Initial Setup

### 1. Clone & Navigate

```bash
# If not already in project directory
cd /Users/zazart/Documents/Github-Projects/SpingSim2

# Switch to feature branch
git checkout 001-spring-oscillation-simulator
```

### 2. Install Dependencies

```bash
npm install
```

**Expected Dependencies** (from `package.json`):

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "d3-scale": "^4.0.2",
    "d3-axis": "^3.0.0",
    "d3-shape": "^3.2.0",
    "d3-selection": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
  "tailwindcss": "^4.1.14",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Bundle Size Check**:
- Expected total: ~105-119 KB gzipped (target: ≤150 KB per constitution)
- Run `npm run build` to verify bundle size

### 3. Verify Configuration Files

Ensure these config files exist:

**`vite.config.ts`**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'd3': ['d3-scale', 'd3-axis', 'd3-shape', 'd3-selection']
        }
      }
    }
  }
});
```

**`tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

**`tailwind.config.js`**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
};
```

---

## Development Workflow

### Start Dev Server

```bash
npm run dev
```

**Expected Output**:
```
VITE v5.4.0  ready in 450 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Open in Browser**: Navigate to `http://localhost:5173/`

### Project Structure

```
src/
├── App.tsx                      # Root component
├── main.tsx                     # Entry point
├── index.css                    # Global styles (Tailwind imports)
├── components/                  # React components
│   ├── ParameterPanel.tsx       # Parameter input controls
│   ├── ControlPanel.tsx         # Start/Pause/Resume/Reset buttons
│   ├── SpringVisualization.tsx  # Animated spring+mass SVG
│   ├── Graph.tsx                # Reusable D3 graph component
│   └── DisplacementGraph.tsx    # Specialized displacement graph
├── hooks/                       # Custom React hooks
│   ├── useSimulation.ts         # Main simulation orchestration
│   ├── usePhysicsEngine.ts      # RK4 physics calculations
│   ├── useGraphData.ts          # Time-series data management
│   └── usePointerDrag.ts        # Mouse/touch drag interaction
├── lib/                         # Pure utility functions
│   ├── physics.ts               # Physics formulas (Hooke's law, RK4, energy)
│   └── constants.ts             # Physical constants and limits
└── types/                       # TypeScript type definitions
    └── simulation.ts            # Core interfaces (SpringParameters, SimulationState, etc.)
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (hot reload enabled) |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint (if configured) |
| `tsc --noEmit` | Type-check without emitting files |

---

## Implementation Checklist

Follow this order for feature implementation:

### Phase 1: Core Types & Utilities

- [ ] Create `src/types/simulation.ts` with all interfaces
- [ ] Create `src/lib/constants.ts` with physical constants
- [ ] Create `src/lib/physics.ts` with pure functions
- [ ] Test: `tsc --noEmit` passes (no type errors)

### Phase 2: Physics Engine

- [ ] Implement `usePhysicsEngine` hook (RK4 integration)
- [ ] Test: Energy conservation <1% error over 10 cycles (manual validation)

### Phase 3: Simulation Core

- [ ] Implement `useSimulation` hook (RAF loop, state management)
- [ ] Test: 30+ FPS in dev tools performance panel

### Phase 4: UI Components

- [ ] Implement `ParameterPanel` (input validation, real-time errors)
- [ ] Implement `ControlPanel` (button visibility logic)
- [ ] Test: Start button disabled for invalid params

### Phase 5: Visualization

- [ ] Implement `SpringVisualization` (SVG rendering, drag interaction)
- [ ] Implement `usePointerDrag` hook (mouse + touch unified)
- [ ] Test: Drag interaction smooth on touch devices

### Phase 6: Graphs

- [ ] Implement `useGraphData` hook (10 Hz data collection)
- [ ] Implement `Graph` component (D3 hybrid pattern)
- [ ] Implement `DisplacementGraph` (specialized variant)
- [ ] Test: All 4 graphs render, 15-second rolling window works

### Phase 7: Integration & QA

- [ ] Integrate all components in `App.tsx`
- [ ] Validate all success criteria (SC-001 to SC-009)
- [ ] Test accessibility (WCAG 2.1 AA: keyboard nav, screen reader)
- [ ] Test bundle size: `npm run build` → check `dist/` size ≤150 KB gzipped

---

## Key Implementation Notes

### Constitution Compliance

**Principle #1: User-Centered UX**
- Real-time parameter validation (FR-019)
- Clear error messages (no technical jargon)
- Smooth animations (30+ FPS target per SC-002)

**Principle #3: Performance & Efficiency**
- RAF loop for 60 FPS rendering
- Throttled graph updates (10 Hz per SC-003)
- Bundle target: ≤150 KB gzipped

**Principle #4: Minimal Dependencies**
- No testing libraries (per constitution: "don't implement test")
- No validation libraries (use pure TypeScript functions)
- D3 modular imports only (tree-shaking)

**Principle #5: Progressive Enhancement**
- Keyboard alternatives to drag (arrow keys)
- Touch + mouse unified (Pointer Events API)
- Semantic HTML (screen reader friendly)

### Physics Implementation

**RK4 Integration** (from research.md):
```typescript
// Pseudocode from research document
const k1 = { x: v, v: a(x) };
const k2 = { x: v + k1.v * dt/2, v: a(x + k1.x * dt/2) };
const k3 = { x: v + k2.v * dt/2, v: a(x + k2.x * dt/2) };
const k4 = { x: v + k3.v * dt, v: a(x + k3.x * dt) };

x_new = x + (dt/6) * (k1.x + 2*k2.x + 2*k3.x + k4.x);
v_new = v + (dt/6) * (k1.v + 2*k2.v + 2*k3.v + k4.v);
```

**Energy Conservation**:
```typescript
const energy = 0.5 * mass * velocity**2 + 0.5 * springConstant * position**2;
// Validate: Variation <1% over 10 cycles (SC-004)
```

### React + D3 Pattern

**Hybrid Approach** (from research.md):
- React manages component lifecycle and state
- D3 manipulates DOM directly within `useRef`
- Update on data change via `useEffect`

**Example**:
```typescript
const svgRef = useRef<SVGSVGElement>(null);

useEffect(() => {
  if (!svgRef.current) return;
  
  const svg = d3.select(svgRef.current);
  
  // D3 updates DOM here
  svg.selectAll('path')
    .data(data)
    .join('path')
    .attr('d', lineGenerator);
    
}, [data]); // Re-run when data changes
```

---

## Testing Strategy

**No Automated Tests** (per constitution):
- Constitution explicitly states: "don't implement test"
- Manual validation using browser dev tools
- Success criteria (SC-001 to SC-009) serve as test cases

**Manual QA Checklist**:

1. **Performance** (SC-002):
   - Open Chrome DevTools → Performance tab
   - Record simulation for 30 seconds
   - Verify: FPS never drops below 30

2. **Energy Conservation** (SC-004):
   - Start simulation with initial displacement 1.0m
   - Record energy values for 10 complete cycles
   - Calculate: `(max - min) / average < 0.01` (1% tolerance)

3. **Accessibility** (SC-006):
   - Test keyboard navigation (Tab, Enter, Arrow keys)
   - Test with VoiceOver (macOS) or NVDA (Windows)
   - Verify all interactive elements have labels

4. **Bundle Size**:
   ```bash
   npm run build
   cd dist
   du -sh *.js | awk '{print $1}' # Check total size
   ```
   Target: ≤150 KB gzipped

---

## Troubleshooting

### Issue: Dev server won't start

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: TypeScript errors in imports

**Solution**:
- Ensure `tsconfig.json` has `"moduleResolution": "bundler"`
- Restart TypeScript server in VS Code: Cmd+Shift+P → "Restart TS Server"

### Issue: Tailwind styles not applying

**Solution**:
- Check `src/index.css` has Tailwind directives:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- Restart dev server

### Issue: Graph not rendering

**Solution**:
- Check browser console for D3 import errors
- Verify `useEffect` dependency array includes `data`
- Ensure `svgRef.current` is not null before D3 operations

### Issue: Simulation laggy on mobile

**Solution**:
- Reduce physics timestep to 1/30 (from 1/60) on mobile detection
- Throttle graph updates to 5 Hz (from 10 Hz)
- Use `pointer-events: none` on non-interactive SVG elements

---

## Performance Profiling

### FPS Monitoring

```typescript
// Add to useSimulation hook for dev mode
let frameCount = 0;
let lastTime = performance.now();

const rafCallback = () => {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = now;
  }
  // ... physics update
};
```

### Bundle Analysis

```bash
npm run build
npx vite-bundle-visualizer
```

Opens interactive bundle size visualization in browser.

---

## Success Criteria Reference

Quick reference for manual validation (see `spec.md` for full details):

| ID | Criterion | How to Test |
|----|-----------|-------------|
| SC-001 | Parameter change triggers calculation | Change mass, verify equilibrium indicator updates immediately |
| SC-002 | 30+ FPS during simulation | Chrome DevTools Performance: record 30s, check FPS counter |
| SC-003 | Graph updates at 10 Hz | Add `console.log` in graph update, verify ~10 logs/second |
| SC-004 | Energy conservation <1% | Log energy for 10 cycles, calculate variance |
| SC-005 | Reset clears state | Click Reset, verify time=0, position=0, graphs empty |
| SC-006 | WCAG 2.1 AA compliance | Test with keyboard + VoiceOver, verify labels and focus |
| SC-007 | Touch support | Test on iPad/phone, verify drag and buttons work |
| SC-008 | FCP <1.5s, TTI <3s | Lighthouse audit in Chrome DevTools |
| SC-009 | Bundle ≤150 KB gzipped | `npm run build`, check `dist/` folder size |

---

## Next Steps After Development

1. **Feature Complete**: Validate all success criteria
2. **Code Review**: Check contracts adherence (types, hooks, components)
3. **Performance Audit**: Run Lighthouse, verify metrics
4. **Constitution Review**: Confirm all principles satisfied
5. **Deployment**: Deploy to static host (Vercel/Netlify/GitHub Pages)

---

## Useful Commands Summary

```bash
# Development
npm run dev              # Start dev server
tsc --noEmit            # Type-check

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Analysis
npx vite-bundle-visualizer  # Bundle size analysis
```

---

## Support & Documentation

- **Specification**: `specs/001-spring-oscillation-simulator/spec.md`
- **Data Model**: `specs/001-spring-oscillation-simulator/data-model.md`
- **Contracts**: `specs/001-spring-oscillation-simulator/contracts/`
- **Research**: `specs/001-spring-oscillation-simulator/research.md`
- **Constitution**: `.specify/memory/constitution.md`

For questions or clarifications, refer to the specification documents or the project constitution for guiding principles.
