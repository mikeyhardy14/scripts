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

  const renderContent = () => {
    switch (active) {
      case 'Chart A':
        return <ChartA filters={filters} />;
      case 'Chart B':
        return <ChartB filters={filters} />;
      case 'Chart C':
        return <ChartC filters={filters} />;
      default:
        return <div style={{ padding: '20px', textAlign: 'center' }}>Select a chart tab.</div>;
    }
  };

  return (
    <div>
      <div className="tab-buttons">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`tab-button ${tab === active ? 'active' : ''}`}
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