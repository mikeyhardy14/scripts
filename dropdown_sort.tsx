import React, { useState } from 'react';
import './DropdownSort.css';

interface Option {
  id: string | number;
  label: string;
  value: string | number;
}

interface DropdownSortProps {
  options: Option[];
  onSelect: (value: string | number) => void; // Function to execute on selection
  defaultSelected?: string | number; // Default selected value (optional)
}

const DropdownSort: React.FC<DropdownSortProps> = ({ 
  options, 
  onSelect, 
  defaultSelected 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(defaultSelected || null);

  const handleOptionClick = (value: string | number) => {
    setSelectedOption(value); // Update local state
    setIsOpen(false); // Close the dropdown
    onSelect(value); // Call the passed function with the selected value
  };

  return (
    <div className="dropdown-sort">
      <div 
        className="dropdown-sort-header" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption 
          ? options.find(option => option.value === selectedOption)?.label 
          : "Select an Option ..."}
        <span className={`dropdown-sort-arrow ${isOpen ? 'open' : ''}`}>&#9660;</span>
      </div>
      {isOpen && (
        <ul className="dropdown-sort-list">
          {options.map((option) => (
            <li 
              key={option.id} 
              className={`dropdown-sort-item ${selectedOption === option.value ? 'selected' : ''}`} 
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownSort;