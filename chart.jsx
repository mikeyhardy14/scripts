import React, { useState, useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './MultiPlotZoom.css';

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
        <input
          type="date"
          className="modern-date-input"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
        />
        <input
          type="date"
          className="modern-date-input"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
        />
        <button className="modern-button">Apply Date Range</button>
        <button className="modern-button">Toggle Mod View</button>
        <button className="modern-button">Toggle Error Bounds</button>
        <button className="modern-button">Clear Deploy</button>
      </div>
      <div className="chart-wrapper">
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
            width: 600,
            height: 400,
            title: 'Chart',
            xaxis: xRange ? { range: xRange } : undefined,
            margin: { l: 30, r: 10, t: 30, b: 30 }, // Reduced margins
          }}
          config={{
            displayModeBar: false, // Hides the Plotly toolbar
          }}
        />
      </div>
    </div>
  );
};

export default MultiPlotZoom;
