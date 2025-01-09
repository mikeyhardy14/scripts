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
  GridToolbar,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { keyframes, styled } from '@mui/material/styles';

export interface RowData {
  id: number;
  name: string;
  start: string;
  stop: string;
}

interface EditableDataGridProps {
  initialRows?: RowData[];
  onRowsChange?: (updatedRows: RowData[]) => void;
}

/** 
 * Keyframes for flashing a row green and fading to transparent 
 * over 2 seconds.
 */
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
  // The magic class that we’ll apply to the row
  '.flash-green': {
    animation: `${flashGreenFade} 2s forwards`,
  },
});

export function EditableDataGrid({
  initialRows = [
    { id: 1, name: 'Task One', start: '2025-01-01', stop: '2025-02-01' },
    { id: 2, name: 'Task Two', start: '2025-03-01', stop: '2025-04-01' },
    { id: 3, name: 'Task Three', start: '2025-05-01', stop: '2025-06-01' },
  ],
  onRowsChange,
}: EditableDataGridProps) {
  const [rows, setRows] = React.useState<RowData[]>(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  // Keep track of which row ID was just updated (for the flash effect).
  const [flashedRowId, setFlashedRowId] = React.useState<GridRowId | null>(null);
  

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

  // Called by DataGrid when saving row edits.
  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    const updatedRow = { ...oldRow, ...newRow } as RowData;
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === oldRow.id ? updatedRow : row
      );
      onRowsChange?.(updatedRows);
      return updatedRows;
    });

    // Trigger the flash on the newly updated row.
    setFlashedRowId(updatedRow.id);

    // Remove the flash after 2s, allowing future saves to flash again.
    setTimeout(() => {
      setFlashedRowId(null);
    }, 2000);

    return updatedRow;
  };

  const handleProcessRowUpdateError = (error: Error) => {
    console.error(error);
  };

  // We show Edit/Save/Cancel/Delete in the Actions column.
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200,flex:1, editable: true },
    { field: 'start', headerName: 'Start Date', width: 150, editable: true },
    { field: 'stop', headerName: 'Stop Date', width: 150, editable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params) => {
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit;

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

  // Dynamically assign the "flash-green" class if the row ID matches flashedRowId.
  const getRowClassName = (params: GridRowParams) => {
    return params.id === flashedRowId ? 'flash-green' : '';
  };

  return (
    <DataGridWrapper>
      <DataGrid
        slots={{toolbar:GridToolbar}}
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
