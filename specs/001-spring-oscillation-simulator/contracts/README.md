# Component Contracts

**Feature**: Mass-Spring Oscillation Simulator  
**Branch**: `001-spring-oscillation-simulator`  
**Date**: 2025-10-18

## Overview

Since this is a client-side SPA with no backend services, there are no external API contracts. This directory documents **internal contracts** between React components, custom hooks, and utility functions.

## Contract Types

1. **Component Props Interfaces** - Type-safe contracts for React component inputs
2. **Hook Signatures** - Return types and expected behavior for custom hooks
3. **Utility Function APIs** - Pure functions for physics calculations

## Files

- `component-props.md` - All React component prop interfaces
- `hooks.md` - Custom hook signatures and guarantees
- `physics.md` - Physics utility function contracts

## Contract Principles

All contracts follow these principles from the constitution:

- **Type Safety** (User-Centered UX): TypeScript strict mode prevents runtime errors
- **Minimal Dependencies** (Principle #4): No external validation libraries, use native TypeScript
- **Performance** (Principle #3): Document performance guarantees (e.g., O(1) operations)

## Usage

Developers implementing this feature should:

1. Review prop interfaces before creating components
2. Implement hooks according to documented behavior
3. Add JSDoc comments referencing contract documents
4. Run `tsc --noEmit` to validate contract adherence

## Validation

Contract validation occurs at compile-time via TypeScript. No runtime schema validation is required (minimizes dependencies per constitution).
