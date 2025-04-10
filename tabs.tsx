import React, { useState } from 'react';
import ChartA, { DictatorEvent } from './ChartA';

interface Filters {
  startDate: string;
  endDate: string;
  // You can extend this interface with more filter fields as needed.
}

interface FetchedData {
  events: DictatorEvent[];
  assets: string[];
  colorMap: { [key: string]: string };
}

const Tabs: React.FC = () => {
  // Active tab state (for example, "Chart A" or "Other Tab")
  const [activeTab, setActiveTab] = useState('Chart A');

  // Filter input state
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: ''
  });

  // State to hold fetched data
  const [data, setData] = useState<FetchedData>({
    events: [],
    assets: [],
    colorMap: {}
  });
  
  // Loading state for our simulated fetch
  const [loading, setLoading] = useState(false);

  // When the Apply button is pressed,
  // fetch and parse data within this component.
  const handleApply = async () => {
    setLoading(true);
    // Simulate an asynchronous fetch (replace this with your real API call)
    setTimeout(() => {
      // Sample data: list of dictator events.
      const sampleEvents: DictatorEvent[] = [
        {
          Name: 'Dictator A',
          Start: '1933-01-30',
          End: '1945-04-30',
          EventType: 'Totalitarian'
        },
        {
          Name: 'Dictator B',
          Start: '1925-05-15',
          End: '1935-05-15',
          EventType: 'Autocratic'
        },
        {
          Name: 'Dictator C',
          Start: '1940-03-01',
          End: '1950-03-01',
          EventType: 'Militaristic'
        }
      ];

      // Sample asset list (each should match an event's Name for the chart row)
      const sampleAssets = ['Dictator A', 'Dictator B', 'Dictator C'];

      // Sample color mapping for event types
      const sampleColorMap = {
        Totalitarian: '#ff5555',
        Autocratic: '#55ff55',
        Militaristic: '#5555ff'
      };

      // Update state with the fetched data
      setData({
        events: sampleEvents,
        assets: sampleAssets,
        colorMap: sampleColorMap
      });
      setLoading(false);
    }, 1000); // simulate a 1-second fetch delay
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      
      {/* Filter panel and Apply button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div>
          <label htmlFor="startDate">Start Date:</label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="endDate">End Date:</label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Apply'}
        </button>
      </div>
      
      {/* Tab header buttons */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={() => setActiveTab('Chart A')}
          style={{ flex: 1, padding: '10px' }}
        >
          Chart A
        </button>
        <button
          onClick={() => setActiveTab('Other Tab')}
          style={{ flex: 1, padding: '10px' }}
        >
          Other Tab
        </button>
      </div>
      
      {/* Tab content */}
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '20px'
        }}
      >
        {activeTab === 'Chart A' && (
          <ChartA
            events={data.events}
            assets={data.assets}
            colorMap={data.colorMap}
            viewStart={filters.startDate || undefined}
            viewEnd={filters.endDate || undefined}
          />
        )}
        {activeTab === 'Other Tab' && <div>Other content goes here.</div>}
      </div>
    </div>
  );
};

export default Tabs;
