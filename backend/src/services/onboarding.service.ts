/**
 * Onboarding Service
 * Business logic for hospital onboarding process
 */

import { PrismaClient, OnboardingApplication } from '@prisma/client';
import * as csv from 'csv-writer';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Update document submission progress
 */
export const updateDocumentProgress = async (applicationId: string) => {
  try {
    // Get all required documents
    const requiredDocs = ['LICENSE', 'REGISTRATION', 'TAX_CERTIFICATE', 'FACILITY_PHOTOS'];
    
    const documents = await prisma.onboardingDocument.findMany({
      where: {
        applicationId,
        documentType: { in: requiredDocs as any },
        isVerified: true
      }
    });
    
    const progress = await prisma.onboardingProgress.findUnique({
      where: { applicationId }
    });
    
    if (progress && documents.length === requiredDocs.length) {
      await prisma.onboardingProgress.update({
        where: { applicationId },
        data: {
          documentsCompleted: true,
          documentsCompletedAt: new Date(),
          currentStage: 'EVALUATION',
          overallProgress: 25
        }
      });
    }
  } catch (error) {
    logger.error('Error updating document progress:', error);
  }
};

/**
 * Calculate average evaluation score
 */
export const calculateAverageScore = async (applicationId: string): Promise<number> => {
  const scores = await prisma.evaluationScore.findMany({
    where: { applicationId },
    select: { totalScore: true }
  });
  
  if (scores.length === 0) return 0;
  
  const total = scores.reduce((sum, score) => sum + score.totalScore, 0);
  return total / scores.length;
};

/**
 * Generate auto evaluation based on application data
 */
export const generateAutoEvaluation = async (application: any) => {
  const scores = {
    facilityScore: 0,
    facilityNotes: '',
    staffingScore: 0,
    staffingNotes: '',
    equipmentScore: 0,
    equipmentNotes: '',
    complianceScore: 0,
    complianceNotes: '',
    financialScore: 0,
    financialNotes: '',
    locationScore: 0,
    locationNotes: '',
    servicesScore: 0,
    servicesNotes: '',
    reputationScore: 0,
    reputationNotes: '',
    totalScore: 0
  };
  
  // Facility scoring
  if (application.bedCapacity) {
    if (application.bedCapacity >= 100) scores.facilityScore = 90;
    else if (application.bedCapacity >= 50) scores.facilityScore = 70;
    else if (application.bedCapacity >= 20) scores.facilityScore = 50;
    else scores.facilityScore = 30;
    scores.facilityNotes = `Bed capacity: ${application.bedCapacity}`;
  }
  
  // Staffing scoring
  if (application.staffCount) {
    if (application.staffCount >= 50) scores.staffingScore = 85;
    else if (application.staffCount >= 25) scores.staffingScore = 65;
    else if (application.staffCount >= 10) scores.staffingScore = 45;
    else scores.staffingScore = 25;
    scores.staffingNotes = `Staff count: ${application.staffCount}`;
  }
  
  // Equipment scoring based on available services
  let equipmentPoints = 0;
  if (application.hasEmergency) equipmentPoints += 25;
  if (application.hasPharmacy) equipmentPoints += 20;
  if (application.hasLaboratory) equipmentPoints += 25;
  if (application.hasRadiology) equipmentPoints += 30;
  scores.equipmentScore = equipmentPoints;
  scores.equipmentNotes = 'Based on available facilities';
  
  // Compliance scoring based on documents
  const verifiedDocs = application.documents?.filter((d: any) => d.isVerified) || [];
  scores.complianceScore = Math.min(verifiedDocs.length * 20, 100);
  scores.complianceNotes = `${verifiedDocs.length} verified documents`;
  
  // Financial scoring (placeholder - would need actual financial data)
  scores.financialScore = 60;
  scores.financialNotes = 'Default score - requires financial review';
  
  // Location scoring based on state (prioritize underserved areas)
  const priorityStates = ['Borno', 'Yobe', 'Adamawa', 'Bauchi', 'Gombe', 'Taraba'];
  if (priorityStates.includes(application.state)) {
    scores.locationScore = 90;
    scores.locationNotes = 'Priority location for healthcare expansion';
  } else {
    scores.locationScore = 70;
    scores.locationNotes = `Location: ${application.state}`;
  }
  
  // Services scoring
  const servicesCount = application.servicesOffered?.length || 0;
  scores.servicesScore = Math.min(servicesCount * 10, 100);
  scores.servicesNotes = `${servicesCount} services offered`;
  
  // Reputation (placeholder)
  scores.reputationScore = 50;
  scores.reputationNotes = 'Pending reference checks';
  
  // Calculate total score (weighted average)
  const weights = {
    facility: 0.15,
    staffing: 0.15,
    equipment: 0.15,
    compliance: 0.20,
    financial: 0.10,
    location: 0.10,
    services: 0.10,
    reputation: 0.05
  };
  
  scores.totalScore = (
    scores.facilityScore * weights.facility +
    scores.staffingScore * weights.staffing +
    scores.equipmentScore * weights.equipment +
    scores.complianceScore * weights.compliance +
    scores.financialScore * weights.financial +
    scores.locationScore * weights.location +
    scores.servicesScore * weights.services +
    scores.reputationScore * weights.reputation
  );
  
  return scores;
};

/**
 * Update checklist progress
 */
export const updateChecklistProgress = async (applicationId: string) => {
  const checklist = await prisma.onboardingChecklist.findMany({
    where: { applicationId }
  });
  
  const requiredItems = checklist.filter(item => item.isRequired);
  const completedRequired = requiredItems.filter(item => item.isCompleted);
  
  if (completedRequired.length === requiredItems.length) {
    const progress = await prisma.onboardingProgress.findUnique({
      where: { applicationId }
    });
    
    if (progress && !progress.isCompleted) {
      await prisma.onboardingProgress.update({
        where: { applicationId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          currentStage: 'COMPLETED',
          overallProgress: 100
        }
      });
    }
  }
};

/**
 * Create hospital from approved application
 */
export const createHospitalFromApplication = async (applicationId: string) => {
  try {
    const application = await prisma.onboardingApplication.findUnique({
      where: { id: applicationId },
      include: { contract: true }
    });
    
    if (!application || !application.contract) {
      throw new Error('Application or contract not found');
    }
    
    // Generate hospital code
    const hospitalCode = `H${Date.now().toString(36).toUpperCase()}`;
    
    const hospital = await prisma.hospital.create({
      data: {
        code: hospitalCode,
        name: application.hospitalName,
        legalName: application.legalName,
        registrationNumber: application.registrationNumber,
        taxIdentificationNo: application.taxId,
        email: application.email,
        phoneNumber: application.phone,
        alternatePhone: application.alternatePhone,
        website: application.website || '',
        addressLine1: application.address,
        city: application.city,
        state: application.state,
        localGovernment: application.lga,
        postalCode: application.postalCode || '',
        type: application.facilityType,
        ownership: 'PRIVATE',
        bedCapacity: application.bedCapacity,
        numberOfStaff: application.staffCount,
        specializations: application.specializations,
        emergencyServices: application.hasEmergency,
        pharmacyServices: application.hasPharmacy,
        laboratoryServices: application.hasLaboratory,
        imagingServices: application.hasRadiology,
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date()
      }
    });
    
    // Update contract with hospital ID
    await prisma.onboardingContract.update({
      where: { id: application.contract.id },
      data: { hospitalId: hospital.id }
    });
    
    // Update progress
    await prisma.onboardingProgress.update({
      where: { applicationId },
      data: {
        hospitalId: hospital.id,
        goLiveCompleted: true,
        goLiveCompletedAt: new Date(),
        isCompleted: true,
        completedAt: new Date(),
        currentStage: 'COMPLETED',
        overallProgress: 100
      }
    });
    
    logger.info(`Hospital created from application: ${hospital.code}`);
    
    return hospital;
  } catch (error) {
    logger.error('Error creating hospital from application:', error);
    throw error;
  }
};

/**
 * Calculate average processing time
 */
export const calculateAverageProcessingTime = async (where: any = {}) => {
  const completedApplications = await prisma.onboardingApplication.findMany({
    where: {
      ...where,
      status: 'APPROVED',
      approvedAt: { not: null }
    },
    select: {
      submittedAt: true,
      approvedAt: true
    }
  });
  
  if (completedApplications.length === 0) return 0;
  
  const totalDays = completedApplications.reduce((sum, app) => {
    if (app.submittedAt && app.approvedAt) {
      const days = Math.floor(
        (app.approvedAt.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }
    return sum;
  }, 0);
  
  return Math.round(totalDays / completedApplications.length);
};

/**
 * Export applications to CSV
 */
export const exportToCSV = async (applications: any[]) => {
  const csvData = applications.map(app => ({
    'Application Number': app.applicationNumber,
    'Hospital Name': app.hospitalName,
    'Legal Name': app.legalName,
    'State': app.state,
    'LGA': app.lga,
    'Owner Name': app.ownerName,
    'Owner Email': app.ownerEmail,
    'Owner Phone': app.ownerPhone,
    'Facility Type': app.facilityType,
    'Bed Capacity': app.bedCapacity,
    'Staff Count': app.staffCount,
    'Status': app.status,
    'Evaluation Score': app.evaluationScores?.[0]?.totalScore || 'N/A',
    'Current Stage': app.progress?.currentStage || 'N/A',
    'Progress %': app.progress?.overallProgress || 0,
    'Submitted Date': app.submittedAt?.toISOString() || '',
    'Approved Date': app.approvedAt?.toISOString() || ''
  }));
  
  // Convert to CSV format
  const headers = Object.keys(csvData[0]);
  const rows = csvData.map(row => headers.map(header => row[header]).join(','));
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Export applications to Excel
 */
export const exportToExcel = async (applications: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Applications');
  
  // Add headers
  worksheet.columns = [
    { header: 'Application Number', key: 'applicationNumber', width: 20 },
    { header: 'Hospital Name', key: 'hospitalName', width: 30 },
    { header: 'Legal Name', key: 'legalName', width: 30 },
    { header: 'State', key: 'state', width: 15 },
    { header: 'LGA', key: 'lga', width: 20 },
    { header: 'Owner Name', key: 'ownerName', width: 25 },
    { header: 'Owner Email', key: 'ownerEmail', width: 30 },
    { header: 'Owner Phone', key: 'ownerPhone', width: 15 },
    { header: 'Facility Type', key: 'facilityType', width: 20 },
    { header: 'Bed Capacity', key: 'bedCapacity', width: 15 },
    { header: 'Staff Count', key: 'staffCount', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Evaluation Score', key: 'evaluationScore', width: 15 },
    { header: 'Current Stage', key: 'currentStage', width: 20 },
    { header: 'Progress %', key: 'progressPercent', width: 12 },
    { header: 'Submitted Date', key: 'submittedDate', width: 20 },
    { header: 'Approved Date', key: 'approvedDate', width: 20 }
  ];
  
  // Add data
  applications.forEach(app => {
    worksheet.addRow({
      applicationNumber: app.applicationNumber,
      hospitalName: app.hospitalName,
      legalName: app.legalName,
      state: app.state,
      lga: app.lga,
      ownerName: app.ownerName,
      ownerEmail: app.ownerEmail,
      ownerPhone: app.ownerPhone,
      facilityType: app.facilityType,
      bedCapacity: app.bedCapacity,
      staffCount: app.staffCount,
      status: app.status,
      evaluationScore: app.evaluationScores?.[0]?.totalScore || 'N/A',
      currentStage: app.progress?.currentStage || 'N/A',
      progressPercent: app.progress?.overallProgress || 0,
      submittedDate: app.submittedAt?.toISOString() || '',
      approvedDate: app.approvedAt?.toISOString() || ''
    });
  });
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Export applications to PDF
 */
export const exportToPDF = async (applications: any[]) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    
    // Add title
    doc.fontSize(20).text('Hospital Onboarding Applications Report', { align: 'center' });
    doc.moveDown();
    
    // Add generation date
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}`, { align: 'right' });
    doc.moveDown();
    
    // Add summary statistics
    doc.fontSize(14).text('Summary Statistics', { underline: true });
    doc.fontSize(10);
    doc.text(`Total Applications: ${applications.length}`);
    doc.text(`Approved: ${applications.filter(a => a.status === 'APPROVED').length}`);
    doc.text(`Pending: ${applications.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length}`);
    doc.text(`Rejected: ${applications.filter(a => a.status === 'REJECTED').length}`);
    doc.moveDown();
    
    // Add application details
    doc.fontSize(14).text('Application Details', { underline: true });
    doc.fontSize(9);
    
    applications.forEach((app, index) => {
      if (index > 0) doc.moveDown();
      
      doc.fontSize(10).text(`${index + 1}. ${app.hospitalName}`, { underline: true });
      doc.fontSize(9);
      doc.text(`   Application #: ${app.applicationNumber}`);
      doc.text(`   Status: ${app.status}`);
      doc.text(`   Location: ${app.city}, ${app.state}`);
      doc.text(`   Owner: ${app.ownerName} (${app.ownerEmail})`);
      doc.text(`   Facility Type: ${app.facilityType}`);
      doc.text(`   Capacity: ${app.bedCapacity || 'N/A'} beds, ${app.staffCount || 'N/A'} staff`);
      
      if (app.evaluationScores?.length > 0) {
        doc.text(`   Evaluation Score: ${app.evaluationScores[0].totalScore.toFixed(2)}`);
      }
      
      if (app.progress) {
        doc.text(`   Current Stage: ${app.progress.currentStage}`);
        doc.text(`   Progress: ${app.progress.overallProgress}%`);
      }
    });
    
    doc.end();
  });
};
