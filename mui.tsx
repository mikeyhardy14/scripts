import React, { useState } from 'react';
import { DataGrid, GridRowModes, GridActionsCellItem } from '@mui/x-data-grid';
import { IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

const initialRows = [
  { id: 1, name: 'John Doe', start: '2024-01-01', stop: '2024-12-31' },
  { id: 2, name: 'Jane Smith', start: '2023-06-01', stop: '2024-05-31' },
];

const MyDataGrid = () => {
  const [rows, setRows] = useState(initialRows);
  const [rowModesModel, setRowModesModel] = useState({});

  // Handle Edit Click
  const handleEditClick = (id) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  // Handle Save Click
  const handleSaveClick = (id) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  // Handle Cancel Click
  const handleCancelClick = (id) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  // Handle Delete Click
  const handleDeleteClick = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  // Columns for the DataGrid
  const columns = [
    { field: 'name', headerName: 'Name', width: 200, editable: false },
    {
      field: 'start',
      headerName: 'Start Date',
      width: 150,
      editable: true,
    },
    {
      field: 'stop',
      headerName: 'Stop Date',
      width: 150,
      editable: true,
    },
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
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
        processRowUpdate={(newRow) => {
          setRows(rows.map((row) => (row.id === newRow.id ? newRow : row)));
          return newRow;
        }}
      />
    </div>
  );
};

export default MyDataGrid;
