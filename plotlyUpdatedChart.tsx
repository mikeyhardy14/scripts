/**********************************************
 * PlotlySparkChartPlot.tsx
 **********************************************/
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import colorConfig from '../Styles/plotlySparkChartPlot.json';

interface PlotlySparkChartPlotProps {
  chartData: any;       // Expects { INR: {...}, PAA: {...} } with nested structure
  filtering: any;       // For chart width/height, xRange, etc.
  renderFlag: boolean;  
  setRenderFlag: (flag: boolean) => void;
}

/**
 * A helper to parse the nested chartData.INR[name] or chartData.PAA[name],
 * summing or collecting each (State->Location->Value) into a "trace map."
 */
function parseNestedData(nestedObj: any) {
  // e.g. nestedObj = {
  //   "2024-01-01": {
  //     "State": {
  //       "NY": {
  //         "Location": {
  //           "New York City": { "Value": 10 },
  //           "Buffalo": { "Value": 5 }
  //         }
  //       },
  //       "CA": { "Location": { "Los Angeles": { "Value": 20 } } }
  //     }
  //   },
  //   "2024-01-02": ...
  // }

  const dateSet = new Set<string>();
  // We'll store one trace per (State:Location).
  const traceMap: {
    [combo: string]: {
      [date: string]: number; // date -> value
    };
  } = {};

  Object.keys(nestedObj).forEach((dateStr) => {
    dateSet.add(dateStr);

    const dateInfo = nestedObj[dateStr];
    if (!dateInfo || !dateInfo.State) return;

    const stateWrapper = dateInfo.State;
    Object.keys(stateWrapper).forEach((stateKey) => {
      const locWrapper = stateWrapper[stateKey].Location || {};
      Object.keys(locWrapper).forEach((locKey) => {
        const { Value } = locWrapper[locKey] || {};
        if (Value !== undefined) {
          // build "State:Location" key
          const comboKey = `${stateKey}:${locKey}`;
          if (!traceMap[comboKey]) {
            traceMap[comboKey] = {};
          }
          traceMap[comboKey][dateStr] = Value;
        }
      });
    });
  });

  // Also return the set of all dateStr so we can unify them
  return { dateSet, traceMap };
}

/**
 * Convert a traceMap from parseNestedData() into an array of Plotly "scatter area" traces,
 * each with the same sorted date array. Missing dates get zero. This is for stacking.
 */
function buildStackedTracesFromMap(
  traceMap: { [combo: string]: { [date: string]: number } },
  allDatesSorted: string[]
) {
  const finalTraces: any[] = [];

  Object.keys(traceMap).forEach((comboKey) => {
    const color =
      colorConfig[comboKey] !== undefined
        ? colorConfig[comboKey]
        : colorConfig.default;

    // Build x,y arrays in sorted order
    const yArray: number[] = [];
    allDatesSorted.forEach((d) => {
      const val = traceMap[comboKey][d] ?? 0;
      yArray.push(val);
    });

    finalTraces.push({
      x: allDatesSorted,
      y: yArray,
      type: 'scatter',
      mode: 'none',
      stackgroup: 'one', // stack all these traces
      fill: 'tonexty',
      fillcolor: color,
      line: { shape: 'hv' },
      name: comboKey,
    });
  });

  return finalTraces;
}

/**
 * Builds a numeric array of total sums at each date index, by summing across all
 * stacked traces. We'll use this to compare with PAA line -> shortfall or surplus.
 */
function sumOfStackedTraces(
  stackedTraces: any[],
  dateIndex: number,
  traceCount?: number
): number {
  // sum the "y" value at dateIndex across all (State,Location) traces
  let sumVal = 0;
  stackedTraces.forEach((tr) => {
    // if "y" is an array of numbers, add y[dateIndex]
    const yVal = tr.y[dateIndex] || 0;
    sumVal += yVal;
  });
  return sumVal;
}

/**
 * Build an array of the total sums at each date.
 */
function buildTotalArrayForDates(
  stackedTraces: any[],
  allDatesSorted: string[]
) {
  const totalArray: number[] = [];
  allDatesSorted.forEach((_, i) => {
    totalArray.push(sumOfStackedTraces(stackedTraces, i));
  });
  return totalArray;
}

/**
 * Parse the line data (nameLineData) similarly, but we usually just need
 * a single "total" line at each date. If your line is spread across multiple
 * states/locations, sum them up.
 */
function parseLineData(nameLineData: any, allDatesSorted: string[]) {
  // For each date, sum all states/locations in nameLineData
  const lineValueByDate: { [date: string]: number } = {};

  Object.keys(nameLineData).forEach((dateStr) => {
    let dateTotal = 0;
    const dateInfo = nameLineData[dateStr];
    if (dateInfo && dateInfo.State) {
      Object.keys(dateInfo.State).forEach((stateKey) => {
        const locWrapper = dateInfo.State[stateKey].Location || {};
        Object.keys(locWrapper).forEach((locKey) => {
          const { Value } = locWrapper[locKey] || {};
          if (Value === 'def') {
            // if literally 'def', interpret as a numeric default, e.g. 20
            dateTotal += 20;
          } else {
            const parsed = parseFloat(Value);
            if (!isNaN(parsed)) {
              dateTotal += parsed;
            }
          }
        });
      });
    }
    lineValueByDate[dateStr] = dateTotal;
  });

  // Build a numeric array in the sorted date order
  return allDatesSorted.map((dateStr) => lineValueByDate[dateStr] ?? 0);
}

/**
 * The main component
 */
const PlotlySparkChartPlot: React.FC<PlotlySparkChartPlotProps> = ({
  chartData,
  filtering,
  renderFlag,
  setRenderFlag,
}) => {
  const [returnedComponent, setReturnedComponent] = useState<
    JSX.Element | JSX.Element[] | null
  >(null);

  useEffect(() => {
    if (renderFlag) {
      if (!chartData) {
        // No data yet
        setReturnedComponent(<p>Loading charts...</p>);
      } else {
        // chartData is something like: { INR: {...}, PAA: {...} }
        // We'll build one chart per "Name" in chartData.INR
        const chartElements = Object.keys(chartData.INR).map((name) => {
          const nameData = chartData.INR[name];
          const nameLineData = chartData.PAA[name] || {};

          // 1) Parse the nested INR data into traceMap
          const { dateSet, traceMap } = parseNestedData(nameData);

          // 2) Build an array of sorted date strings
          const allDatesSorted = Array.from(dateSet).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );

          // 3) Convert that traceMap into real stacked traces for Plotly
          const stackedTraces = buildStackedTracesFromMap(
            traceMap,
            allDatesSorted
          );

          // 4) Sum the total across all stacked traces => totalINR
          const totalINR = buildTotalArrayForDates(stackedTraces, allDatesSorted);

          // 5) Parse the line data from nameLineData => lineValues
          const lineValues = parseLineData(nameLineData, allDatesSorted);

          // 6) Build shortfall & surplus arrays
          // shortfall[i] = (lineVal - totalINR[i]) if lineVal > totalINR[i], else 0
          // surplus[i]   = (totalINR[i] - lineVal) if totalINR[i] > lineVal, else 0
          const shortfall: number[] = [];
          const surplus: number[] = [];

          lineValues.forEach((lineVal, i) => {
            const actual = totalINR[i];
            if (actual < lineVal) {
              shortfall.push(lineVal - actual);
              surplus.push(0);
            } else {
              shortfall.push(0);
              surplus.push(actual - lineVal);
            }
          });

          // 7) Build a "shortfall trace" if sum < line
          //    That sits on top of totalINR
          const shortfallTrace = {
            x: allDatesSorted,
            y: shortfall.map((val, i) => val + totalINR[i]),
            type: 'scatter',
            mode: 'none',
            stackgroup: 'one',
            fill: 'tonexty',
            fillcolor: 'red',
            line: { shape: 'hv' },
            name: 'Shortfall',
          };

          // 8) Build a "surplus trace" if sum > line
          //    That sits on top of the line (so offset by lineValue)
          const surplusTrace = {
            x: allDatesSorted,
            y: surplus.map((val, i) => val + lineValues[i]),
            type: 'scatter',
            mode: 'none',
            fill: 'tonexty',
            fillcolor: 'blue',
            line: { shape: 'hv' },
            name: 'Surplus',
          };

          // 9) The line trace in black
          const lineTrace = {
            x: allDatesSorted,
            y: lineValues,
            type: 'scatter',
            mode: 'lines',
            line: { color: 'black', width: 2, shape: 'hv' },
            name: 'Target (PAA)',
          };

          // Combine all stackedTraces + shortfall + surplus + line
          const finalData = [...stackedTraces, shortfallTrace, surplusTrace, lineTrace];

          // Layout
          const layout = {
            width: filtering.ChartWidth,
            height: filtering.ChartHeight,
            margin: { l: 50, r: 30, t: 30, b: 40 },
            title: {
              text: name,
              x: 0.5,
              font: { color: 'black', size: 16 },
            },
            xaxis: filtering.xRange
              ? {
                  range: filtering.xRange,
                  type: 'date' as const,
                }
              : { type: 'date' as const },
          };

          return (
            <div className="chartContainer" key={name} id={name}>
              <Plot
                data={finalData}
                layout={layout}
                useResizeHandler={true}
                style={{ width: '100%', height: '400px' }}
              />
            </div>
          );
        });

        setReturnedComponent(chartElements);
      }
      // reset the flag
      setRenderFlag(false);
    }
  }, [renderFlag, chartData, filtering, setRenderFlag]);

  return returnedComponent;
};

export default PlotlySparkChartPlot;
