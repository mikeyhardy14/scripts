import { useMemo } from 'react';
import ChartA from './charts/ChartA';
import ChartB from './charts/ChartB';
import ChartC from './charts/ChartC';

interface Props {
  active: string;
  onChange: (tab: string) => void;
  filters: any;
}

const Tabs = ({ active, onChange, filters }: Props) => {
  const tabs = ['Overview', 'Chart A', 'Chart B', 'Chart C'];

  const renderContent = useMemo(() => {
    switch (active) {
      case 'Chart A':
        return <ChartA filters={filters} />;
      case 'Chart B':
        return <ChartB filters={filters} />;
      case 'Chart C':
        return <ChartC filters={filters} />;
      default:
        return <div>Select a chart tab.</div>;
    }
  }, [active, filters]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '10px' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              padding: '10px 15px',
              background: tab === active ? '#0070f3' : '#eaeaea',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
              color: tab === active ? 'white' : 'black',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {renderContent}
    </div>
  );
};

export default Tabs;