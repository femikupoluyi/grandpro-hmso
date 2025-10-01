"use strict";
/**
 * File Upload Middleware
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads/';
        // Determine folder based on file type
        if (file.mimetype.startsWith('image/')) {
            uploadPath += 'images/';
        }
        else if (file.mimetype === 'application/pdf') {
            uploadPath += 'documents/';
        }
        else {
            uploadPath += 'others/';
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
// File filter
const fileFilter = (req, file, cb) => {
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
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed.'), false);
    }
};
// Create multer instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_UPLOAD || '10485760'), // 10MB default
    },
});
//# sourceMappingURL=upload.js.map