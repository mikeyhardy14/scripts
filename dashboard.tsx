import React, { useState } from 'react';
import Tabs, { ChartData } from '../components/Tabs';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  // Sample chart data.
  const chartData: ChartData = {
    events: [
      { Name: "Adolf Hitler", Start: "1933-01-30", End: "1945-04-30", EventType: "Totalitarian" },
      { Name: "Joseph Stalin", Start: "1924-03-05", End: "1953-03-05", EventType: "Communist" }
    ],
    colorMap: {
      Totalitarian: "#ff4d4f",
      Communist: "#52c41a"
    },
    assets: ["Adolf Hitler", "Joseph Stalin"]
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <Tabs 
          active={activeTab} 
          onChange={setActiveTab} 
          filters={{}} 
          chartData={chartData} 
      />
    </div>
  );
};

export default Dashboard;
