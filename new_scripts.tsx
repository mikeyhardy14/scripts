"use client"; // Ensures this component is executed on the client side

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import styles from './ChartStyles.module.css'; // Import CSS module for styling

// Dynamically import Plotly component with SSR disabled
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Define the structure of the data with dynamic name keys
interface GroupedData {
  [name: string]: { [date: string]: number }; // Allow any string for names (e.g., "John", "Jane") and dates
}

interface ApiResponse {
  group: GroupedData;
  group1: GroupedData;
}

const mockData: ApiResponse = {
  group: {
    John: {
      "2021-01-01": 12,
      "2021-02-01": 8,
      "2021-03-01": 15,
    },
    Jane: {
      "2021-01-01": 20,
      "2021-03-15": 25,
      "2021-04-01": 18,
    },
  },
  group1: {
    John: {
      "2021-01-15": 10,
      "2021-02-01": 10,
      "2021-03-01": 10,
    },
    Jane: {
      "2021-01-10": 15,
      "2021-03-01": 20,
      "2021-04-01": 12,
    },
  },
};

const AreaAndLineChartPage: React.FC = () => {
  const [chartData, setChartData] = useState<ApiResponse | null>(null);
  const [filteredData, setFilteredData] = useState<ApiResponse | null>(null);
  const [startDate, setStartDate] = useState<string>("2021-01-01");
  const [endDate, setEndDate] = useState<string>("2021-12-31");

  useEffect(() => {
    // Simulate fetching data
    setChartData(mockData);
    setFilteredData(mockData); // Initially, filtered data is the same as mock data
  }, []);

  // Handle changes in the date range filters
  const handleFilter = () => {
    if (!chartData) return;

    // Filter the data based on the selected date range
    const filtered = {
      group: {},
      group1: {},
    };

    Object.keys(chartData.group).forEach((name) => {
      // Filter both group and group1 data based on the selected date range
      filtered.group[name] = Object.keys(chartData.group[name])
        .filter((date) => date >= startDate && date <= endDate)
        .reduce((acc, date) => {
          acc[date] = chartData.group[name][date];
          return acc;
        }, {} as { [date: string]: number });

      filtered.group1[name] = Object.keys(chartData.group1[name])
        .filter((date) => date >= startDate && date <= endDate)
        .reduce((acc, date) => {
          acc[date] = chartData.group1[name][date];
          return acc;
        }, {} as { [date: string]: number });
    });

    setFilteredData(filtered); // Update the filtered data
  };

  // Function to unify dates and interpolate missing values
  const mergeDates = (groupData: { [date: string]: number }, group1Data: { [date: string]: number }) => {
    // Get unique dates from both group and group1
    const allDates = Array.from(new Set([...Object.keys(groupData), ...Object.keys(group1Data)]))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Sort dates

    // Interpolated data arrays
    const groupValues: number[] = [];
    const group1Values: number[] = [];

    // Keep track of previous values to carry forward when missing data
    let prevGroupValue = 0;
    let prevGroup1Value = 0;

    allDates.forEach((date) => {
      if (date in groupData) {
        prevGroupValue = groupData[date];
      }
      if (date in group1Data) {
        prevGroup1Value = group1Data[date];
      }
      groupValues.push(prevGroupValue);
      group1Values.push(prevGroup1Value);
    });

    return { allDates, groupValues, group1Values };
  };

  const renderCharts = () => {
    if (!filteredData) {
      return <p>Loading charts...</p>;
    }

    return Object.keys(filteredData.group).map((name) => {
      // Merge the dates and interpolate values
      const { allDates, groupValues, group1Values } = mergeDates(filteredData.group[name], filteredData.group1[name]);

      // Parse dates for Plotly
      const plotDates = allDates.map((date) => new Date(date));

      // Green area is the base (minimum of group and group1)
      const greenArea = groupValues.map((value, i) => Math.min(value, group1Values[i]));

      // Red area is the difference between group1 and green (stacked on top of green, or zero if green is hidden)
      const redArea = group1Values.map((value, i) => (group1Values[i] > groupValues[i] ? group1Values[i] - groupValues[i] : 0));

      // Blue area is the surplus (where group > group1)
      const blueArea = groupValues.map((value, i) => (value > group1Values[i] ? value - group1Values[i] : 0));

      return (
        <div className={styles.chartContainer} key={name}>
          <h3>{name}'s Chart</h3>
          <Plot
            data={[
              // Green area (base) with step look
              {
                x: plotDates,
                y: greenArea,
                type: 'scatter',
                mode: 'none', // Only the fill
                fill: 'tozeroy',
                fillcolor: 'green', // Green area
                line: { shape: 'hv' }, // Step look
                name: `${name} (Group - Green Area)`,
              },
              // Red area (stacked on top of green, adjusts when green is hidden) with step look
              {
                x: plotDates,
                y: redArea.map((value, i) => value + greenArea[i]), // Stack red on top of green, adjust if green is hidden
                type: 'scatter',
                mode: 'none',
                fill: 'tonexty',
                fillcolor: 'red', // Red area for deficit
                line: { shape: 'hv' }, // Step look
                name: `${name} (Group1 Deficit - Red Area)`,
              },
              // Blue area (surplus, stacked above group1) with step look
              {
                x: plotDates,
                y: blueArea.map((value, i) => value + group1Values[i]), // Blue stacked above group1
                type: 'scatter',
                mode: 'none',
                fill: 'tonexty',
                fillcolor: 'blue', // Blue area for surplus
                line: { shape: 'hv' }, // Step look
                name: `${name} (Group Surplus - Blue Area)`,
              },
              // Line chart (black) for group1
              {
                x: plotDates,
                y: group1Values,
                type: 'scatter',
                mode: 'lines',
                line: { color: 'black', shape: 'hv', width: 2 }, // Step look for line
                name: `${name} (Group1 - Line)`,
              },
            ]}
            layout={{
              title: `${name}'s Stacked Area Chart`,
              xaxis: {
                title: 'Date',
                type: 'date', // This ensures Plotly knows that the x-axis is a date
              },
              yaxis: {
                title: 'Value',
              },
              autosize: true,
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '500px' }} // Updated to be wider
          />
        </div>
      );
    });
  };

  return (
    <div>
      <div className={styles.filterContainer}>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={handleFilter}>Apply Filters</button>
      </div>
      <div className={styles.chartRow}>{renderCharts