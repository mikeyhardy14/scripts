import Plot from 'react-plotly.js';

interface Event {
  name: string;
  start: string;
  end: string;
  eventType: string;
}

interface Props {
  filters: any;
}

const sampleData: Event[] = [
  { name: 'Asset A', start: '2025-04-01', end: '2025-04-04', eventType: 'Outage' },
  { name: 'Asset A', start: '2025-04-06', end: '2025-04-08', eventType: 'Maintenance' },
  { name: 'Asset B', start: '2025-04-02', end: '2025-04-07', eventType: 'Upgrade' },
  { name: 'Asset C', start: '2025-04-03', end: '2025-04-06', eventType: 'Inspection' },
];

// Define consistent colors per event type
const eventColors: Record<string, string> = {
  Outage: '#ff4d4f',
  Maintenance: '#1890ff',
  Upgrade: '#52c41a',
  Inspection: '#faad14',
};

const ChartA = ({ filters }: Props) => {
  const traces = sampleData.map((event, index) => ({
    x: [event.start, event.end],
    y: [event.name, event.name],
    type: 'scatter',
    mode: 'lines',
    line: {
      width: 20,
      color: eventColors[event.eventType] || '#ccc',
    },
    name: event.eventType,
    hoverinfo: 'x+y+name',
    showlegend: !tracesAlreadyAdded[event.eventType],
  }));

  // Avoid duplicate legends
  const tracesAlreadyAdded: Record<string, boolean> = {};
  const uniqueTraces = traces.filter((trace) => {
    const exists = tracesAlreadyAdded[trace.name];
    tracesAlreadyAdded[trace.name] = true;
    return !exists;
  });

  return (
    <Plot
      data={traces}
      layout={{
        title: 'Asset Timeline',
        height: 400,
        margin: { l: 120, r: 40, t: 40, b: 40 },
        xaxis: {
          title: 'Date',
          type: 'date',
        },
        yaxis: {
          title: 'Assets',
        },
        legend: {
          orientation: 'h',
          x: 0,
          y: -0.2,
        },
      }}
      config={{ responsive: true }}
      style={{ width: '100%' }}
    />
  );
};

export default ChartA;