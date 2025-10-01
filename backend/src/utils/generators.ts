/**
 * Generator Utilities
 * Functions for generating unique identifiers and numbers
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate unique application number
 * Format: APP-YYYY-MM-XXXXXX
 */
export const generateApplicationNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get count of applications this month
  const startOfMonth = new Date(year, date.getMonth(), 1);
  const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const count = await prisma.onboardingApplication.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });
  
  const sequence = String(count + 1).padStart(6, '0');
  return `APP-${year}-${month}-${sequence}`;
};

/**
 * Generate unique contract number
 * Format: CON-YYYY-MM-XXXXXX
 */
export const generateContractNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get count of contracts this month
  const startOfMonth = new Date(year, date.getMonth(), 1);
  const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const count = await prisma.onboardingContract.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });
  
  const sequence = String(count + 1).padStart(6, '0');
  return `CON-${year}-${month}-${sequence}`;
};

/**
 * Generate unique hospital code
 * Format: HOSP-STATE-XXXXX
 */
export const generateHospitalCode = async (state: string): Promise<string> => {
  // State abbreviations map
  const stateAbbr: { [key: string]: string } = {
    'Abia': 'AB',
    'Adamawa': 'AD',
    'Akwa Ibom': 'AK',
    'Anambra': 'AN',
    'Bauchi': 'BA',
    'Bayelsa': 'BY',
    'Benue': 'BN',
    'Borno': 'BO',
    'Cross River': 'CR',
    'Delta': 'DT',
    'Ebonyi': 'EB',
    'Edo': 'ED',
    'Ekiti': 'EK',
    'Enugu': 'EN',
    'FCT': 'FC',
    'Gombe': 'GM',
    'Imo': 'IM',
    'Jigawa': 'JG',
    'Kaduna': 'KD',
    'Kano': 'KN',
    'Katsina': 'KT',
    'Kebbi': 'KB',
    'Kogi': 'KG',
    'Kwara': 'KW',
    'Lagos': 'LG',
    'Nasarawa': 'NS',
    'Niger': 'NG',
    'Ogun': 'OG',
    'Ondo': 'ON',
    'Osun': 'OS',
    'Oyo': 'OY',
    'Plateau': 'PL',
    'Rivers': 'RV',
    'Sokoto': 'SK',
    'Taraba': 'TR',
    'Yobe': 'YB',
    'Zamfara': 'ZM'
  };
  
  const abbr = stateAbbr[state] || 'XX';
  
  // Get count of hospitals in this state
  const count = await prisma.hospital.count({
    where: { state }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  return `HOSP-${abbr}-${sequence}`;
};

/**
 * Generate unique patient number
 * Format: PAT-HOSP-YYYYMM-XXXXX
 */
export const generatePatientNumber = async (hospitalCode: string): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get hospital abbreviation (first 2 letters after HOSP-)
  const hospAbbr = hospitalCode.split('-')[1] || 'XX';
  
  // Get count of patients registered this month at this hospital
  const startOfMonth = new Date(year, date.getMonth(), 1);
  const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const hospital = await prisma.hospital.findUnique({
    where: { code: hospitalCode }
  });
  
  if (!hospital) {
    throw new Error('Hospital not found');
  }
  
  const count = await prisma.patient.count({
    where: {
      hospitalId: hospital.id,
      registeredAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  return `PAT-${hospAbbr}-${year}${month}-${sequence}`;
};

/**
 * Generate unique invoice number
 * Format: INV-HOSP-YYYYMM-XXXXX
 */
export const generateInvoiceNumber = async (hospitalId: string): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    select: { code: true }
  });
  
  const hospAbbr = hospital?.code.split('-')[1] || 'XX';
  
  // Get count of invoices this month for this hospital
  const startOfMonth = new Date(year, date.getMonth(), 1);
  const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const count = await prisma.invoice.count({
    where: {
      hospitalId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  return `INV-${hospAbbr}-${year}${month}-${sequence}`;
};

/**
 * Generate unique appointment number
 * Format: APT-YYYYMMDD-XXXXX
 */
export const generateAppointmentNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Get count of appointments today
  const startOfDay = new Date(year, date.getMonth(), date.getDate());
  const endOfDay = new Date(year, date.getMonth(), date.getDate(), 23, 59, 59, 999);
  
  const count = await prisma.appointment.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  return `APT-${year}${month}${day}-${sequence}`;
};

/**
 * Generate unique staff number
 * Format: STF-HOSP-XXXXX
 */
export const generateStaffNumber = async (hospitalId: string): Promise<string> => {
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    select: { code: true }
  });
  
  const hospAbbr = hospital?.code.split('-')[1] || 'XX';
  
  // Get count of staff at this hospital
  const count = await prisma.staffMember.count({
    where: { hospitalId }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  return `STF-${hospAbbr}-${sequence}`;
};

/**
 * Generate unique medical record number
 * Format: MRN-PAT-YYYYMM-XXXXX
 */
export const generateMedicalRecordNumber = async (patientId: string): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { patientNumber: true }
  });
  
  if (!patient) {
    throw new Error('Patient not found');
  }
  
  // Extract patient code part
  const patCode = patient.patientNumber.split('-')[1] || 'XX';
  
  // Get count of medical records for this patient this month
  const startOfMonth = new Date(year, date.getMonth(), 1);
  const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const count = await prisma.medicalRecord.count({
    where: {
      patientId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  return `MRN-${patCode}-${year}${month}-${sequence}`;
};

/**
 * Generate unique prescription number
 * Format: RX-YYYYMMDD-XXXXX
 */
export const generatePrescriptionNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Get count of prescriptions today
  const startOfDay = new Date(year, date.getMonth(), date.getDate());
  const endOfDay = new Date(year, date.getMonth(), date.getDate(), 23, 59, 59, 999);
  
  const count = await prisma.prescription.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  return `RX-${year}${month}${day}-${sequence}`;
};

/**
 * Generate unique lab result number
 * Format: LAB-YYYYMMDD-XXXXX
 */
export const generateLabResultNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Get count of lab results today
  const startOfDay = new Date(year, date.getMonth(), date.getDate());
  const endOfDay = new Date(year, date.getMonth(), date.getDate(), 23, 59, 59, 999);
  
  const count = await prisma.labResult.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  return `LAB-${year}${month}${day}-${sequence}`;
};

/**
 * Generate verification token
 * Used for email verification, password reset, etc.
 */
export const generateVerificationToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Generate OTP (One-Time Password)
 * Returns a 6-digit OTP
 */
export const generateOTP = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Generate session token
 */
export const generateSessionToken = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
};
