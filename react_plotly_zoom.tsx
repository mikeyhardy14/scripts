import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist';

const MultiPlotZoom: React.FC = () => {
  const chartIds = ['chart1', 'chart2', 'chart3']; // Add all your chart IDs here
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const createCharts = () => {
    const data1 = [{
      x: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01'],
      y: [10, 15, 13, 17],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'red' },
    }];
    const data2 = [{
      x: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01'],
      y: [16, 5, 11, 9],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'blue' },
    }];
    const data3 = [{
      x: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01'],
      y: [12, 9, 15, 12],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'green' },
    }];

    Plotly.newPlot('chart1', data1);
    Plotly.newPlot('chart2', data2);
    Plotly.newPlot('chart3', data3);
  };

  useEffect(() => {
    createCharts();
  }, []);

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
      <div id="chart1" style={{ width: '320px', height: '240px' }}></div>
      <div id="chart2" style={{ width: '320px', height: '240px' }}></div>
      <div id="chart3" style={{ width: '320px', height: '240px' }}></div>
    </div>
  );
};

export default MultiPlotZoom;