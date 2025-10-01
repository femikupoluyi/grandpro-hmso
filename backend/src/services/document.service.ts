/**
 * Document Service
 * Handles file uploads, storage, and management
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Ensure upload directories exist
 */
export const ensureUploadDirs = async () => {
  const dirs = [
    'documents',
    'contracts',
    'profiles',
    'medical-records'
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(path.join(UPLOAD_DIR, dir), { recursive: true });
  }
};

/**
 * Save uploaded file
 */
export const saveFile = async (
  file: Express.Multer.File,
  category: string = 'documents'
): Promise<string> => {
  try {
    await ensureUploadDirs();
    
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, category, fileName);
    
    await fs.writeFile(filePath, file.buffer);
    
    return `/${category}/${fileName}`;
  } catch (error) {
    logger.error('Error saving file:', error);
    throw error;
  }
};

/**
 * Delete file from storage
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const filePath = path.join(UPLOAD_DIR, fileUrl.replace(/^\//, ''));
    await fs.unlink(filePath);
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file stats
 */
export const getFileStats = async (fileUrl: string) => {
  try {
    const filePath = path.join(UPLOAD_DIR, fileUrl.replace(/^\//, ''));
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  } catch (error) {
    logger.error('Error getting file stats:', error);
    throw error;
  }
};

/**
 * Generate file checksum
 */
export const generateChecksum = (buffer: Buffer): string => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Validate file type
 */
export const validateFileType = (
  mimeType: string,
  allowedTypes: string[] = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
): boolean => {
  return allowedTypes.includes(mimeType);
};

/**
 * Validate file size
 */
export const validateFileSize = (
  size: number,
  maxSize: number = MAX_FILE_SIZE
): boolean => {
  return size <= maxSize;
};

/**
 * Sanitize file name
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};
