-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HOSPITAL_OWNER', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'ACCOUNTANT', 'PATIENT', 'STAFF');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "HospitalStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'INSURANCE', 'NHIS', 'HMO');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CAC_CERTIFICATE', 'MEDICAL_LICENSE', 'TAX_CERTIFICATE', 'INSURANCE_CERTIFICATE', 'BUILDING_PERMIT', 'FIRE_SAFETY_CERTIFICATE', 'ENVIRONMENTAL_PERMIT', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "nationality" TEXT NOT NULL DEFAULT 'Nigerian',
    "stateOfOrigin" TEXT,
    "localGovernment" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "avatar" TEXT,
    "bio" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Nigeria',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "registrationNumber" TEXT,
    "taxIdentificationNo" TEXT,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "website" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "localGovernment" TEXT NOT NULL,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Nigeria',
    "coordinates" JSONB,
    "type" TEXT NOT NULL,
    "ownership" TEXT NOT NULL,
    "bedCapacity" INTEGER,
    "numberOfStaff" INTEGER,
    "specializations" TEXT[],
    "operatingHours" JSONB,
    "emergencyServices" BOOLEAN NOT NULL DEFAULT false,
    "ambulanceServices" BOOLEAN NOT NULL DEFAULT false,
    "pharmacyServices" BOOLEAN NOT NULL DEFAULT false,
    "laboratoryServices" BOOLEAN NOT NULL DEFAULT false,
    "imagingServices" BOOLEAN NOT NULL DEFAULT false,
    "status" "HospitalStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "nhisNumber" TEXT,
    "hmoRegistrations" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "language" TEXT NOT NULL DEFAULT 'en',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalOwner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "ownershipPercentage" DOUBLE PRECISION,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "HospitalOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "headOfDepartment" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3),
    "terminationClause" TEXT,
    "contractValue" MONEY NOT NULL,
    "paymentTerms" TEXT,
    "paymentSchedule" JSONB,
    "commissionRate" DOUBLE PRECISION,
    "revenueShareRate" DOUBLE PRECISION,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "signedByHospital" BOOLEAN NOT NULL DEFAULT false,
    "hospitalSignDate" TIMESTAMP(3),
    "hospitalSignatory" TEXT,
    "signedByGrandPro" BOOLEAN NOT NULL DEFAULT false,
    "grandProSignDate" TIMESTAMP(3),
    "grandProSignatory" TEXT,
    "documentUrl" TEXT,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "lastModifiedBy" TEXT,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalApplication" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "hospitalId" TEXT,
    "hospitalName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "proposedLocation" JSONB NOT NULL,
    "proposedBedCapacity" INTEGER,
    "proposedSpecializations" TEXT[],
    "businessPlan" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStartedAt" TIMESTAMP(3),
    "reviewCompletedAt" TIMESTAMP(3),
    "evaluationScore" DOUBLE PRECISION,
    "evaluationCriteria" JSONB,
    "evaluationNotes" TEXT,
    "evaluatedBy" TEXT,
    "decision" TEXT,
    "decisionDate" TIMESTAMP(3),
    "decisionReason" TEXT,
    "decisionBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalDocument" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentNumber" TEXT,
    "documentUrl" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,

    CONSTRAINT "HospitalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "patientNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "genotype" TEXT,
    "allergies" TEXT[],
    "chronicConditions" TEXT[],
    "currentMedications" JSONB,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "hasInsurance" BOOLEAN NOT NULL DEFAULT false,
    "insuranceProvider" TEXT,
    "insurancePolicyNumber" TEXT,
    "insuranceValidUntil" TIMESTAMP(3),
    "nhisNumber" TEXT,
    "nhisValidUntil" TIMESTAMP(3),
    "hmoProvider" TEXT,
    "hmoPolicyNumber" TEXT,
    "hmoValidUntil" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisit" TIMESTAMP(3),
    "visitCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "recordNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitType" TEXT NOT NULL,
    "chiefComplaint" TEXT,
    "presentingIllness" TEXT,
    "pastMedicalHistory" TEXT,
    "familyHistory" TEXT,
    "socialHistory" TEXT,
    "vitalSigns" JSONB,
    "physicalExamination" TEXT,
    "provisionalDiagnosis" TEXT,
    "finalDiagnosis" TEXT,
    "icdCode" TEXT,
    "treatmentPlan" TEXT,
    "proceduresPerformed" JSONB,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "attendingDoctor" TEXT NOT NULL,
    "attendingNurse" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "appointmentNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "appointmentType" TEXT NOT NULL,
    "department" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "cancelledBy" TEXT,
    "rescheduledFrom" TEXT,
    "rescheduledAt" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" "PaymentMethod",
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "staffNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "departmentId" TEXT,
    "designation" TEXT NOT NULL,
    "specialization" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "employmentType" TEXT NOT NULL,
    "employmentDate" TIMESTAMP(3) NOT NULL,
    "contractEndDate" TIMESTAMP(3),
    "baseSalary" MONEY,
    "allowances" JSONB,
    "workSchedule" JSONB,
    "shiftPattern" TEXT,
    "annualLeaveBalance" INTEGER NOT NULL DEFAULT 21,
    "sickLeaveBalance" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "terminationDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "description" TEXT,
    "genericName" TEXT,
    "brandName" TEXT,
    "dosageForm" TEXT,
    "strength" TEXT,
    "manufacturer" TEXT,
    "unitOfMeasure" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 10,
    "maximumStock" INTEGER NOT NULL DEFAULT 100,
    "reorderLevel" INTEGER NOT NULL DEFAULT 20,
    "costPrice" MONEY NOT NULL,
    "sellingPrice" MONEY NOT NULL,
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "storageLocation" TEXT,
    "storageConditions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "lastRestocked" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "prescriptionNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicalRecordId" TEXT NOT NULL,
    "prescribedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dispensedBy" TEXT,
    "dispensedAt" TIMESTAMP(3),
    "instructions" TEXT,
    "pharmacistNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "inventoryId" TEXT,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "instructions" TEXT,
    "quantityDispensed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "labNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicalRecordId" TEXT,
    "requestedBy" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "testCategory" TEXT NOT NULL,
    "specimen" TEXT,
    "specimenCollectedAt" TIMESTAMP(3),
    "results" JSONB NOT NULL,
    "normalRange" JSONB,
    "interpretation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "reportUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" MONEY NOT NULL,
    "tax" MONEY NOT NULL DEFAULT 0,
    "discount" MONEY NOT NULL DEFAULT 0,
    "totalAmount" MONEY NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "amountPaid" MONEY NOT NULL DEFAULT 0,
    "balance" MONEY NOT NULL,
    "insuranceClaim" BOOLEAN NOT NULL DEFAULT false,
    "insuranceProvider" TEXT,
    "claimNumber" TEXT,
    "claimAmount" MONEY,
    "claimStatus" TEXT,
    "appointmentId" TEXT,
    "medicalRecordId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" MONEY NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "referenceNumber" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "cardLastFour" TEXT,
    "cardType" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "receiptNumber" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalMetrics" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPatients" INTEGER NOT NULL DEFAULT 0,
    "newPatients" INTEGER NOT NULL DEFAULT 0,
    "activePatients" INTEGER NOT NULL DEFAULT 0,
    "totalAppointments" INTEGER NOT NULL DEFAULT 0,
    "completedAppointments" INTEGER NOT NULL DEFAULT 0,
    "cancelledAppointments" INTEGER NOT NULL DEFAULT 0,
    "noShowAppointments" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" MONEY NOT NULL DEFAULT 0,
    "cashRevenue" MONEY NOT NULL DEFAULT 0,
    "insuranceRevenue" MONEY NOT NULL DEFAULT 0,
    "outstandingAmount" MONEY NOT NULL DEFAULT 0,
    "bedOccupancyRate" DOUBLE PRECISION,
    "averageWaitTime" INTEGER,
    "staffUtilization" DOUBLE PRECISION,
    "drugStockLevel" DOUBLE PRECISION,
    "expiredItems" INTEGER NOT NULL DEFAULT 0,
    "stockouts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HospitalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestMethod" TEXT,
    "requestUrl" TEXT,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_sessionToken_idx" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_resource_action_idx" ON "Permission"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_code_key" ON "Hospital"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_email_key" ON "Hospital"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_nhisNumber_key" ON "Hospital"("nhisNumber");

-- CreateIndex
CREATE INDEX "Hospital_code_idx" ON "Hospital"("code");

-- CreateIndex
CREATE INDEX "Hospital_email_idx" ON "Hospital"("email");

-- CreateIndex
CREATE INDEX "Hospital_status_idx" ON "Hospital"("status");

-- CreateIndex
CREATE INDEX "Hospital_state_idx" ON "Hospital"("state");

-- CreateIndex
CREATE INDEX "Hospital_nhisNumber_idx" ON "Hospital"("nhisNumber");

-- CreateIndex
CREATE INDEX "HospitalOwner_userId_idx" ON "HospitalOwner"("userId");

-- CreateIndex
CREATE INDEX "HospitalOwner_hospitalId_idx" ON "HospitalOwner"("hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalOwner_userId_hospitalId_key" ON "HospitalOwner"("userId", "hospitalId");

-- CreateIndex
CREATE INDEX "Department_hospitalId_idx" ON "Department"("hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_hospitalId_code_key" ON "Department"("hospitalId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- CreateIndex
CREATE INDEX "Contract_contractNumber_idx" ON "Contract"("contractNumber");

-- CreateIndex
CREATE INDEX "Contract_hospitalId_idx" ON "Contract"("hospitalId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalApplication_applicationNumber_key" ON "HospitalApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "HospitalApplication_applicationNumber_idx" ON "HospitalApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "HospitalApplication_status_idx" ON "HospitalApplication"("status");

-- CreateIndex
CREATE INDEX "HospitalApplication_contactEmail_idx" ON "HospitalApplication"("contactEmail");

-- CreateIndex
CREATE INDEX "ApplicationDocument_applicationId_idx" ON "ApplicationDocument"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationDocument_documentType_idx" ON "ApplicationDocument"("documentType");

-- CreateIndex
CREATE INDEX "HospitalDocument_hospitalId_idx" ON "HospitalDocument"("hospitalId");

-- CreateIndex
CREATE INDEX "HospitalDocument_documentType_idx" ON "HospitalDocument"("documentType");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientNumber_key" ON "Patient"("patientNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_nhisNumber_key" ON "Patient"("nhisNumber");

-- CreateIndex
CREATE INDEX "Patient_patientNumber_idx" ON "Patient"("patientNumber");

-- CreateIndex
CREATE INDEX "Patient_userId_idx" ON "Patient"("userId");

-- CreateIndex
CREATE INDEX "Patient_hospitalId_idx" ON "Patient"("hospitalId");

-- CreateIndex
CREATE INDEX "Patient_nhisNumber_idx" ON "Patient"("nhisNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_recordNumber_key" ON "MedicalRecord"("recordNumber");

-- CreateIndex
CREATE INDEX "MedicalRecord_recordNumber_idx" ON "MedicalRecord"("recordNumber");

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");

-- CreateIndex
CREATE INDEX "MedicalRecord_hospitalId_idx" ON "MedicalRecord"("hospitalId");

-- CreateIndex
CREATE INDEX "MedicalRecord_visitDate_idx" ON "MedicalRecord"("visitDate");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_appointmentNumber_key" ON "Appointment"("appointmentNumber");

-- CreateIndex
CREATE INDEX "Appointment_appointmentNumber_idx" ON "Appointment"("appointmentNumber");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_hospitalId_idx" ON "Appointment"("hospitalId");

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_staffNumber_key" ON "StaffMember"("staffNumber");

-- CreateIndex
CREATE INDEX "StaffMember_staffNumber_idx" ON "StaffMember"("staffNumber");

-- CreateIndex
CREATE INDEX "StaffMember_userId_idx" ON "StaffMember"("userId");

-- CreateIndex
CREATE INDEX "StaffMember_hospitalId_idx" ON "StaffMember"("hospitalId");

-- CreateIndex
CREATE INDEX "StaffMember_departmentId_idx" ON "StaffMember"("departmentId");

-- CreateIndex
CREATE INDEX "Inventory_hospitalId_idx" ON "Inventory"("hospitalId");

-- CreateIndex
CREATE INDEX "Inventory_category_idx" ON "Inventory"("category");

-- CreateIndex
CREATE INDEX "Inventory_currentStock_idx" ON "Inventory"("currentStock");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_hospitalId_itemCode_key" ON "Inventory"("hospitalId", "itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_prescriptionNumber_key" ON "Prescription"("prescriptionNumber");

-- CreateIndex
CREATE INDEX "Prescription_prescriptionNumber_idx" ON "Prescription"("prescriptionNumber");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_medicalRecordId_idx" ON "Prescription"("medicalRecordId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "LabResult_labNumber_key" ON "LabResult"("labNumber");

-- CreateIndex
CREATE INDEX "LabResult_labNumber_idx" ON "LabResult"("labNumber");

-- CreateIndex
CREATE INDEX "LabResult_patientId_idx" ON "LabResult"("patientId");

-- CreateIndex
CREATE INDEX "LabResult_status_idx" ON "LabResult"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_patientId_idx" ON "Invoice"("patientId");

-- CreateIndex
CREATE INDEX "Invoice_hospitalId_idx" ON "Invoice"("hospitalId");

-- CreateIndex
CREATE INDEX "Invoice_paymentStatus_idx" ON "Invoice"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNumber_key" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_paymentNumber_idx" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "HospitalMetrics_hospitalId_idx" ON "HospitalMetrics"("hospitalId");

-- CreateIndex
CREATE INDEX "HospitalMetrics_metricDate_idx" ON "HospitalMetrics"("metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalMetrics_hospitalId_metricDate_key" ON "HospitalMetrics"("hospitalId", "metricDate");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalOwner" ADD CONSTRAINT "HospitalOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalOwner" ADD CONSTRAINT "HospitalOwner_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalApplication" ADD CONSTRAINT "HospitalApplication_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDocument" ADD CONSTRAINT "ApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "HospitalApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalDocument" ADD CONSTRAINT "HospitalDocument_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalMetrics" ADD CONSTRAINT "HospitalMetrics_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
