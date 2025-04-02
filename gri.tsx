import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridRenderEditCellParams,
  GridPreProcessEditCellProps,
  GridRowModes,
  GridRowModel,
  GridEditInputCell,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DiscardIcon from '@mui/icons-material/Undo';
import Button from '@mui/material/Button';

const StyledBox = styled('div')(({ theme }) => ({
  height: 400,
  width: '100%',
  marginTop: theme.spacing(2),
  '& .MuiDataGrid-cell--editable': {
    backgroundColor: 'rgb(217 243 190)',
    '& .MuiInputBase-root': {
      height: '100%',
    },
    ...theme.applyStyles('dark', {
      backgroundColor: '#376331',
    }),
  },
  '& .Mui-error': {
    backgroundColor: 'rgba(126,10,15, 0.1)',
    color: '#750f0f',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(126,10,15, 0)',
      color: '#ff4343',
    }),
  },
  // Class applied temporarily for the flash effect on successful save
  '& .flash-success': {
    backgroundColor: 'lightgreen',
    transition: 'background-color 1s ease-out',
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

// Custom edit input cell that wraps the default GridEditInputCell with a tooltip
function CustomEditInputCell(props: GridRenderEditCellParams) {
  const { error } = props;
  return (
    <StyledTooltip open={!!error} title={error || ''}>
      <GridEditInputCell {...props} />
    </StyledTooltip>
  );
}

// Validation function for Custodian field.
// If the entered value is "Mike" (case insensitive), return an error message.
async function validateCustodian(value: string): Promise<string | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (value.toLowerCase() === 'mike') {
        resolve('Mike is not allowed.');
      } else {
        resolve(null);
      }
    }, 300);
  });
}

// Dummy validation for Start (always passes)
async function validateStart(value: string): Promise<string | null> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), 300);
  });
}

// Initial sample data rows
const initialRows: GridRowsProp = [
  { id: 1, custodian: 'Alice', asset: 'Asset A', start: '2023-01-01', stop: '2023-01-31' },
  { id: 2, custodian: 'Bob', asset: 'Asset B', start: '2023-02-01', stop: '2023-02-28' },
];

// Type for error tracking per row field.
interface RowError {
  custodian?: string;
  start?: string;
}

export default function ExtendedDataGrid() {
  const [rows, setRows] = React.useState<GridRowModel[]>(initialRows);
  // Tracks whether a row is in edit mode or view mode.
  const [rowModesModel, setRowModesModel] = React.useState<{ [id: number]: { mode: GridRowModes } }>({});
  // Used to trigger a flash effect on saved rows.
  const [flashRows, setFlashRows] = React.useState<{ [id: number]: boolean }>({});
  // State to track validation errors for each row's editable fields.
  const [rowErrors, setRowErrors] = React.useState<{ [id: number]: RowError }>({});

  // Sort rows: unsaved rows always come first; saved rows are sorted by the 'start' date.
  const sortedRows = React.useMemo(() => {
    return rows.slice().sort((a, b) => {
      if (a.unsaved && !b.unsaved) return -1;
      if (!a.unsaved && b.unsaved) return 1;
      return a.start.localeCompare(b.start);
    });
  }, [rows]);

  // Handler to enable edit mode for a row.
  const handleEditClick = (id: number) => {
    setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.Edit } }));
  };

  // Handler to cancel edit mode and discard changes.
  const handleCancelClick = (id: number) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
  };

  // processRowUpdate validates the row values.
  // If validation fails, it throws an error and the row remains in edit mode.
  const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
    const custodianError = await validateCustodian(newRow.custodian?.toString() || '');
    const startError = await validateStart(newRow.start?.toString() || '');
    if (custodianError || startError) {
      throw new Error(custodianError || startError || 'Validation error');
    }
    return newRow;
  };

  // Handler to save a row.
  // It calls processRowUpdate and, if validation passes, removes the 'unsaved' flag,
  // sorts the rows (if the row was newly added) and exits edit mode.
  const handleSaveClick = async (id: number) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    try {
      const updatedRow = await processRowUpdate(row, row);
      // Remove the 'unsaved' flag if it exists.
      if (updatedRow.unsaved) {
        delete updatedRow.unsaved;
      }
      // Update rows and sort them.
      setRows((prevRows) => {
        const newRows = prevRows.map((r) => (r.id === id ? updatedRow : r));
        return newRows.slice().sort((a, b) => {
          if (a.unsaved && !b.unsaved) return -1;
          if (!a.unsaved && b.unsaved) return 1;
          return a.start.localeCompare(b.start);
        });
      });
      // Set row mode to view.
      setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.View } }));
      // Trigger flash effect.
      setFlashRows((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setFlashRows((prev) => ({ ...prev, [id]: false }));
      }, 1000);
    } catch (error) {
      console.error('Validation error:', error);
      // Optionally, you can display a notification to the user here.
    }
  };

  // Handler to delete a row.
  const handleDeleteClick = (id: number) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    // Clean up errors and editing mode for the row.
    setRowErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setRowModesModel((prev) => {
      const newModes = { ...prev };
      delete newModes[id];
      return newModes;
    });
  };

  // Handler to add a new row.
  // New rows are flagged as unsaved so they remain at the top until saved.
  const handleAddRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => Number(r.id))) + 1 : 1;
    const newRow: GridRowModel = {
      id: newId,
      custodian: '',
      asset: '',
      start: new Date().toISOString().slice(0, 10),
      stop: '',
      unsaved: true,
    };
    setRows((prevRows) => [newRow, ...prevRows]);
    setRowModesModel((prev) => ({ ...prev, [newId]: { mode: GridRowModes.Edit } }));
  };

  // Define grid columns.
  const columns: GridColDef[] = [
    {
      field: 'custodian',
      headerName: 'Custodian',
      width: 150,
      editable: true,
      preProcessEditCellProps: async (params: GridPreProcessEditCellProps) => {
        const error = await validateCustodian(params.props.value?.toString() || '');
        setRowErrors((prev) => ({
          ...prev,
          [params.id]: { ...prev[params.id], custodian: error || '' },
        }));
        return { ...params.props, error };
      },
      cellClassName: (params) => (flashRows[params.id as number] ? 'flash-success' : ''),
      renderEditCell: (params: GridRenderEditCellParams) => <CustomEditInputCell {...params} />,
    },
    {
      field: 'asset',
      headerName: 'Asset',
      width: 150,
      editable: false,
    },
    {
      field: 'start',
      headerName: 'Start',
      width: 150,
      editable: true,
      preProcessEditCellProps: async (params: GridPreProcessEditCellProps) => {
        const error = await validateStart(params.props.value?.toString() || '');
        setRowErrors((prev) => ({
          ...prev,
          [params.id]: { ...prev[params.id], start: error || '' },
        }));
        return { ...params.props, error };
      },
      cellClassName: (params) => (flashRows[params.id as number] ? 'flash-success' : ''),
      renderEditCell: (params: GridRenderEditCellParams) => <CustomEditInputCell {...params} />,
    },
    {
      field: 'stop',
      headerName: 'Stop',
      width: 150,
      editable: false,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const isInEditMode = rowModesModel[params.id as number]?.mode === GridRowModes.Edit;
        const errorsForRow = rowErrors[params.id] || {};
        const hasError = Object.values(errorsForRow).some((error) => error);
        return isInEditMode ? (
          <>
            <CancelIcon
              onClick={() => handleCancelClick(params.id as number)}
              style={{ cursor: 'pointer', marginRight: 8 }}
              fontSize="small"
            />
            <SaveIcon
              onClick={!hasError ? () => handleSaveClick(params.id as number) : undefined}
              style={{
                cursor: hasError ? 'not-allowed' : 'pointer',
                marginRight: 8,
                opacity: hasError ? 0.5 : 1,
              }}
              fontSize="small"
            />
            <DiscardIcon
              onClick={() => {
                // Discard logic placeholder
              }}
              style={{ cursor: 'pointer' }}
              fontSize="small"
            />
          </>
        ) : (
          <>
            <EditIcon
              onClick={() => handleEditClick(params.id as number)}
              style={{ cursor: 'pointer', marginRight: 8 }}
              fontSize="small"
            />
            <DeleteIcon
              onClick={() => handleDeleteClick(params.id as number)}
              style={{ cursor: 'pointer' }}
              fontSize="small"
            />
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleAddRow}>
        Add Row
      </Button>
      <StyledBox>
        <DataGrid
          rows={sortedRows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          processRowUpdate={processRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </StyledBox>
    </div>
  );
}