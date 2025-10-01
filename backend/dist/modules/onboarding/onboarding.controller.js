"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnboardingProgress = exports.signContract = exports.generateContract = exports.evaluateApplication = exports.uploadDocument = exports.updateApplicationStatus = exports.getApplicationById = exports.getApplications = exports.submitApplication = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
// Validation schemas
const hospitalApplicationSchema = zod_1.z.object({
    hospitalName: zod_1.z.string().min(2).max(200),
    contactPerson: zod_1.z.string().min(2).max(100),
    contactEmail: zod_1.z.string().email(),
    contactPhone: zod_1.z.string().regex(/^(\+234|0)[789]\d{9}$/, 'Invalid Nigerian phone number'),
    proposedLocation: zod_1.z.object({
        state: zod_1.z.string(),
        localGovernment: zod_1.z.string(),
        city: zod_1.z.string(),
        address: zod_1.z.string(),
    }),
    proposedBedCapacity: zod_1.z.number().min(5).optional(),
    proposedSpecializations: zod_1.z.array(zod_1.z.string()).optional(),
    businessPlan: zod_1.z.string().optional(),
});
const evaluationScoreSchema = zod_1.z.object({
    applicationId: zod_1.z.string(),
    evaluationScore: zod_1.z.number().min(0).max(100),
    evaluationCriteria: zod_1.z.object({
        infrastructure: zod_1.z.number().min(0).max(20),
        staffing: zod_1.z.number().min(0).max(20),
        equipment: zod_1.z.number().min(0).max(20),
        location: zod_1.z.number().min(0).max(20),
        financialViability: zod_1.z.number().min(0).max(20),
    }),
    evaluationNotes: zod_1.z.string().optional(),
});
const contractGenerationSchema = zod_1.z.object({
    applicationId: zod_1.z.string(),
    contractType: zod_1.z.string(),
    contractDuration: zod_1.z.number().min(1).max(10), // years
    contractValue: zod_1.z.number().min(0),
    commissionRate: zod_1.z.number().min(0).max(100).optional(),
    revenueShareRate: zod_1.z.number().min(0).max(100).optional(),
    paymentTerms: zod_1.z.string().optional(),
});
const digitalSignatureSchema = zod_1.z.object({
    contractId: zod_1.z.string(),
    signatureData: zod_1.z.string(), // Base64 encoded signature
    signatoryName: zod_1.z.string(),
    signatoryRole: zod_1.z.string(),
    signatoryEmail: zod_1.z.string().email(),
});
// Helper function to generate application number
const generateApplicationNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `APP-${year}${month}-${random}`;
};
// Helper function to generate contract number
const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CNT-${year}${month}-${random}`;
};
// Submit Hospital Application
const submitApplication = async (req, res) => {
    try {
        const validatedData = hospitalApplicationSchema.parse(req.body);
        // Check if email already has an application
        const existingApplication = await prisma.hospitalApplication.findFirst({
            where: {
                contactEmail: validatedData.contactEmail,
                status: {
                    notIn: ['REJECTED', 'WITHDRAWN'],
                },
            },
        });
        if (existingApplication) {
            return res.status(400).json({
                error: 'An application with this email already exists',
            });
        }
        const application = await prisma.hospitalApplication.create({
            data: {
                applicationNumber: generateApplicationNumber(),
                hospitalName: validatedData.hospitalName,
                contactPerson: validatedData.contactPerson,
                contactEmail: validatedData.contactEmail,
                contactPhone: validatedData.contactPhone,
                proposedLocation: validatedData.proposedLocation,
                proposedBedCapacity: validatedData.proposedBedCapacity,
                proposedSpecializations: validatedData.proposedSpecializations || [],
                businessPlan: validatedData.businessPlan,
                status: 'SUBMITTED',
            },
        });
        res.status(201).json({
            message: 'Application submitted successfully',
            application,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
};
exports.submitApplication = submitApplication;
// Get all applications
const getApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [applications, total] = await Promise.all([
            prisma.hospitalApplication.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    documents: true,
                },
            }),
            prisma.hospitalApplication.count({ where }),
        ]);
        res.json({
            applications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
};
exports.getApplications = getApplications;
// Get single application
const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await prisma.hospitalApplication.findUnique({
            where: { id },
            include: {
                documents: true,
                hospital: true,
            },
        });
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json(application);
    }
    catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
};
exports.getApplicationById = getApplicationById;
// Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const updateData = { status };
        if (status === 'UNDER_REVIEW') {
            updateData.reviewStartedAt = new Date();
        }
        else if (status === 'APPROVED' || status === 'REJECTED') {
            updateData.reviewCompletedAt = new Date();
            updateData.decision = status;
            updateData.decisionDate = new Date();
            updateData.decisionReason = reason;
            updateData.decisionBy = req.user?.id; // Assuming user is attached to request
        }
        const application = await prisma.hospitalApplication.update({
            where: { id },
            data: updateData,
        });
        res.json({
            message: 'Application status updated successfully',
            application,
        });
    }
    catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
// Upload document for application
const uploadDocument = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { documentType } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const application = await prisma.hospitalApplication.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        // Create document record
        const document = await prisma.applicationDocument.create({
            data: {
                applicationId,
                documentType,
                documentName: req.file.originalname,
                documentUrl: `/uploads/${req.file.filename}`,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
            },
        });
        res.status(201).json({
            message: 'Document uploaded successfully',
            document,
        });
    }
    catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};
exports.uploadDocument = uploadDocument;
// Automated evaluation scoring
const evaluateApplication = async (req, res) => {
    try {
        const validatedData = evaluationScoreSchema.parse(req.body);
        const application = await prisma.hospitalApplication.findUnique({
            where: { id: validatedData.applicationId },
            include: { documents: true },
        });
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        // Calculate weighted score
        const criteria = validatedData.evaluationCriteria;
        const totalScore = criteria.infrastructure +
            criteria.staffing +
            criteria.equipment +
            criteria.location +
            criteria.financialViability;
        // Automated decision based on score
        let decision = 'PENDING';
        let status;
        if (totalScore >= 70) {
            decision = 'APPROVED';
            status = 'APPROVED';
        }
        else if (totalScore < 50) {
            decision = 'REJECTED';
            status = 'REJECTED';
        }
        else {
            decision = 'PENDING_DOCUMENTS';
            status = 'DOCUMENTS_REQUESTED';
        }
        const updatedApplication = await prisma.hospitalApplication.update({
            where: { id: validatedData.applicationId },
            data: {
                evaluationScore: totalScore,
                evaluationCriteria: validatedData.evaluationCriteria,
                evaluationNotes: validatedData.evaluationNotes,
                evaluatedBy: req.user?.id,
                status,
                decision,
                decisionDate: new Date(),
            },
        });
        res.json({
            message: 'Application evaluated successfully',
            application: updatedApplication,
            recommendation: decision,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error evaluating application:', error);
        res.status(500).json({ error: 'Failed to evaluate application' });
    }
};
exports.evaluateApplication = evaluateApplication;
// Generate contract
const generateContract = async (req, res) => {
    try {
        const validatedData = contractGenerationSchema.parse(req.body);
        const application = await prisma.hospitalApplication.findUnique({
            where: { id: validatedData.applicationId },
        });
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        if (application.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Application must be approved before generating contract' });
        }
        // Check if hospital exists or create one
        let hospital = await prisma.hospital.findFirst({
            where: { email: application.contactEmail },
        });
        if (!hospital) {
            // Create hospital from application data
            const location = application.proposedLocation;
            hospital = await prisma.hospital.create({
                data: {
                    code: `HSP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    name: application.hospitalName,
                    email: application.contactEmail,
                    phoneNumber: application.contactPhone,
                    addressLine1: location.address,
                    city: location.city,
                    state: location.state,
                    localGovernment: location.localGovernment,
                    country: 'Nigeria',
                    type: 'PRIVATE',
                    ownership: 'PRIVATE',
                    bedCapacity: application.proposedBedCapacity,
                    specializations: application.proposedSpecializations || [],
                    status: 'PENDING',
                },
            });
            // Update application with hospital ID
            await prisma.hospitalApplication.update({
                where: { id: application.id },
                data: { hospitalId: hospital.id },
            });
        }
        // Generate contract
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + validatedData.contractDuration);
        const contract = await prisma.contract.create({
            data: {
                contractNumber: generateContractNumber(),
                hospitalId: hospital.id,
                title: `Service Agreement - ${hospital.name}`,
                description: `Hospital management service agreement between GrandPro HMSO and ${hospital.name}`,
                type: validatedData.contractType,
                startDate,
                endDate,
                renewalDate: new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before end
                contractValue: validatedData.contractValue,
                paymentTerms: validatedData.paymentTerms,
                commissionRate: validatedData.commissionRate,
                revenueShareRate: validatedData.revenueShareRate,
                status: 'DRAFT',
                createdBy: req.user?.id,
            },
        });
        // Generate contract document (template)
        const contractContent = await generateContractDocument(contract, hospital, application);
        // Save contract document
        const documentsDir = path.join(process.cwd(), 'uploads', 'contracts');
        await fs.mkdir(documentsDir, { recursive: true });
        const fileName = `${contract.contractNumber}.html`;
        const filePath = path.join(documentsDir, fileName);
        await fs.writeFile(filePath, contractContent);
        // Update contract with document URL
        await prisma.contract.update({
            where: { id: contract.id },
            data: { documentUrl: `/uploads/contracts/${fileName}` },
        });
        res.status(201).json({
            message: 'Contract generated successfully',
            contract,
            documentUrl: `/uploads/contracts/${fileName}`,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error generating contract:', error);
        res.status(500).json({ error: 'Failed to generate contract' });
    }
};
exports.generateContract = generateContract;
// Digital signature for contract
const signContract = async (req, res) => {
    try {
        const validatedData = digitalSignatureSchema.parse(req.body);
        const contract = await prisma.contract.findUnique({
            where: { id: validatedData.contractId },
            include: { hospital: true },
        });
        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        if (contract.status !== 'DRAFT' && contract.status !== 'SENT') {
            return res.status(400).json({ error: 'Contract cannot be signed in current status' });
        }
        // Generate signature hash
        const signatureHash = crypto
            .createHash('sha256')
            .update(validatedData.signatureData + validatedData.contractId + new Date().toISOString())
            .digest('hex');
        // Determine who is signing
        const isHospitalSign = validatedData.signatoryEmail === contract.hospital.email;
        const updateData = {
            status: 'SENT',
        };
        if (isHospitalSign) {
            updateData.signedByHospital = true;
            updateData.hospitalSignDate = new Date();
            updateData.hospitalSignatory = validatedData.signatoryName;
        }
        else {
            updateData.signedByGrandPro = true;
            updateData.grandProSignDate = new Date();
            updateData.grandProSignatory = validatedData.signatoryName;
        }
        // If both parties have signed, activate the contract
        if ((isHospitalSign && contract.signedByGrandPro) ||
            (!isHospitalSign && contract.signedByHospital)) {
            updateData.status = 'ACTIVE';
            // Update hospital status to ACTIVE
            await prisma.hospital.update({
                where: { id: contract.hospitalId },
                data: {
                    status: 'ACTIVE',
                    isVerified: true,
                    verifiedAt: new Date(),
                },
            });
        }
        const updatedContract = await prisma.contract.update({
            where: { id: validatedData.contractId },
            data: updateData,
        });
        // Store signature data
        const signaturesDir = path.join(process.cwd(), 'uploads', 'signatures');
        await fs.mkdir(signaturesDir, { recursive: true });
        const signatureFileName = `${contract.contractNumber}-${signatureHash}.json`;
        const signaturePath = path.join(signaturesDir, signatureFileName);
        await fs.writeFile(signaturePath, JSON.stringify({
            contractId: validatedData.contractId,
            signatureHash,
            signatureData: validatedData.signatureData,
            signatoryName: validatedData.signatoryName,
            signatoryRole: validatedData.signatoryRole,
            signatoryEmail: validatedData.signatoryEmail,
            signedAt: new Date().toISOString(),
        }));
        res.json({
            message: 'Contract signed successfully',
            contract: updatedContract,
            signatureHash,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error signing contract:', error);
        res.status(500).json({ error: 'Failed to sign contract' });
    }
};
exports.signContract = signContract;
// Helper function to generate contract document
async function generateContractDocument(contract, hospital, application) {
    const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Service Agreement - ${contract.contractNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; border-top: 1px solid #000; padding-top: 10px; }
        h1 { color: #2c5530; }
        h2 { color: #333; }
        .terms { background: #f5f5f5; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HOSPITAL MANAGEMENT SERVICE AGREEMENT</h1>
        <p>Contract Number: ${contract.contractNumber}</p>
        <p>Date: ${new Date().toLocaleDateString('en-NG')}</p>
      </div>

      <div class="section">
        <h2>PARTIES</h2>
        <p>This Service Agreement ("Agreement") is entered into between:</p>
        <p><strong>GrandPro HMSO</strong> (hereinafter referred to as "Service Provider")<br>
        Address: Lagos, Nigeria</p>
        <p>AND</p>
        <p><strong>${hospital.name}</strong> (hereinafter referred to as "Hospital")<br>
        Address: ${hospital.addressLine1}, ${hospital.city}, ${hospital.state}, Nigeria<br>
        Email: ${hospital.email}<br>
        Phone: ${hospital.phoneNumber}</p>
      </div>

      <div class="section">
        <h2>TERMS OF AGREEMENT</h2>
        <div class="terms">
          <p><strong>1. Duration:</strong> ${contract.contractDuration || 1} year(s)</p>
          <p><strong>2. Start Date:</strong> ${new Date(contract.startDate).toLocaleDateString('en-NG')}</p>
          <p><strong>3. End Date:</strong> ${new Date(contract.endDate).toLocaleDateString('en-NG')}</p>
          <p><strong>4. Contract Value:</strong> ₦${contract.contractValue.toLocaleString('en-NG')}</p>
          ${contract.commissionRate ? `<p><strong>5. Commission Rate:</strong> ${contract.commissionRate}%</p>` : ''}
          ${contract.revenueShareRate ? `<p><strong>6. Revenue Share:</strong> ${contract.revenueShareRate}%</p>` : ''}
          <p><strong>7. Payment Terms:</strong> ${contract.paymentTerms || 'Monthly'}</p>
        </div>
      </div>

      <div class="section">
        <h2>SERVICES PROVIDED</h2>
        <ul>
          <li>Hospital Management System Access</li>
          <li>Electronic Medical Records (EMR) System</li>
          <li>Billing and Revenue Management</li>
          <li>Inventory Management</li>
          <li>Staff Management and Rostering</li>
          <li>Patient Management and CRM</li>
          <li>Analytics and Reporting</li>
          <li>Technical Support and Maintenance</li>
          <li>Training and Onboarding</li>
        </ul>
      </div>

      <div class="section">
        <h2>HOSPITAL INFORMATION</h2>
        <p><strong>Bed Capacity:</strong> ${hospital.bedCapacity || 'TBD'}</p>
        <p><strong>Specializations:</strong> ${hospital.specializations?.join(', ') || 'General'}</p>
        <p><strong>Contact Person:</strong> ${application.contactPerson}</p>
      </div>

      <div class="section">
        <h2>TERMS AND CONDITIONS</h2>
        <ol>
          <li>The Hospital agrees to use the GrandPro HMSO platform for all hospital management operations.</li>
          <li>GrandPro HMSO will provide continuous technical support and system updates.</li>
          <li>Both parties agree to maintain confidentiality of all shared information.</li>
          <li>The Hospital will ensure compliance with Nigerian healthcare regulations.</li>
          <li>Payment shall be made according to the agreed payment terms.</li>
          <li>This agreement may be renewed upon mutual consent before expiration.</li>
          <li>Either party may terminate this agreement with 60 days written notice.</li>
          <li>This agreement is governed by the laws of the Federal Republic of Nigeria.</li>
        </ol>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <p><strong>For GrandPro HMSO</strong></p>
          <p>Name: _______________________</p>
          <p>Title: _______________________</p>
          <p>Date: _______________________</p>
        </div>
        <div class="signature-box">
          <p><strong>For ${hospital.name}</strong></p>
          <p>Name: _______________________</p>
          <p>Title: _______________________</p>
          <p>Date: _______________________</p>
        </div>
      </div>
    </body>
    </html>
  `;
    return template;
}
// Get onboarding progress
const getOnboardingProgress = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await prisma.hospitalApplication.findUnique({
            where: { id: applicationId },
            include: {
                documents: true,
                hospital: {
                    include: {
                        contracts: true,
                    },
                },
            },
        });
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        // Calculate progress
        const steps = {
            applicationSubmitted: true,
            documentsUploaded: application.documents.length >= 3, // Assuming minimum 3 documents
            evaluationCompleted: application.evaluationScore !== null,
            contractGenerated: application.hospital?.contracts?.length > 0,
            contractSigned: application.hospital?.contracts?.some(c => c.status === 'ACTIVE'),
            onboardingComplete: application.hospital?.status === 'ACTIVE',
        };
        const completedSteps = Object.values(steps).filter(Boolean).length;
        const totalSteps = Object.keys(steps).length;
        const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
        res.json({
            applicationId,
            status: application.status,
            progress: {
                percentage: progressPercentage,
                completedSteps,
                totalSteps,
                steps,
            },
            application,
        });
    }
    catch (error) {
        console.error('Error fetching onboarding progress:', error);
        res.status(500).json({ error: 'Failed to fetch onboarding progress' });
    }
};
exports.getOnboardingProgress = getOnboardingProgress;
//# sourceMappingURL=onboarding.controller.js.map