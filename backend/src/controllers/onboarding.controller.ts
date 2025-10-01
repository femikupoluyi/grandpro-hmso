/**
 * Onboarding Controller
 * Handles hospital application, evaluation, and contract management
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import * as onboardingService from '../services/onboarding.service';
import * as emailService from '../services/email.service';
import * as documentService from '../services/document.service';
import * as contractService from '../services/contract.service';
import { generateApplicationNumber, generateContractNumber } from '../utils/generators';
import { calculateEvaluationScore } from '../utils/evaluation';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// ============================================
// APPLICATION MANAGEMENT
// ============================================

export const submitApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const applicationData = req.body;
    
    // Generate unique application number
    const applicationNumber = await generateApplicationNumber();
    
    // Create application with initial progress tracking
    const application = await prisma.onboardingApplication.create({
      data: {
        ...applicationData,
        applicationNumber,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        progress: {
          create: {
            currentStage: 'APPLICATION',
            applicationCompleted: true,
            applicationCompletedAt: new Date(),
            overallProgress: 12, // 12% for application submission
          }
        },
        checklists: {
          create: [
            { category: 'Documents', item: 'CAC Certificate', isRequired: true, orderIndex: 1 },
            { category: 'Documents', item: 'Medical License', isRequired: true, orderIndex: 2 },
            { category: 'Documents', item: 'Tax Clearance', isRequired: true, orderIndex: 3 },
            { category: 'Documents', item: 'Facility Photos', isRequired: true, orderIndex: 4 },
            { category: 'Documents', item: 'Insurance Certificate', isRequired: false, orderIndex: 5 },
            { category: 'Verification', item: 'Site Inspection', isRequired: true, orderIndex: 6 },
            { category: 'Verification', item: 'Reference Check', isRequired: true, orderIndex: 7 },
            { category: 'Contract', item: 'Contract Review', isRequired: true, orderIndex: 8 },
            { category: 'Contract', item: 'Contract Signing', isRequired: true, orderIndex: 9 },
            { category: 'Setup', item: 'System Access', isRequired: true, orderIndex: 10 },
            { category: 'Setup', item: 'Staff Training', isRequired: true, orderIndex: 11 },
            { category: 'Setup', item: 'Go-Live Preparation', isRequired: true, orderIndex: 12 },
          ]
        }
      },
      include: {
        progress: true,
        checklists: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
    
    // Send confirmation email
    await emailService.sendApplicationConfirmation(
      application.ownerEmail,
      application.ownerName,
      application.applicationNumber
    );
    
    // Log the application submission
    logger.info(`New hospital application submitted: ${application.applicationNumber}`);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        progress: application.progress,
        nextSteps: application.checklists.filter(c => !c.isCompleted).slice(0, 3)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      state,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (status) where.status = status;
    if (state) where.state = state;
    if (search) {
      where.OR = [
        { hospitalName: { contains: String(search), mode: 'insensitive' } },
        { applicationNumber: { contains: String(search), mode: 'insensitive' } },
        { ownerName: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    
    const [applications, total] = await Promise.all([
      prisma.onboardingApplication.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: sortOrder },
        include: {
          progress: true,
          evaluationScores: {
            select: {
              totalScore: true,
              evaluatedAt: true
            }
          },
          _count: {
            select: {
              documents: true,
              checklists: {
                where: { isCompleted: true }
              }
            }
          }
        }
      }),
      prisma.onboardingApplication.count({ where })
    ]);
    
    res.json({
      success: true,
      data: applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const application = await prisma.onboardingApplication.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        evaluationScores: {
          include: {
            evaluator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        contract: true,
        progress: true,
        checklists: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
    
    if (!application) {
      throw new AppError('Application not found', 404);
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationNumber } = req.params;
    const { email } = req.query;
    
    const application = await prisma.onboardingApplication.findFirst({
      where: {
        applicationNumber,
        email: email as string
      },
      select: {
        id: true,
        applicationNumber: true,
        hospitalName: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        approvedAt: true,
        rejectionReason: true,
        progress: {
          select: {
            currentStage: true,
            overallProgress: true
          }
        }
      }
    });
    
    if (!application) {
      throw new AppError('Application not found', 404);
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = (req as any).user.id;
    
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    switch (status) {
      case 'UNDER_REVIEW':
        updateData.reviewedAt = new Date();
        updateData.reviewedBy = userId;
        break;
      case 'APPROVED':
        updateData.approvedAt = new Date();
        updateData.approvedBy = userId;
        break;
      case 'REJECTED':
        updateData.rejectionReason = reason;
        updateData.reviewedAt = new Date();
        updateData.reviewedBy = userId;
        break;
    }
    
    const application = await prisma.onboardingApplication.update({
      where: { id },
      data: updateData,
      include: {
        progress: true
      }
    });
    
    // Update progress if approved
    if (status === 'APPROVED' && application.progress) {
      await prisma.onboardingProgress.update({
        where: { id: application.progress.id },
        data: {
          evaluationCompleted: true,
          evaluationCompletedAt: new Date(),
          currentStage: 'CONTRACT_NEGOTIATION',
          overallProgress: 50
        }
      });
    }
    
    // Send notification email
    await emailService.sendApplicationStatusUpdate(
      application.ownerEmail,
      application.ownerName,
      application.applicationNumber,
      status,
      reason
    );
    
    res.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    const { documentType, documentName } = req.body;
    const file = req.file;
    
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }
    
    // Generate checksum for file integrity
    const fileBuffer = await fs.readFile(file.path);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Save document record
    const document = await prisma.onboardingDocument.create({
      data: {
        applicationId,
        documentType,
        documentName: documentName || file.originalname,
        originalFileName: file.originalname,
        fileUrl: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        checksum,
        uploadedBy: (req as any).user?.id || applicationId, // Use applicationId if public upload
      }
    });
    
    // Update progress
    await onboardingService.updateDocumentProgress(applicationId);
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    
    const documents = await prisma.onboardingDocument.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isVerified, verificationNotes } = req.body;
    const userId = (req as any).user.id;
    
    const document = await prisma.onboardingDocument.update({
      where: { id },
      data: {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? userId : null,
        verificationNotes
      }
    });
    
    res.json({
      success: true,
      message: `Document ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.onboardingDocument.findUnique({
      where: { id }
    });
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }
    
    // Delete file from storage
    await documentService.deleteFile(document.fileUrl);
    
    // Delete database record
    await prisma.onboardingDocument.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// EVALUATION
// ============================================

export const submitEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    const evaluationData = req.body;
    const evaluatorId = (req as any).user.id;
    
    // Calculate total score
    const totalScore = calculateEvaluationScore(evaluationData);
    
    const evaluation = await prisma.evaluationScore.create({
      data: {
        applicationId,
        evaluatorId,
        ...evaluationData,
        totalScore,
        isAutoGenerated: false
      }
    });
    
    // Update application with average score
    const averageScore = await onboardingService.calculateAverageScore(applicationId);
    // Note: evaluationScore is stored with the evaluation records, not on the application itself
    
    res.status(201).json({
      success: true,
      message: 'Evaluation submitted successfully',
      data: evaluation
    });
  } catch (error) {
    next(error);
  }
};

export const getEvaluationScores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    
    const evaluations = await prisma.evaluationScore.findMany({
      where: { applicationId },
      include: {
        evaluator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { evaluatedAt: 'desc' }
    });
    
    const averageScore = await onboardingService.calculateAverageScore(applicationId);
    
    res.json({
      success: true,
      data: {
        evaluations,
        averageScore,
        totalEvaluations: evaluations.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const autoEvaluate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    const evaluatorId = (req as any).user.id;
    
    // Get application details
    const application = await prisma.onboardingApplication.findUnique({
      where: { id: applicationId },
      include: {
        documents: {
          where: { isVerified: true }
        }
      }
    });
    
    if (!application) {
      throw new AppError('Application not found', 404);
    }
    
    // Auto-generate scores based on application data
    const scores = await onboardingService.generateAutoEvaluation(application);
    
    const evaluation = await prisma.evaluationScore.create({
      data: {
        applicationId,
        evaluatorId,
        ...scores,
        isAutoGenerated: true,
        recommendation: scores.totalScore >= 60 ? 'APPROVE' : 'REJECT'
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Auto-evaluation completed',
      data: evaluation
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CONTRACT MANAGEMENT
// ============================================

export const generateContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      applicationId,
      templateId,
      startDate,
      endDate,
      revenueSharePercentage,
      monthlyFee,
      setupFee,
      paymentTerms,
      specialClauses
    } = req.body;
    
    // Get application details
    const application = await prisma.onboardingApplication.findUnique({
      where: { id: applicationId }
    });
    
    if (!application) {
      throw new AppError('Application not found', 404);
    }
    
    // Generate contract number
    const contractNumber = await generateContractNumber();
    
    // Get template if provided
    let content = '';
    if (templateId) {
      const template = await prisma.contractTemplate.findUnique({
        where: { id: templateId }
      });
      if (template) {
        content = await contractService.populateTemplate(
          template.content,
          {
            hospitalName: application.hospitalName,
            legalName: application.legalName,
            registrationNumber: application.registrationNumber,
            ownerName: application.ownerName,
            startDate,
            endDate,
            revenueSharePercentage,
            monthlyFee,
            setupFee,
            paymentTerms
          }
        );
      }
    }
    
    const contract = await prisma.onboardingContract.create({
      data: {
        contractNumber,
        applicationId,
        title: `Partnership Agreement - ${application.hospitalName}`,
        templateId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        revenueSharePercentage,
        monthlyFee,
        setupFee,
        paymentTerms,
        specialClauses: specialClauses || [],
        content,
        status: 'DRAFT'
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Contract generated successfully',
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

export const getContractByApplicationId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    
    const contract = await prisma.onboardingContract.findUnique({
      where: { applicationId },
      include: {
        application: {
          select: {
            hospitalName: true,
            ownerName: true,
            ownerEmail: true
          }
        }
      }
    });
    
    if (!contract) {
      throw new AppError('Contract not found', 404);
    }
    
    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

export const updateContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const contract = await prisma.onboardingContract.update({
      where: { id },
      data: {
        ...updateData,
        version: { increment: 1 }
      }
    });
    
    res.json({
      success: true,
      message: 'Contract updated successfully',
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

export const sendContractForSigning = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const contract = await prisma.onboardingContract.findUnique({
      where: { id },
      include: {
        application: true
      }
    });
    
    if (!contract) {
      throw new AppError('Contract not found', 404);
    }
    
    // Generate PDF of contract
    const pdfUrl = await contractService.generateContractPDF(contract);
    
    // Update contract status
    await prisma.onboardingContract.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        documentUrl: pdfUrl
      }
    });
    
    // Send email with contract
    await emailService.sendContractForSigning(
      contract.application.ownerEmail,
      contract.application.ownerName,
      contract.contractNumber,
      pdfUrl
    );
    
    res.json({
      success: true,
      message: 'Contract sent for signing',
      data: {
        contractId: id,
        sentTo: contract.application.ownerEmail
      }
    });
  } catch (error) {
    next(error);
  }
};

export const signContractHospital = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { signature, signerName, signerEmail } = req.body;
    
    // Get current contract first
    const currentContract = await prisma.onboardingContract.findUnique({
      where: { id }
    });
    
    const contract = await prisma.onboardingContract.update({
      where: { id },
      data: {
        status: 'SIGNED',
        hospitalSignedAt: new Date(),
        hospitalSignedBy: signerName,
        hospitalSignatureData: signature,
        viewedAt: currentContract?.viewedAt || new Date()
      }
    });
    
    // Update progress
    if (contract.applicationId) {
      await prisma.onboardingProgress.update({
        where: { applicationId: contract.applicationId },
        data: {
          signingCompleted: true,
          signingCompletedAt: new Date(),
          currentStage: 'SYSTEM_SETUP',
          overallProgress: 75
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Contract signed successfully',
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

export const signContractGrandPro = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;
    const userId = (req as any).user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    });
    
    const contract = await prisma.onboardingContract.update({
      where: { id },
      data: {
        status: 'ACTIVE', // Changed from COUNTERSIGNED to ACTIVE
        ghmsoSignedAt: new Date(),
        ghmsoSignedBy: `${user?.firstName} ${user?.lastName}`,
        ghmsoSignatureData: signature
      },
      include: {
        application: true
      }
    });
    
    // Generate final signed document
    const signedDocumentUrl = await contractService.generateSignedContract(contract);
    
    await prisma.onboardingContract.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        signedDocumentUrl
      }
    });
    
    // Create hospital record if contract is fully executed
    if (contract.status === 'ACTIVE') {
      await onboardingService.createHospitalFromApplication(contract.applicationId);
    }
    
    res.json({
      success: true,
      message: 'Contract countersigned and activated',
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ONBOARDING PROGRESS
// ============================================

export const getOnboardingProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    
    const progress = await prisma.onboardingProgress.findUnique({
      where: { applicationId },
      include: {
        application: {
          select: {
            hospitalName: true,
            applicationNumber: true,
            status: true
          }
        }
      }
    });
    
    if (!progress) {
      throw new AppError('Progress not found', 404);
    }
    
    // Get checklist completion
    const checklist = await prisma.onboardingChecklist.findMany({
      where: { applicationId },
      orderBy: { orderIndex: 'asc' }
    });
    
    const completedItems = checklist.filter(item => item.isCompleted).length;
    const totalItems = checklist.length;
    const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        ...progress,
        checklistProgress,
        completedItems,
        totalItems
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOnboardingStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    const { stage, notes } = req.body;
    
    const stageProgress = {
      APPLICATION: 12,
      DOCUMENT_SUBMISSION: 25,
      EVALUATION: 37,
      CONTRACT_NEGOTIATION: 50,
      CONTRACT_SIGNING: 62,
      SYSTEM_SETUP: 75,
      TRAINING: 87,
      GO_LIVE: 95,
      COMPLETED: 100
    };
    
    const progress = await prisma.onboardingProgress.update({
      where: { applicationId },
      data: {
        currentStage: stage,
        overallProgress: stageProgress[stage as keyof typeof stageProgress] || 0,
        notes,
        [`${stage.toLowerCase()}Completed`]: true,
        [`${stage.toLowerCase()}CompletedAt`]: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Onboarding stage updated',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CHECKLIST MANAGEMENT
// ============================================

export const getChecklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { applicationId } = req.params;
    const { category } = req.query;
    
    const where: any = { applicationId };
    if (category) where.category = category;
    
    const checklist = await prisma.onboardingChecklist.findMany({
      where,
      orderBy: { orderIndex: 'asc' }
    });
    
    // Group by category
    const groupedChecklist = checklist.reduce((acc: any, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: groupedChecklist
    });
  } catch (error) {
    next(error);
  }
};

export const updateChecklistItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isCompleted, notes } = req.body;
    const userId = (req as any).user.id;
    
    const item = await prisma.onboardingChecklist.update({
      where: { id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        completedBy: isCompleted ? userId : null,
        notes
      }
    });
    
    // Update overall progress
    await onboardingService.updateChecklistProgress(item.applicationId);
    
    res.json({
      success: true,
      message: 'Checklist item updated',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CONTRACT TEMPLATES
// ============================================

export const getContractTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, isActive = true } = req.query;
    
    const where: any = { isActive: isActive === 'true' };
    if (type) where.type = type;
    
    const templates = await prisma.contractTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    next(error);
  }
};

export const createContractTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const templateData = req.body;
    const userId = (req as any).user.id;
    
    const template = await prisma.contractTemplate.create({
      data: {
        ...templateData,
        createdBy: userId
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Contract template created',
      data: template
    });
  } catch (error) {
    next(error);
  }
};

export const updateContractTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const template = await prisma.contractTemplate.update({
      where: { id },
      data: {
        ...updateData,
        version: { increment: 1 }
      }
    });
    
    res.json({
      success: true,
      message: 'Contract template updated',
      data: template
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// EVALUATION CRITERIA
// ============================================

export const getEvaluationCriteria = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, isActive = true } = req.query;
    
    const where: any = { isActive: isActive === 'true' };
    if (category) where.category = category;
    
    const criteria = await prisma.evaluationCriteria.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { weight: 'desc' }
      ]
    });
    
    // Group by category
    const groupedCriteria = criteria.reduce((acc: any, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: groupedCriteria
    });
  } catch (error) {
    next(error);
  }
};

export const upsertEvaluationCriteria = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const criteriaData = req.body;
    
    // Check if criteria exists
    const existingCriteria = await prisma.evaluationCriteria.findFirst({
      where: {
        category: criteriaData.category,
        criterion: criteriaData.criterion
      }
    });
    
    let criteria;
    if (existingCriteria) {
      criteria = await prisma.evaluationCriteria.update({
        where: { id: existingCriteria.id },
        data: criteriaData
      });
    } else {
      criteria = await prisma.evaluationCriteria.create({
        data: criteriaData
      });
    }
    
    res.json({
      success: true,
      message: 'Evaluation criteria saved',
      data: criteria
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ANALYTICS & REPORTING
// ============================================

export const getOnboardingMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, state } = req.query;
    
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    if (state) where.state = state;
    
    const [
      totalApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
      activeContracts,
      averageProcessingTime
    ] = await Promise.all([
      prisma.onboardingApplication.count({ where }),
      prisma.onboardingApplication.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.onboardingApplication.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.onboardingApplication.count({ 
        where: { 
          ...where, 
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } 
        } 
      }),
      prisma.onboardingContract.count({ 
        where: { 
          status: 'ACTIVE',
          application: where
        } 
      }),
      onboardingService.calculateAverageProcessingTime(where)
    ]);
    
    // Get applications by state
    const applicationsByState = await prisma.onboardingApplication.groupBy({
      by: ['state'],
      where,
      _count: true
    });
    
    // Get applications by stage
    const applicationsByStage = await prisma.onboardingProgress.groupBy({
      by: ['currentStage'],
      where: {
        application: where
      },
      _count: true
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalApplications,
          approvedApplications,
          rejectedApplications,
          pendingApplications,
          activeContracts,
          approvalRate: totalApplications > 0 
            ? ((approvedApplications / totalApplications) * 100).toFixed(2) 
            : 0,
          averageProcessingTime
        },
        byState: applicationsByState,
        byStage: applicationsByStage
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format } = req.params;
    const { status, state, startDate, endDate } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (state) where.state = state;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    
    const applications = await prisma.onboardingApplication.findMany({
      where,
      include: {
        evaluationScores: {
          select: {
            totalScore: true
          }
        },
        progress: {
          select: {
            currentStage: true,
            overallProgress: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    let exportData;
    let contentType;
    let fileName;
    
    switch (format) {
      case 'csv':
        exportData = await onboardingService.exportToCSV(applications);
        contentType = 'text/csv';
        fileName = `applications_${Date.now()}.csv`;
        break;
      case 'excel':
        exportData = await onboardingService.exportToExcel(applications);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `applications_${Date.now()}.xlsx`;
        break;
      case 'pdf':
        exportData = await onboardingService.exportToPDF(applications);
        contentType = 'application/pdf';
        fileName = `applications_${Date.now()}.pdf`;
        break;
      default:
        throw new AppError('Invalid export format', 400);
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(exportData);
  } catch (error) {
    next(error);
  }
};
