import React from "react";
import Plot from "react-plotly.js";

const StackedAreaChart: React.FC = () => {
  // Set the cutoff date to cover everything before it
  const cutoffDate = "2021-02-01";

  return (
    <Plot
      data={[
        {
          x: ["2021-01-01", "2021-02-01", "2021-03-01"],
          y: [10, 15, 13],
          type: "scatter",
          mode: "lines",
          fill: "tonexty",
          fillcolor: "rgba(255, 0, 0, 0.5)", // Red with 50% transparency
          line: { color: "rgba(255, 0, 0, 1)" }, // Red line with full opacity
          name: "Dataset 1",
        },
        {
          x: ["2021-01-01", "2021-02-01", "2021-03-01"],
          y: [5, 10, 8],
          type: "scatter",
          mode: "lines",
          fill: "tonexty",
          fillcolor: "rgba(0, 0, 255, 0.5)", // Blue with 50% transparency
          line: { color: "rgba(0, 0, 255, 1)" }, // Blue line with full opacity
          name: "Dataset 2",
        },
      ]}
      layout={{
        title: "Stacked Area Chart with Alpha Cover Before Date",
        xaxis: { title: "Date" },
        yaxis: { title: "Value" },
        showlegend: true,
        shapes: [
          {
            type: "rect",
            xref: "x",
            yref: "paper",
            x0: "2021-01-01",
            x1: cutoffDate,
            y0: 0,
            y1: 1,
            fillcolor: "rgba(0, 0, 0, 0.3)", // Semi-transparent black overlay
            opacity: 0.5,
            line: { width: 0 }, // No border line
          },
        ],
      }}
    />
  );
};

export default StackedAreaChart;
