import React from 'react';

interface Task {
  id: string;
  groupId: number;
  name: string;
  start: string; // ISO date string
  end: string;   // ISO date string
  eventType: string;
}

interface Group {
  id: number;
  title: string;
}

interface ChartAProps {
  filters: any; // Extend this type and use filters as needed.
}

const ChartA: React.FC<ChartAProps> = ({ filters }) => {
  // Sample tasks data (replace or filter based on the filters prop)
  const tasks: Task[] = [
    { id: '1', groupId: 1, name: 'Asset 1', start: '2025-04-01', end: '2025-04-05', eventType: 'EventA' },
    { id: '2', groupId: 2, name: 'Asset 2', start: '2025-04-02', end: '2025-04-06', eventType: 'EventB' },
    { id: '3', groupId: 3, name: 'Asset 3', start: '2025-04-03', end: '2025-04-07', eventType: 'EventC' },
  ];

  // Groups for the y-axis; each group corresponds to an asset.
  const groups: Group[] = [
    { id: 1, title: 'Asset 1' },
    { id: 2, title: 'Asset 2' },
    { id: 3, title: 'Asset 3' },
  ];

  // Mapping event types to colors
  const eventColors: { [key: string]: string } = {
    EventA: '#0070f3',
    EventB: '#ff4d4f',
    EventC: '#52c41a'
    // Add more event types as needed...
  };

  // Parse the task dates into Date objects
  const taskDates = tasks.map(task => ({
    start: new Date(task.start),
    end: new Date(task.end)
  }));

  // Determine the time bounds of the chart (min start and max end)
  const minTime = Math.min(...taskDates.map(d => d.start.getTime()));
  const maxTime = Math.max(...taskDates.map(d => d.end.getTime()));
  const minDate = new Date(minTime);
  const maxDate = new Date(maxTime);

  // Dimensions for the SVG chart
  const totalWidth = 800;
  const marginLeft = 150;  // space for group labels
  const marginRight = 20;
  const marginTop = 40;
  const marginBottom = 40;
  const chartWidth = totalWidth - marginLeft - marginRight;
  const rowHeight = 50;
  const barHeight = 20;
  const totalHeight = marginTop + marginBottom + groups.length * rowHeight;

  // Helper: map a date to an x coordinate within the chart area.
  const dateToX = (date: Date) => {
    return marginLeft + ((date.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * chartWidth;
  };

  // Generate a few x-axis ticks (here, 5 ticks evenly spaced)
  const tickCount = 5;
  const ticks: Date[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const tickTime = minDate.getTime() + (i * (maxDate.getTime() - minDate.getTime())) / tickCount;
    ticks.push(new Date(tickTime));
  }

  return (
    <div
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

      {/* SVG Container for the timeline chart */}
      <svg width={totalWidth} height={totalHeight} style={{ border: '1px solid #ddd', background: '#fff' }}>
        {/* Render x-axis ticks */}
        {ticks.map((tick, index) => {
          const x = dateToX(tick);
          return (
            <g key={index}>
              <line x1={x} y1={marginTop - 5} x2={x} y2={totalHeight - marginBottom} stroke="#ccc" />
              <text x={x} y={marginTop - 10} textAnchor="middle" fontSize="10" fill="#333">
                {tick.toLocaleDateString()}
              </text>
            </g>
          );
        })}

        {/* Render group labels along the left side */}
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

        {/* Render tasks as bars */}
        {tasks.map(task => {
          // Determine the group/row for this task
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
                rx="4"
                ry="4"
              />
              <text
                x={x + width / 2}
                y={y + barHeight / 2}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="10"
                fill="#fff"
              >
                {task.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ChartA;