/**
 * File Upload Middleware
 */

import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/';
    
    // Determine folder based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath += 'documents/';
    } else {
      uploadPath += 'others/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed.'), false);
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_UPLOAD || '10485760'), // 10MB default
  },
});
