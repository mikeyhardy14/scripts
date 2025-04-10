import React, { useState, useRef, MouseEvent } from 'react';

//
// Define the type for each dictator event.
//
export interface DictatorEvent {
  Name: string;       // e.g., "Adolf Hitler"
  Start: string;      // ISO date string, e.g., "1933-01-30"
  End: string;        // ISO date string, e.g., "1945-04-30"
  EventType: string;  // e.g., "Totalitarian"
}

export interface TimelineChartProps {
  events: DictatorEvent[];              // List of dictator events
  colorMap: { [key: string]: string };   // Mapping: EventType -> color hex
  assets: string[];                     // List of asset names (each will be a row)
  viewStart?: string;                   // Optional ISO date string for chart start view
  viewEnd?: string;                     // Optional ISO date string for chart end view
}

interface TooltipData {
  x: number;
  y: number;
  content: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  events,
  colorMap,
  assets,
  viewStart,
  viewEnd
}) => {
  // Only render if there are events.
  if (!events || events.length === 0) {
    return null;
  }

  // Compute overall time bounds from events.
  const eventDates = events.map(evt => ({
    start: new Date(evt.Start),
    end: new Date(evt.End)
  }));
  const computedMinTime = Math.min(...eventDates.map(d => d.start.getTime()));
  const computedMaxTime = Math.max(...eventDates.map(d => d.end.getTime()));
  const computedMinDate = new Date(computedMinTime);
  const computedMaxDate = new Date(computedMaxTime);
  const effectiveMinDate = viewStart ? new Date(viewStart) : computedMinDate;
  const effectiveMaxDate = viewEnd ? new Date(viewEnd) : computedMaxDate;

  // Chart dimensions and layout.
  const totalWidth = 800;
  const marginLeft = 150;  // space on left for asset labels
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 60; // space at bottom for x-axis tick labels
  const chartWidth = totalWidth - marginLeft - marginRight;
  
  const rowHeight = 20;          // fixed row height per asset
  const backgroundBarHeight = 12;  // height of the gray background bar
  const backgroundBarOffset = (rowHeight - backgroundBarHeight) / 2;
  const eventBarPadding = 1;     // inset for event bar
  const eventBarHeight = backgroundBarHeight - 2 * eventBarPadding;
  const totalHeight = marginTop + marginBottom + assets.length * rowHeight;
  
  // Helper: Map a Date to an x-coordinate within the chart.
  const dateToX = (date: Date) => {
    return marginLeft + ((date.getTime() - effectiveMinDate.getTime()) /
      (effectiveMaxDate.getTime() - effectiveMinDate.getTime())) * chartWidth;
  };

  // Generate x-axis tick marks (using 5 evenly spaced ticks).
  const tickCount = 5;
  const ticks: Date[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const tickTime = effectiveMinDate.getTime() +
      (i * (effectiveMaxDate.getTime() - effectiveMinDate.getTime())) / tickCount;
    ticks.push(new Date(tickTime));
  }

  // Tooltip state.
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent, evt: DictatorEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const content = `${evt.Name}\n${new Date(evt.Start).toLocaleDateString()} - ${new Date(evt.End).toLocaleDateString()}`;
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
      {/* SVG container for the timeline chart */}
      <svg width={totalWidth} height={totalHeight} style={{ border: '1px solid #ddd', background: '#fff' }}>
        {/* Render gray background bars for each asset row */}
        {assets.map((asset, index) => {
          const y = marginTop + index * rowHeight + backgroundBarOffset;
          return (
            <rect
              key={`bg-${asset}`}
              x={marginLeft}
              y={y}
              width={chartWidth}
              height={backgroundBarHeight}
              fill="rgba(0, 0, 0, 0.03)"
            />
          );
        })}
        
        {/* Render x-axis tick marks and grid lines at the bottom */}
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

        {/* Render asset labels on the left */}
        {assets.map((asset, index) => {
          const y = marginTop + index * rowHeight + rowHeight / 2;
          return (
            <text
              key={asset}
              x={marginLeft - 10}
              y={y}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize="12"
              fill="#333"
            >
              {asset}
            </text>
          );
        })}

        {/* Render event bars on top of the background bars.
            Each event is drawn on the row corresponding to the asset whose name matches the event's Name.
        */}
        {events.map((evt, idx) => {
          const assetIndex = assets.indexOf(evt.Name);
          if (assetIndex === -1) return null;
          
          const eventStart = new Date(evt.Start);
          const eventEnd = new Date(evt.End);
          const x = dateToX(eventStart);
          const xEnd = dateToX(eventEnd);
          const y = marginTop + assetIndex * rowHeight + backgroundBarOffset + eventBarPadding;
          const width = xEnd - x;
          
          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={width}
                height={eventBarHeight}
                fill={colorMap[evt.EventType] || '#999'}
                rx="2"
                ry="2"
                onMouseMove={(e) => handleMouseMove(e, evt)}
                onMouseEnter={(e) => handleMouseMove(e, evt)}
                onMouseLeave={handleMouseLeave}
              />
              <text
                x={x + width / 2}
                y={y + eventBarHeight / 2}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="10"
                fill="#fff"
                pointerEvents="none"
              >
                {evt.Name}
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

export default TimelineChart;
