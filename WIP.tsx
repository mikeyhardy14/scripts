// src/components/WIPChart.tsx
import React from 'react'
import Plot from 'react-plotly.js'
import { Layout, Config, Data } from 'plotly.js'

export interface WIPData {
  Totals: {
    [type: string]: number[]
  }
}

export interface WIPChartProps {
  data: WIPData
  colorMap: Record<string, string>
  start: string | Date
  stop: string | Date
}

const formatDate = (d: Date) => d.toISOString().split('T')[0]

/**
 * Builds an array of YYYY-MM-DD strings from start to stop (inclusive)
 */
const generateDateArray = (start: string | Date, stop: string | Date): string[] => {
  const dates: string[] = []
  const curr = new Date(start)
  const end = new Date(stop)
  curr.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  while (curr <= end) {
    dates.push(formatDate(curr))
    curr.setDate(curr.getDate() + 1)
  }
  return dates
}

const WIPChart: React.FC<WIPChartProps> = ({ data, colorMap, start, stop }) => {
  const xDates = generateDateArray(start, stop)

  const traces: Data[] = []
  for (const [type, values] of Object.entries(data.Totals)) {
    traces.push({
      x: xDates,
      y: values,
      type: 'scatter',
      mode: 'lines+markers',
      name: type,
      line: { shape: 'linear', color: colorMap[type], width: 2 },
      marker: { color: colorMap[type] },
      fill: 'tozeroy',
    })
  }

  const layout: Partial<Layout> = {
    title: 'WIP by Day',
    xaxis: { title: 'Date', type: 'date', tickangle: -45, tickformat: '%Y-%m-%d' },
    yaxis: { title: 'Count' },
    legend: { orientation: 'h', x: 0, y: -0.2 },
    margin: { t: 50, b: 100, l: 50, r: 50 },
    autosize: true,
  }

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false,
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default WIPChart
