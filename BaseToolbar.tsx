import { 
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport
} from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { ToolbarConfig } from './types';

interface BaseToolbarProps {
  config?: ToolbarConfig;
}

export default function BaseToolbar({ config }: BaseToolbarProps) {
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
    <GridToolbarContainer sx={{ 
      padding: '8px 16px',
      borderBottom: '1px solid',
      borderColor: 'divider',
      gap: 1
    }}>
      {/* Add Button */}
      {showAddButton && onAddClick && (
        <Button
          color="primary"
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          sx={{ mr: 1 }}
        >
          {addButtonLabel}
        </Button>
      )}

      {/* Standard Toolbar Buttons */}
      {showColumnsButton && <GridToolbarColumnsButton />}
      {showFilterButton && <GridToolbarFilterButton />}
      {showDensitySelector && (
        <GridToolbarDensitySelector
          slotProps={{ tooltip: { title: 'Change table density' } }}
        />
      )}

      {/* Custom Buttons */}
      {customButtons}

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Export Button */}
      {showExportButton && (
        <GridToolbarExport
          slotProps={{
            tooltip: { title: 'Export data to CSV' },
          }}
        />
      )}
    </GridToolbarContainer>
  );
}

