import React, { useState } from 'react';
import './DropdownSort.css'; // Import the external CSS file

interface Option {
  id: string | number;
  label: string;
  value: string | number;
}

interface DropdownSortProps {
  options: Option[];
  onSelect: (value: string | number) => void;
  defaultSelected?: string | number;
}

const DropdownSort: React.FC<DropdownSortProps> = ({ 
  options, 
  onSelect, 
  defaultSelected 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | number | null>(defaultSelected || null);

  const handleOptionClick = (value: string | number) => {
    setSelectedOption(value);
    onSelect(value);
  };

  return (
    <div className="dropdown-sort-container">
      {options.map((option) => (
        <button 
          key={option.id} 
          className={`dropdown-sort-option ${selectedOption === option.value ? 'selected' : ''}`} 
          onClick={() => handleOptionClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default DropdownSort;