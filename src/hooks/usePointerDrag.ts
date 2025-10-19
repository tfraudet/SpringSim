/**
 * Pointer drag hook for unified mouse/touch interaction
 * @see specs/001-spring-oscillation-simulator/contracts/hooks.md
 */

import { useRef, useEffect } from 'react';

interface UsePointerDragOptions {
  onDrag: (deltaY: number) => void;
  enabled: boolean;
}

/**
 * Hook for handling pointer drag interactions (unified mouse + touch)
 * 
 * @param options - Drag configuration
 * @returns Ref to attach to draggable element and drag state
 */
export function usePointerDrag({ onDrag, enabled }: UsePointerDragOptions) {
  const ref = useRef<SVGCircleElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const lastYRef = useRef(0);
  
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      startYRef.current = e.clientY;
      lastYRef.current = e.clientY;
      element.setPointerCapture(e.pointerId);
    };
    
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      
      const deltaY = e.clientY - lastYRef.current;
      lastYRef.current = e.clientY;
      onDrag(deltaY);
    };
    
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      isDraggingRef.current = false;
      element.releasePointerCapture(e.pointerId);
    };
    
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);
    
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [enabled, onDrag]);
  
  return {
    ref,
    isDragging: isDraggingRef.current,
  };
}
