import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as onboardingController from './onboarding.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX are allowed.'));
    }
  },
});

// Public routes (no authentication required for initial application)
router.post('/applications/submit', onboardingController.submitApplication);
router.get('/applications/:id/progress', onboardingController.getOnboardingProgress);

// Protected routes (require authentication)
router.use(authenticate);

// Application management
router.get('/applications', onboardingController.getApplications);
router.get('/applications/:id', onboardingController.getApplicationById);
router.patch('/applications/:id/status', onboardingController.updateApplicationStatus);

// Document upload
router.post(
  '/applications/:applicationId/documents',
  upload.single('document'),
  onboardingController.uploadDocument
);

// Evaluation and scoring
router.post('/applications/evaluate', onboardingController.evaluateApplication);

// Contract generation and signing
router.post('/contracts/generate', onboardingController.generateContract);
router.post('/contracts/sign', onboardingController.signContract);

export default router;
