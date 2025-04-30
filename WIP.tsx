// components/WIPChart.tsx
import React from 'react'
import dynamic from 'next/dynamic'
import { Layout, Config, Data } from 'plotly.js'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export interface WIPData {
  [location: string]: {
    Totals: {
      [type: string]: number[]
    }
  }
}

export interface WIPChartProps {
  data: WIPData
  colorMap: { [type: string]: string }
  start: string | Date
  stop: string | Date
}

const formatDate = (d: Date) => d.toISOString().split('T')[0]

/**
 * Generates an array of date strings ("YYYY-MM-DD") from start to stop inclusive.
 */
const generateDateArray = (start: string | Date, stop: string | Date): string[] => {
  const dates: string[] = []
  let curr = typeof start === 'string' ? new Date(start) : new Date(start)
  const end = typeof stop === 'string' ? new Date(stop) : new Date(stop)
  // ensure time portion doesn’t interfere
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

  // build one trace per location/type
  const traces: Data[] = []
  Object.entries(data).forEach(([location, locObj]) => {
    Object.entries(locObj.Totals).forEach(([type, values]) => {
      traces.push({
        x: xDates,
        y: values,
        type: 'scatter',
        mode: 'lines+markers',
        name: `${location} – ${type}`,
        marker: { color: colorMap[type] || undefined },
        line: { shape: 'linear', color: colorMap[type] || undefined, width: 2 },
        fill: 'tozeroy', // comment out if you don’t want an area
      })
    })
  })

  const layout: Partial<Layout> = {
    title: 'WIP Chart',
    xaxis: {
      title: 'Date',
      type: 'date',
      tickformat: '%Y-%m-%d',
      tickangle: -45,
    },
    yaxis: {
      title: 'Count',
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: -0.2,
    },
    margin: { t: 50, b: 100, l: 50, r: 50 },
    autosize: true,
  }

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false,
  }

  return (
    <Plot
      data={traces}
      layout={layout}
      config={config}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default WIPChart
