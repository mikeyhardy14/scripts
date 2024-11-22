import React, { useState, useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './MultiPlotZoom.css'; // Import custom styles

const DateInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = React.memo(({ label, value, onChange }) => {
  return (
    <div className="date-input-wrapper">
      <label className="date-label">{label}</label>
      <input
        className="modern-date-input"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
});

const MultiPlotZoom: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const xRange = useMemo<[string, string] | undefined>(() => {
    if (!startDate || !endDate) {
      return undefined;
    }
    return [startDate, endDate];
  }, [startDate, endDate]);

  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date);
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date);
  }, []);

  return (
    <div className="zoom-container">
      <div className="date-range-wrapper">
        <DateInput
          label="Start Date:"
          value={startDate}
          onChange={handleStartDateChange}
        />
        <DateInput
          label="End Date:"
          value={endDate}
          onChange={handleEndDateChange}
        />
        <button className="modern-zoom-button" onClick={() => {}}>
          Zoom
        </button>
      </div>
      
      {/* Chart Components */}
      <Plot
        data={[
          {
            x: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01'],
            y: [10, 15, 13, 17],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'red' },
          },
        ]}
        layout={{
          width: 320,
          height: 240,
          title: 'Chart 1',
          xaxis: xRange ? { range: xRange } : undefined,
        }}
      />
    </div>
  );
};

export default MultiPlotZoom;
