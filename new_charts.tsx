import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import './ChartPage.css'; // Import the CSS file

const ChartPage: React.FC = () => {
  const [chartsPerRow, setChartsPerRow] = useState(3); // Default: 3 charts per row

  // Example chart data
  const chartData = Array.from({ length: 30 }, (_, index) => ({
    data: [
      {
        x: [1, 2, 3],
        y: [index + 1, index + 2, index + 3],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'blue' },
      },
    ],
    layout: { title: `Chart ${index + 1}` },
  }));

  return (
    <div className="chart-page">
      {/* Filter Section */}
      <div className="filter-section">
        <label htmlFor="chartsPerRow">Charts per row: </label>
        <select
          id="chartsPerRow"
          value={chartsPerRow}
          onChange={(e) => setChartsPerRow(Number(e.target.value))}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div
        className="charts-grid"
        style={{
          gridTemplateColumns: `repeat(${chartsPerRow}, 1fr)`,
        }}
      >
        {chartData.map((chart, index) => (
          <div key={index} className="chart-container">
            <Plot data={chart.data} layout={chart.layout} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartPage;
