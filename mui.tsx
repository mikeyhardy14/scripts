import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowModesModel,
  GridRowModes,
  GridRowId,
  GridRowModel,
  GridActionsCellItem,
  GridRowParams,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { keyframes, styled } from '@mui/material/styles';
// import { nanoid } from 'nanoid'; // Optionally use a library for unique IDs

/**
 * If you have data that might NOT have an id, define a minimal interface.
 * E.g., the "partial row" might look like { name, start, stop } only.
 */
interface PartialRowData {
  name: string;
  start: string;
  stop: string;
  id?: number; // This may or may not exist in the incoming data
}

/** 
 * The row interface we *actually* want in state, 
 * guaranteeing an `id` is present.
 */
export interface RowData {
  id: number;
  name: string;
  start: string;
  stop: string;
}

interface EditableDataGridProps {
  /**
   * Initial list of rows. Some or all might be missing an `id`.
   */
  initialRows?: PartialRowData[];
  /**
   * Callback when rows change (e.g., saved or deleted).
   */
  onRowsChange?: (updatedRows: RowData[]) => void;
}

/** Keyframes for flashing a row green and fading to transparent */
const flashGreenFade = keyframes`
  0% {
    background-color: #c8f0c6; /* Light green */
  }
  100% {
    background-color: transparent;
  }
`;

/** 
 * We create a styled wrapper around a simple div. 
 * Any child element with the class "flash-green" gets our animation.
 */
const DataGridWrapper = styled('div')({
  width: '100%',
  height: 400,
  '.flash-green': {
    animation: `${flashGreenFade} 2s forwards`,
  },
});

export function EditableDataGrid({
  initialRows = [
    { name: 'Task One',  start: '2025-01-01', stop: '2025-02-01' },
    { name: 'Task Two',  start: '2025-03-01', stop: '2025-04-01' },
    { name: 'Task Three',start: '2025-05-01', stop: '2025-06-01' },
  ],
  onRowsChange,
}: EditableDataGridProps) {
  /**
   * 1) Convert "partial" rows (with possible missing `id`) to "full" rows
   *    by generating an ID if none is present.
   */
  const rowsWithIds = React.useMemo<RowData[]>(() => {
    return initialRows.map((row, index) => {
      return {
        // Use the existing `id` if present; otherwise generate one
        id: row.id ?? index + 1, 
        // or use nanoid() if you want a random unique ID:
        // id: row.id ?? nanoid(),
        name: row.name,
        start: row.start,
        stop: row.stop,
      };
    });
  }, [initialRows]);

  /**
   * 2) We store these "full" rows in state.
   */
  const [rows, setRows] = React.useState<RowData[]>(rowsWithIds);

  /**
   * 3) Track which row is in "Edit" or "View" mode
   */
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  /**
   * 4) Keep track of which row just got updated (for the "flash" effect).
   */
  const [flashedRowId, setFlashedRowId] = React.useState<GridRowId | null>(null);

  // -- ACTION HANDLERS --
  const handleEditClick = (id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  const handleSaveClick = (id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View },
    }));
  };

  const handleCancelClick = (id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
  };

  const handleDeleteClick = (id: GridRowId) => {
    setRows((prevRows) => {
      const updated = prevRows.filter((row) => row.id !== id);
      onRowsChange?.(updated);
      return updated;
    });
  };

  /**
   * 5) processRowUpdate gets called by DataGrid 
   *    when a row is saved (after inline editing).
   */
  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    const updatedRow = { ...oldRow, ...newRow } as RowData;
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === oldRow.id ? updatedRow : row
      );
      onRowsChange?.(updatedRows);
      return updatedRows;
    });

    // Trigger the "flash" on the just-updated row
    setFlashedRowId(updatedRow.id);
    // Remove the flash after 2 seconds
    setTimeout(() => {
      setFlashedRowId(null);
    }, 2000);

    return updatedRow;
  };

  const handleProcessRowUpdateError = (error: Error) => {
    console.error(error);
  };

  /**
   * 6) Columns, including the "Actions" column
   */
  const columns: GridColDef[] = [
    { field: 'name',  headerName: 'Name',       width: 200, editable: true },
    { field: 'start', headerName: 'Start Date', width: 150, editable: true },
    { field: 'stop',  headerName: 'Stop Date',  width: 150, editable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params) => {
        const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={() => handleSaveClick(params.id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              onClick={() => handleCancelClick(params.id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDeleteClick(params.id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditClick(params.id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(params.id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  /**
   * 7) getRowClassName is used to apply the "flash-green" class 
   *    if the row was just updated.
   */
  const getRowClassName = (params: GridRowParams) => {
    return params.id === flashedRowId ? 'flash-green' : '';
  };

  /**
   * Finally, render the DataGrid with our columns and row data.
   */
  return (
    <DataGridWrapper>
      <DataGrid
        rows={rows}
        columns={columns}
        rowModesModel={rowModesModel}
        onRowModesModelChange={(model) => setRowModesModel(model)}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        getRowClassName={getRowClassName}
        // experimentalFeatures={{ newEditingApi: true }}
      />
    </DataGridWrapper>
  );
}
