import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  ButtonGroup,
  TextField
} from '@mui/material';
import { 
  GetApp as ExportIcon,
  Description as CsvIcon,
  TableChart as ExcelIcon,
  Archive as ZipIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './export.css';

// Types
type ExportFormat = 'csv' | 'xlsx';

interface FileData {
  id: string;
  name: string;
  format: ExportFormat;
}

interface EventData extends Record<string, unknown> {
  id: number;
  name: string;
  type: string;
  date: string;
  participants: number;
}

interface LocationData extends Record<string, unknown> {
  Date: string;
  Day: number;
  Location: string;
  Value: number;
}

interface ProcessedData {
  events: EventData[];
  locationSheets: Record<string, LocationData[]>;
}

interface InputData {
  assetNames: Record<string, unknown>;
  Colors: Record<string, unknown>;
  Events: EventData[];
  totalsByLocationType: Record<string, number[]>;
}

interface ExportProps {
  data: InputData;
  startDate: string;
}

// Constants
const INITIAL_FILES: FileData[] = [
  { id: '1', name: 'events', format: 'csv' },
  { id: '2', name: 'location_summary', format: 'xlsx' }
];

const MIME_TYPES = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
} as const;

const Export: React.FC<ExportProps> = ({ data, startDate }) => {
  // State
  const [files, setFiles] = useState<FileData[]>(INITIAL_FILES);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  // Utility Functions
  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (!data?.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const convertToXLSX = (data: Record<string, unknown>[]): Uint8Array => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  };

  const downloadFile = (content: string | Uint8Array, fileName: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, fileName);
  };

  const processData = (inputData: InputData, startDate: string): ProcessedData => {
    const baseDate = new Date(startDate);
    
    const locationSheets: Record<string, LocationData[]> = {};
    
    Object.entries(inputData.totalsByLocationType).forEach(([location, values]) => {
      locationSheets[location] = values.map((value, index) => {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + index);
        
        return {
          Date: currentDate.toISOString().split('T')[0],
          Day: index + 1,
          Location: location,
          Value: value
        };
      });
    });

    return {
      events: [...inputData.Events],
      locationSheets
    };
  };

  const generateFiles = (data: ProcessedData): FileData[] => {
    const generatedFiles: FileData[] = [];

    if (data.events.length > 0) {
      generatedFiles.push({
        id: 'events',
        name: 'events',
        format: 'csv'
      });
    }

    Object.keys(data.locationSheets).forEach(location => {
      generatedFiles.push({
        id: location,
        name: `location_${location}`,
        format: 'csv'
      });
    });

    return generatedFiles;
  };

  const getFileData = (fileId: string): Record<string, unknown>[] => {
    if (!processedData) return [];
    
    if (fileId === 'events') {
      return processedData.events;
    }
    
    return processedData.locationSheets[fileId] || [];
  };

  const addFileToZip = (zip: JSZip, file: FileData, data: Record<string, unknown>[]): void => {
    const { name, format } = file;
    const fileName = `${name}.${format}`;
    
    if (format === 'csv') {
      const csvContent = convertToCSV(data);
      zip.file(fileName, csvContent);
    } else {
      const xlsxContent = convertToXLSX(data);
      zip.file(fileName, xlsxContent);
    }
  };

  // Event Handlers
  const handleProcessData = (): void => {
    try {
      const processed = processData(data, startDate);
      setProcessedData(processed);
      setFiles(generateFiles(processed));
      setExportStatus('Data processed successfully! Files are ready for download.');
    } catch (error) {
      console.error('Data processing error:', error);
      setExportStatus('Failed to process data. Please check your data format.');
    }
  };

  const handleDownloadAll = async (): Promise<void> => {
    if (!processedData) {
      setExportStatus('Please process data first before downloading.');
      return;
    }

    setIsDownloadingAll(true);
    setExportStatus(null);
    
    try {
      const zip = new JSZip();
      
      files.forEach(file => {
        const data = getFileData(file.id);
        if (data.length > 0) {
          addFileToZip(zip, file, data);
        }
      });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'export_archive.zip');
      
      setExportStatus('Successfully downloaded all files as export_archive.zip');
    } catch (error) {
      console.error('ZIP creation error:', error);
      setExportStatus('Failed to create ZIP file. Please try again.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleIndividualDownload = async (fileId: string, fileName: string, format: ExportFormat): Promise<void> => {
    if (!processedData) {
      setExportStatus('Please process data first before downloading.');
      return;
    }

    setDownloadingFiles(prev => new Set(prev).add(fileId));
    setExportStatus(null);
    
    try {
      const data = getFileData(fileId);
      
      if (data.length === 0) {
        setExportStatus(`No data available for ${fileName}`);
        return;
      }
      
      const fullFileName = `${fileName}.${format}`;
      
      if (format === 'csv') {
        const content = convertToCSV(data);
        downloadFile(content, fullFileName, MIME_TYPES.csv);
      } else {
        const content = convertToXLSX(data);
        downloadFile(content, fullFileName, MIME_TYPES.xlsx);
      }
      
      setExportStatus(`Successfully downloaded ${fullFileName}`);
    } catch (error) {
      console.error('Download error:', error);
      setExportStatus(`Failed to download ${fileName}.${format}. Please try again.`);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleFormatChange = (fileId: string, newFormat: ExportFormat): void => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, format: newFormat } : file
    ));
  };

  const handleChangeAllFormats = (newFormat: ExportFormat): void => {
    setFiles(prev => prev.map(file => ({ ...file, format: newFormat })));
  };

  const getFormatIcon = (format: ExportFormat) => {
    return format === 'xlsx' ? <ExcelIcon /> : <CsvIcon />;
  };

  // Auto-process data when component mounts or data changes
  useEffect(() => {
    if (data && data.Events && data.totalsByLocationType) {
      handleProcessData();
    }
  }, [data, startDate]);

  return (
    <Box className="export-container">
      <Paper elevation={2} className="export-paper">
        {/* Header */}
        <Box className="export-header">
          <ExportIcon className="export-header-icon" />
          <Typography variant="h5" component="h2">
            Export Data
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" className="export-description">
          Download individual files in your preferred format, or get everything in one convenient zip archive.
        </Typography>

        {/* Data Processing Section */}
        <Paper variant="outlined" className="processing-section">
          <Typography variant="h6" sx={{ mb: 2 }}>
            Data Processing
          </Typography>
          <Box className="processing-controls">
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleProcessData}
              className="processing-button"
            >
              Process Data
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Start date for location data processing. Data will be automatically processed when changed.
          </Typography>
        </Paper>

        {/* Download All Section */}
        <Paper variant="outlined" className="download-all-section">
          <Box className="download-all-header">
            <Box className="download-all-info">
              <Typography variant="h6">
                <ZipIcon className="download-all-icon" />
                Download All Files
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get all {files.length} files in their selected formats as a compressed archive
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<ZipIcon />}
              onClick={handleDownloadAll}
              disabled={isDownloadingAll || !processedData}
              className="download-all-button"
            >
              {isDownloadingAll ? 'Creating Archive...' : 'Download All (.zip)'}
            </Button>
          </Box>
          
          {isDownloadingAll && (
            <Box className="progress-section">
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" className="progress-text">
                Compressing files into archive...
              </Typography>
            </Box>
          )}
        </Paper>

        <Divider className="section-divider" />

        {/* Individual Files Section */}
        <Box className="individual-header">
          <Typography variant="h6">
            Individual Downloads
          </Typography>
          <Box className="format-controls">
            <Typography variant="body2" color="text.secondary">
              Change all to:
            </Typography>
            <ButtonGroup size="small" variant="outlined">
              <Button
                startIcon={<CsvIcon />}
                onClick={() => handleChangeAllFormats('csv')}
              >
                CSV
              </Button>
              <Button
                startIcon={<ExcelIcon />}
                onClick={() => handleChangeAllFormats('xlsx')}
              >
                XLSX
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
        
        <List>
          {files.map((file) => (
            <ListItem key={file.id} className="file-item">
              <ListItemText
                primary={
                  <Box className="file-name-container">
                    <Typography variant="subtitle1" className="file-name">
                      {file.name}
                    </Typography>
                    <Chip
                      icon={getFormatIcon(file.format)}
                      label={file.format.toUpperCase()}
                      size="small"
                      className="format-chip"
                      color={file.format === 'xlsx' ? 'success' : 'info'}
                    />
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box className="file-actions">
                  <FormControl size="small" className="format-select">
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={file.format}
                      label="Format"
                      onChange={(e) => handleFormatChange(file.id, e.target.value as ExportFormat)}
                    >
                      <MenuItem value="csv">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CsvIcon sx={{ mr: 1, fontSize: 18 }} />
                          CSV
                        </Box>
                      </MenuItem>
                      <MenuItem value="xlsx">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ExcelIcon sx={{ mr: 1, fontSize: 18 }} />
                          XLSX
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleIndividualDownload(file.id, file.name, file.format)}
                    disabled={downloadingFiles.has(file.id) || !processedData}
                    className="download-button"
                  >
                    {downloadingFiles.has(file.id) ? 'Downloading...' : 'Download'}
                  </Button>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {/* Status Alert */}
        {exportStatus && (
          <Alert 
            severity={exportStatus.includes('Successfully') ? 'success' : 'error'}
            className="status-alert"
          >
            {exportStatus}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default Export; 
