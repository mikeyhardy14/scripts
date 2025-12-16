import { useState, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid, GridRowModes } from '@mui/x-data-grid';
import type { 
  GridColDef, 
  GridRowModel,
  GridValidRowModel,
  GridRenderCellParams
} from '@mui/x-data-grid';
import { Box, CircularProgress, Typography } from '@mui/material';
import BaseToolbar from './BaseToolbar';
import ActionsCell from './ActionsCell';
import type { BaseDataGridProps, RowModesModel, ToolbarConfig } from './types';

// Styled container with flash animation
const StyledDataGridContainer = styled('div')<{ height?: number | string }>(({ theme, height }) => ({
  height: height ?? 600,
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

// Loading component
function LoadingOverlay({ message }: { message?: string }) {
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
      <Typography variant="h6">{message ?? 'Loading...'}</Typography>
    </Box>
  );
}

export default function BaseDataGrid<R extends GridValidRowModel = GridValidRowModel>({
  rows,
  columns,
  loading = false,
  loadingMessage,
  actionsColumnConfig,
  toolbarConfig,
  onRowEdit,
  onRowSave,
  onRowDelete,
  onRowAdd,
  validationErrors = {},
  height,
  containerSx,
  flashRowId,
  editMode = 'row',
  ...dataGridProps
}: BaseDataGridProps<R>) {
  // Internal state for row modes
  const [rowModesModel, setRowModesModel] = useState<RowModesModel>({});
  const [internalFlashRowId, setInternalFlashRowId] = useState<string | number | null>(null);
  const [originalRows, setOriginalRows] = useState<Record<string | number, R>>({});

  // Use external flashRowId if provided, otherwise use internal
  const activeFlashRowId = flashRowId ?? internalFlashRowId;

  // Handle entering edit mode
  const handleEditClick = useCallback((id: string | number) => {
    const rowToEdit = rows.find(row => (row as any).id === id);
    if (rowToEdit) {
      setOriginalRows(prev => ({
        ...prev,
        [id]: { ...rowToEdit }
      }));
    }
    setRowModesModel(prev => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit }
    }));
    if (onRowEdit && rowToEdit) {
      onRowEdit(rowToEdit);
    }
  }, [rows, onRowEdit]);

  // Handle save click
  const handleSaveClick = useCallback((id: string | number) => {
    setRowModesModel(prev => ({
      ...prev,
      [id]: { mode: GridRowModes.View }
    }));
  }, []);

  // Handle cancel click
  const handleCancelClick = useCallback((id: string | number) => {
    setRowModesModel(prev => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    }));
  }, []);

  // Handle delete click
  const handleDeleteClick = useCallback(async (id: string | number) => {
    const rowToDelete = rows.find(row => (row as any).id === id);
    if (rowToDelete && onRowDelete) {
      await onRowDelete(rowToDelete);
    }
  }, [rows, onRowDelete]);

  // Process row update (called when exiting edit mode)
  const processRowUpdate = useCallback(async (newRow: GridRowModel) => {
    const id = (newRow as any).id;
    const oldRow = originalRows[id];
    
    if (onRowSave && oldRow) {
      const savedRow = await onRowSave(newRow as R, oldRow);
      
      // Flash effect
      setInternalFlashRowId(id);
      setTimeout(() => setInternalFlashRowId(null), 1000);
      
      return savedRow;
    }
    
    return newRow;
  }, [originalRows, onRowSave]);

  // Check if a row has validation errors
  const hasValidationErrors = useCallback((id: string | number) => {
    const rowErrors = validationErrors[id];
    return rowErrors && Object.values(rowErrors).some(hasError => hasError);
  }, [validationErrors]);

  // Build the actions column
  const actionsColumn: GridColDef | null = useMemo(() => {
    const config = actionsColumnConfig;
    if (config?.show === false) return null;

    return {
      field: 'actions',
      headerName: config?.headerName ?? 'Actions',
      width: config?.width ?? 180,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => {
        const isEditing = rowModesModel[params.id]?.mode === GridRowModes.Edit;
        const hasErrors = hasValidationErrors(params.id);

        return (
          <ActionsCell
            row={params.row}
            isEditing={isEditing}
            hasErrors={hasErrors}
            actions={config?.actions}
            showEditSaveCancel={config?.showEditSaveCancel ?? true}
            onEdit={() => handleEditClick(params.id)}
            onSave={() => handleSaveClick(params.id)}
            onCancel={() => handleCancelClick(params.id)}
            onDelete={() => handleDeleteClick(params.id)}
          />
        );
      }
    };
  }, [
    actionsColumnConfig,
    rowModesModel,
    hasValidationErrors,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleDeleteClick
  ]);

  // Combine columns with actions column
  const allColumns = useMemo(() => {
    if (actionsColumn) {
      return [...columns, actionsColumn as GridColDef<R>];
    }
    return columns;
  }, [columns, actionsColumn]);

  // Build toolbar config with add handler
  const finalToolbarConfig: ToolbarConfig = useMemo(() => ({
    ...toolbarConfig,
    onAddClick: onRowAdd ?? toolbarConfig?.onAddClick
  }), [toolbarConfig, onRowAdd]);

  // Create toolbar component
  const ToolbarComponent = useCallback(() => (
    <BaseToolbar config={finalToolbarConfig} />
  ), [finalToolbarConfig]);

  // Show loading state
  if (loading) {
    return <LoadingOverlay message={loadingMessage} />;
  }

  return (
    <Box sx={{ width: '100%', ...containerSx }}>
      <StyledDataGridContainer height={height}>
        <DataGrid
          rows={rows}
          columns={allColumns}
          editMode={editMode}
          rowModesModel={rowModesModel as any}
          onRowModesModelChange={(newModel) => setRowModesModel(newModel as RowModesModel)}
          onRowEditStart={(params, event) => { event.defaultMuiPrevented = true; }}
          onRowEditStop={(params, event) => { event.defaultMuiPrevented = true; }}
          processRowUpdate={processRowUpdate}
          getRowClassName={(params) => 
            activeFlashRowId === params.id ? 'flash-green' : ''
          }
          slots={{
            toolbar: ToolbarComponent,
          }}
          sx={{
            height: '100%',
            '& .MuiDataGrid-toolbarContainer': {
              padding: '8px',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
          }}
          {...dataGridProps}
        />
      </StyledDataGridContainer>
    </Box>
  );
}

