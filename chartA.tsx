import React, { useState, useRef, MouseEvent } from 'react';

// Data types for tasks and groups.
interface Task {
  id: string;
  groupId: number;
  name: string;
  start: string; // ISO date string, e.g., "2025-04-01"
  end: string;   // ISO date string, e.g., "2025-04-05"
  eventType: string;
}

interface Group {
  id: number;
  title: string;
}

interface TooltipData {
  x: number;
  y: number;
  content: string;
}

interface ChartAProps {
  tasks?: Task[];
  groups?: Group[];
  viewStart?: string; // ISO date string for chart start view
  viewEnd?: string;   // ISO date string for chart end view
  filters?: any;      // Placeholder for filtering logic if needed
}

const ChartA: React.FC<ChartAProps> = ({
  tasks: propTasks,
  groups: propGroups,
  viewStart,
  viewEnd,
  filters
}) => {
  // Sample data if no external data is provided.
  const defaultTasks: Task[] = [
    { id: '1', groupId: 1, name: 'Asset 1 Event', start: '2025-04-01', end: '2025-04-05', eventType: 'EventA' },
    { id: '2', groupId: 2, name: 'Asset 2 Event', start: '2025-04-02', end: '2025-04-06', eventType: 'EventB' },
    { id: '3', groupId: 3, name: 'Asset 3 Event', start: '2025-04-03', end: '2025-04-07', eventType: 'EventC' }
  ];

  const defaultGroups: Group[] = [
    { id: 1, title: 'Asset 1' },
    { id: 2, title: 'Asset 2' },
    { id: 3, title: 'Asset 3' }
  ];

  // Use external data if provided.
  const tasks = propTasks && propTasks.length > 0 ? propTasks : defaultTasks;
  const groups = propGroups && propGroups.length > 0 ? propGroups : defaultGroups;

  // Mapping from event types to colors.
  const eventColors: { [key: string]: string } = {
    EventA: '#0070f3',
    EventB: '#ff4d4f',
    EventC: '#52c41a'
    // Add additional event types as needed…
  };

  // Parse each task's start and end dates.
  const taskDates = tasks.map(task => ({
    start: new Date(task.start),
    end: new Date(task.end)
  }));

  // Calculate the overall bounds from tasks.
  const computedMinTime = Math.min(...taskDates.map(d => d.start.getTime()));
  const computedMaxTime = Math.max(...taskDates.map(d => d.end.getTime()));
  const computedMinDate = new Date(computedMinTime);
  const computedMaxDate = new Date(computedMaxTime);

  // Use the provided viewStart/viewEnd props if given; otherwise use computed values.
  const effectiveMinDate = viewStart ? new Date(viewStart) : computedMinDate;
  const effectiveMaxDate = viewEnd ? new Date(viewEnd) : computedMaxDate;

  // Dimensions (customize as needed)
  const totalWidth = 800;
  const marginLeft = 150; // space for group labels
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 60; // extra space for x-axis labels at the bottom
  const rowHeight = 20;    // fixed row height as requested
  const barHeight = 14;    // slightly smaller than row height to allow for padding
  const chartWidth = totalWidth - marginLeft - marginRight;
  const totalHeight = marginTop + marginBottom + groups.length * rowHeight;

  // Helper: convert a date to an x coordinate within the chart area.
  const dateToX = (date: Date) => {
    return marginLeft + ((date.getTime() - effectiveMinDate.getTime()) / (effectiveMaxDate.getTime() - effectiveMinDate.getTime())) * chartWidth;
  };

  // Generate tick marks (we'll use 5 evenly spaced ticks).
  const tickCount = 5;
  const ticks: Date[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const tickTime = effectiveMinDate.getTime() + (i * (effectiveMaxDate.getTime() - effectiveMinDate.getTime())) / tickCount;
    ticks.push(new Date(tickTime));
  }

  // Tooltip state to show event details on hover.
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handler to update tooltip position and content.
  const handleMouseMove = (e: MouseEvent, task: Task) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const content = `${task.name}\n${new Date(task.start).toLocaleDateString()} - ${new Date(task.end).toLocaleDateString()}`;
    setTooltip({
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top + 10,
      content
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '500px',
        width: `${totalWidth}px`,
        margin: '0 auto'
      }}
    >
      {/* Legend in the top right */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontSize: '12px',
          zIndex: 10
        }}
      >
        <strong style={{ fontSize: '14px' }}>Legend:</strong>
        <div style={{ marginTop: '4px' }}>
          {Object.entries(eventColors).map(([eventType, color]) => (
            <div key={eventType} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: color, marginRight: '6px' }} />
              <span>{eventType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG container for the timeline chart */}
      <svg width={totalWidth} height={totalHeight} style={{ border: '1px solid #ddd', background: '#fff' }}>
        {/* Render faint gray backgrounds for each group row */}
        {groups.map((group, index) => {
          const y = marginTop + index * rowHeight;
          return (
            <rect
              key={`bg-${group.id}`}
              x={marginLeft}
              y={y}
              width={chartWidth}
              height={rowHeight}
              fill="rgba(0, 0, 0, 0.03)"
            />
          );
        })}

        {/* Render x-axis ticks and grid lines (labels at bottom) */}
        {ticks.map((tick, index) => {
          const x = dateToX(tick);
          return (
            <g key={index}>
              <line x1={x} y1={marginTop} x2={x} y2={totalHeight - marginBottom} stroke="#ccc" />
              <text x={x} y={totalHeight - marginBottom + 20} textAnchor="middle" fontSize="10" fill="#333">
                {tick.toLocaleDateString()}
              </text>
            </g>
          );
        })}

        {/* Render group labels on the left */}
        {groups.map((group, index) => {
          const y = marginTop + index * rowHeight + rowHeight / 2;
          return (
            <text
              key={group.id}
              x={marginLeft - 10}
              y={y}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize="12"
              fill="#333"
            >
              {group.title}
            </text>
          );
        })}

        {/* Render task bars */}
        {tasks.map(task => {
          const groupIndex = groups.findIndex(g => g.id === task.groupId);
          if (groupIndex === -1) return null;
          const taskStart = new Date(task.start);
          const taskEnd = new Date(task.end);
          const x = dateToX(taskStart);
          const xEnd = dateToX(taskEnd);
          const y = marginTop + groupIndex * rowHeight + (rowHeight - barHeight) / 2;
          const width = xEnd - x;
          return (
            <g key={task.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill={eventColors[task.eventType] || '#999'}
                rx="3"
                ry="3"
                onMouseMove={(e) => handleMouseMove(e, task)}
                onMouseEnter={(e) => handleMouseMove(e, task)}
                onMouseLeave={handleMouseLeave}
              />
              {/* Centered text on task bar (optional) */}
              <text
                x={x + width / 2}
                y={y + barHeight / 2}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="10"
                fill="#fff"
                pointerEvents="none"
              >
                {task.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip: appears on hover over a task */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            padding: '6px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'pre-line',
            pointerEvents: 'none',
            zIndex: 20
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default ChartA;