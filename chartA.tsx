import React, { useState, useRef, useEffect, MouseEvent } from 'react';

// Types for tasks and groups.
interface Task {
  id: string;
  groupId: number;
  name: string;
  start: string; // ISO date string (e.g., "2025-04-01")
  end: string;   // ISO date string (e.g., "2025-04-05")
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
  filters?: any; // Use filters to pre-filter tasks if needed.
}

const ChartA: React.FC<ChartAProps> = ({
  tasks: propTasks,
  groups: propGroups,
  filters
}) => {
  // Default (sample) data if no data is provided via props.
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

  // Allow external data; otherwise, use defaults.
  const tasks = propTasks && propTasks.length > 0 ? propTasks : defaultTasks;
  const groups = propGroups && propGroups.length > 0 ? propGroups : defaultGroups;

  // Mapping event types to colors.
  const eventColors: { [key: string]: string } = {
    EventA: '#0070f3',
    EventB: '#ff4d4f',
    EventC: '#52c41a'
    // Extend as needed…
  };

  // Parse task dates.
  const taskDates = tasks.map(task => ({
    start: new Date(task.start),
    end: new Date(task.end)
  }));

  // Determine time bounds.
  const minTime = Math.min(...taskDates.map(d => d.start.getTime()));
  const maxTime = Math.max(...taskDates.map(d => d.end.getTime()));
  const minDate = new Date(minTime);
  const maxDate = new Date(maxTime);

  // Dimensions for the SVG chart.
  const totalWidth = 800;
  const marginLeft = 150;  // space for group labels
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 60; // extra space for x-axis labels at bottom
  const rowHeight = 40;    // assets stacked closer together
  const barHeight = 16;
  const totalHeight = marginTop + marginBottom + groups.length * rowHeight;

  // Convert a date to an x-coordinate.
  const dateToX = (date: Date) => {
    return marginLeft + ((date.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * (totalWidth - marginLeft - marginRight);
  };

  // Generate tick marks; here, 5 evenly spaced ticks.
  const tickCount = 5;
  const ticks: Date[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const tickTime = minDate.getTime() + (i * (maxDate.getTime() - minDate.getTime())) / tickCount;
    ticks.push(new Date(tickTime));
  }

  // Tooltip state.
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handler to update tooltip position and content.
  const handleMouseMove = (e: MouseEvent, task: Task) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Set tooltip content with task name and formatted start/end dates.
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

      {/* SVG for the timeline */}
      <svg width={totalWidth} height={totalHeight} style={{ border: '1px solid #ddd', background: '#fff' }}>
        {/* X-axis ticks and grid lines drawn at the bottom */}
        {ticks.map((tick, index) => {
          const x = dateToX(tick);
          return (
            <g key={index}>
              {/* Vertical grid line */}
              <line x1={x} y1={marginTop} x2={x} y2={totalHeight - marginBottom} stroke="#ccc" />
              {/* Tick label at bottom */}
              <text x={x} y={totalHeight - marginBottom + 20} textAnchor="middle" fontSize="10" fill="#333">
                {tick.toLocaleDateString()}
              </text>
            </g>
          );
        })}

        {/* Group labels on the left */}
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

        {/* Task bars */}
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
              {/* Optional: Centered text inside the bar, if desired */}
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

      {/* Tooltip: an absolutely positioned box that appears on hover */}
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