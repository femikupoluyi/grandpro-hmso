/**
 * Onboarding Validation Schemas
 */

import Joi from 'joi';

// Nigerian states for validation
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Hospital application schema
export const applicationSchema = Joi.object({
  hospitalName: Joi.string().min(3).max(100).required(),
  legalName: Joi.string().min(3).max(100).required(),
  registrationNumber: Joi.string().required(),
  taxId: Joi.string().optional().allow(''),
  establishedDate: Joi.date().max('now').optional(),
  
  // Contact Information
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+234|0)[789]\d{9}$/).required()
    .messages({
      'string.pattern.base': 'Phone number must be a valid Nigerian number'
    }),
  alternatePhone: Joi.string().pattern(/^(\+234|0)[789]\d{9}$/).optional().allow(''),
  website: Joi.string().uri().optional().allow(''),
  
  // Address Information
  address: Joi.string().min(10).max(200).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().valid(...NIGERIAN_STATES).required()
    .messages({
      'any.only': 'Please select a valid Nigerian state'
    }),
  lga: Joi.string().min(2).max(50).required(),
  postalCode: Joi.string().optional().allow(''),
  
  // Owner Information
  ownerName: Joi.string().min(3).max(100).required(),
  ownerEmail: Joi.string().email().required(),
  ownerPhone: Joi.string().pattern(/^(\+234|0)[789]\d{9}$/).required(),
  ownerNin: Joi.string().length(11).optional()
    .messages({
      'string.length': 'NIN must be exactly 11 digits'
    }),
  
  // Facility Information
  facilityType: Joi.string().valid(
    'General Hospital',
    'Specialist Hospital',
    'Teaching Hospital',
    'Primary Healthcare Center',
    'Clinic',
    'Diagnostic Center',
    'Maternity Home'
  ).required(),
  bedCapacity: Joi.number().integer().min(0).max(5000).optional(),
  staffCount: Joi.number().integer().min(1).max(10000).optional(),
  servicesOffered: Joi.array().items(Joi.string()).min(1).required(),
  specializations: Joi.array().items(Joi.string()).optional(),
  hasEmergency: Joi.boolean().default(false),
  hasPharmacy: Joi.boolean().default(false),
  hasLaboratory: Joi.boolean().default(false),
  hasRadiology: Joi.boolean().default(false)
});

// Evaluation score schema
export const evaluationSchema = Joi.object({
  facilityScore: Joi.number().min(0).max(100).required(),
  facilityNotes: Joi.string().max(500).optional().allow(''),
  
  staffingScore: Joi.number().min(0).max(100).required(),
  staffingNotes: Joi.string().max(500).optional().allow(''),
  
  equipmentScore: Joi.number().min(0).max(100).required(),
  equipmentNotes: Joi.string().max(500).optional().allow(''),
  
  complianceScore: Joi.number().min(0).max(100).required(),
  complianceNotes: Joi.string().max(500).optional().allow(''),
  
  financialScore: Joi.number().min(0).max(100).required(),
  financialNotes: Joi.string().max(500).optional().allow(''),
  
  locationScore: Joi.number().min(0).max(100).required(),
  locationNotes: Joi.string().max(500).optional().allow(''),
  
  servicesScore: Joi.number().min(0).max(100).required(),
  servicesNotes: Joi.string().max(500).optional().allow(''),
  
  reputationScore: Joi.number().min(0).max(100).required(),
  reputationNotes: Joi.string().max(500).optional().allow(''),
  
  recommendation: Joi.string().valid('APPROVE', 'REJECT', 'REVIEW').required(),
  generalNotes: Joi.string().max(2000).optional().allow(''),
  riskAssessment: Joi.string().max(1000).optional().allow('')
});

// Contract schema
export const contractSchema = Joi.object({
  applicationId: Joi.string().required(),
  templateId: Joi.string().optional(),
  title: Joi.string().min(5).max(200).optional(),
  type: Joi.string().valid('PARTNERSHIP', 'SERVICE', 'LEASE', 'MANAGEMENT').default('PARTNERSHIP'),
  startDate: Joi.date().min('now').required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  autoRenew: Joi.boolean().default(false),
  renewalPeriodMonths: Joi.when('autoRenew', {
    is: true,
    then: Joi.number().integer().min(1).max(60).required(),
    otherwise: Joi.optional()
  }),
  revenueSharePercentage: Joi.number().min(0).max(100).optional(),
  monthlyFee: Joi.number().min(0).optional(),
  setupFee: Joi.number().min(0).optional(),
  currency: Joi.string().valid('NGN', 'USD').default('NGN'),
  paymentTerms: Joi.string().max(1000).optional(),
  content: Joi.string().optional(),
  termsAndConditions: Joi.string().optional(),
  specialClauses: Joi.array().items(Joi.string()).optional()
});

// Document upload schema
export const documentUploadSchema = Joi.object({
  documentType: Joi.string().valid(
    'LICENSE',
    'REGISTRATION',
    'TAX_CERTIFICATE',
    'INSURANCE',
    'FACILITY_PHOTOS',
    'OWNERSHIP_PROOF',
    'STAFF_CREDENTIALS',
    'CAC_CERTIFICATE',
    'MEDICAL_LICENSE',
    'INSURANCE_CERTIFICATE',
    'BUILDING_PERMIT',
    'FIRE_SAFETY_CERTIFICATE',
    'ENVIRONMENTAL_PERMIT',
    'OTHER'
  ).required(),
  documentName: Joi.string().max(200).optional(),
  expiryDate: Joi.date().optional()
});

// Checklist update schema
export const checklistSchema = Joi.object({
  isCompleted: Joi.boolean().required(),
  notes: Joi.string().max(500).optional().allow('')
});

// Contract template schema
export const contractTemplateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  type: Joi.string().valid('PARTNERSHIP', 'SERVICE', 'LEASE', 'MANAGEMENT').required(),
  content: Joi.string().min(100).required(),
  variables: Joi.object().optional(),
  isActive: Joi.boolean().default(true)
});

// Evaluation criteria schema
export const evaluationCriteriaSchema = Joi.object({
  category: Joi.string().min(3).max(50).required(),
  criterion: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  weight: Joi.number().min(0).max(10).default(1.0),
  maxScore: Joi.number().min(0).max(100).default(100),
  passThreshold: Joi.number().min(0).max(100).default(60),
  isActive: Joi.boolean().default(true)
});

// Application status update schema
export const applicationStatusSchema = Joi.object({
  status: Joi.string().valid(
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN'
  ).required(),
  reason: Joi.when('status', {
    is: 'REJECTED',
    then: Joi.string().min(10).max(500).required(),
    otherwise: Joi.string().optional()
  })
});

// Onboarding stage update schema
export const onboardingStageSchema = Joi.object({
  stage: Joi.string().valid(
    'APPLICATION',
    'DOCUMENT_SUBMISSION',
    'EVALUATION',
    'CONTRACT_NEGOTIATION',
    'CONTRACT_SIGNING',
    'SYSTEM_SETUP',
    'TRAINING',
    'GO_LIVE',
    'COMPLETED'
  ).required(),
  notes: Joi.string().max(1000).optional()
});

// Contract signature schema
export const contractSignatureSchema = Joi.object({
  signature: Joi.string().required(),
  signerName: Joi.string().min(3).max(100).required(),
  signerEmail: Joi.string().email().required(),
  signerRole: Joi.string().optional()
});

// Search/Filter schema for applications
export const applicationFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN'
  ).optional(),
  state: Joi.string().valid(...NIGERIAN_STATES).optional(),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid(
    'createdAt',
    'submittedAt',
    'hospitalName',
    'state',
    'status'
  ).default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  startDate: Joi.date().optional(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional()
});

// Metrics query schema
export const metricsQuerySchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional(),
  state: Joi.string().valid(...NIGERIAN_STATES).optional(),
  groupBy: Joi.string().valid('day', 'week', 'month', 'state', 'status').optional()
});
