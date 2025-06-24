import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import type { TooltipProps } from '@mui/material/Tooltip';
import { 
  DataGrid,
  GridRowModes,
  GridEditInputCell,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport
} from '@mui/x-data-grid';
import type { 
  GridColDef,
  GridPreProcessEditCellProps,
  GridRowModel,
  GridRenderEditCellParams
} from '@mui/x-data-grid';
import { 
  Box, 
  Stack, 
  Typography, 
  CircularProgress,
  Alert,
  IconButton,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useFakeArrowAPI, arrowTableToRows } from '../hooks/useFakeArrowAPI';

// Styled components
const StyledDataGridContainer = styled('div')(({ theme }) => ({
  height: 600,
  width: '100%',
  '& .MuiDataGrid-cell--editable .MuiInputBase-root': {
    height: '100%',
  },
  '& .Mui-error': {
    backgroundColor: 'rgb(126,10,15, 0.1)',
    color: '#750f0f',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgb(126,10,15, 0)',
      color: '#ff4343',
    }),
  },
  '& .flash-green': {
    backgroundColor: '#c8f0c6 !important',
    animation: 'flash 1s ease-in-out',
  },
  '@keyframes flash': {
    '0%, 100%': { backgroundColor: '#c8f0c6' },
    '50%': { backgroundColor: '#81c784' },
  },
}));

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

// Custom edit cell for dates to ensure yyyy-mm-dd format
function DateEditInputCell(props: GridRenderEditCellParams) {
  const { value, ...other } = props;
  
  // Convert Date object to yyyy-mm-dd string for the input
  const dateValue = value ? (value instanceof Date ? value.toISOString().split('T')[0] : value) : '';
  
  return <GridEditInputCell {...other} value={dateValue} />;
}

// Custom edit cell with validation tooltip
function LocationEditInputCell(props: GridRenderEditCellParams) {
  const { error } = props;
  return (
    <StyledTooltip open={!!error} title={error || ''}>
      <GridEditInputCell {...props} />
    </StyledTooltip>
  );
}

// Validation function
const validateLocation = (location: string): string | null => {
  if (location.length < 2) {
    return 'Location must be at least 2 characters long.';
  } else if (location.toUpperCase() === 'NYC') {
    return 'NYC is not allowed as a location.';
  } else {
    return null;
  }
};

// Types
type Row = {
  id: number;
  location: string;
  name: string;
  start: string;
  stop: string;
  source: string;
};

type RowModesModel = Record<number, { mode: GridRowModes }>;

export default function DataGridDemo() {
  const { data: arrowData, isLoading } = useFakeArrowAPI();
  const [rows, setRows] = useState<Row[]>([]);
  const [rowModesModel, setRowModesModel] = useState<RowModesModel>({});
  const [flashRowId, setFlashRowId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, boolean>>>({});

  // Effects
  useEffect(() => {
    if (arrowData && !isLoading) {
      setRows(arrowTableToRows(arrowData));
    }
  }, [arrowData, isLoading]);

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
        <Typography variant="h6">Loading Arrow DataFrame...</Typography>
        <Typography variant="body2" color="text.secondary">
          Fetching project data from fake API
        </Typography>
      </Box>
    );
  }

  // Event handlers
  const handleRowModeChange = (id: number, mode: GridRowModes, options?: { ignoreModifications?: boolean }) => {
    setRowModesModel(prev => ({
      ...prev,
      [id]: { mode, ...options } as any
    }));
  };

  const handleEditClick = (id: number) => handleRowModeChange(id, GridRowModes.Edit);
  const handleSaveClick = (id: number) => handleRowModeChange(id, GridRowModes.View);
  const handleCancelClick = (id: number) => {
    handleRowModeChange(id, GridRowModes.View, { ignoreModifications: true });
    // Clear validation errors for this row when canceling
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleDeleteRow = (id: number) => {
    setRows(prev => prev.filter(row => row.id !== id));
    // Clear validation errors for deleted row
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleAddRow = () => {
    const newId = Math.max(...rows.map(r => r.id), 0) + 1;
    const newRow: Row = {
      id: newId,
      location: '',
      name: `New Project ${newId}`,
      start: new Date().toISOString().split('T')[0], // Today's date
      stop: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      source: 'Internal'
    };
    
    setRows(prev => [...prev, newRow]);
    setRowModesModel(prev => ({
      ...prev,
      [newId]: { mode: GridRowModes.Edit }
    }));
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow } as Row;
    setRows(prev => prev.map(row => row.id === newRow.id ? updatedRow : row));
    
    // Clear validation errors for this row after successful save
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[updatedRow.id];
      return newErrors;
    });
    
    // Flash effect
    setFlashRowId(newRow.id as number);
    setTimeout(() => setFlashRowId(null), 1000);
    
    return updatedRow;
  };

  // Validation with error tracking
  const preProcessEditLocationProps = (params: GridPreProcessEditCellProps) => {
    const errorMessage = validateLocation(params.props.value!.toString());
    const hasError = !!errorMessage;
    
    // Track validation errors
    const rowId = Number(params.id);
    setValidationErrors(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        location: hasError
      }
    }));
    
    return { ...params.props, error: errorMessage };
  };

  // Check if a row has validation errors
  const hasValidationErrors = (id: number) => {
    const rowErrors = validationErrors[id];
    return rowErrors && Object.values(rowErrors).some(hasError => hasError);
  };

  // Column definitions
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'location', 
      headerName: 'Location', 
      width: 150, 
      editable: true,
      preProcessEditCellProps: preProcessEditLocationProps,
      renderEditCell: (params) => <LocationEditInputCell {...params} />,
    },
    { field: 'name', headerName: 'Name', width: 200, editable: false },
    { 
      field: 'start', 
      headerName: 'Start Date', 
      width: 130, 
      editable: true,
      type: 'date',
      valueGetter: (params: any) => {
        if (!params) return null;
        // params is the actual value, not an object with a value property
        return params instanceof Date ? params : new Date(params);
      },
      valueFormatter: (params: any) => {
        if (!params) return '';
        const date = params instanceof Date ? params : new Date(params);
        return date.toISOString().split('T')[0]; // yyyy-mm-dd format
      },
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => ({
        ...params.props, 
        error: isNaN(new Date(params.props.value).getTime())
      }),
      renderEditCell: (params) => <DateEditInputCell {...params} />,
    },
    { 
      field: 'stop', 
      headerName: 'Stop Date', 
      width: 130, 
      editable: false,
      type: 'date',
      valueGetter: (params: any) => {
        if (!params) return null;
        // params is the actual value, not an object with a value property
        return params instanceof Date ? params : new Date(params);
      },
      valueFormatter: (params: any) => {
        if (!params) return '';
        const date = params instanceof Date ? params : new Date(params);
        return date.toISOString().split('T')[0]; // yyyy-mm-dd format
      },
      renderEditCell: (params) => <DateEditInputCell {...params} />,
    },
    { field: 'source', headerName: 'Source', width: 120, editable: false },
  ];

  // Action buttons renderer
  const renderActionButtons = (params: any) => {
    const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;
    const hasErrors = hasValidationErrors(params.id);

    if (isInEditMode) {
      return (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            disabled={hasErrors}
            onClick={() => handleSaveClick(params.id)}
            title={hasErrors ? "Fix validation errors before saving" : "Save"}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              opacity: hasErrors ? 0.5 : 1,
            }}
          >
            <SaveIcon fontSize="small" />
          </Button>
          <IconButton 
            size="small" 
            onClick={() => handleCancelClick(params.id)}
            title="Cancel"
          >
            <CancelIcon />
          </IconButton>
          <IconButton 
            size="small" 
            color="error"
            onClick={() => handleDeleteRow(params.id)}
            title="Delete"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      );
    }

    return (
      <Stack direction="row" spacing={1}>
        <IconButton 
          size="small" 
          onClick={() => handleEditClick(params.id)}
          title="Edit"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          size="small" 
          color="error" 
          onClick={() => handleDeleteRow(params.id)}
          title="Delete"
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    );
  };

  // Custom toolbar with proper slotProps usage
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          sx={{ mr: 1 }}
        >
          Add Row
        </Button>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector
          slotProps={{ tooltip: { title: 'Change table density' } }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <GridToolbarExport
          slotProps={{
            tooltip: { title: 'Export data to CSV or Excel' },
          }}
        />
      </GridToolbarContainer>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Arrow DataFrame loaded!</strong> 
          {arrowData && ` Rows: ${arrowData.numRows}, Columns: ${arrowData.numCols}`}
        </Typography>
      </Alert>
      
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Projects Database</Typography>
      </Box>
      
      <StyledDataGridContainer>
        <DataGrid
          rows={rows}
          columns={[
            ...columns,
            {
              field: 'actions',
              headerName: 'Actions',
              width: 200,
              renderCell: renderActionButtons,
              sortable: false,
              filterable: false,
              disableColumnMenu: true,
            }
          ]}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowEditStart={(params, event) => { event.defaultMuiPrevented = true; }}
          onRowEditStop={(params, event) => { event.defaultMuiPrevented = true; }}
          processRowUpdate={processRowUpdate}
          columnVisibilityModel={{ name: false }}
          getRowClassName={(params) => flashRowId === params.id ? 'flash-green' : ''}
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            height: '100%',
            '& .MuiDataGrid-toolbarContainer': {
              padding: '8px',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
          }}
        />
      </StyledDataGridContainer>
    </Box>
  );
} 
