import * as React from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridRowModesModel, 
  GridRowModes, 
  GridRowId, 
  GridRowModel, 
  GridActionsCellItem 
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

interface RowData {
  id: number;
  name: string;
  start: string;
  stop: string;
}

export default function EditableDataGrid() {
  const [rows, setRows] = React.useState<RowData[]>([
    { id: 1, name: 'Task One', start: '2025-01-01', stop: '2025-02-01' },
    { id: 2, name: 'Task Two', start: '2025-03-01', stop: '2025-04-01' },
    { id: 3, name: 'Task Three', start: '2025-05-01', stop: '2025-06-01' },
  ]);

  // Keeps track of which row is in which mode (view or edit).
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  // Start editing a row
  const handleEditClick = (id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  // Save the row edits
  const handleSaveClick = (id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View },
    }));
  };

  // Cancel the edits
  const handleCancelClick = (id: GridRowId) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
  };

  // Delete the row
  const handleDeleteClick = (id: GridRowId) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  // Callback that the DataGrid calls when it wants to save edited data
  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    // Typically, you’d send an API request here.
    // For the demo, we’ll just merge the new row data into state.
    const updatedRow = { ...oldRow, ...newRow };
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  // If row editing fails, revert changes
  const handleProcessRowUpdateError = (error: Error) => {
    console.error(error);
  };

  // Define the columns
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200, editable: true },
    { field: 'start', headerName: 'Start Date', width: 150, editable: true },
    { field: 'stop', headerName: 'Stop Date', width: 150, editable: true },
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

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        // The rowModesModel tells DataGrid which rows are in "edit" mode.
        rowModesModel={rowModesModel}
        onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
        // Called before rowUpdate is finalized
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        experimentalFeatures={{ newEditingApi: true }} // or remove if using stable editing features
      />
    </div>
  );
}
