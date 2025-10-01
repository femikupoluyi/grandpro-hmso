"use strict";
/**
 * Database Seeder for GrandPro HMSO
 * Populates the database with Nigerian sample data
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Nigerian sample data
const NIGERIAN_NAMES = {
    first: ['Adebayo', 'Chioma', 'Emeka', 'Fatima', 'Gbenga', 'Halima', 'Ibrahim', 'Kemi', 'Lanre', 'Ngozi'],
    last: ['Okonkwo', 'Adeleke', 'Mohammed', 'Balogun', 'Adesanya', 'Okafor', 'Yusuf', 'Adeyemi', 'Eze', 'Olawale'],
    middle: ['Oluwaseun', 'Chukwudi', 'Abdullahi', 'Olufemi', 'Chinonso', 'Aisha', 'Temitope', 'Ikechukwu', 'Folake', 'Bashir']
};
const NIGERIAN_HOSPITALS = [
    {
        name: 'Lagos General Hospital',
        city: 'Lagos',
        state: 'Lagos',
        lga: 'Lagos Island',
        type: 'General',
        ownership: 'Public',
    },
    {
        name: 'Abuja Medical Centre',
        city: 'Abuja',
        state: 'Federal Capital Territory',
        lga: 'Abuja Municipal',
        type: 'Specialist',
        ownership: 'Private',
    },
    {
        name: 'Port Harcourt Teaching Hospital',
        city: 'Port Harcourt',
        state: 'Rivers',
        lga: 'Port Harcourt',
        type: 'Teaching',
        ownership: 'Public',
    },
    {
        name: 'Kano Specialist Hospital',
        city: 'Kano',
        state: 'Kano',
        lga: 'Kano Municipal',
        type: 'Specialist',
        ownership: 'Public',
    },
    {
        name: 'Ibadan Family Care Hospital',
        city: 'Ibadan',
        state: 'Oyo',
        lga: 'Ibadan North',
        type: 'General',
        ownership: 'Private',
    },
];
const NIGERIAN_ADDRESSES = [
    '15 Marina Road, Lagos Island',
    '42 Wuse District, Zone 4',
    '7 Trans Amadi Industrial Layout',
    '23 Murtala Mohammed Way',
    '88 Ring Road, Ibadan',
];
async function seedDatabase() {
    console.log('🌱 Starting database seeding with Nigerian data...');
    try {
        // Clean existing data
        console.log('Cleaning existing data...');
        await prisma.payment.deleteMany();
        await prisma.invoice.deleteMany();
        await prisma.labResult.deleteMany();
        await prisma.prescriptionItem.deleteMany();
        await prisma.prescription.deleteMany();
        await prisma.medicalRecord.deleteMany();
        await prisma.appointment.deleteMany();
        await prisma.patient.deleteMany();
        await prisma.staffMember.deleteMany();
        await prisma.department.deleteMany();
        await prisma.inventory.deleteMany();
        await prisma.hospitalDocument.deleteMany();
        await prisma.applicationDocument.deleteMany();
        await prisma.hospitalApplication.deleteMany();
        await prisma.contract.deleteMany();
        await prisma.hospitalOwner.deleteMany();
        await prisma.hospital.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.auditLog.deleteMany();
        await prisma.session.deleteMany();
        await prisma.permission.deleteMany();
        await prisma.role.deleteMany();
        await prisma.user.deleteMany();
        // Create super admin user
        console.log('Creating super admin user...');
        const hashedPassword = await bcryptjs_1.default.hash('Admin@123', 10);
        const superAdmin = await prisma.user.create({
            data: {
                email: 'admin@grandpro-hmso.com.ng',
                username: 'superadmin',
                password: hashedPassword,
                firstName: 'Adebayo',
                lastName: 'Ogundimu',
                middleName: 'Oluwaseun',
                phoneNumber: '+2348012345678',
                role: 'SUPER_ADMIN',
                isEmailVerified: true,
                isPhoneVerified: true,
                nationality: 'Nigerian',
                stateOfOrigin: 'Lagos',
                localGovernment: 'Lagos Island',
                addressLine1: '10 Marina Road',
                city: 'Lagos',
                state: 'Lagos',
                country: 'Nigeria',
            },
        });
        console.log(`✅ Super Admin created: ${superAdmin.email}`);
        // Create sample hospitals
        console.log('Creating sample hospitals...');
        const hospitals = [];
        for (let i = 0; i < NIGERIAN_HOSPITALS.length; i++) {
            const hospitalData = NIGERIAN_HOSPITALS[i];
            const hospital = await prisma.hospital.create({
                data: {
                    code: `HOS-${String(i + 1).padStart(3, '0')}`,
                    name: hospitalData.name,
                    legalName: `${hospitalData.name} Limited`,
                    registrationNumber: `RC${Math.floor(100000 + Math.random() * 900000)}`,
                    taxIdentificationNo: `TIN${Math.floor(10000000 + Math.random() * 90000000)}`,
                    email: `info@${hospitalData.name.toLowerCase().replace(/\s+/g, '')}.ng`,
                    phoneNumber: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
                    addressLine1: NIGERIAN_ADDRESSES[i],
                    city: hospitalData.city,
                    state: hospitalData.state,
                    localGovernment: hospitalData.lga,
                    country: 'Nigeria',
                    type: hospitalData.type,
                    ownership: hospitalData.ownership,
                    bedCapacity: Math.floor(50 + Math.random() * 200),
                    numberOfStaff: Math.floor(20 + Math.random() * 100),
                    specializations: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics'],
                    emergencyServices: true,
                    pharmacyServices: true,
                    laboratoryServices: true,
                    status: 'ACTIVE',
                    isVerified: true,
                    verifiedAt: new Date(),
                    nhisNumber: `NHIS${Math.floor(100000 + Math.random() * 900000)}`,
                    bankName: 'First Bank of Nigeria',
                    bankAccountNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                    bankAccountName: hospitalData.name,
                },
            });
            hospitals.push(hospital);
            console.log(`✅ Hospital created: ${hospital.name}`);
        }
        // Create hospital owners
        console.log('Creating hospital owners...');
        for (let i = 0; i < 3; i++) {
            const owner = await prisma.user.create({
                data: {
                    email: `owner${i + 1}@grandpro-hmso.com.ng`,
                    username: `owner${i + 1}`,
                    password: hashedPassword,
                    firstName: NIGERIAN_NAMES.first[i],
                    lastName: NIGERIAN_NAMES.last[i],
                    middleName: NIGERIAN_NAMES.middle[i],
                    phoneNumber: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
                    role: 'HOSPITAL_OWNER',
                    isEmailVerified: true,
                    nationality: 'Nigerian',
                    stateOfOrigin: ['Lagos', 'Ogun', 'Oyo'][i],
                    addressLine1: `${Math.floor(1 + Math.random() * 100)} Victoria Island`,
                    city: 'Lagos',
                    state: 'Lagos',
                    country: 'Nigeria',
                },
            });
            // Link owner to hospital
            await prisma.hospitalOwner.create({
                data: {
                    userId: owner.id,
                    hospitalId: hospitals[i].id,
                    ownershipPercentage: 100,
                    role: 'OWNER',
                },
            });
            console.log(`✅ Hospital owner created: ${owner.firstName} ${owner.lastName}`);
        }
        // Create departments for first hospital
        console.log('Creating departments...');
        const departments = ['Emergency', 'Surgery', 'Pediatrics', 'Obstetrics & Gynecology', 'Internal Medicine'];
        const createdDepartments = [];
        for (let i = 0; i < departments.length; i++) {
            const dept = await prisma.department.create({
                data: {
                    hospitalId: hospitals[0].id,
                    name: departments[i],
                    code: `DEPT-${String(i + 1).padStart(3, '0')}`,
                    description: `${departments[i]} Department`,
                },
            });
            createdDepartments.push(dept);
            console.log(`✅ Department created: ${dept.name}`);
        }
        // Create staff members
        console.log('Creating staff members...');
        const staffRoles = [
            { role: 'DOCTOR', designation: 'Medical Doctor', specialization: 'General Practice' },
            { role: 'NURSE', designation: 'Registered Nurse', specialization: 'General Nursing' },
            { role: 'PHARMACIST', designation: 'Pharmacist', specialization: 'Clinical Pharmacy' },
            { role: 'LAB_TECHNICIAN', designation: 'Laboratory Technician', specialization: 'Medical Laboratory' },
            { role: 'RECEPTIONIST', designation: 'Receptionist', specialization: null },
        ];
        for (let i = 0; i < staffRoles.length; i++) {
            const staffUser = await prisma.user.create({
                data: {
                    email: `staff${i + 1}@hospital.ng`,
                    username: `staff${i + 1}`,
                    password: hashedPassword,
                    firstName: NIGERIAN_NAMES.first[i + 3],
                    lastName: NIGERIAN_NAMES.last[i + 3],
                    phoneNumber: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
                    role: staffRoles[i].role,
                    isEmailVerified: true,
                    nationality: 'Nigerian',
                    stateOfOrigin: 'Lagos',
                    city: 'Lagos',
                    state: 'Lagos',
                    country: 'Nigeria',
                },
            });
            await prisma.staffMember.create({
                data: {
                    staffNumber: `STF-${String(i + 1).padStart(4, '0')}`,
                    userId: staffUser.id,
                    hospitalId: hospitals[0].id,
                    departmentId: createdDepartments[i % createdDepartments.length].id,
                    designation: staffRoles[i].designation,
                    specialization: staffRoles[i].specialization,
                    licenseNumber: staffRoles[i].role === 'DOCTOR' ? `MDCN/${Math.floor(10000 + Math.random() * 90000)}` : null,
                    employmentType: 'FULL_TIME',
                    employmentDate: new Date(2023, 0, 1),
                    baseSalary: Math.floor(150000 + Math.random() * 500000), // NGN 150,000 - 650,000
                },
            });
            console.log(`✅ Staff member created: ${staffUser.firstName} ${staffUser.lastName} (${staffRoles[i].designation})`);
        }
        // Create sample patients
        console.log('Creating sample patients...');
        for (let i = 0; i < 5; i++) {
            const patientUser = await prisma.user.create({
                data: {
                    email: `patient${i + 1}@example.com`,
                    username: `patient${i + 1}`,
                    password: hashedPassword,
                    firstName: NIGERIAN_NAMES.first[i + 5],
                    lastName: NIGERIAN_NAMES.last[i + 5],
                    phoneNumber: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
                    role: 'PATIENT',
                    isEmailVerified: true,
                    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
                    dateOfBirth: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                    nationality: 'Nigerian',
                    stateOfOrigin: ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo'][i],
                    city: 'Lagos',
                    state: 'Lagos',
                    country: 'Nigeria',
                },
            });
            const patient = await prisma.patient.create({
                data: {
                    patientNumber: `PAT-${String(i + 1).padStart(4, '0')}-2024`,
                    userId: patientUser.id,
                    hospitalId: hospitals[0].id,
                    bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'O-'][i],
                    genotype: ['AA', 'AS', 'AA', 'AS', 'AA'][i],
                    allergies: i % 2 === 0 ? ['Penicillin'] : [],
                    chronicConditions: i % 3 === 0 ? ['Hypertension'] : [],
                    hasInsurance: i % 2 === 0,
                    nhisNumber: i % 2 === 0 ? `NHIS${Math.floor(100000 + Math.random() * 900000)}` : null,
                    emergencyContactName: `${NIGERIAN_NAMES.first[i]} ${NIGERIAN_NAMES.last[i]}`,
                    emergencyContactPhone: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
                    emergencyContactRelation: ['Spouse', 'Parent', 'Sibling', 'Friend', 'Child'][i],
                },
            });
            console.log(`✅ Patient created: ${patientUser.firstName} ${patientUser.lastName}`);
        }
        // Create sample contracts
        console.log('Creating sample contracts...');
        for (let i = 0; i < 3; i++) {
            const contract = await prisma.contract.create({
                data: {
                    contractNumber: `CTR-2024-${String(i + 1).padStart(4, '0')}`,
                    hospitalId: hospitals[i].id,
                    title: `Service Agreement - ${hospitals[i].name}`,
                    description: 'Hospital management and operational services agreement',
                    type: 'SERVICE',
                    startDate: new Date(2024, 0, 1),
                    endDate: new Date(2025, 11, 31),
                    contractValue: Math.floor(5000000 + Math.random() * 20000000), // NGN 5M - 25M
                    paymentTerms: 'Monthly installments',
                    commissionRate: 10 + Math.random() * 5, // 10-15%
                    status: 'ACTIVE',
                    signedByHospital: true,
                    hospitalSignDate: new Date(2023, 11, 15),
                    signedByGrandPro: true,
                    grandProSignDate: new Date(2023, 11, 15),
                },
            });
            console.log(`✅ Contract created: ${contract.contractNumber}`);
        }
        // Create sample inventory items
        console.log('Creating inventory items...');
        const medications = [
            { name: 'Paracetamol 500mg', category: 'DRUG', dosageForm: 'TABLET', unitPrice: 50 },
            { name: 'Amoxicillin 500mg', category: 'DRUG', dosageForm: 'CAPSULE', unitPrice: 150 },
            { name: 'Ibuprofen 400mg', category: 'DRUG', dosageForm: 'TABLET', unitPrice: 80 },
            { name: 'Cough Syrup', category: 'DRUG', dosageForm: 'SYRUP', unitPrice: 500 },
            { name: 'Surgical Gloves', category: 'CONSUMABLE', dosageForm: null, unitPrice: 200 },
            { name: 'Face Masks', category: 'CONSUMABLE', dosageForm: null, unitPrice: 50 },
            { name: 'Syringes 5ml', category: 'CONSUMABLE', dosageForm: null, unitPrice: 30 },
            { name: 'Bandages', category: 'CONSUMABLE', dosageForm: null, unitPrice: 150 },
        ];
        for (let i = 0; i < medications.length; i++) {
            const item = medications[i];
            await prisma.inventory.create({
                data: {
                    hospitalId: hospitals[0].id,
                    itemCode: `INV-${String(i + 1).padStart(4, '0')}`,
                    name: item.name,
                    category: item.category,
                    dosageForm: item.dosageForm,
                    unitOfMeasure: item.category === 'DRUG' ? 'PIECE' : 'BOX',
                    currentStock: Math.floor(100 + Math.random() * 500),
                    minimumStock: 50,
                    maximumStock: 1000,
                    reorderLevel: 100,
                    costPrice: item.unitPrice * 0.7,
                    sellingPrice: item.unitPrice,
                },
            });
            console.log(`✅ Inventory item created: ${item.name}`);
        }
        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Super Admin: admin@grandpro-hmso.com.ng (Password: Admin@123)`);
        console.log(`   - Hospitals: ${hospitals.length}`);
        console.log(`   - Hospital Owners: 3`);
        console.log(`   - Departments: ${departments.length}`);
        console.log(`   - Staff Members: ${staffRoles.length}`);
        console.log(`   - Patients: 5`);
        console.log(`   - Contracts: 3`);
        console.log(`   - Inventory Items: ${medications.length}`);
        console.log('\n🇳🇬 All data uses Nigerian context (names, locations, currency, etc.)');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the seeder
seedDatabase()
    .then(() => {
    console.log('\n🎉 Seeding process finished!');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map