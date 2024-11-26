import React, { useState, useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './MultiPlotZoom.css';

interface ChartRow {
  id: number;
  startDate: string;
  endDate: string;
  label: string;
}

const MultiPlotZoom: React.FC = () => {
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [nextId, setNextId] = useState(1);

  // Add a new row input
  const addRow = () => {
    setRows([...rows, { id: nextId, startDate: '', endDate: '', label: '' }]);
    setNextId(nextId + 1);
  };

  // Update a row's data
  const updateRow = (id: number, field: keyof ChartRow, value: string) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Remove a row
  const removeRow = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  // Generate xRange for a specific row
  const getXRange = useMemo(() => {
    return (startDate: string, endDate: string): [string, string] | undefined => {
      if (!startDate || !endDate) {
        return undefined;
      }
      return [startDate, endDate];
    };
  }, []);

  return (
    <div className="zoom-container">
      <div className="filter-wrapper">
        <button className="modern-button" onClick={addRow}>
          Add Row
        </button>
      </div>

      {/* Input Rows */}
      <div className="row-wrapper">
        {rows.map((row) => (
          <div key={row.id} className="input-row">
            <input
              type="date"
              className="modern-date-input"
              value={row.startDate}
              onChange={(e) =>
                updateRow(row.id, 'startDate', e.target.value)
              }
              placeholder="Start Date"
            />
            <input
              type="date"
              className="modern-date-input"
              value={row.endDate}
              onChange={(e) => updateRow(row.id, 'endDate', e.target.value)}
              placeholder="End Date"
            />
            <input
              type="text"
              className="modern-text-input"
              value={row.label}
              onChange={(e) => updateRow(row.id, 'label', e.target.value)}
              placeholder="Label"
            />
            <button
              className="modern-button remove-button"
              onClick={() => removeRow(row.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Generated Charts */}
      <div className="chart-wrapper">
        {rows.map((row) => (
          <Plot
            key={row.id}
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
              title: row.label || `Chart ${row.id}`,
              xaxis: row.startDate && row.endDate ? { range: getXRange(row.startDate, row.endDate) } : undefined,
              margin: { l: 30, r: 10, t: 30, b: 30 },
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MultiPlotZoom;
