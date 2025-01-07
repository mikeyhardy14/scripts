import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

// Import color config so each (State,Location) can have its own color
import colorConfig from './colorConfig.json';

const MultiChart = () => {
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    // 1) Fetch your combined JSON. It should have { Group: {...}, Group1: {...} } at the top level.
    fetch('/api/my-data-endpoint')
      .then(res => res.json())
      .then(jsonData => {
        const groupData = jsonData.Group || {};
        const group1Data = jsonData.Group1 || {};

        const newCharts = [];

        // For each "Name" in Group (e.g. NameA, NameB, etc.)
        Object.keys(groupData).forEach(name => {
          const nameData = groupData[name];
          if (!nameData) return;

          // We'll get the matching data from Group1
          const nameLineData = group1Data[name] || {};

          // Build the stacked area traces for all states/locations
          // plus the "difference" trace (red shortfall) and the black line
          const { traces, layout } = buildStackWithRedDiffAndLine(
            name,
            nameData,
            nameLineData
          );

          newCharts.push({ name, traces, layout });
        });

        setCharts(newCharts);
      })
      .catch(err => console.error('Fetch error:', err));
  }, []);

  // Render one chart per "Name"
  return (
    <div>
      {charts.map(({ name, traces, layout }) => (
        <div key={name} style={{ marginBottom: '60px' }}>
          <h2>{name}</h2>
          <Plot data={traces} layout={layout} />
        </div>
      ))}
    </div>
  );
};

export default MultiChart;

/**
 * Build traces for a single "Name" so that:
 * 1) Each (State, Location) is stacked in its own color (from colorConfig).
 * 2) We fetch the line from nameLineData (Group1). 
 *    For each date, parse that line value (ex: "20").
 * 3) If sum of stacks < line, create a red slice for the difference (line - sum).
 * 4) Draw a dashed black line so we can see the target visually.
 */
function buildStackWithRedDiffAndLine(name, nameData, nameLineData) {
  // First, gather all data from Group (the numeric data to be stacked),
  // grouped by (State, Location). We'll store them in a traceMap.
  const traceMap = {}; 
  // e.g. traceMap["NY:New York City"] = { x: [], y: [], ... }

  // Also collect a set/list of all date keys
  const dateSet = new Set();

  // nameData might look like:
  // { "2024-01-01": { State: { "NY": { Location: { "New York City": { Value: 10 }}}}}, ... }
  Object.keys(nameData).forEach(dateStr => {
    dateSet.add(dateStr);

    const dateInfo = nameData[dateStr];
    if (!dateInfo || !dateInfo.State) return;

    // There might be multiple states
    Object.keys(dateInfo.State).forEach(stateKey => {
      const locWrapper = dateInfo.State[stateKey].Location || {};
      Object.keys(locWrapper).forEach(locKey => {
        const { Value } = locWrapper[locKey] || {};
        if (Value === undefined) return;

        const comboKey = `${stateKey}:${locKey}`; // e.g. "NY:New York City"
        if (!traceMap[comboKey]) {
          // Initialize a trace for this combo
          const c = colorConfig[comboKey] || colorConfig.default;
          traceMap[comboKey] = {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'none',
            stackgroup: 'one',
            fill: 'tonexty',
            fillcolor: c,
            name: comboKey, // Legend label
          };
        }

        // We need to make sure x and y line up index-wise.
        // Typically we just push dateStr onto x, Value onto y.
        traceMap[comboKey].x.push(dateStr);
        traceMap[comboKey].y.push(Value);
      });
    });
  });

  // We’ll now turn each trace’s date order into a sorted sequence so that 
  // Plotly can plot in ascending x order. 
  // Also, for any missing date in a trace, you'd need to insert 0 if you want 
  // a consistent timeseries. However, to keep it simpler, we assume each 
  // trace has data for each date it actually appears. 
  //
  // But let's unify the approach: we build a sorted array of all dates, 
  // then we re-map each trace onto that full set, inserting 0 if missing.
  const allDatesSorted = Array.from(dateSet).sort();
  
  // For each trace in traceMap, build new arrays that include allDatesSorted,
  // inserting 0 if the trace had no data for that date.
  Object.keys(traceMap).forEach(comboKey => {
    const oldTrace = traceMap[comboKey];
    const dateValsMap = {}; 
    // map dateStr -> value
    oldTrace.x.forEach((d, idx) => {
      dateValsMap[d] = oldTrace.y[idx];
    });

    // Rebuild x,y in sorted date order
    const newX = [];
    const newY = [];
    allDatesSorted.forEach(d => {
      newX.push(d);
      newY.push(dateValsMap[d] !== undefined ? dateValsMap[d] : 0);
    });

    oldTrace.x = newX;
    oldTrace.y = newY;
  });

  // Now let's build a separate array for the line (Group1).
  // lineValues[i] = line on allDatesSorted[i].
  const lineValues = allDatesSorted.map(dateStr => {
    // Look up nameLineData[dateStr]. 
    // If it's missing, assume line=0 or something
    let lineVal = 0;
    const lineDateInfo = nameLineData[dateStr];
    if (lineDateInfo && lineDateInfo.State) {
      Object.keys(lineDateInfo.State).forEach(stateKey => {
        const locWrapper = lineDateInfo.State[stateKey].Location || {};
        Object.keys(locWrapper).forEach(locKey => {
          // If it's a string (like "20" or "def"), parse it
          const { Value } = locWrapper[locKey];
          if (Value === 'def') {
            // If literally 'def', interpret as a numeric default, e.g. 20
            lineVal += 20;
          } else {
            const parsed = parseFloat(Value);
            if (!isNaN(parsed)) lineVal += parsed;
          }
        });
      });
    }
    return lineVal;
  });

  // Next, we create a "difference" trace that covers from the sum of all stacks 
  // up to the line if sum < line (i.e. shortfall). 
  // We'll do that by first computing "sumAtIndex" for each date index 
  // across all state/location traces.
  const sumAtEachDate = allDatesSorted.map((_, idx) => 0);

  // For each trace, add up y[idx].
  Object.keys(traceMap).forEach(comboKey => {
    const tr = traceMap[comboKey];
    tr.y.forEach((val, idx) => {
      sumAtEachDate[idx] += val;
    });
  });

  // Build difference array: if sum < line => (line - sum), else 0
  const diffArray = sumAtEachDate.map((sumVal, i) => {
    const lineVal = lineValues[i];
    if (sumVal < lineVal) {
      return lineVal - sumVal;
    }
    return 0;
  });

  // We'll add one more stacked trace for that difference in red
  const diffTrace = {
    x: allDatesSorted,
    y: diffArray,
    type: 'scatter',
    mode: 'none',
    stackgroup: 'one',
    fill: 'tonexty',
    fillcolor: 'red',
    name: 'Shortfall (sum < line)'
  };

  // Also add a black dashed line trace so we can see the target
  const lineTrace = {
    x: allDatesSorted,
    y: lineValues,
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'black',
      dash: 'dash'
    },
    name: 'Line (Group1)'
  };

  // Final array of traces:
  //  - All state/location traces (colored from config)
  //  - The "diff" trace in red (on top if sum < line)
  //  - The dashed line trace
  const allStackTraces = [
    ...Object.values(traceMap), 
    diffTrace, 
    lineTrace
  ];

  const layout = {
    title: `Stacked Chart for ${name}`,
    xaxis: { title: 'Date', type: 'category' },
    yaxis: { title: 'Value' },
    legend: { orientation: 'h' },
    // Optionally, make the chart taller if you have many traces
    margin: { t: 50, b: 50, l: 50, r: 50 }
  };

  return { traces: allStackTraces, layout };
}
