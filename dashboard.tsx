import React, { useEffect, useState } from 'react';
import ToggleSwitch from './components/ToggleSwitch'; // Adjust the import path as needed

// The JSON is expected to be a dictionary with key as the type and value as the color.
const Dashboard: React.FC = () => {
  // State for the fetched types (a dictionary mapping type -> color)
  const [typeOptions, setTypeOptions] = useState<{ [key: string]: string }>({});
  // State for the toggle states, where keys are type names.
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>({});

  // Fetch data from localhost/Type when the component mounts.
  useEffect(() => {
    fetch('http://localhost/Type')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: { [key: string]: string }) => {
        setTypeOptions(data);
        // Initialize toggleStates for each type as false.
        const initialStates: { [key: string]: boolean } = {};
        Object.keys(data).forEach((type) => {
          initialStates[type] = false;
        });
        setToggleStates(initialStates);
      })
      .catch((err) => {
        console.error("Error fetching types:", err);
      });
  }, []);

  // Handler to update state when a toggle changes.
  const handleToggleChange = (id: string, checked: boolean) => {
    setToggleStates((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Filters</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {/* Map over the dictionary entries to render a ToggleSwitch for each type */}
        {Object.entries(typeOptions).map(([type, color]) => (
          <ToggleSwitch 
            key={type}
            id={type}
            label={type}
            checked={toggleStates[type] || false}
            onChange={(checked: boolean) => handleToggleChange(type, checked)}
            onColor={color}
            offColor="#A9A9A9"
          />
        ))}
      </div>

      {/* Other Dashboard content goes here (e.g., tabs, charts, etc.) */}
      <div style={{ marginTop: '40px' }}>
        <p>Other Dashboard content goes here…</p>
      </div>
    </div>
  );
};

export default Dashboard;