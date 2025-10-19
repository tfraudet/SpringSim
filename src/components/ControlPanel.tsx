/**
 * Control buttons for simulation (Start, Pause, Resume, Reset)
 * @see specs/001-spring-oscillation-simulator/contracts/component-props.md
 */

import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface ControlPanelProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  disabled: boolean;
}

export function ControlPanel({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
  disabled,
}: ControlPanelProps) {
  const showStart = !isRunning;
  const showPause = isRunning && !isPaused;
  const showResume = isRunning && isPaused;
  
  return (
    <div className="flex flex-col gap-3">
      {/* Start Button */}
      {showStart && (
        <button
          onClick={onStart}
          disabled={disabled}
          className="w-full px-6 py-4 bg-[#0ea5e9] text-white font-semibold rounded-lg hover:bg-[#0284c7] focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          aria-label="Start simulation"
          title={disabled ? 'Please enter valid parameters' : 'Start simulation'}
        >
          <PlayIcon style={{ width: '20px', height: '20px' }} />
          Start Simulation
        </button>
      )}
      
      {/* Pause Button */}
      {showPause && (
        <button
          onClick={onPause}
          className="w-full px-6 py-4 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors flex items-center justify-center gap-2"
          aria-label="Pause simulation"
        >
          <PauseIcon style={{ width: '20px', height: '20px' }} />
          Pause
        </button>
      )}
      
      {/* Resume Button */}
      {showResume && (
        <button
          onClick={onResume}
          className="w-full px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center justify-center gap-2"
          aria-label="Resume simulation"
        >
          <PlayIcon style={{ width: '14px', height: '14px' }} />
          Resume
        </button>
      )}
      
      {/* Reset Button - Always Visible */}
      <button
        onClick={onReset}
        className="w-full px-6 py-4 bg-[#4b5563] text-white font-semibold rounded-lg hover:bg-[#374151] focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center justify-center gap-2"
        aria-label="Reset simulation"
      >
        <ArrowPathIcon style={{ width: '14px', height: '14px' }} />
        Reset
      </button>
    </div>
  );
}
