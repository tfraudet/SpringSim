/**
 * Parameter input panel for spring-mass system configuration
 * @see specs/001-spring-oscillation-simulator/contracts/component-props.md
 */

import { useState, useEffect } from 'react';
import type { SpringParameters } from '../types/simulation';
import { validateParameters } from '../lib/validation';

interface ParameterPanelProps {
  parameters: SpringParameters;
  onChange: (params: SpringParameters) => void;
  disabled: boolean;
}

export function ParameterPanel({ parameters, onChange, disabled }: ParameterPanelProps) {
  const [localParams, setLocalParams] = useState(parameters);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Sync with external changes
  useEffect(() => {
    setLocalParams(parameters);
  }, [parameters]);
  
  const handleChange = (field: keyof SpringParameters, value: string) => {
    const numValue = parseFloat(value);
    const updated = { ...localParams, [field]: numValue };
    setLocalParams(updated);
    
    // Real-time validation
    const validation = validateParameters(updated);
    setErrors(validation.errors);
  };
  
  const handleBlur = (_field: keyof SpringParameters) => {
    const validation = validateParameters(localParams);
    if (validation.isValid) {
      onChange(localParams);
      setErrors({});
    } else {
      setErrors(validation.errors);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, field: keyof SpringParameters) => {
    if (e.key === 'Enter') {
      handleBlur(field);
    }
  };
  
  return (
    <div className="space-y-4 mb-10">
      {/* Mass */}
      <div>
        <label
          htmlFor="mass"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Mass (kg)
        </label>
        <input
          id="mass"
          type="number"
          value={localParams.mass}
          onChange={(e) => handleChange('mass', e.target.value)}
          onBlur={() => handleBlur('mass')}
          onKeyPress={(e) => handleKeyPress(e, 'mass')}
          disabled={disabled}
          step="0.1"
          min="0.01"
          className={`w-full px-4 py-3 bg-[#0f1115] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent ${
            errors.mass
              ? 'border-red-500 focus:ring-red-500'
              : 'focus:ring-blue-500'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          aria-invalid={!!errors.mass}
          aria-describedby={errors.mass ? 'mass-error' : undefined}
        />
        {errors.mass && (
          <p
            id="mass-error"
            className="mt-1 text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            {errors.mass}
          </p>
        )}
      </div>
      
      {/* Initial Length */}
      <div>
        <label
          htmlFor="initialLength"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Initial Length (m)
        </label>
        <input
          id="initialLength"
          type="number"
          value={localParams.initialLength}
          onChange={(e) => handleChange('initialLength', e.target.value)}
          onBlur={() => handleBlur('initialLength')}
          onKeyPress={(e) => handleKeyPress(e, 'initialLength')}
          disabled={disabled}
          step="0.1"
          min="0.1"
          className={`w-full px-4 py-3 bg-[#0f1115] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent ${
            errors.initialLength
              ? 'border-red-500 focus:ring-red-500'
              : 'focus:ring-blue-500'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          aria-invalid={!!errors.initialLength}
          aria-describedby={errors.initialLength ? 'initialLength-error' : undefined}
        />
        {errors.initialLength && (
          <p
            id="initialLength-error"
            className="mt-1 text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            {errors.initialLength}
          </p>
        )}
      </div>
      
      {/* Spring Constant */}
      <div>
        <label
          htmlFor="springConstant"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Spring Constant (N/m)
        </label>
        <input
          id="springConstant"
          type="number"
          value={localParams.springConstant}
          onChange={(e) => handleChange('springConstant', e.target.value)}
          onBlur={() => handleBlur('springConstant')}
          onKeyPress={(e) => handleKeyPress(e, 'springConstant')}
          disabled={disabled}
          step="1"
          min="0.1"
          className={`w-full px-4 py-3 bg-[#0f1115] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent ${
            errors.springConstant
              ? 'border-red-500 focus:ring-red-500'
              : 'focus:ring-blue-500'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          aria-invalid={!!errors.springConstant}
          aria-describedby={errors.springConstant ? 'springConstant-error' : undefined}
        />
        {errors.springConstant && (
          <p
            id="springConstant-error"
            className="mt-1 text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            {errors.springConstant}
          </p>
        )}
      </div>
      
      {/* Damping Coefficient */}
      <div>
        <label
          htmlFor="dampingCoefficient"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Damping Coefficient (N·s/m)
        </label>
        <input
          id="dampingCoefficient"
          type="number"
          value={localParams.dampingCoefficient}
          onChange={(e) => handleChange('dampingCoefficient', e.target.value)}
          onBlur={() => handleBlur('dampingCoefficient')}
          onKeyPress={(e) => handleKeyPress(e, 'dampingCoefficient')}
          disabled={disabled}
          step="0.1"
          min="0"
          className={`w-full px-4 py-3 bg-[#0f1115] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent ${
            errors.dampingCoefficient
              ? 'border-red-500 focus:ring-red-500'
              : 'focus:ring-blue-500'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          aria-invalid={!!errors.dampingCoefficient}
          aria-describedby={errors.dampingCoefficient ? 'dampingCoefficient-error' : undefined}
        />
        {errors.dampingCoefficient && (
          <p
            id="dampingCoefficient-error"
            className="mt-1 text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            {errors.dampingCoefficient}
          </p>
        )}
      </div>
    </div>
  );
}
