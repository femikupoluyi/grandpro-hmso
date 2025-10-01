/**
 * Onboarding Routes
 * Handles hospital application, evaluation, and contract management
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import * as onboardingController from '../controllers/onboarding.controller';
import { upload } from '../middleware/upload.middleware';
import {
  applicationSchema,
  evaluationSchema,
  contractSchema,
  documentUploadSchema,
  checklistSchema,
} from '../validators/onboarding.validators';

const router = Router();

// ============================================
// PUBLIC ROUTES (for hospital owners to apply)
// ============================================

// Submit new hospital application
router.post(
  '/applications/submit',
  validateRequest(applicationSchema),
  onboardingController.submitApplication
);

// Check application status (with application number and email)
router.get(
  '/applications/status/:applicationNumber',
  onboardingController.getApplicationStatus
);

// Upload documents for application (public with token)
router.post(
  '/applications/:applicationId/documents',
  upload.single('document'),
  validateRequest(documentUploadSchema),
  onboardingController.uploadDocument
);

// ============================================
// PROTECTED ROUTES (require authentication)
// ============================================

// Get all applications (admin only)
router.get(
  '/applications',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getAllApplications
);

// Get single application details
router.get(
  '/applications/:id',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getApplicationById
);

// Update application status
router.patch(
  '/applications/:id/status',
  authenticateToken,
  authorize('onboarding', 'update'),
  onboardingController.updateApplicationStatus
);

// ============================================
// EVALUATION ROUTES
// ============================================

// Submit evaluation score
router.post(
  '/applications/:applicationId/evaluate',
  authenticateToken,
  authorize('onboarding', 'evaluate'),
  validateRequest(evaluationSchema),
  onboardingController.submitEvaluation
);

// Get evaluation scores for an application
router.get(
  '/applications/:applicationId/evaluations',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getEvaluationScores
);

// Auto-generate evaluation score based on documents
router.post(
  '/applications/:applicationId/auto-evaluate',
  authenticateToken,
  authorize('onboarding', 'evaluate'),
  onboardingController.autoEvaluate
);

// ============================================
// CONTRACT ROUTES
// ============================================

// Generate contract from template
router.post(
  '/contracts/generate',
  authenticateToken,
  authorize('onboarding', 'manage'),
  validateRequest(contractSchema),
  onboardingController.generateContract
);

// Get contract by application ID
router.get(
  '/contracts/application/:applicationId',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getContractByApplicationId
);

// Update contract
router.put(
  '/contracts/:id',
  authenticateToken,
  authorize('onboarding', 'manage'),
  validateRequest(contractSchema),
  onboardingController.updateContract
);

// Send contract for signing
router.post(
  '/contracts/:id/send',
  authenticateToken,
  authorize('onboarding', 'manage'),
  onboardingController.sendContractForSigning
);

// Sign contract (hospital side)
router.post(
  '/contracts/:id/sign/hospital',
  onboardingController.signContractHospital
);

// Sign contract (GrandPro side)
router.post(
  '/contracts/:id/sign/grandpro',
  authenticateToken,
  authorize('onboarding', 'manage'),
  onboardingController.signContractGrandPro
);

// ============================================
// ONBOARDING PROGRESS ROUTES
// ============================================

// Get onboarding progress
router.get(
  '/applications/:applicationId/progress',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getOnboardingProgress
);

// Update onboarding stage
router.patch(
  '/applications/:applicationId/progress/stage',
  authenticateToken,
  authorize('onboarding', 'update'),
  onboardingController.updateOnboardingStage
);

// ============================================
// CHECKLIST ROUTES
// ============================================

// Get checklist items
router.get(
  '/applications/:applicationId/checklist',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getChecklist
);

// Update checklist item
router.patch(
  '/checklist/:id',
  authenticateToken,
  authorize('onboarding', 'update'),
  validateRequest(checklistSchema),
  onboardingController.updateChecklistItem
);

// ============================================
// DOCUMENT MANAGEMENT ROUTES
// ============================================

// Get all documents for an application
router.get(
  '/applications/:applicationId/documents',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getDocuments
);

// Verify document
router.patch(
  '/documents/:id/verify',
  authenticateToken,
  authorize('onboarding', 'verify'),
  onboardingController.verifyDocument
);

// Delete document
router.delete(
  '/documents/:id',
  authenticateToken,
  authorize('onboarding', 'delete'),
  onboardingController.deleteDocument
);

// ============================================
// CONTRACT TEMPLATE ROUTES
// ============================================

// Get all templates
router.get(
  '/templates',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getContractTemplates
);

// Create new template
router.post(
  '/templates',
  authenticateToken,
  authorize('onboarding', 'manage'),
  onboardingController.createContractTemplate
);

// Update template
router.put(
  '/templates/:id',
  authenticateToken,
  authorize('onboarding', 'manage'),
  onboardingController.updateContractTemplate
);

// ============================================
// EVALUATION CRITERIA ROUTES
// ============================================

// Get evaluation criteria
router.get(
  '/evaluation-criteria',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getEvaluationCriteria
);

// Create/Update evaluation criteria
router.post(
  '/evaluation-criteria',
  authenticateToken,
  authorize('onboarding', 'manage'),
  onboardingController.upsertEvaluationCriteria
);

// ============================================
// ANALYTICS & REPORTING
// ============================================

// Get onboarding metrics
router.get(
  '/metrics',
  authenticateToken,
  authorize('onboarding', 'read'),
  onboardingController.getOnboardingMetrics
);

// Export applications
router.get(
  '/applications/export/:format',
  authenticateToken,
  authorize('onboarding', 'export'),
  onboardingController.exportApplications
);

export default router;
