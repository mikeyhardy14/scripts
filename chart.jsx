import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import './MultiPlotZoom.css';

const MultiPlotZoom: React.FC = () => {
  const [chartsPerRow, setChartsPerRow] = useState(3); // Default to 3 charts per row

  const chartData = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    label: `Chart ${index + 1}`,
    data: {
      x: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01'],
      y: [10 + index, 15 + index, 13 + index, 17 + index],
    },
  }));

  const handleChartsPerRowChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChartsPerRow(parseInt(e.target.value, 10));
  };

  return (
    <div className="zoom-container">
      {/* Controls */}
      <div className="controls">
        <label htmlFor="charts-per-row">Charts per row: </label>
        <select
          id="charts-per-row"
          value={chartsPerRow}
          onChange={handleChartsPerRowChange}
          className="modern-select"
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Chart Grid */}
      <div
        className="chart-grid"
        style={{
          gridTemplateColumns: `repeat(${chartsPerRow}, 1fr)`,
        }}
      >
        {chartData.map((chart) => (
          <div key={chart.id} className="chart-item">
            <Plot
              data={[
                {
                  x: chart.data.x,
                  y: chart.data.y,
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: 'red' },
                },
              ]}
              layout={{
                title: chart.label,
                width: undefined,
                height: undefined,
                margin: { l: 30, r: 10, t: 30, b: 30 },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiPlotZoom;
