import { useState } from 'react';
import Tabs from '../components/Tabs';
import DateRangeFilter from '../components/filters/DateRangeFilter';
import TypeFilter from '../components/filters/TypeFilter';
import EventTypeFilter from '../components/filters/EventTypeFilter';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    type: '',
    eventTypes: [] as string[],
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '20px' }}>
        <DateRangeFilter
          value={filters.dateRange}
          onChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
        />
        <TypeFilter
          value={filters.type}
          onChange={(type) => setFilters(prev => ({ ...prev, type }))}
        />
        <EventTypeFilter
          value={filters.eventTypes}
          onChange={(eventTypes) => setFilters(prev => ({ ...prev, eventTypes }))}
        />
      </div>

      <Tabs active={activeTab} onChange={setActiveTab} filters={filters} />
    </div>
  );
};

export default Dashboard;