import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  TextField,
  Stack
} from '@mui/material';
import { useFakeArrowAPI, arrowTableToRows } from '../hooks/useFakeArrowAPI';

export default function BarChart() {
  const { data: arrowData, isLoading } = useFakeArrowAPI();
  const [rows, setRows] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (arrowData && !isLoading) {
      const convertedRows = arrowTableToRows(arrowData);
      setRows(convertedRows);
      
      // Set default date range based on data
      if (convertedRows.length > 0) {
        const dates = convertedRows
          .map(row => row.start)
          .filter(date => date)
          .map(date => new Date(date))
          .sort((a, b) => a.getTime() - b.getTime());
        
        if (dates.length > 0 && !startDate && !endDate) {
          setStartDate(dates[0].toISOString().split('T')[0]);
          setEndDate(dates[dates.length - 1].toISOString().split('T')[0]);
        }
      }
    }
  }, [arrowData, isLoading, startDate, endDate]);

  // Filter rows based on date range
  const getFilteredRows = () => {
    if (!startDate || !endDate) return rows;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return rows.filter(row => {
      if (!row.start) return false;
      const rowDate = new Date(row.start);
      return rowDate >= start && rowDate <= end;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: 500, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6">Loading Chart Data...</Typography>
        <Typography variant="body2" color="text.secondary">
          Fetching project data from fake API
        </Typography>
      </Box>
    );
  }

  // Prepare yearly events chart data
  const getYearlyChartData = () => {
    const filteredRows = getFilteredRows();
    if (!filteredRows.length) return { data: [], title: 'No Data Available in Selected Range' };

    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f', '#00796b', '#f9a825'];

    // Events by year, stacked by source
    const yearSourceMap: Record<string, Record<string, number>> = {};
    const sources = new Set<string>();
    
    filteredRows.forEach(row => {
      if (row.start) {
        const date = new Date(row.start);
        const year = date.getFullYear().toString();
        const source = row.source || 'Unknown';
        sources.add(source);
        
        if (!yearSourceMap[year]) {
          yearSourceMap[year] = {};
        }
        yearSourceMap[year][source] = (yearSourceMap[year][source] || 0) + 1;
      }
    });

    // Sort years chronologically
    const years = Object.keys(yearSourceMap).sort();
    const sourceArray = Array.from(sources);
    
    const data = sourceArray.map((source, index) => ({
      x: years,
      y: years.map(year => yearSourceMap[year][source] || 0),
      name: source,
      type: 'bar' as const,
      marker: { color: colors[index % colors.length] },
      hovertemplate: '<b>%{x}</b><br>%{fullData.name}: %{y} events<extra></extra>',
    }));

    const dateRangeText = startDate && endDate ? ` (${startDate} to ${endDate})` : '';
    return {
      data,
      title: `Events by Year (Stacked by Source)${dateRangeText}`,
      xAxisTitle: 'Year'
    };
  };

  const chartData = getYearlyChartData();

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Events by Year Dashboard
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1" sx={{ minWidth: 'auto' }}>
              Date Range:
            </Typography>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            <Typography variant="body2" color="text.secondary">
              to
            </Typography>
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            <Typography variant="body2" color="text.secondary">
              ({getFilteredRows().length} events in range)
            </Typography>
          </Stack>
        </Box>

        {arrowData && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Arrow DataFrame loaded!</strong> 
              {` Rows: ${arrowData.numRows}, Columns: ${arrowData.numCols}`}
            </Typography>
          </Alert>
        )}

        {chartData.data.length > 0 ? (
          <Box sx={{ 
            width: '100%', 
            height: 500,
            '& .plotly': {
              width: '100% !important',
              height: '100% !important'
            }
          }}>
            <Plot
              data={chartData.data}
              layout={{
                title: {
                  text: chartData.title,
                  font: { size: 20 }
                },
                xaxis: {
                  title: { text: chartData.xAxisTitle },
                  tickangle: 0,
                },
                yaxis: {
                  title: { text: 'Number of Events' }
                },
                barmode: 'stack',
                margin: { t: 60, r: 120, b: 100, l: 60 },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: {
                  family: '"Roboto", "Helvetica", "Arial", sans-serif'
                },
                showlegend: true,
                legend: {
                  x: 1.02,
                  y: 1,
                  xanchor: 'left',
                  yanchor: 'top',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  bordercolor: 'rgba(0,0,0,0.2)',
                  borderwidth: 1
                },
                hovermode: 'closest'
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
        ) : (
          <Alert severity="warning">
            No data available for the selected date range.
          </Alert>
        )}
      </Paper>
    </Box>
  );
} 
