import React, { useState } from 'react';
import styles from './CustomCheckbox.module.css';

interface CustomCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked = false, onChange }) => {
  const [isChecked, setIsChecked] = useState<boolean>(checked);

  const handleCheckboxChange = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <label className={styles.checkboxContainer}>
      <input 
        type="checkbox" 
        className={styles.hiddenCheckbox} 
        checked={isChecked} 
        onChange={handleCheckboxChange} 
      />
      <span className={styles.customCheckbox}>
        {isChecked && <span className={styles.checkmark} />}
      </span>
      <span className={styles.labelText}>{label}</span>
    </label>
  );
};

export default CustomCheckbox;