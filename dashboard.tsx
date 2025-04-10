import React, { useEffect, useState } from 'react';
import ToggleSwitch from './components/ToggleSwitch'; // Adjust the import path as needed

// Define the expected shape of the fetched type data.
interface TypeData {
  Type: string;
  Color: string;
}

const Dashboard: React.FC = () => {
  // State to hold the fetched type options.
  const [typeOptions, setTypeOptions] = useState<TypeData[]>([]);
  // State to hold the toggle states for each type.
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>({});

  // Fetch the types from localhost/Type when the component mounts.
  useEffect(() => {
    fetch('http://localhost/Type')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: TypeData[]) => {
        setTypeOptions(data);
        // Initialize toggleStates for each type as false.
        const initialStates: { [key: string]: boolean } = {};
        data.forEach(item => {
          initialStates[item.Type] = false;
        });
        setToggleStates(initialStates);
      })
      .catch((err) => {
        console.error("Error fetching types:", err);
      });
  }, []);

  // Handler for when a toggle changes.
  const handleToggleChange = (id: string, checked: boolean) => {
    setToggleStates(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Filters</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {typeOptions.map(type => (
          <ToggleSwitch 
            key={type.Type}
            id={type.Type}
            label={type.Type}
            checked={toggleStates[type.Type] || false}
            onChange={(checked: boolean) => handleToggleChange(type.Type, checked)}
            onColor={type.Color}
            offColor="#A9A9A9"
          />
        ))}
      </div>

      {/* Other Dashboard content goes here (e.g., tabs, charts, etc.) */}
      <div style={{ marginTop: '40px' }}>
        {/* This is where you might render your Tabs component, passing along additional data and filters */}
        <p>Other Dashboard content goes here…</p>
      </div>
    </div>
  );
};

export default Dashboard;