import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { IconButton, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

interface RowData {
  id: number;
  name: string;
  start: string;
  stop: string;
}

const MyDataGrid = () => {
  const [rows, setRows] = useState<RowData[]>([]);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editedDates, setEditedDates] = useState<{ start: string; stop: string }>({
    start: '',
    stop: '',
  });

  // Fetch data from API
  useEffect(() => {
    fetch('/api/your-endpoint')
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((item: any, index: number) => ({
          id: index,
          name: item.name,
          start: item.startDate,
          stop: item.stopDate,
        }));
        setRows(formattedData);
      });
  }, []);

  // Columns for the DataGrid
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'start',
      headerName: 'Start Date',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        if (editRowId === params.row.id) {
          return (
            <TextField
              type="date"
              value={editedDates.start}
              onChange={(e) => setEditedDates({ ...editedDates, start: e.target.value })}
            />
          );
        }
        return params.value;
      },
    },
    {
      field: 'stop',
      headerName: 'Stop Date',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        if (editRowId === params.row.id) {
          return (
            <TextField
              type="date"
              value={editedDates.stop}
              onChange={(e) => setEditedDates({ ...editedDates, stop: e.target.value })}
            />
          );
        }
        return params.value;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        if (editRowId === params.row.id) {
          return (
            <IconButton onClick={() => handleSave(params.row.id)}>
              <SaveIcon />
            </IconButton>
          );
        }
        return (
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
        );
      },
    },
  ];

  // Handle edit
  const handleEdit = (row: RowData) => {
    setEditRowId(row.id);
    setEditedDates({ start: row.start, stop: row.stop });
  };

  // Handle save
  const handleSave = (id: number) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, ...editedDates } : row))
    );
    setEditRowId(null);

    // Optionally, send the updated data to the API
    // fetch('/api/your-endpoint', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(editedDates),
    // });
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
};

export default MyDataGrid;
