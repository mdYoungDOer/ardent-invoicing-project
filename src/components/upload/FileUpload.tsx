'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  IconButton,
  Paper,
  Alert,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { StorageService, UploadProgress, StorageFile, FILE_TYPES } from '@/lib/storage';

interface FileUploadProps {
  bucket: string;
  onUploadComplete: (files: StorageFile[]) => void;
  onUploadError?: (error: Error) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  tenantId?: string;
  metadata?: Record<string, any>;
  basePath?: string;
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

export default function FileUpload({
  bucket,
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  tenantId,
  metadata = {},
  basePath = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [uploadedFiles, setUploadedFiles] = useState<StorageFile[]>([]);
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File) => {
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${formatFileSize(maxSize)} limit`);
    }
    
    if (accept && !accept.split(',').some(type => file.type.match(type.trim()))) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
    
    return true;
  }, [maxSize, accept]);

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Validate files
    try {
      fileArray.forEach(validateFile);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid file');
      onUploadError?.(error as Error);
      return;
    }

    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        const progressKey = `${file.name}-${index}`;
        
        const uploadOptions = {
          onProgress: (progress: UploadProgress) => {
            setUploadProgress(prev => ({
              ...prev,
              [progressKey]: progress,
            }));
          },
          metadata: {
            ...metadata,
            tenantId,
            originalName: file.name,
          },
        };

        const path = tenantId ? `${basePath}/tenant-${tenantId}` : basePath;
        const uploadedFile = await StorageService.uploadFile(bucket, path, file, uploadOptions);
        
        // Clean up progress tracking
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[progressKey];
          return newProgress;
        });

        return uploadedFile;
      });

      const results = await Promise.all(uploadPromises);
      const newFiles = [...uploadedFiles, ...results];
      
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      onUploadError?.(error as Error);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [bucket, uploadedFiles, maxFiles, validateFile, metadata, tenantId, basePath, onUploadComplete, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleRemoveFile = useCallback(async (fileId: string) => {
    try {
      await StorageService.deleteFile(fileId);
      const newFiles = uploadedFiles.filter(file => file.id !== fileId);
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Delete failed');
    }
  }, [uploadedFiles, onUploadComplete]);

  const handleOpenFile = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const handleDownloadFile = useCallback((url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Upload Area */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          border: isDragging ? 2 : 1,
          borderStyle: 'dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          bgcolor: isDragging ? 'primary.50' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            bgcolor: disabled ? 'background.paper' : 'primary.50',
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
          {isDragging ? 'Drop files here' : 'Upload Files'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop files here, or click to browse
        </Typography>
        
        {accept && (
          <Typography variant="caption" color="text.secondary">
            Accepted formats: {accept}
          </Typography>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Max file size: {formatFileSize(maxSize)} • Max files: {maxFiles}
        </Typography>
      </Paper>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mt: 2 }}>
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <Box key={key} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{key}</Typography>
                <Typography variant="body2">{progress.percentage.toFixed(0)}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress.percentage}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Uploaded Files ({uploadedFiles.length})
          </Typography>
          
          <Stack spacing={1}>
            {uploadedFiles.map((file) => (
              <Paper
                key={file.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box sx={{ color: 'text.secondary' }}>
                  {getFileIcon(file.type)}
                </Box>
                
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)} • {file.type}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenFile(file.url)}
                    title="View file"
                  >
                    <ViewIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={() => handleDownloadFile(file.url, file.name)}
                    title="Download file"
                  >
                    <DownloadIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFile(file.id)}
                    title="Remove file"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Uploading Indicator */}
      {uploading && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Uploading files...
          </Typography>
        </Box>
      )}
    </Box>
  );
}
