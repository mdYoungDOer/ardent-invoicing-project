import { supabase } from './supabase';
import { supabaseAdmin } from './supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface StorageFile {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  bucket: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  RECEIPTS: 'receipts',
  INVOICES: 'invoices',
  BUSINESS_LOGO: 'business-logos',
  USER_AVATARS: 'user-avatars',
  DOCUMENTS: 'documents',
  EXPORTS: 'exports',
} as const;

// File type configurations
export const FILE_TYPES = {
  IMAGE: {
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  },
  PDF: {
    types: ['application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['.pdf']
  },
  DOCUMENT: {
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['.pdf', '.doc', '.docx', '.txt']
  },
  ALL: {
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx', '.txt']
  }
} as const;

export class StorageService {
  /**
   * Upload file with progress tracking
   */
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options: {
      onProgress?: (progress: UploadProgress) => void;
      metadata?: Record<string, any>;
      cacheControl?: string;
      upsert?: boolean;
    } = {}
  ): Promise<StorageFile> {
    const { onProgress, metadata, cacheControl, upsert = false } = options;

    // Validate file
    this.validateFile(file);

    // Generate unique filename if path doesn't exist
    const finalPath = await this.generateUniquePath(bucket, path, file.name);

    // Upload with progress tracking
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(finalPath, file, {
        cacheControl: cacheControl || '3600',
        upsert,
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
          ...metadata
        }
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Store file metadata in database
    const fileRecord = await this.storeFileMetadata({
      name: file.name,
      path: data.path,
      url: publicUrl,
      size: file.size,
      type: file.type,
      bucket,
      metadata
    });

    return fileRecord;
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    bucket: string,
    files: File[],
    options: {
      onProgress?: (fileIndex: number, progress: UploadProgress) => void;
      metadata?: Record<string, any>;
      basePath?: string;
    } = {}
  ): Promise<StorageFile[]> {
    const { onProgress, metadata, basePath = '' } = options;
    const results: StorageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${basePath}/${Date.now()}-${i}-${file.name}`;
      
      try {
        const result = await this.uploadFile(bucket, path, file, {
          onProgress: (progress) => onProgress?.(i, progress),
          metadata
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Delete file from storage and database
   */
  static async deleteFile(fileId: string): Promise<void> {
    // Get file metadata from database
    const { data: fileData, error: fetchError } = await supabase
      .from('storage_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError || !fileData) {
      throw new Error('File not found');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(fileData.bucket)
      .remove([fileData.path]);

    if (storageError) {
      throw new Error(`Storage deletion failed: ${storageError.message}`);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('storage_files')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }
  }

  /**
   * Get file by ID
   */
  static async getFile(fileId: string): Promise<StorageFile | null> {
    const { data, error } = await supabase
      .from('storage_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * List files in a bucket with pagination
   */
  static async listFiles(
    bucket: string,
    options: {
      limit?: number;
      offset?: number;
      search?: string;
      tenantId?: string;
    } = {}
  ): Promise<{ files: StorageFile[]; total: number }> {
    const { limit = 50, offset = 0, search, tenantId } = options;

    let query = supabase
      .from('storage_files')
      .select('*', { count: 'exact' })
      .eq('bucket', bucket)
      .order('created_at', { ascending: false });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return {
      files: data || [],
      total: count || 0
    };
  }

  /**
   * Generate signed URL for private file access
   */
  static async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(tenantId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    buckets: Record<string, { files: number; size: number }>;
  }> {
    let query = supabase
      .from('storage_files')
      .select('bucket, size');

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }

    const buckets: Record<string, { files: number; size: number }> = {};
    let totalFiles = 0;
    let totalSize = 0;

    data?.forEach(file => {
      if (!buckets[file.bucket]) {
        buckets[file.bucket] = { files: 0, size: 0 };
      }
      buckets[file.bucket].files++;
      buckets[file.bucket].size += file.size;
      totalFiles++;
      totalSize += file.size;
    });

    return {
      totalFiles,
      totalSize,
      buckets
    };
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): void {
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'); // 10MB default
    const allowedTypes = (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || '').split(',');

    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
  }

  /**
   * Generate unique file path
   */
  private static async generateUniquePath(
    bucket: string,
    basePath: string,
    fileName: string
  ): Promise<string> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    return `${basePath}/${timestamp}-${randomId}-${nameWithoutExt}.${extension}`;
  }

  /**
   * Store file metadata in database
   */
  private static async storeFileMetadata(fileData: {
    name: string;
    path: string;
    url: string;
    size: number;
    type: string;
    bucket: string;
    metadata?: Record<string, any>;
  }): Promise<StorageFile> {
    const { data, error } = await supabase
      .from('storage_files')
      .insert({
        ...fileData,
        metadata: fileData.metadata || {}
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store file metadata: ${error.message}`);
    }

    return data;
  }
}

// Convenience functions for common operations
export const uploadReceipt = (file: File, tenantId: string) =>
  StorageService.uploadFile(STORAGE_BUCKETS.RECEIPTS, `tenant-${tenantId}/receipts`, file, {
    metadata: { tenantId, category: 'receipt' }
  });

export const uploadInvoicePDF = (file: File, tenantId: string) =>
  StorageService.uploadFile(STORAGE_BUCKETS.INVOICES, `tenant-${tenantId}/invoices`, file, {
    metadata: { tenantId, category: 'invoice' }
  });

export const uploadBusinessLogo = (file: File, tenantId: string) =>
  StorageService.uploadFile(STORAGE_BUCKETS.BUSINESS_LOGO, `tenant-${tenantId}`, file, {
    metadata: { tenantId, category: 'logo' }
  });

export const uploadUserAvatar = (file: File, userId: string) =>
  StorageService.uploadFile(STORAGE_BUCKETS.USER_AVATARS, `user-${userId}`, file, {
    metadata: { userId, category: 'avatar' }
  });
