import React, { useState } from 'react';
import styles from './OptionsSelector.module.css'; // Custom styles for the component

interface Option {
  id: string | number;
  label: string;
  value: string | number;
}

interface OptionsSelectorProps {
  options: Option[];
  onSelect: (value: string | number) => void;
  multiple?: boolean; // Allows multiple selection if true
  defaultSelected?: string | number | string[] | number[];
}

const OptionsSelector: React.FC<OptionsSelectorProps> = ({ 
  options, 
  onSelect, 
  multiple = false, 
  defaultSelected 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[] | number[]>(
    Array.isArray(defaultSelected) ? defaultSelected : defaultSelected ? [defaultSelected] : []
  );

  const handleOptionClick = (value: string | number) => {
    if (multiple) {
      setSelectedOptions((prev) => 
        prev.includes(value) 
          ? prev.filter((option) => option !== value) 
          : [...prev, value]
      );
    } else {
      setSelectedOptions([value]);
    }
    onSelect(value);
  };

  const isSelected = (value: string | number) => selectedOptions.includes(value);

  return (
    <div className={styles.optionsContainer}>
      {options.map((option) => (
        <button 
          key={option.id} 
          className={`${styles.optionButton} ${isSelected(option.value) ? styles.selected : ''}`} 
          onClick={() => handleOptionClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default OptionsSelector;