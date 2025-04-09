import React from 'react';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';

interface ChartAProps {
  filters: any; // You can refine this type based on your filter data shape
}

// A simple mapping of event types to colors.
// Extend or modify this mapping as needed (e.g., for 25 event types).
const eventColors: { [eventType: string]: string } = {
  EventA: '#0070f3',
  EventB: '#ff4d4f',
  EventC: '#52c41a',
  // Add more events and their colors here…
};

// Sample asset names (groups)
const groups = [
  { id: 1, title: 'Asset 1' },
  { id: 2, title: 'Asset 2' },
  { id: 3, title: 'Asset 3' },
];

// Sample events as items; each item belongs to a group, spans start_time to end_time,
// and has an eventType used for coloring.
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

// Custom item renderer to apply our eventType-based color
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
  // Here you would filter or adjust groups/items based on the passed filters.
  // For this sample, the demo data is static.

  return (
    <div>
      {/* Legend */}
      <div style={{ marginBottom: '20px' }}>
        <strong>Legend:</strong>
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          {Object.entries(eventColors).map(([eventType, color]) => (
            <div
              key={eventType}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: color,
                  borderRadius: '2px'
                }}
              ></div>
              <span>{eventType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Chart */}
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={new Date('2025-03-31')}
        defaultTimeEnd={new Date('2025-04-10')}
        itemRenderer={itemRenderer}
      />
    </div>
  );
};

export default ChartA;