import React from 'react';
import DropdownSort from './DropdownSort';

const ParentComponent: React.FC = () => {
  const options = [
    { id: 1, label: 'Option 1', value: 'option1' },
    { id: 2, label: 'Option 2', value: 'option2' },
    { id: 3, label: 'Option 3', value: 'option3' },
    { id: 4, label: 'Option 4', value: 'option4' },
  ];

  // Custom function to handle selection
  const handleSelection = (selectedValue: string | number) => {
    console.log('Selected option:', selectedValue);
    // Additional logic specific to your app
  };

  return (
    <div>
      <h1>Select an Option</h1>
      <DropdownSort 
        options={options} 
        onSelect={handleSelection} 
        defaultSelected="option2" 
      />
    </div>
  );
};

export default ParentComponent;