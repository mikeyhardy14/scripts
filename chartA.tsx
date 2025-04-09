import React from 'react';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';

interface ChartAProps {
  filters: any; // Extend this type as needed based on your filtering logic.
}

// A mapping for event types to colors.
// Extend this object with your 25 event types as needed.
const eventColors: { [eventType: string]: string } = {
  EventA: '#0070f3',
  EventB: '#ff4d4f',
  EventC: '#52c41a',
  // Add additional event type/color pairs here…
};

// Sample asset groups — these will appear on the Y-axis.
const groups = [
  { id: 1, title: 'Asset 1' },
  { id: 2, title: 'Asset 2' },
  { id: 3, title: 'Asset 3' },
];

// Sample events (items) to display on the timeline.
const items = [
  {
    id: 1,
    group: 1,
    title: 'EventA',
    start_time: new Date('2025-04-01'),
    end_time: new Date('2025-04-05'),
    eventType: 'EventA'
  },
  {
    id: 2,
    group: 2,
    title: 'EventB',
    start_time: new Date('2025-04-02'),
    end_time: new Date('2025-04-06'),
    eventType: 'EventB'
  },
  {
    id: 3,
    group: 3,
    title: 'EventC',
    start_time: new Date('2025-04-03'),
    end_time: new Date('2025-04-07'),
    eventType: 'EventC'
  }
];

// Custom item renderer to apply the proper event color and styling.
const itemRenderer = ({
  item,
  timelineContext,
  itemContext,
  getItemProps,
  getResizeProps
}: any) => {
  const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
  const backgroundColor = eventColors[item.eventType] || '#999';

  return (
    <div
      {...getItemProps({
        style: {
          background: backgroundColor,
          borderRadius: '4px',
          color: 'white',
          padding: '4px'
        }
      })}
    >
      {item.title}
      {itemContext.useResizeHandle && <div {...leftResizeProps} />}
      {itemContext.useResizeHandle && <div {...rightResizeProps} />}
    </div>
  );
};

const ChartA: React.FC<ChartAProps> = ({ filters }) => {
  // In a complete application you might filter/transform groups or items based on the filters prop.

  return (
    // This container ensures the timeline has a set view. It will extend if more height is needed.
    <div style={{ position: 'relative', minHeight: '500px' }}>
      {/* Legend positioned in the top right of the timeline view */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          zIndex: 10,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <strong style={{ fontSize: '14px' }}>Legend:</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
          {Object.entries(eventColors).map(([eventType, color]) => (
            <div key={eventType} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: color,
                  borderRadius: '2px'
                }}
              />
              <span style={{ fontSize: '12px' }}>{eventType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline is wrapped in a container that occupies the set view height */}
      <div style={{ height: '100%' }}>
        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={new Date('2025-03-31')}
          defaultTimeEnd={new Date('2025-04-10')}
          itemRenderer={itemRenderer}
        />
      </div>
    </div>
  );
};

export default ChartA;