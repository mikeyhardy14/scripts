import React, { useState, type ReactNode } from 'react';
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
import type { GridColDef, GridRowModel, GridValidRowModel, GridRenderCellParams, DataGridProps } from '@mui/x-data-grid';
import { Box, Stack, IconButton, Button, Tooltip, Skeleton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon, Visibility as ViewIcon } from '@mui/icons-material';

// ============================================================================
// Types
// ============================================================================

export type ActionType = 'view' | 'edit' | 'delete' | 'custom';

export interface ActionConfig {
  type: ActionType;
  label?: string;
  icon?: ReactNode;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  tooltip?: string;
  onClick?: (row: GridRowModel) => void | Promise<void>;
  hidden?: (row: GridRowModel) => boolean;
  disabled?: (row: GridRowModel) => boolean;
}

export interface ToolbarConfig {
  showAddButton?: boolean;
  addButtonLabel?: string;
  showColumnsButton?: boolean;
  showFilterButton?: boolean;
  showDensitySelector?: boolean;
  showExportButton?: boolean;
  customButtons?: ReactNode;
  onAddClick?: () => void;
}

export type RowModesModel = Record<string | number, { mode: GridRowModes; ignoreModifications?: boolean }>;

export type ValidationErrors = Record<string | number, Record<string, boolean>>;

export interface BaseDataGridProps<R extends GridValidRowModel = GridValidRowModel> 
  extends Omit<DataGridProps<R>, 'columns' | 'rows' | 'slots' | 'slotProps'> {
  rows: R[];
  columns: GridColDef<R>[];
  loading?: boolean;
  actionsColumnConfig?: {
    show?: boolean;
    width?: number;
    headerName?: string;
    actions?: ActionConfig[];
    showEditSaveCancel?: boolean;
  };
  toolbarConfig?: ToolbarConfig;
  onRowEdit?: (row: R) => void;
  onRowSave?: (newRow: R, oldRow: R) => Promise<R> | R;
  onRowDelete?: (row: R) => Promise<void> | void;
  onRowAdd?: () => void;
  validationErrors?: ValidationErrors;
  height?: number | string;
  containerSx?: object;
  flashRowId?: string | number | null;
}

// ============================================================================
// Styled Components
// ============================================================================

const StyledContainer = styled('div')<{ height?: number | string }>(({ theme, height }) => ({
  height: height ?? 600,
  width: '100%',
  '& .MuiDataGrid-cell--editable .MuiInputBase-root': { height: '100%' },
  '& .Mui-error': {
    backgroundColor: 'rgb(126,10,15, 0.1)',
    color: '#750f0f',
    ...theme.applyStyles('dark', { backgroundColor: 'rgb(126,10,15, 0)', color: '#ff4343' }),
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
// Toolbar
// ============================================================================

function Toolbar({ config }: { config?: ToolbarConfig }) {
  const { showAddButton = true, addButtonLabel = 'Add Row', showColumnsButton = true, showFilterButton = true, showDensitySelector = true, showExportButton = true, customButtons, onAddClick } = config || {};

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
// Actions Cell
// ============================================================================

const ICONS: Record<string, React.ReactNode> = { view: <ViewIcon />, edit: <EditIcon />, delete: <DeleteIcon /> };
const COLORS: Record<string, ActionConfig['color']> = { delete: 'error', edit: 'primary', view: 'info' };

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
        <Tooltip title="Cancel"><IconButton size="small" onClick={onCancel}><CancelIcon /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={onDelete}><DeleteIcon /></IconButton></Tooltip>
      </Stack>
    );
  }

  const items = actions.length > 0 ? actions : (showEditSaveCancel ? [{ type: 'edit' as const, tooltip: 'Edit' }, { type: 'delete' as const, tooltip: 'Delete' }] : []);

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {items.map((action, i) => {
        if (action.hidden?.(row)) return null;
        const onClick = () => action.type === 'edit' ? onEdit() : action.type === 'delete' ? onDelete() : action.onClick?.(row);
        return (
          <Tooltip key={i} title={action.tooltip ?? action.label ?? action.type}>
            <span>
              <IconButton size="small" color={action.color ?? COLORS[action.type] ?? 'inherit'} onClick={onClick} disabled={action.disabled?.(row)}>
                {action.icon ?? ICONS[action.type] ?? null}
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
  rows, columns, loading = false, actionsColumnConfig, toolbarConfig, onRowEdit, onRowSave, onRowDelete, onRowAdd,
  validationErrors = {}, height, containerSx, flashRowId, editMode = 'row', ...dataGridProps
}: BaseDataGridProps<R>) {
  const [rowModesModel, setRowModesModel] = useState<RowModesModel>({});
  const [internalFlashRowId, setInternalFlashRowId] = useState<string | number | null>(null);
  const [originalRows, setOriginalRows] = useState<Record<string | number, R>>({});

  const activeFlashRowId = flashRowId ?? internalFlashRowId;

  const handleEdit = (id: string | number) => {
    const row = rows.find(r => (r as any).id === id);
    if (row) {
      setOriginalRows(prev => ({ ...prev, [id]: { ...row } }));
      onRowEdit?.(row);
    }
    setRowModesModel(prev => ({ ...prev, [id]: { mode: GridRowModes.Edit } }));
  };

  const handleSave = (id: string | number) => setRowModesModel(prev => ({ ...prev, [id]: { mode: GridRowModes.View } }));
  const handleCancel = (id: string | number) => setRowModesModel(prev => ({ ...prev, [id]: { mode: GridRowModes.View, ignoreModifications: true } }));
  const handleDelete = async (id: string | number) => {
    const row = rows.find(r => (r as any).id === id);
    if (row && onRowDelete) await onRowDelete(row);
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const id = (newRow as any).id;
    const oldRow = originalRows[id];
    if (onRowSave && oldRow) {
      const saved = await onRowSave(newRow as R, oldRow);
      setInternalFlashRowId(id);
      setTimeout(() => setInternalFlashRowId(null), 1000);
      return saved;
    }
    return newRow;
  };

  const hasErrors = (id: string | number) => {
    const errs = validationErrors[id];
    return errs && Object.values(errs).some(Boolean);
  };

  const actionsCol: GridColDef | null = actionsColumnConfig?.show === false ? null : {
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
        hasErrors={hasErrors(params.id)}
        actions={actionsColumnConfig?.actions}
        showEditSaveCancel={actionsColumnConfig?.showEditSaveCancel ?? true}
        onEdit={() => handleEdit(params.id)}
        onSave={() => handleSave(params.id)}
        onCancel={() => handleCancel(params.id)}
        onDelete={() => handleDelete(params.id)}
      />
    )
  };

  if (loading) return <Skeleton variant="rectangular" height={height ?? 600} />;

  return (
    <Box sx={{ width: '100%', ...containerSx }}>
      <StyledContainer height={height}>
        <DataGrid
          rows={rows}
          columns={actionsCol ? [...columns, actionsCol as GridColDef<R>] : columns}
          editMode={editMode}
          rowModesModel={rowModesModel as any}
          onRowModesModelChange={m => setRowModesModel(m as RowModesModel)}
          onRowEditStart={(_, e) => { e.defaultMuiPrevented = true; }}
          onRowEditStop={(_, e) => { e.defaultMuiPrevented = true; }}
          processRowUpdate={processRowUpdate as any}
          getRowClassName={p => activeFlashRowId === p.id ? 'flash-green' : ''}
          slots={{ toolbar: () => <Toolbar config={{ ...toolbarConfig, onAddClick: onRowAdd ?? toolbarConfig?.onAddClick }} /> }}
          sx={{ height: '100%', '& .MuiDataGrid-toolbarContainer': { padding: '8px', borderBottom: '1px solid', borderColor: 'divider' } }}
          {...dataGridProps}
        />
      </StyledContainer>
    </Box>
  );
}
