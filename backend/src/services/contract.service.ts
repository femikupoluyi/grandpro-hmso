/**
 * Contract Service
 * Handles contract generation, template processing, and digital signatures
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { OnboardingContract } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Populate contract template with variables
 */
export const populateTemplate = async (
  template: string,
  variables: Record<string, any>
): Promise<string> => {
  try {
    // Register Handlebars helpers for Nigerian formatting
    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(amount);
    });
    
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });
    
    Handlebars.registerHelper('formatPercent', (value: number) => {
      return `${value}%`;
    });
    
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(variables);
  } catch (error) {
    logger.error('Error populating contract template:', error);
    throw error;
  }
};

/**
 * Generate PDF from contract content
 */
export const generateContractPDF = async (
  contract: OnboardingContract & { application: any }
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `contract_${contract.contractNumber}.pdf`;
      const filePath = path.join(process.cwd(), 'uploads', 'contracts', fileName);
      
      // Ensure directory exists
      await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
      
      // Create write stream
      const stream = doc.pipe(fs.createWriteStream(filePath));
      
      // Add header
      doc.fontSize(20).text('PARTNERSHIP AGREEMENT', { align: 'center' });
      doc.moveDown();
      
      // Add contract number and date
      doc.fontSize(12);
      doc.text(`Contract Number: ${contract.contractNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-NG')}`, { align: 'right' });
      doc.moveDown();
      
      // Add parties
      doc.fontSize(14).text('BETWEEN:', { underline: true });
      doc.fontSize(12);
      doc.text('GrandPro Hospital Management Services Organization (GHMSO)');
      doc.text('(hereinafter referred to as "GrandPro")');
      doc.moveDown();
      doc.text('AND');
      doc.moveDown();
      doc.text(contract.application.hospitalName);
      doc.text(`Legal Name: ${contract.application.legalName}`);
      doc.text(`Registration Number: ${contract.application.registrationNumber}`);
      doc.text('(hereinafter referred to as "Hospital")');
      doc.moveDown(2);
      
      // Add contract terms
      doc.fontSize(14).text('TERMS AND CONDITIONS', { underline: true });
      doc.fontSize(11);
      doc.moveDown();
      
      // Contract duration
      doc.text('1. CONTRACT DURATION', { underline: true });
      doc.text(`This agreement shall commence on ${new Date(contract.startDate).toLocaleDateString('en-NG')} and shall continue until ${new Date(contract.endDate).toLocaleDateString('en-NG')}.`);
      if (contract.autoRenew) {
        doc.text(`This contract shall automatically renew for periods of ${contract.renewalPeriodMonths} months unless terminated by either party.`);
      }
      doc.moveDown();
      
      // Financial terms
      doc.text('2. FINANCIAL TERMS', { underline: true });
      if (contract.setupFee) {
        doc.text(`Setup Fee: ${formatNaira(contract.setupFee)} (one-time payment)`);
      }
      if (contract.monthlyFee) {
        doc.text(`Monthly Management Fee: ${formatNaira(contract.monthlyFee)}`);
      }
      if (contract.revenueSharePercentage) {
        doc.text(`Revenue Share: ${contract.revenueSharePercentage}% of monthly gross revenue`);
      }
      if (contract.paymentTerms) {
        doc.text(`Payment Terms: ${contract.paymentTerms}`);
      }
      doc.moveDown();
      
      // Services provided
      doc.text('3. SERVICES PROVIDED BY GRANDPRO', { underline: true });
      doc.text('GrandPro shall provide the following services:');
      doc.text('• Hospital Management System (HMS) software and support');
      doc.text('• Training for hospital staff on system usage');
      doc.text('• Technical support and maintenance');
      doc.text('• Data backup and security services');
      doc.text('• Integration with insurance and HMO partners');
      doc.text('• Regular system updates and improvements');
      doc.text('• Performance analytics and reporting');
      doc.moveDown();
      
      // Hospital obligations
      doc.text('4. HOSPITAL OBLIGATIONS', { underline: true });
      doc.text('The Hospital agrees to:');
      doc.text('• Provide accurate and timely information');
      doc.text('• Ensure staff participation in training programs');
      doc.text('• Maintain required hardware and internet connectivity');
      doc.text('• Comply with data protection and privacy regulations');
      doc.text('• Make timely payments as per agreed terms');
      doc.moveDown();
      
      // Add main contract content if provided
      if (contract.content) {
        doc.addPage();
        doc.fontSize(11);
        doc.text(contract.content, {
          align: 'justify',
          lineGap: 2
        });
      }
      
      // Add special clauses if any
      if (contract.specialClauses && contract.specialClauses.length > 0) {
        doc.moveDown();
        doc.fontSize(12).text('SPECIAL CLAUSES', { underline: true });
        doc.fontSize(11);
        contract.specialClauses.forEach((clause, index) => {
          doc.text(`${index + 1}. ${clause}`);
        });
      }
      
      // Add signature section
      doc.addPage();
      doc.fontSize(14).text('SIGNATURES', { underline: true });
      doc.moveDown(2);
      
      // GrandPro signature
      doc.fontSize(12);
      doc.text('For GrandPro HMSO:');
      doc.moveDown(3);
      doc.text('_____________________________');
      doc.text('Name:');
      doc.text('Title:');
      doc.text('Date:');
      doc.moveDown(2);
      
      // Hospital signature
      doc.text('For Hospital:');
      doc.moveDown(3);
      doc.text('_____________________________');
      doc.text(`Name: ${contract.application.ownerName}`);
      doc.text('Title: Hospital Owner/Representative');
      doc.text('Date:');
      
      // Add footer on each page
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8);
        doc.text(
          `Page ${i + 1} of ${pages.count}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }
      
      // Finalize PDF
      doc.end();
      
      stream.on('finish', () => {
        resolve(`/contracts/${fileName}`);
      });
    } catch (error) {
      logger.error('Error generating contract PDF:', error);
      reject(error);
    }
  });
};

/**
 * Generate signed contract with signatures
 */
export const generateSignedContract = async (
  contract: OnboardingContract & { application: any }
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `signed_contract_${contract.contractNumber}.pdf`;
      const filePath = path.join(process.cwd(), 'uploads', 'contracts', fileName);
      
      // Ensure directory exists
      await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
      
      // Create write stream
      const stream = doc.pipe(fs.createWriteStream(filePath));
      
      // Copy content from original contract
      // (In production, you would copy the original PDF and add signatures)
      
      // Add header
      doc.fontSize(20).text('PARTNERSHIP AGREEMENT', { align: 'center' });
      doc.fontSize(12).text('(EXECUTED)', { align: 'center' });
      doc.moveDown();
      
      // Add execution notice
      doc.fontSize(10);
      doc.fillColor('green');
      doc.text('This contract has been digitally signed and is legally binding.', { align: 'center' });
      doc.fillColor('black');
      doc.moveDown();
      
      // Add contract details (similar to generateContractPDF but with signatures)
      doc.fontSize(12);
      doc.text(`Contract Number: ${contract.contractNumber}`, { align: 'right' });
      doc.text(`Execution Date: ${new Date().toLocaleDateString('en-NG')}`, { align: 'right' });
      doc.moveDown();
      
      // ... (Add same content as generateContractPDF)
      
      // Add digital signatures section
      doc.addPage();
      doc.fontSize(14).text('DIGITAL SIGNATURES', { underline: true });
      doc.moveDown();
      
      // Hospital signature
      if (contract.hospitalSignedAt) {
        doc.fontSize(12).text('Hospital Signature:', { underline: true });
        doc.fontSize(10);
        doc.text(`Signed by: ${contract.hospitalSignedBy}`);
        doc.text(`Date: ${new Date(contract.hospitalSignedAt).toLocaleString('en-NG')}`);
        doc.text(`Digital Signature ID: ${contract.hospitalSignatureData?.substring(0, 20)}...`);
        doc.moveDown();
      }
      
      // GrandPro signature
      if (contract.ghmsoSignedAt) {
        doc.fontSize(12).text('GrandPro HMSO Signature:', { underline: true });
        doc.fontSize(10);
        doc.text(`Signed by: ${contract.ghmsoSignedBy}`);
        doc.text(`Date: ${new Date(contract.ghmsoSignedAt).toLocaleString('en-NG')}`);
        doc.text(`Digital Signature ID: ${contract.ghmsoSignatureData?.substring(0, 20)}...`);
        doc.moveDown();
      }
      
      // Add verification QR code or hash
      doc.moveDown();
      doc.fontSize(8);
      doc.text('Document Verification Hash:', { underline: true });
      doc.text(generateDocumentHash(contract));
      
      // Finalize PDF
      doc.end();
      
      stream.on('finish', () => {
        resolve(`/contracts/${fileName}`);
      });
    } catch (error) {
      logger.error('Error generating signed contract:', error);
      reject(error);
    }
  });
};

/**
 * Verify digital signature
 */
export const verifySignature = (
  signatureData: string,
  documentHash: string
): boolean => {
  try {
    // In production, implement proper digital signature verification
    // using cryptographic methods
    return signatureData !== '' && documentHash !== '';
  } catch (error) {
    logger.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Generate document hash for verification
 */
const generateDocumentHash = (contract: any): string => {
  const crypto = require('crypto');
  const contractString = JSON.stringify({
    contractNumber: contract.contractNumber,
    hospitalName: contract.application.hospitalName,
    startDate: contract.startDate,
    endDate: contract.endDate,
    hospitalSignedAt: contract.hospitalSignedAt,
    ghmsoSignedAt: contract.ghmsoSignedAt
  });
  
  return crypto
    .createHash('sha256')
    .update(contractString)
    .digest('hex')
    .substring(0, 32)
    .toUpperCase();
};

/**
 * Format amount in Naira
 */
const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

/**
 * Create default contract template
 */
export const createDefaultTemplate = (): string => {
  return `
PARTNERSHIP AGREEMENT

This Agreement is entered into on {{formatDate startDate}} between:

1. GrandPro Hospital Management Services Organization ("GrandPro")
2. {{hospitalName}} ("Hospital")

WHEREAS, GrandPro provides hospital management software and services;
WHEREAS, Hospital desires to utilize GrandPro's services;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. TERM
This Agreement shall commence on {{formatDate startDate}} and continue until {{formatDate endDate}}.

2. SERVICES
GrandPro shall provide:
- Hospital Management System software
- Technical support and maintenance
- Staff training
- System updates and improvements

3. FEES
{{#if setupFee}}
Setup Fee: {{formatCurrency setupFee}} (one-time)
{{/if}}
{{#if monthlyFee}}
Monthly Fee: {{formatCurrency monthlyFee}}
{{/if}}
{{#if revenueSharePercentage}}
Revenue Share: {{formatPercent revenueSharePercentage}} of gross revenue
{{/if}}

4. PAYMENT TERMS
{{paymentTerms}}

5. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all proprietary information.

6. TERMINATION
Either party may terminate this Agreement with 30 days written notice.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the Federal Republic of Nigeria.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.
`;
};
