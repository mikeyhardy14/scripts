// CustodianDataGrid.tsx
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import {
  DataGrid,
  GridColDef,
  GridRowModesModel,
  GridRowModes,
  GridActionsCellItem,
  GridPreProcessEditCellProps,
  GridRenderEditCellParams,
  GridRowId,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { useCustodies } from '../hooks/useCustodies';

const StyledBox = styled('div')(({ theme }) => ({
  height: 400,
  width: '100%',
  '& .MuiDataGrid-cell--editable': {
    backgroundColor: 'rgb(217 243 190)',
    '& .MuiInputBase-root': { height: '100%' },
    ...theme.applyStyles('dark', { backgroundColor: '#376331' }),
  },
  '& .Mui-error': {
    backgroundColor: 'rgba(126,10,15,0.1)',
    color: '#750f0f',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(126,10,15,0)',
      color: '#ff4343',
    }),
  },
}));

// Tooltip wrapper for cell-level errors
const StyledTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

function EditInputCell(props: GridRenderEditCellParams) {
  const { error } = props;
  return (
    <StyledTooltip open={!!error} title={error}>
      <props.components.EditInputCell {...props} />
    </StyledTooltip>
  );
}

export interface CustodianDataGridProps {
  asset: string;
  dataVersion: string;
}

export default function CustodianDataGrid({
  asset,
  dataVersion,
}: CustodianDataGridProps) {
  const { data, error, isLoading } = useCustodies(dataVersion);
  const [rows, setRows] = React.useState<any[]>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  // load → array → filter → sort
  React.useEffect(() => {
    if (!isLoading && data) {
      const arr = Array.isArray(data) ? data : Object.values(data);
      const filtered = arr.filter((c: any) => c.asset === asset);
      filtered.sort(
        (a: any, b: any) =>
          new Date(a.start).getTime() - new Date(b.start).getTime()
      );
      setRows(filtered);
    }
  }, [data, isLoading, asset]);

  // validation for Custodian
  const validateCustodian: GridPreProcessEditCellProps['preProcessEditCellProps'] = (
    params
  ) => {
    const value = (params.props.value || '').toString();
    const error = value.trim() === '' ? 'Required' : '';
    return { ...params.props, error };
  };

  // validation for Start date
  const validateStart: GridPreProcessEditCellProps['preProcessEditCellProps'] = (
    params
  ) => {
    const v = (params.props.value || '').toString();
    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(v);
    return { ...params.props, error: isValid ? '' : 'Format YYYY-MM-DD' };
  };

  // action handlers
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel((m) => ({
      ...m,
      [id]: { mode: GridRowModes.Edit },
    }));
  };
  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel((m) => ({
      ...m,
      [id]: { mode: GridRowModes.View },
    }));
  };
  const handleDeleteClick = (id: GridRowId) => () => {
    // TODO: call your delete API, then:
    setRows((r) => r.filter((row) => row.id !== id));
  };
  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel((m) => ({
      ...m,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
  };

  // processRowUpdate is called on Save; you can call your update API here
  const processRowUpdate = async (newRow: any) => {
    // TODO: await saveCustody(newRow)
    return newRow;
  };

  const columns: GridColDef[] = [
    {
      field: 'custodian',
      headerName: 'Custodian',
      width: 180,
      editable: true,
      preProcessEditCellProps: validateCustodian,
      renderEditCell: EditInputCell,
    },
    { field: 'asset', headerName: 'Asset', hide: true },
    {
      field: 'start',
      headerName: 'Start',
      width: 120,
      editable: true,
      preProcessEditCellProps: validateStart,
      renderEditCell: EditInputCell,
    },
    { field: 'stop', headerName: 'Stop', width: 120 },
    { field: 'source', headerName: 'Source', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      width: 120,
      headerName: 'Actions',
      getActions: (params) => {
        const isEditing =
          rowModesModel[params.id]?.mode === GridRowModes.Edit;
        return isEditing
          ? [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                onClick={handleSaveClick(params.id)}
                showInMenu={false}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                onClick={handleCancelClick(params.id)}
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(params.id)}
                color="error"
              />,
            ]
          : [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={handleEditClick(params.id)}
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(params.id)}
                color="error"
              />,
            ];
      },
    },
  ];

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error loading custodies</div>;

  return (
    <StyledBox>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        processRowUpdate={processRowUpdate}
        experimentalFeatures={{ newEditingApi: true }}
      />
    </StyledBox>
  );
}
