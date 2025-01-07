import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
// Import the color config (assuming it’s in the same folder)
import colorConfig from './colorConfig.json';

const MultiChart = () => {
  // We'll store an array of chart configs (each with traces and layout)
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    // Example endpoint — replace with your actual URL
    // e.g., fetch('https://yourserver.com/api/my-data-endpoint')
    fetch('/api/my-data-endpoint')
      .then((res) => res.json())
      .then((jsonData) => {
        // jsonData should have shape:
        // {
        //   "Group": {
        //     "NameA": { "2023-01-01": { ... }, ... },
        //     "NameB": { "2023-01-01": { ... }, ... },
        //     ...
        //   }
        // }
        const groupData = jsonData.Group || {};

        // We'll accumulate an array of objects: [{ name, traces, layout }, ...]
        const newCharts = [];

        // 1) Loop over each "Name" key in "Group"
        Object.keys(groupData).forEach((name) => {
          // name might be "NameA", "NameB", etc.
          const nameData = groupData[name];
          if (!nameData) return;

          // 2) Build the Plotly traces for this "Name"
          const traces = buildTracesForName(nameData);

          // 3) Create a layout (optional, can be customized for each name)
          const layout = {
            title: `Chart for ${name}`,
            xaxis: { title: 'Date' },
            yaxis: { title: 'Value' }
          };

          // 4) Push the chart config into newCharts
          newCharts.push({
            name,    // will serve as a unique key in map()
            traces,
            layout
          });
        });

        // 5) Update state, which triggers render
        setCharts(newCharts);
      })
      .catch((err) => {
        console.error('Fetch error', err);
      });
  }, []);

  // Finally, render one <Plot> per "Name"
  return (
    <div>
      {charts.map(({ name, traces, layout }) => (
        <div key={name} style={{ marginBottom: '40px' }}>
          <Plot data={traces} layout={layout} />
        </div>
      ))}
    </div>
  );
};

export default MultiChart;


/**
 * Helper function to parse the deeply nested data for a single “Name”
 * and build an array of Plotly traces.
 *
 * Returns an array like:
 * [
 *   {
 *     x: [...],
 *     y: [...],
 *     type: 'scatter',
 *     mode: 'lines+markers',
 *     marker: { color: 'someColor' },
 *     name: 'NY - New York City'
 *   },
 *   {
 *     x: [...],
 *     y: [...],
 *     ...
 *   }
 * ]
 */
function buildTracesForName(nameData) {
  // We’ll collect multiple traces, one for each (stateKey:locationKey) combo
  // so that if a single Name has multiple states/locations, each gets its own line/trace.
  const traceMap = {}; 
  // key = "NY:New York City" => {
  //   x: [...dates],
  //   y: [...values],
  //   ...
  // }

  // nameData has shape like:
  // {
  //   "2023-01-01": {
  //     "State": {
  //       "NY": {
  //         "Location": {
  //           "New York City": {
  //             "Value": 100
  //           }
  //         }
  //       }
  //     }
  //   },
  //   "2023-01-02": ...
  // }
  Object.keys(nameData).forEach((dateStr) => {
    const dateInfo = nameData[dateStr];
    if (!dateInfo || !dateInfo.State) return;

    // dateInfo.State might have multiple states
    const stateWrapper = dateInfo.State;
    Object.keys(stateWrapper).forEach((stateKey) => {
      const locationWrapper = stateWrapper[stateKey].Location || {};

      // locationWrapper might be { "New York City": { Value: 100 }, "Buffalo": { Value: 50 } } etc.
      Object.keys(locationWrapper).forEach((locationKey) => {
        // e.g. locationWrapper["New York City"] = { Value: 100 }
        const { Value } = locationWrapper[locationKey] || {};
        if (Value === undefined) return;

        // Build an ID for color lookup => "NY:New York City"
        const traceID = `${stateKey}:${locationKey}`;

        // If we haven't seen this (state:location) yet, initialize it
        if (!traceMap[traceID]) {
          // Use colorConfig to get a color, or fallback to default
          const color = colorConfig[traceID] || colorConfig.default;

          traceMap[traceID] = {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color },
            // For the legend label, let's do "State - Location"
            name: `${stateKey} - ${locationKey}`
          };
        }

        // Push this data point
        traceMap[traceID].x.push(dateStr);
        traceMap[traceID].y.push(Value);
      });
    });
  });

  // Convert traceMap to an array of trace objects
  return Object.values(traceMap);
}
