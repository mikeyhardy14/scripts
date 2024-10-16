import React from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist';

const MultiPlotZoom: React.FC = () => {
  const chartIds = ['chart1', 'chart2', 'chart3']; // Add all your chart IDs here

  const zoomCharts = (zoomIn: boolean) => {
    const zoomFactor = zoomIn ? 0.8 : 1.25; // Use < 1 for zoom in, > 1 for zoom out
    chartIds.forEach((chartId) => {
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        Plotly.relayout(chartElement, {
          'xaxis.range[0]': 0,  // Adjust the range according to your data
          'xaxis.range[1]': 10 * zoomFactor,
          'yaxis.range[0]': 0,  // Adjust the range according to your data
          'yaxis.range[1]': 10 * zoomFactor
        });
      }
    });
  };

  return (
    <div>
      <div>
        <button onClick={() => zoomCharts(true)}>Zoom In</button>
        <button onClick={() => zoomCharts(false)}>Zoom Out</button>
      </div>
      <div id="chart1">
        <Plot
          data={[
            {
              x: [1, 2, 3, 4],
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
              x: [1, 2, 3, 4],
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
              x: [1, 2, 3, 4],
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