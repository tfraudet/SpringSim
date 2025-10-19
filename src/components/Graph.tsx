/**
 * Reusable D3-powered graph component
 * @see specs/001-spring-oscillation-simulator/contracts/component-props.md
 */

import { useEffect, useRef, memo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import { select } from 'd3-selection';
import type { DataPoint, GraphConfig } from '../types/simulation';

interface GraphProps {
  data: DataPoint[];
  config: GraphConfig;
  /** Optional fixed width (px). If omitted, DEFAULT_WIDTH is used unless fillPanel is true. */
  width?: number;
  /** Optional fixed height (px). If omitted, DEFAULT_HEIGHT is used unless fillPanel is true. */
  height?: number;
  /** When true, the graph will measure its container and fill its panel */
  fillPanel?: boolean;
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 200;

const GraphComponent = ({ data, config, width, height, fillPanel }: GraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredSize, setMeasuredSize] = useState<{ w: number; h: number } | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
  const margin = { top: 20, right: 20, bottom: 20, left: 60 };
  // If the component is set to fill its panel, prefer measured size
  const actualWidth = measuredSize ? measuredSize.w : (width ?? DEFAULT_WIDTH);
  const actualHeight = measuredSize ? measuredSize.h : (height ?? DEFAULT_HEIGHT);
  const innerWidth = actualWidth - margin.left - margin.right;
  const innerHeight = actualHeight - margin.top - margin.bottom;
    
    // Clear previous content
  const svg = select(svgRef.current);
  svg.selectAll('*').remove();
    
    // Create container group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Calculate domains
    const xDomain = config.xDomain;
    const yDomain = config.yDomain === 'auto' 
      ? [
          Math.min(...data.map(d => d.value)) * 0.9,
          Math.max(...data.map(d => d.value)) * 1.1
        ]
      : config.yDomain;
    
    // Scales
    const xScale = scaleLinear().domain(xDomain).range([0, innerWidth]);
    const yScale = scaleLinear().domain(yDomain).range([innerHeight, 0]);
    
    // Axes
    const xAxis = axisBottom(xScale).ticks(5);
    const yAxis = axisLeft(yScale).ticks(5);
    
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#9ca3af');
    
    // Style axes
    g.selectAll('.domain, .tick line')
      .attr('stroke', '#4b5563');
    
    g.selectAll('.tick text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '11px');
    
    // Title (top left)
    g.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .attr('text-anchor', 'start')
      .attr('font-size', '13px')
      .attr('font-weight', '500')
      .attr('fill', config.color)
      .text(config.title);
    
    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#6b7280')
      .text(config.xLabel);
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#6b7280')
      .text(config.yLabel);
    
    // Line generator
    const lineGenerator = line<DataPoint>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.value));
    
    // Draw line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', config.color)
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);
    
  }, [data, config, width, height, measuredSize]);

  // Measure container when fillPanel is requested
  useEffect(() => {
    if (!containerRef.current || !fillPanel) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      // subtract computed paddings to get inner svg area
      const style = getComputedStyle(el);
      const padTop = parseFloat(style.paddingTop || '0');
      const padBottom = parseFloat(style.paddingBottom || '0');
      const padLeft = parseFloat(style.paddingLeft || '0');
      const padRight = parseFloat(style.paddingRight || '0');
      const w = Math.max(0, rect.width - padLeft - padRight);
      const h = Math.max(0, rect.height - padTop - padBottom);
      setMeasuredSize({ w, h });
    });
    ro.observe(el);
    // initial measurement
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const padTop = parseFloat(style.paddingTop || '0');
    const padBottom = parseFloat(style.paddingBottom || '0');
    const padLeft = parseFloat(style.paddingLeft || '0');
    const padRight = parseFloat(style.paddingRight || '0');
    setMeasuredSize({ w: Math.max(0, rect.width - padLeft - padRight), h: Math.max(0, rect.height - padTop - padBottom) });
    return () => ro.disconnect();
  }, [fillPanel]);
  
  return (
    <div ref={containerRef} className={`bg-neutral-800 p-4 rounded-lg flex items-center justify-center ${fillPanel ? 'h-full' : ''}`}>
      <svg
        ref={svgRef}
        // width={measuredSize ? measuredSize.w : (width ?? DEFAULT_WIDTH)}
        // height={measuredSize ? measuredSize.h : (height ?? DEFAULT_HEIGHT)}
        role="img"
        aria-label={`${config.title} graph`}
        className="block w-full h-full"
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders with custom comparison
export const Graph = memo(GraphComponent, (prevProps, nextProps) => {
  // Only re-render if data length changed or last data point changed
  if (prevProps.data.length !== nextProps.data.length) return false;
  if (prevProps.data.length === 0) return true;
  
  const prevLast = prevProps.data[prevProps.data.length - 1];
  const nextLast = nextProps.data[nextProps.data.length - 1];
  
  return (
    prevLast.time === nextLast.time &&
    prevLast.value === nextLast.value &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.config.title === nextProps.config.title
  );
});
