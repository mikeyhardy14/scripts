import { Stack, IconButton, Button, Tooltip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import type { GridRowModel } from '@mui/x-data-grid';
import type { ActionConfig } from './types';

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

// Get the default icon for an action type
function getDefaultIcon(type: ActionConfig['type']) {
  switch (type) {
    case 'view':
      return <ViewIcon />;
    case 'edit':
      return <EditIcon />;
    case 'delete':
      return <DeleteIcon />;
    default:
      return null;
  }
}

// Get the default color for an action type
function getDefaultColor(type: ActionConfig['type']): ActionConfig['color'] {
  switch (type) {
    case 'delete':
      return 'error';
    case 'edit':
      return 'primary';
    case 'view':
      return 'info';
    default:
      return 'inherit';
  }
}

export default function ActionsCell({
  row,
  isEditing,
  hasErrors,
  actions = [],
  showEditSaveCancel = true,
  onEdit,
  onSave,
  onCancel,
  onDelete
}: ActionsCellProps) {
  // Render edit mode buttons (Save/Cancel/Delete)
  if (isEditing && showEditSaveCancel) {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title={hasErrors ? "Fix validation errors before saving" : "Save"}>
          <span>
            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={hasErrors}
              onClick={onSave}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                opacity: hasErrors ? 0.5 : 1,
              }}
            >
              <SaveIcon fontSize="small" />
            </Button>
          </span>
        </Tooltip>
        
        <Tooltip title="Cancel">
          <IconButton size="small" onClick={onCancel}>
            <CancelIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  // Render view mode buttons
  const renderAction = (action: ActionConfig, index: number) => {
    // Check if action should be hidden
    if (action.hidden?.(row)) {
      return null;
    }

    const isDisabled = action.disabled?.(row) ?? false;
    const icon = action.icon ?? getDefaultIcon(action.type);
    const color = action.color ?? getDefaultColor(action.type);
    const tooltip = action.tooltip ?? action.label ?? action.type;

    const handleClick = () => {
      switch (action.type) {
        case 'edit':
          onEdit();
          break;
        case 'delete':
          onDelete();
          break;
        case 'view':
        case 'custom':
          action.onClick?.(row);
          break;
      }
    };

    return (
      <Tooltip key={`action-${index}`} title={tooltip}>
        <span>
          <IconButton
            size="small"
            color={color}
            onClick={handleClick}
            disabled={isDisabled}
          >
            {icon}
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  // Default actions if none provided
  const defaultActions: ActionConfig[] = showEditSaveCancel
    ? [
        { type: 'edit', tooltip: 'Edit' },
        { type: 'delete', tooltip: 'Delete' }
      ]
    : [];

  const actionsToRender = actions.length > 0 ? actions : defaultActions;

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {actionsToRender.map(renderAction)}
    </Stack>
  );
}

