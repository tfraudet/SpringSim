/**
 * Main application component - Spring-Mass Oscillation Simulator
 * @see specs/001-spring-oscillation-simulator/plan.md
 */

import { useState } from 'react';
import { BeakerIcon } from '@heroicons/react/24/solid';
import type { SpringParameters } from './types/simulation';
import { validateParameters } from './lib/validation';
import { useSimulation } from './hooks/useSimulation';
import { ParameterPanel } from './components/ParameterPanel';
import { ControlPanel } from './components/ControlPanel';
import { SpringVisualization } from './components/SpringVisualization';
import { Graph } from './components/Graph';

function App() {
  // Initial parameters (default values)
  const [parameters, setParameters] = useState<SpringParameters>({
    mass: 10.0,
    springConstant: 100.0,
    initialLength: 2.0,
    dampingCoefficient: 0.5, // Light damping (critically damped ~ 2*sqrt(m*k) = 63.2)
  });
  
  // Validate parameters
  const validation = validateParameters(parameters);
  
  // Simulation hook
  const {
    state,
    timeSeriesData,
    lockedYDomains,
    start,
    pause,
    resume,
    reset,
    setInitialDisplacement,
  } = useSimulation(parameters);
  
  // Graph uses its own default sizing or measures container when fillPanel is true
  const xDomain: [number, number] = [Math.max(0, state.time - 15), state.time];

  return (
        <div className="h-screen bg-black p-4 pb-20">
           <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BeakerIcon className="text-white" style={{ width: '24px', height: '24px' }} />
            Mass-Spring System Simulator
          </h1>

          {/* Screen reader announcements */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {state.isRunning && !state.isPaused && `Simulation running. Time: ${state.time.toFixed(1)} seconds. Position: ${state.position.toFixed(3)} meters.`}
            {state.isPaused && 'Simulation paused.'}
            {!state.isRunning && 'Simulation stopped.'}
          </div>


          {/* Main panel */}
          <div className="flex flex-row h-full gap-4">
              <div className="basis-full ">
                  <div className="flex flex-col h-full">
                      {/* Spring panel * displacement graph */}
                      <div className="basis-2/3">
                        <div className="flex flex-row h-full">
                          <div className="basis-1/2 m-2 mt-0">
                            <SpringVisualization
                              position={state.position}
                              parameters={parameters}
                              isRunning={state.isRunning}
                              onDrag={setInitialDisplacement}
                            />
                          </div>

                          <div className="basis-1/2 m-2 mt-0">
                            <Graph
                              fillPanel
                              data={timeSeriesData.displacement}
                              config={{
                                title: 'Displacement (m)',
                                xLabel: 'Time (s)',
                                yLabel: 'Displacement (m)',
                                xDomain,
                                yDomain: lockedYDomains ? lockedYDomains.displacement : 'auto',
                                color: '#06b6d4', // Cyan
                                showGrid: true,
                              }}                
                            />
                          </div>
                        </div>
                      </div>

                      {/* Graphs panel: velocity, acceleration, total energy */}
                      <div className="basis-1/3">
                         <div className="flex flex-row h-full ">
                          <div className="basis-1/3 m-2">
                            <Graph
                              fillPanel
                              data={timeSeriesData.velocity}
                              config={{
                                title: 'Velocity (m/s)',
                                xLabel: 'Time (s)',
                                yLabel: 'Velocity (m/s)',
                                xDomain,
                                yDomain: lockedYDomains ? lockedYDomains.velocity : 'auto',
                                color: '#fbbf24', // Yellow/Orange
                                showGrid: true,
                              }}
                            />
                          </div>

                          <div className="basis-1/3 m-2">
                            <Graph
                              fillPanel
                              data={timeSeriesData.acceleration}
                              config={{
                                title: 'Acceleration (m/s²)',
                                xLabel: 'Time (s)',
                                yLabel: 'Acceleration (m/s²)',
                                xDomain,
                                yDomain: lockedYDomains ? lockedYDomains.acceleration : 'auto',
                                color: '#f87171', // Red
                                showGrid: true,
                              }}
                            />
                         </div>

                          <div className="basis-1/3 m-2">
                            <Graph
                              fillPanel
                              data={timeSeriesData.totalEnergy}
                              config={{
                                title: 'Total Energy (J)',
                                xLabel: 'Time (s)',
                                yLabel: 'Energy (J)',
                                xDomain,
                                yDomain: lockedYDomains ? lockedYDomains.totalEnergy : 'auto',
                                color: '#4ade80', // Green
                                showGrid: true,
                              }}
                            />
                          </div>

                        </div>
                     </div>
                  </div>
              </div>

              {/* Right sidebar: Controls */}
              <div className="basis-[30vw] bg-neutral-800 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-white mb-6">Simulation Controls</h2>
                  <ParameterPanel
                    parameters={parameters}
                    onChange={setParameters}
                    disabled={state.isRunning}
                  />
                  <ControlPanel
                    isRunning={state.isRunning}
                    isPaused={state.isPaused}
                    onStart={start}
                    onPause={pause}
                    onResume={resume}
                    onReset={reset}
                    disabled={!validation.isValid}
                  />
              </div>

          </div>
        </div>
  );
}

export default App;
