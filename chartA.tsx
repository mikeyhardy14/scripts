import React, { useState, useRef, MouseEvent } from 'react';

// Types for tasks and groups.
interface Task {
  id: string;
  groupId: number;
  name: string;
  start: string; // ISO date string, for example "2025-04-01"
  end: string;   // ISO date string, for example "2025-04-05"
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
  filters?: any;      // Placeholder for filtering logic, if needed
}

const ChartA: React.FC<ChartAProps> = ({
  tasks: propTasks,
  groups: propGroups,
  viewStart,
  viewEnd,
  filters
}) => {
  // Default sample data if none is provided.
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

  const tasks = propTasks && propTasks.length > 0 ? propTasks : defaultTasks;
  const groups = propGroups && propGroups.length > 0 ? propGroups : defaultGroups;

  // Mapping event types to colors.
  const eventColors: { [key: string]: string } = {
    EventA: '#0070f3',
    EventB: '#ff4d4f',
    EventC: '#52c41a'
    // Add additional event type mappings as necessary.
  };

  // Parse task dates.
  const taskDates = tasks.map(task => ({
    start: new Date(task.start),
    end: new Date(task.end)
  }));

  // Compute overall min and max dates from tasks.
  const computedMinTime = Math.min(...taskDates.map(d => d.start.getTime()));
  const computedMaxTime = Math.max(...taskDates.map(d => d.end.getTime()));
  const computedMinDate = new Date(computedMinTime);
  const computedMaxDate = new Date(computedMaxTime);

  // Use the provided view dates if given; otherwise use the computed bounds.
  const effectiveMinDate = viewStart ? new Date(viewStart) : computedMinDate;
  const effectiveMaxDate = viewEnd ? new Date(viewEnd) : computedMaxDate;

  // Chart dimensions.
  const totalWidth = 800;
  const marginLeft = 150;  // space for group labels
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 60; // space for x-axis labels at bottom
  const chartWidth = totalWidth - marginLeft - marginRight;

  // Fixed row and bar dimensions.
  const rowHeight = 20;  
  // Draw a background "bar" for each group that does not fill the entire row,
  // so there’s visible space (gap) between rows.
  const backgroundBarHeight = 12;
  const backgroundBarOffset = (rowHeight - backgroundBarHeight) / 2; // equals 4 px
  // Event bars will be drawn on top, with a slight inset.
  const eventBarPadding = 1;
  const eventBarHeight = backgroundBarHeight - 2 * eventBarPadding; // equals 10 px

  const totalHeight = marginTop + marginBottom + groups.length * rowHeight;

  // Helper: convert a date to an x coordinate within the timeline.
  const dateToX = (date: Date) => {
    return marginLeft + ((date.getTime() - effectiveMinDate.getTime()) / (effectiveMaxDate.getTime() - effectiveMinDate.getTime())) * chartWidth;
  };

  // Generate x-axis tick marks (using 5 evenly spaced ticks).
  const tickCount = 5;
  const ticks: Date[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const tickTime = effectiveMinDate.getTime() + (i * (effectiveMaxDate.getTime() - effectiveMinDate.getTime())) / tickCount;
    ticks.push(new Date(tickTime));
  }

  // Tooltip state.
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update tooltip position and content on hover.
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
      {/* SVG container for the Gantt chart */}
      <svg width={totalWidth} height={totalHeight} style={{ border: '1px solid #ddd', background: '#fff' }}>
        {/* Draw a faint gray background bar for each group row (with gaps between rows) */}
        {groups.map((group, index) => {
          const y = marginTop + index * rowHeight + backgroundBarOffset;
          return (
            <rect
              key={`bg-${group.id}`}
              x={marginLeft}
              y={y}
              width={chartWidth}
              height={backgroundBarHeight}
              fill="rgba(0, 0, 0, 0.03)"
            />
          );
        })}

        {/* Render x-axis ticks and grid lines at the bottom */}
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

        {/* Render event bars on top of the gray background */}
        {tasks.map(task => {
          const groupIndex = groups.findIndex(g => g.id === task.groupId);
          if (groupIndex === -1) return null;
          const taskStart = new Date(task.start);
          const taskEnd = new Date(task.end);
          const x = dateToX(taskStart);
          const xEnd = dateToX(taskEnd);
          // Calculate y: start at the row top plus the inset for the event bar.
          const y = marginTop + groupIndex * rowHeight + backgroundBarOffset + eventBarPadding;
          const width = xEnd - x;
          return (
            <g key={task.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={eventBarHeight}
                fill={eventColors[task.eventType] || '#999'}
                rx="2"
                ry="2"
                onMouseMove={(e) => handleMouseMove(e, task)}
                onMouseEnter={(e) => handleMouseMove(e, task)}
                onMouseLeave={handleMouseLeave}
              />
              {/* Optional centered text on the event bar */}
              <text
                x={x + width / 2}
                y={y + eventBarHeight / 2}
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

      {/* Tooltip for event details on hover */}
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