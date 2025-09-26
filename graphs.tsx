import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import Plot from 'react-plotly.js';

interface ApiData {
  [date: string]: {
    [place: string]: number;
  };
}


export default function Graphs() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!name) {
        setError('No name parameter provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate fake data for demonstration
        const mockData: ApiData = generateMockData(name);
        setData(mockData);
        
        // Uncomment below to use real API call
        // const response = await fetch(`/api/${name}`);
        // if (!response.ok) {
        //   throw new Error(`Failed to fetch data: ${response.statusText}`);
        // }
        // const apiData: ApiData = await response.json();
        // setData(apiData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  // Generate mock data for demonstration
  const generateMockData = (datasetName: string): ApiData => {
    const places = ['New York', 'London', 'Tokyo', 'Sydney', 'Paris'];
    const mockData: ApiData = {};
    
    // Generate data for the last 30 days
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      mockData[dateStr] = {};
      
      // Generate values for each place with some variation based on dataset name
      places.forEach((place, index) => {
        const baseValue = datasetName.length * 10 + index * 5;
        const randomVariation = (Math.random() - 0.5) * 20;
        const trendFactor = (29 - i) * 0.5; // Slight upward trend over time
        const value = Math.max(0, baseValue + randomVariation + trendFactor);
        
        mockData[dateStr][place] = Math.round(value * 100) / 100; // Round to 2 decimal places
      });
    }
    
    return mockData;
  };

  const processDataForPlotly = (apiData: ApiData) => {
    const placeData: { [place: string]: { dates: string[], values: number[] } } = {};
    
    // Group data by place
    Object.entries(apiData).forEach(([date, places]) => {
      Object.entries(places).forEach(([place, value]) => {
        if (!placeData[place]) {
          placeData[place] = { dates: [], values: [] };
        }
        placeData[place].dates.push(date);
        placeData[place].values.push(value);
      });
    });

    // Sort dates for each place and create chart data for each place
    return Object.entries(placeData).map(([place, { dates, values }]) => {
      // Combine dates and values, sort by date, then separate again
      const combined = dates.map((date, index) => ({ date, value: values[index] }));
      combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return {
        place,
        trace: {
          x: combined.map(item => item.date),
          y: combined.map(item => item.value),
          type: 'scatter' as const,
          mode: 'lines+markers' as const,
          name: place,
          line: { width: 3 },
          marker: { size: 8 },
          fill: 'tonexty' as const,
          fillcolor: 'rgba(74, 144, 226, 0.1)'
        }
      };
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading data for {name}...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Timeline Charts - {name}
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Timeline Charts - {name}
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            No data available for {name}
          </Alert>
        </Box>
      </Container>
    );
  }

  const chartData = processDataForPlotly(data);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Timeline Charts - {name}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {chartData.map(({ place, trace }) => (
            <Paper key={place} elevation={3} sx={{ p: 2, width: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
                {place}
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <Plot
                  data={[trace]}
                  layout={{
                    xaxis: {
                      title: { text: 'Date', font: { size: 14 } },
                      type: 'date',
                      tickangle: -45,
                      tickfont: { size: 12 }
                    },
                    yaxis: {
                      title: { text: 'Value', font: { size: 14 } },
                      tickfont: { size: 12 }
                    },
                    hovermode: 'x unified',
                    showlegend: false,
                    margin: {
                      l: 60,
                      r: 30,
                      t: 20,
                      b: 80
                    },
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    paper_bgcolor: 'rgba(0,0,0,0)'
                  }}
                  style={{ width: '100%', height: '100%' }}
                  config={{
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                    displaylogo: false
                  }}
                />
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
