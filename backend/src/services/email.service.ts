/**
 * Email Service
 * Handles email notifications for the onboarding process
 */

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Create transporter (in production, use actual email service credentials)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send application confirmation email
 */
export const sendApplicationConfirmation = async (
  email: string,
  name: string,
  applicationNumber: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@grandprohmso.com',
      to: email,
      subject: `Application Received - ${applicationNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Dear ${name},</h2>
          
          <p>Thank you for submitting your hospital application to GrandPro HMSO.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #666;">Application Details:</h3>
            <p><strong>Application Number:</strong> ${applicationNumber}</p>
            <p><strong>Status:</strong> Submitted</p>
          </div>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Document Verification - Our team will review your submitted documents</li>
            <li>Evaluation - We will evaluate your facility based on our criteria</li>
            <li>Contract Negotiation - Upon approval, we'll prepare your partnership agreement</li>
            <li>Onboarding - Complete system setup and staff training</li>
          </ol>
          
          <p>You can check your application status anytime using your application number and email address.</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            GrandPro HMSO Team<br>
            Email: support@grandprohmso.com<br>
            Phone: +234 XXX XXX XXXX
          </p>
        </div>
      `
    };
    
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      logger.info('Email would be sent:', mailOptions);
    }
  } catch (error) {
    logger.error('Error sending application confirmation email:', error);
  }
};

/**
 * Send application status update email
 */
export const sendApplicationStatusUpdate = async (
  email: string,
  name: string,
  applicationNumber: string,
  status: string,
  reason?: string
): Promise<void> => {
  try {
    let statusColor = '#666';
    let statusMessage = '';
    
    switch (status) {
      case 'APPROVED':
        statusColor = '#28a745';
        statusMessage = 'Congratulations! Your application has been approved.';
        break;
      case 'REJECTED':
        statusColor = '#dc3545';
        statusMessage = 'Unfortunately, your application has not been approved at this time.';
        break;
      case 'UNDER_REVIEW':
        statusColor = '#ffc107';
        statusMessage = 'Your application is currently under review.';
        break;
      default:
        statusMessage = `Your application status has been updated to: ${status}`;
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@grandprohmso.com',
      to: email,
      subject: `Application Update - ${applicationNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Dear ${name},</h2>
          
          <p>We have an update regarding your hospital application.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: ${statusColor};">${statusMessage}</h3>
            <p><strong>Application Number:</strong> ${applicationNumber}</p>
            <p><strong>New Status:</strong> ${status}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          
          ${status === 'APPROVED' ? `
            <h3>Next Steps:</h3>
            <ol>
              <li>Contract Review - We will send you the partnership agreement for review</li>
              <li>Contract Signing - Sign the agreement digitally</li>
              <li>System Setup - We'll help you set up the hospital management system</li>
              <li>Training - Your staff will receive comprehensive training</li>
            </ol>
          ` : ''}
          
          ${status === 'REJECTED' ? `
            <p>We appreciate your interest in partnering with GrandPro HMSO. 
            You may reapply after addressing the concerns mentioned above.</p>
          ` : ''}
          
          <p>If you have any questions, please contact us.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            GrandPro HMSO Team<br>
            Email: support@grandprohmso.com<br>
            Phone: +234 XXX XXX XXXX
          </p>
        </div>
      `
    };
    
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      logger.info('Email would be sent:', mailOptions);
    }
  } catch (error) {
    logger.error('Error sending status update email:', error);
  }
};

/**
 * Send contract for signing
 */
export const sendContractForSigning = async (
  email: string,
  name: string,
  contractNumber: string,
  contractUrl: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@grandprohmso.com',
      to: email,
      subject: `Partnership Agreement Ready for Signing - ${contractNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Dear ${name},</h2>
          
          <p>Your partnership agreement with GrandPro HMSO is ready for signing.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #666;">Contract Details:</h3>
            <p><strong>Contract Number:</strong> ${contractNumber}</p>
            <p><strong>Status:</strong> Pending Signature</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/contracts/sign/${contractNumber}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Review and Sign Contract
            </a>
          </div>
          
          <h3>Important Information:</h3>
          <ul>
            <li>Please review the contract carefully before signing</li>
            <li>The contract must be signed within 7 days</li>
            <li>You can download a copy for your records after signing</li>
            <li>Digital signatures are legally binding</li>
          </ul>
          
          <p>If you have any questions about the contract terms, please contact us before signing.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            GrandPro HMSO Legal Team<br>
            Email: legal@grandprohmso.com<br>
            Phone: +234 XXX XXX XXXX
          </p>
        </div>
      `
    };
    
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      logger.info('Email would be sent:', mailOptions);
    }
  } catch (error) {
    logger.error('Error sending contract email:', error);
  }
};

/**
 * Send onboarding completion email
 */
export const sendOnboardingCompletion = async (
  email: string,
  name: string,
  hospitalCode: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@grandprohmso.com',
      to: email,
      subject: `Welcome to GrandPro HMSO - ${hospitalCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Welcome to GrandPro HMSO!</h2>
          
          <p>Dear ${name},</p>
          
          <p>Congratulations! Your hospital onboarding process is complete.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #666;">Your Hospital Details:</h3>
            <p><strong>Hospital Code:</strong> ${hospitalCode}</p>
            <p><strong>Status:</strong> Active</p>
            <p><strong>System Access:</strong> Enabled</p>
          </div>
          
          <h3>Getting Started:</h3>
          <ol>
            <li>Access the system at: ${process.env.FRONTEND_URL}</li>
            <li>Use your registered email and password to log in</li>
            <li>Complete your hospital profile setup</li>
            <li>Start managing your hospital operations</li>
          </ol>
          
          <h3>Available Resources:</h3>
          <ul>
            <li>User Guide: ${process.env.FRONTEND_URL}/guide</li>
            <li>Video Tutorials: ${process.env.FRONTEND_URL}/tutorials</li>
            <li>Support Center: ${process.env.FRONTEND_URL}/support</li>
          </ul>
          
          <p>Our support team is available to assist you with any questions.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            GrandPro HMSO Success Team<br>
            Email: success@grandprohmso.com<br>
            Phone: +234 XXX XXX XXXX
          </p>
        </div>
      `
    };
    
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      logger.info('Email would be sent:', mailOptions);
    }
  } catch (error) {
    logger.error('Error sending onboarding completion email:', error);
  }
};
