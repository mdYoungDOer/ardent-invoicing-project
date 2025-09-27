'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CloudUpload as UploadIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { StorageService, StorageFile, STORAGE_BUCKETS } from '@/lib/storage';

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  buckets: Record<string, { files: number; size: number }>;
}

interface StorageFilters {
  bucket: string;
  search: string;
  dateRange: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon />;
  if (fileType === 'application/pdf') return <PdfIcon />;
  if (fileType.includes('document') || fileType.includes('text')) return <DocumentIcon />;
  return <FileIcon />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getBucketColor = (bucket: string) => {
  switch (bucket) {
    case 'receipts':
      return 'success';
    case 'invoices':
      return 'primary';
    case 'business-logos':
      return 'warning';
    case 'user-avatars':
      return 'info';
    case 'documents':
      return 'secondary';
    case 'exports':
      return 'default';
    default:
      return 'default';
  }
};

export default function AdminStorageManager() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [stats, setStats] = useState<StorageStats>({
    totalFiles: 0,
    totalSize: 0,
    buckets: {},
  });
  const [filters, setFilters] = useState<StorageFilters>({
    bucket: '',
    search: '',
    dateRange: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const itemsPerPage = 20;

  useEffect(() => {
    loadStorageData();
  }, [filters, currentPage]);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsData, filesData] = await Promise.all([
        StorageService.getStorageStats(),
        StorageService.listFiles('', {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
          search: filters.search || undefined,
        }),
      ]);

      setStats(statsData);
      setFiles(filesData.files);
      setTotalPages(Math.ceil(filesData.total / itemsPerPage));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load storage data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFiles = async () => {
    try {
      setLoading(true);
      
      await Promise.all(
        filesToDelete.map(fileId => StorageService.deleteFile(fileId))
      );

      setSuccess(`Successfully deleted ${filesToDelete.length} file(s)`);
      setDeleteDialogOpen(false);
      setFilesToDelete([]);
      setSelectedFiles([]);
      await loadStorageData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete files');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleDeleteSelected = () => {
    setFilesToDelete(selectedFiles);
    setDeleteDialogOpen(true);
  };

  const handleViewFile = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = (key: keyof StorageFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Storage Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStorageData}
            disabled={loading}
          >
            Refresh
          </Button>
          {selectedFiles.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
            >
              Delete Selected ({selectedFiles.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Storage Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.totalFiles.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Files
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FolderIcon sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatFileSize(stats.totalSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Storage
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {Object.keys(stats.buckets).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Buckets
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ fontSize: 32, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedFiles.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selected Files
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Storage Usage by Bucket */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Storage Usage by Bucket
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(stats.buckets).map(([bucket, usage]) => (
              <Grid item xs={12} sm={6} md={4} key={bucket}>
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={bucket.replace('-', ' ')}
                      color={getBucketColor(bucket) as any}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {usage.files} files
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {formatFileSize(usage.size)}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(usage.size / stats.totalSize) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search files..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Bucket</InputLabel>
                <Select
                  value={filters.bucket}
                  label="Bucket"
                  onChange={(e) => handleFilterChange('bucket', e.target.value)}
                >
                  <MenuItem value="">All Buckets</MenuItem>
                  {Object.values(STORAGE_BUCKETS).map((bucket) => (
                    <MenuItem key={bucket} value={bucket}>
                      {bucket.replace('-', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.dateRange}
                  label="Date Range"
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={loadStorageData}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Files ({stats.totalFiles.toLocaleString()})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFiles.length === files.length && files.length > 0}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Bucket</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id} hover>
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => handleSelectFile(file.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getFileIcon(file.type)}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {file.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={file.bucket}
                            color={getBucketColor(file.bucket) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatFileSize(file.size)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {file.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(file.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View file">
                              <IconButton
                                size="small"
                                onClick={() => handleViewFile(file.url)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download file">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadFile(file.url, file.name)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete file">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setFilesToDelete([file.id]);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {filesToDelete.length} file(s)? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteFiles} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
