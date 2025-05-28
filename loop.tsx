import React from "react";
import Plot from "react-plotly.js";

type Props = {
  data: {
    [name: string]: {
      [type: string]: number[];
    };
  };
};

const MultiCharts: React.FC<Props> = ({ data }) => {
  return (
    <div>
      {Object.entries(data)
        .filter(([name]) => name !== "Totals")
        .map(([name, metrics]) => {
          const traces = Object.entries(metrics).map(
            ([metricType, values]) => {
              const x = values.map((_, i) => `Day ${i + 1}`);
              return {
                x,
                y: values,
                type: "scatter",
                mode: "lines+markers",
                name: metricType,
              };
            }
          );

          return (
            <div key={name} style={{ marginBottom: "30px" }}>
              <h3>{name}</h3>
              <Plot
                data={traces}
                layout={{
                  width: 600,
                  height: 400,
                  title: `${name}'s Metrics`,
                }}
              />
            </div>
          );
        })}
    </div>
  );
};

export default MultiCharts;
