import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import Plot from 'react-plotly.js';

interface ApiData {
  [date: string]: {
    [place: string]: number;
  };
}

interface PlotlyTrace {
  x: string[];
  y: number[];
  type: 'scatter';
  mode: 'lines+markers';
  name: string;
  line: {
    width: 2;
  };
  marker: {
    size: 6;
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

  const processDataForPlotly = (apiData: ApiData): PlotlyTrace[] => {
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

    // Sort dates for each place and create traces
    return Object.entries(placeData).map(([place, { dates, values }]) => {
      // Combine dates and values, sort by date, then separate again
      const combined = dates.map((date, index) => ({ date, value: values[index] }));
      combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return {
        x: combined.map(item => item.date),
        y: combined.map(item => item.value),
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        name: place,
        line: { width: 2 },
        marker: { size: 6 }
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

  const traces = processDataForPlotly(data);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Timeline Charts - {name}
        </Typography>
        
        <Box sx={{ mt: 4, width: '100%', height: 600 }}>
          <Plot
            data={traces}
            layout={{
              title: {
                text: `Timeline Data for ${name}`,
                font: { size: 18 }
              },
              xaxis: {
                title: { text: 'Date' },
                type: 'date',
                tickangle: -45
              },
              yaxis: {
                title: { text: 'Value' }
              },
              hovermode: 'x unified',
              showlegend: true,
              legend: {
                orientation: 'h',
                y: -0.2
              },
              margin: {
                l: 60,
                r: 30,
                t: 80,
                b: 120
              }
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
      </Box>
    </Container>
  );
}
