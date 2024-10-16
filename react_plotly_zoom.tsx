import React, { useState, useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';

// Memoized Input Component to avoid re-renders when not necessary
const DateInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = React.memo(({ label, value, onChange }) => {
  console.log(`${label} rendered`); // for debugging

  return (
    <div>
      <label>{label}</label>
      <input
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

  // Memoize the xRange calculation based on the startDate and endDate
  const xRange = useMemo<[string, string] | undefined>(() => {
    if (!startDate || !endDate) {
      return undefined; // No zoom range if dates are invalid
    }
    return [startDate, endDate];
  }, [startDate, endDate]);

  // Memoize input handlers to avoid re-creating them on each render
  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date);
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date);
  }, []);

  return (
    <div>
      <div>
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
        <button onClick={() => setStartDate(startDate) && setEndDate(endDate)}>
          Zoom
        </button>
      </div>
      
      {/* Chart 1 */}
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
          xaxis: xRange ? { range: xRange } : undefined, // Apply the x-axis range based on zoom
        }}
      />

      {/* Chart 2 */}
      <Plot
        data={[
          {
            x: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01'],
            y: [16, 5, 11, 9],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' },
          },
        ]}
        layout={{
          width: 320,
          height: 240,
          title: 'Chart 2',
          xaxis: xRange ? { range: xRange } : undefined, // Apply the x-axis range based on zoom
        }}
      />

      {/* Chart 3 */}
      <Plot
        data={[
          {
            x: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01'],
            y: [12, 9, 15, 12],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'green' },
          },
        ]}
        layout={{
          width: 320,
          height: 240,
          title: 'Chart 3',
          xaxis: xRange ? { range: xRange } : undefined, // Apply the x-axis range based on zoom
        }}
      />
    </div>
  );
};

export default MultiPlotZoom;