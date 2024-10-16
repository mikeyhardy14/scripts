import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const MultiPlotZoom: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [xRange, setXRange] = useState<[string, string] | undefined>(undefined);

  const zoomCharts = () => {
    if (!startDate || !endDate) {
      alert('Please enter valid dates.');
      return;
    }
    setXRange([startDate, endDate]); // Set the new range for the charts
  };

  return (
    <div>
      <div>
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={zoomCharts}>Zoom</button>
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