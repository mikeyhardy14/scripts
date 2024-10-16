import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist';

const MultiPlotZoom: React.FC = () => {
  const chartIds = ['chart1', 'chart2', 'chart3']; // Add all your chart IDs here
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const zoomCharts = () => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (isNaN(start) || isNaN(end)) {
      alert('Please enter valid dates.');
      return;
    }

    chartIds.forEach((chartId) => {
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        Plotly.relayout(chartElement, {
          'xaxis.range': [start, end],
        });
      }
    });
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
      <div id="chart1">
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
          layout={{ width: 320, height: 240, title: 'Chart 1' }}
        />
      </div>
      <div id="chart2">
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
          layout={{ width: 320, height: 240, title: 'Chart 2' }}
        />
      </div>
      <div id="chart3">
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
          layout={{ width: 320, height: 240, title: 'Chart 3' }}
        />
      </div>
    </div>
  );
};

export default MultiPlotZoom;