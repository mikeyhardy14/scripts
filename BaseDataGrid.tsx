import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  DataGrid, 
  GridRowModes,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport
} from '@mui/x-data-grid';
import type { 
  GridColDef, 
  GridRowModel,
  GridValidRowModel,
  GridRenderCellParams
} from '@mui/x-data-grid';
import { Box, Stack, IconButton, Button, Tooltip, Skeleton } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import type { BaseDataGridProps, RowModesModel, ToolbarConfig, ActionConfig } from './types';

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

// ============================================================================
// BaseToolbar
// ============================================================================

function BaseToolbar({ config }: { config?: ToolbarConfig }) {
  const {
    showAddButton = true,
    addButtonLabel = 'Add Row',
    showColumnsButton = true,
    showFilterButton = true,
    showDensitySelector = true,
    showExportButton = true,
    customButtons,
    onAddClick
  } = config || {};

  return (
    <GridToolbarContainer sx={{ padding: '8px 16px', borderBottom: '1px solid', borderColor: 'divider', gap: 1 }}>
      {showAddButton && onAddClick && (
        <Button color="primary" variant="contained" size="small" startIcon={<AddIcon />} onClick={onAddClick} sx={{ mr: 1 }}>
          {addButtonLabel}
        </Button>
      )}
      {showColumnsButton && <GridToolbarColumnsButton />}
      {showFilterButton && <GridToolbarFilterButton />}
      {showDensitySelector && <GridToolbarDensitySelector slotProps={{ tooltip: { title: 'Change table density' } }} />}
      {customButtons}
      <Box sx={{ flexGrow: 1 }} />
      {showExportButton && <GridToolbarExport slotProps={{ tooltip: { title: 'Export data to CSV' } }} />}
    </GridToolbarContainer>
  );
}

// ============================================================================
// ActionsCell
// ============================================================================

const ACTION_ICONS: Record<string, React.ReactNode> = {
  view: <ViewIcon />,
  edit: <EditIcon />,
  delete: <DeleteIcon />,
};

const ACTION_COLORS: Record<string, ActionConfig['color']> = {
  delete: 'error',
  edit: 'primary',
  view: 'info',
};

interface ActionsCellProps {
  row: GridRowModel;
  isEditing: boolean;
  hasErrors: boolean;
  actions?: ActionConfig[];
  showEditSaveCancel?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function ActionsCell({ row, isEditing, hasErrors, actions = [], showEditSaveCancel = true, onEdit, onSave, onCancel, onDelete }: ActionsCellProps) {
  if (isEditing && showEditSaveCancel) {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title={hasErrors ? "Fix validation errors before saving" : "Save"}>
          <span>
            <Button size="small" variant="contained" color="primary" disabled={hasErrors} onClick={onSave} sx={{ minWidth: 'auto', px: 1.5, opacity: hasErrors ? 0.5 : 1 }}>
              <SaveIcon fontSize="small" />
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Cancel">
          <IconButton size="small" onClick={onCancel}><CancelIcon /></IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete}><DeleteIcon /></IconButton>
        </Tooltip>
      </Stack>
    );
  }

  const actionsToRender = actions.length > 0 ? actions : (showEditSaveCancel ? [{ type: 'edit' as const, tooltip: 'Edit' }, { type: 'delete' as const, tooltip: 'Delete' }] : []);

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {actionsToRender.map((action, index) => {
        if (action.hidden?.(row)) return null;
        
        const handleClick = () => {
          if (action.type === 'edit') onEdit();
          else if (action.type === 'delete') onDelete();
          else action.onClick?.(row);
        };

        return (
          <Tooltip key={index} title={action.tooltip ?? action.label ?? action.type}>
            <span>
              <IconButton size="small" color={action.color ?? ACTION_COLORS[action.type] ?? 'inherit'} onClick={handleClick} disabled={action.disabled?.(row)}>
                {action.icon ?? ACTION_ICONS[action.type] ?? null}
              </IconButton>
            </span>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

// ============================================================================
// BaseDataGrid
// ============================================================================

export default function BaseDataGrid<R extends GridValidRowModel = GridValidRowModel>({
  rows,
  columns,
  loading = false,
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
  const [rowModesModel, setRowModesModel] = useState<RowModesModel>({});
  const [internalFlashRowId, setInternalFlashRowId] = useState<string | number | null>(null);
  const [originalRows, setOriginalRows] = useState<Record<string | number, R>>({});

  const activeFlashRowId = flashRowId ?? internalFlashRowId;

  const handleEditClick = (id: string | number) => {
    const rowToEdit = rows.find(row => (row as any).id === id);
    if (rowToEdit) {
      setOriginalRows(prev => ({ ...prev, [id]: { ...rowToEdit } }));
      onRowEdit?.(rowToEdit);
    }
    setRowModesModel(prev => ({ ...prev, [id]: { mode: GridRowModes.Edit } }));
  };

  const handleSaveClick = (id: string | number) => {
    setRowModesModel(prev => ({ ...prev, [id]: { mode: GridRowModes.View } }));
  };

  const handleCancelClick = (id: string | number) => {
    setRowModesModel(prev => ({ ...prev, [id]: { mode: GridRowModes.View, ignoreModifications: true } }));
  };

  const handleDeleteClick = async (id: string | number) => {
    const rowToDelete = rows.find(row => (row as any).id === id);
    if (rowToDelete && onRowDelete) {
      await onRowDelete(rowToDelete);
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const id = (newRow as any).id;
    const oldRow = originalRows[id];
    
    if (onRowSave && oldRow) {
      const savedRow = await onRowSave(newRow as R, oldRow);
      setInternalFlashRowId(id);
      setTimeout(() => setInternalFlashRowId(null), 1000);
      return savedRow;
    }
    return newRow;
  };

  const hasValidationErrors = (id: string | number) => {
    const rowErrors = validationErrors[id];
    return rowErrors && Object.values(rowErrors).some(Boolean);
  };

  // Build actions column
  const actionsColumn: GridColDef | null = actionsColumnConfig?.show === false ? null : {
    field: 'actions',
    headerName: actionsColumnConfig?.headerName ?? 'Actions',
    width: actionsColumnConfig?.width ?? 180,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params: GridRenderCellParams) => (
      <ActionsCell
        row={params.row}
        isEditing={rowModesModel[params.id]?.mode === GridRowModes.Edit}
        hasErrors={hasValidationErrors(params.id)}
        actions={actionsColumnConfig?.actions}
        showEditSaveCancel={actionsColumnConfig?.showEditSaveCancel ?? true}
        onEdit={() => handleEditClick(params.id)}
        onSave={() => handleSaveClick(params.id)}
        onCancel={() => handleCancelClick(params.id)}
        onDelete={() => handleDeleteClick(params.id)}
      />
    )
  };

  const allColumns = actionsColumn ? [...columns, actionsColumn as GridColDef<R>] : columns;

  const finalToolbarConfig: ToolbarConfig = {
    ...toolbarConfig,
    onAddClick: onRowAdd ?? toolbarConfig?.onAddClick
  };

  if (loading) {
    return <Skeleton variant="rectangular" height={height ?? 600} />;
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
          onRowEditStart={(_params, event) => { event.defaultMuiPrevented = true; }}
          onRowEditStop={(_params, event) => { event.defaultMuiPrevented = true; }}
          processRowUpdate={processRowUpdate as any}
          getRowClassName={(params) => activeFlashRowId === params.id ? 'flash-green' : ''}
          slots={{ toolbar: () => <BaseToolbar config={finalToolbarConfig} /> }}
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
