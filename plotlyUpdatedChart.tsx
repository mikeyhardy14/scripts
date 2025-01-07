import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
// If you want colorConfig for other reasons, import it. Not strictly needed for the above/below logic.
// import colorConfig from './colorConfig.json';

const MultiChart = () => {
  const [charts, setCharts] = useState([]);
  
  // Set your "target line" value here
  const lineValue = 100; // Example: line is at y=100

  useEffect(() => {
    // Replace with your actual endpoint or local file
    fetch('/api/my-data-endpoint')
      .then((res) => res.json())
      .then((jsonData) => {
        /**
         * JSON shape (example):
         * {
         *   "Group": {
         *     "NameA": {
         *       "2023-01-01": { "State": { "NY": { "Location": { "New York City": { "Value": 100 }}}}},
         *       ...
         *     },
         *     "NameB": {
         *       "2023-01-01": { ... },
         *       ...
         *     }
         *   }
         * }
         */
        const groupData = jsonData.Group || {};

        // We'll accumulate an array of { name, traces, layout } for each Name
        const newCharts = [];

        // Go through each "Name"
        Object.keys(groupData).forEach((name) => {
          const nameData = groupData[name];
          if (!nameData) return;

          // Build the stacked-area (two-trace) data
          const { traces, minDate, maxDate } = buildStackedAreaWithLine(nameData, lineValue);

          // Create a layout with a horizontal shape or line at `lineValue`
          // We'll set x0 = minDate, x1 = maxDate so it spans the entire domain.
          const layout = {
            title: `Chart for ${name}`,
            xaxis: { title: 'Date', type: 'category' }, 
            // ^ If your dates are real Date objects or you want time-series, switch to type: 'date'
            yaxis: { title: 'Total' },
            shapes: [
              {
                type: 'line',
                xref: 'x',  // bind line to x-axis
                yref: 'y',  // bind line to y-axis
                x0: minDate,
                x1: maxDate,
                y0: lineValue,
                y1: lineValue,
                line: {
                  color: 'black',
                  width: 2,
                  dash: 'dash'
                }
              }
            ]
          };

          // Store the chart config
          newCharts.push({ name, traces, layout });
        });

        setCharts(newCharts);
      })
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  return (
    <div>
      {charts.map(({ name, traces, layout }) => (
        <div key={name} style={{ marginBottom: '50px' }}>
          <Plot data={traces} layout={layout} />
        </div>
      ))}
    </div>
  );
};

export default MultiChart;

/**
 * Parses the nested data for a single "Name," sums up all values at each date,
 * then creates TWO stacked traces:
 *   1) Red area from y=0 up to min(total, lineValue)
 *   2) Blue area from min(total, lineValue) up to total (if total > lineValue)
 *
 * Returns { traces, minDate, maxDate } so the caller can draw a shape or line.
 */
function buildStackedAreaWithLine(nameData, lineValue) {
  // 1) Collect all date keys
  const dateKeys = Object.keys(nameData);

  // 2) For each date, sum up all (State->Location->Value)
  //    Then store into an array for plotting.
  const dateArray = [];
  const totalArray = [];

  dateKeys.forEach((dateStr) => {
    let dateTotal = 0;

    const dateInfo = nameData[dateStr];
    if (!dateInfo || !dateInfo.State) {
      dateArray.push(dateStr);
      totalArray.push(0);
      return;
    }

    const stateWrapper = dateInfo.State;
    // stateWrapper might have multiple states, each with multiple locations
    Object.keys(stateWrapper).forEach((stateKey) => {
      const locObj = stateWrapper[stateKey].Location || {};
      Object.keys(locObj).forEach((locKey) => {
        // e.g. locObj["New York City"] = { "Value": 100 }
        const { Value } = locObj[locKey] || {};
        if (Value !== undefined) {
          dateTotal += Value;
        }
      });
    });

    dateArray.push(dateStr);
    totalArray.push(dateTotal);
  });

  // Optionally sort by date if they're real dates
  // For demonstration, we assume they're in ascending order, 
  // or they’re strings like "2023-01-01" that are sorted in the JSON.

  // 3) Build two arrays: belowLineY and aboveLineY
  //    belowLineY = how much of total is at or below line
  //    aboveLineY = how much is above line
  const belowLineY = [];
  const aboveLineY = [];

  totalArray.forEach((val) => {
    const below = Math.min(val, lineValue);
    const above = val > lineValue ? val - lineValue : 0;
    belowLineY.push(below);
    aboveLineY.push(above);
  });

  // 4) We create 2 stacked-area traces:
  //    a) "Below line" in red, from 0 -> belowLineY
  //    b) "Above line" in blue, from belowLineY -> belowLineY+aboveLineY
  //    By using `stackgroup: 'one'`, Plotly will stack them vertically.
  const traceBelow = {
    x: dateArray,
    y: belowLineY,
    type: 'scatter',
    mode: 'none',          // no line markers, just the fill
    stackgroup: 'one',     // both traces in the same stack
    fill: 'tonexty',       // or 'tozeroy'
    fillcolor: 'red',
    name: 'Below/At Line'
  };

  const traceAbove = {
    x: dateArray,
    y: aboveLineY,
    type: 'scatter',
    mode: 'none',
    stackgroup: 'one',
    fill: 'tonexty',
    fillcolor: 'blue',
    name: 'Above Line'
  };

  // 5) Determine the min/max date for a horizontal shape
  //    If your xaxis is type: 'date', you can parse dateStrs to actual JS Date or just use the strings.
  const minDate = dateArray[0];
  const maxDate = dateArray[dateArray.length - 1];

  return {
    traces: [traceBelow, traceAbove],
    minDate,
    maxDate
  };
}
