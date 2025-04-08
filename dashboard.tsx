import { useState } from 'react';
import Tabs from '../components/Tabs';
import DateRangeFilter from '../components/filters/DateRangeFilter';
import TypeFilter from '../components/filters/TypeFilter';
import EventTypeFilter from '../components/filters/EventTypeFilter';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    type: '',
    eventTypes: [] as string[],
  });

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="card filter-card">
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

      <div className="card">
        <Tabs active={activeTab} onChange={setActiveTab} filters={filters} />
      </div>
    </div>
  );
};

export default Dashboard;