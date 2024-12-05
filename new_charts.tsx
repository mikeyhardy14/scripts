import React, { useState } from 'react';
import Plot from 'react-plotly.js';

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
    <div>
      {/* Filter Section */}
      <div style={{ marginBottom: '20px' }}>
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
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${chartsPerRow}, 1fr)`,
          gap: '20px',
        }}
      >
        {chartData.map((chart, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <Plot data={chart.data} layout={chart.layout} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartPage;
