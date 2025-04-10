import React from 'react';
import TimelineChart, { DictatorEvent } from './charts/TimelineChart';

//
// Define a type for the data you pass to TimelineChart.
//
export interface ChartData {
  events: DictatorEvent[];
  colorMap: { [key: string]: string };
  assets: string[];
}

interface TabsProps {
  active: string;
  onChange: (tab: string) => void;
  filters: any;
  chartData?: ChartData;
}

const Tabs: React.FC<TabsProps> = ({ active, onChange, filters, chartData }) => {
  // Define your tab names.
  const tabs = ['Overview', 'TimelineChart', 'ChartB'];

  const renderContent = () => {
    switch (active) {
      case 'TimelineChart':
        if (!chartData || !chartData.events || chartData.events.length === 0) {
          return <div style={{ padding: '20px' }}>No data provided for TimelineChart.</div>;
        }
        return <TimelineChart 
                  events={chartData.events} 
                  colorMap={chartData.colorMap} 
                  assets={chartData.assets}
               />;
      // Placeholders for the other tabs:
      case 'Overview':
        return <div style={{ padding: '20px' }}>Overview Content (to be built later)</div>;
      case 'ChartB':
        return <div style={{ padding: '20px' }}>ChartB Content (to be built later)</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '10px' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              flex: 1,
              padding: '10px 15px',
              background: tab === active ? '#0070f3' : '#eaeaea',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
              color: tab === active ? 'white' : 'black'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
};

export default Tabs;
