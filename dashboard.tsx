import { useState } from 'react';
import Tabs from '../components/Tabs';
import DateRangeFilter from '../components/filters/DateRangeFilter';
import TypeFilter from '../components/filters/TypeFilter';
import EventTypeFilter from '../components/filters/EventTypeFilter';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    type: '',
    eventTypes: [] as string[],
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={`${styles.card} ${styles.filterCard}`}>
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

      <div className={styles.card}>
        <Tabs active={activeTab} onChange={setActiveTab} filters={filters} />
      </div>
    </div>
  );
};

export default Dashboard;