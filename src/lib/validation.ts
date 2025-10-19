/**
 * Parameter validation utilities for the spring-mass system
 * @see specs/001-spring-oscillation-simulator/contracts/physics.md
 */

import type { SpringParameters, ValidationResult } from '../types/simulation';
import { PARAMETER_LIMITS } from './constants';

/**
 * Validate spring-mass system parameters
 * 
 * Checks that all parameters are positive, finite, and within acceptable ranges.
 * 
 * @param params - Spring parameters to validate
 * @returns Validation result with isValid flag and error messages
 */
export function validateParameters(params: SpringParameters): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Validate mass
  if (!Number.isFinite(params.mass)) {
    errors.mass = 'Mass must be a finite number';
  } else if (params.mass <= 0) {
    errors.mass = 'Mass must be positive';
  } else if (params.mass < PARAMETER_LIMITS.MIN_MASS) {
    errors.mass = `Mass must be at least ${PARAMETER_LIMITS.MIN_MASS} kg`;
  } else if (params.mass > PARAMETER_LIMITS.MAX_MASS) {
    errors.mass = `Mass must be at most ${PARAMETER_LIMITS.MAX_MASS} kg`;
  }
  
  // Validate spring constant
  if (!Number.isFinite(params.springConstant)) {
    errors.springConstant = 'Spring constant must be a finite number';
  } else if (params.springConstant <= 0) {
    errors.springConstant = 'Spring constant must be positive';
  } else if (params.springConstant < PARAMETER_LIMITS.MIN_SPRING_CONSTANT) {
    errors.springConstant = `Spring constant must be at least ${PARAMETER_LIMITS.MIN_SPRING_CONSTANT} N/m`;
  } else if (params.springConstant > PARAMETER_LIMITS.MAX_SPRING_CONSTANT) {
    errors.springConstant = `Spring constant must be at most ${PARAMETER_LIMITS.MAX_SPRING_CONSTANT} N/m`;
  }
  
  // Validate initial length
  if (!Number.isFinite(params.initialLength)) {
    errors.initialLength = 'Initial length must be a finite number';
  } else if (params.initialLength <= 0) {
    errors.initialLength = 'Initial length must be positive';
  } else if (params.initialLength < PARAMETER_LIMITS.MIN_LENGTH) {
    errors.initialLength = `Initial length must be at least ${PARAMETER_LIMITS.MIN_LENGTH} m`;
  } else if (params.initialLength > PARAMETER_LIMITS.MAX_LENGTH) {
    errors.initialLength = `Initial length must be at most ${PARAMETER_LIMITS.MAX_LENGTH} m`;
  }
  
  // Validate damping coefficient
  if (!Number.isFinite(params.dampingCoefficient)) {
    errors.dampingCoefficient = 'Damping coefficient must be a finite number';
  } else if (params.dampingCoefficient < 0) {
    errors.dampingCoefficient = 'Damping coefficient must be non-negative';
  } else if (params.dampingCoefficient > 100) {
    errors.dampingCoefficient = 'Damping coefficient must be at most 100 N·s/m';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
