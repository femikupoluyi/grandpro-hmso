"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Automated scoring system for hospital applications
class EvaluationService {
    // Weight factors for each criterion (total = 100)
    static WEIGHTS = {
        infrastructure: 20,
        staffing: 20,
        equipment: 20,
        location: 20,
        financialViability: 20,
    };
    // Minimum score thresholds
    static THRESHOLDS = {
        approve: 70,
        review: 50,
    };
    /**
     * Perform automated evaluation of hospital application
     */
    static async evaluateApplication(applicationId) {
        const application = await prisma.hospitalApplication.findUnique({
            where: { id: applicationId },
            include: { documents: true },
        });
        if (!application) {
            throw new Error('Application not found');
        }
        const criteria = {
            infrastructure: await this.evaluateInfrastructure(application),
            staffing: await this.evaluateStaffing(application),
            equipment: await this.evaluateEquipment(application),
            location: await this.evaluateLocation(application),
            financialViability: await this.evaluateFinancialViability(application),
        };
        const totalScore = this.calculateTotalScore(criteria);
        const recommendation = this.getRecommendation(totalScore);
        const notes = this.generateEvaluationNotes(criteria, application);
        return {
            totalScore,
            criteria,
            recommendation,
            notes,
        };
    }
    /**
     * Evaluate infrastructure based on bed capacity and facilities
     */
    static async evaluateInfrastructure(application) {
        let score = 0;
        const bedCapacity = application.proposedBedCapacity || 0;
        // Bed capacity scoring
        if (bedCapacity >= 100)
            score += 8;
        else if (bedCapacity >= 50)
            score += 6;
        else if (bedCapacity >= 20)
            score += 4;
        else if (bedCapacity >= 10)
            score += 2;
        // Specializations scoring
        const specializations = application.proposedSpecializations || [];
        if (specializations.length >= 5)
            score += 6;
        else if (specializations.length >= 3)
            score += 4;
        else if (specializations.length >= 1)
            score += 2;
        // Document verification scoring
        const hasInfrastructureDocs = application.documents.some((doc) => doc.documentType === 'FACILITY_PLAN' || doc.documentType === 'BUILDING_PERMIT');
        if (hasInfrastructureDocs)
            score += 6;
        return Math.min(score, this.WEIGHTS.infrastructure);
    }
    /**
     * Evaluate staffing capabilities
     */
    static async evaluateStaffing(application) {
        let score = 0;
        // Check for staffing plan in business plan
        if (application.businessPlan?.includes('staff') || application.businessPlan?.includes('personnel')) {
            score += 5;
        }
        // Check for medical license documents
        const hasMedicalLicense = application.documents.some((doc) => doc.documentType === 'MEDICAL_LICENSE' || doc.documentType === 'STAFF_CREDENTIALS');
        if (hasMedicalLicense)
            score += 10;
        // Check specializations (implies qualified staff)
        const specializations = application.proposedSpecializations || [];
        if (specializations.length > 0)
            score += 5;
        return Math.min(score, this.WEIGHTS.staffing);
    }
    /**
     * Evaluate equipment and medical resources
     */
    static async evaluateEquipment(application) {
        let score = 0;
        // Check for equipment list in documents
        const hasEquipmentDocs = application.documents.some((doc) => doc.documentType === 'EQUIPMENT_LIST' || doc.documentType === 'INVENTORY');
        if (hasEquipmentDocs)
            score += 10;
        // Check business plan for equipment mentions
        if (application.businessPlan?.includes('equipment') || application.businessPlan?.includes('medical devices')) {
            score += 5;
        }
        // Bed capacity implies basic equipment
        if (application.proposedBedCapacity >= 50)
            score += 5;
        return Math.min(score, this.WEIGHTS.equipment);
    }
    /**
     * Evaluate location strategic value
     */
    static async evaluateLocation(application) {
        let score = 0;
        const location = application.proposedLocation;
        if (!location)
            return 0;
        // Strategic states in Nigeria
        const strategicStates = ['Lagos', 'Abuja', 'FCT', 'Kano', 'Rivers', 'Ogun', 'Oyo', 'Kaduna'];
        const secondaryStates = ['Anambra', 'Delta', 'Edo', 'Enugu', 'Imo', 'Kwara', 'Osun'];
        if (strategicStates.includes(location.state)) {
            score += 12;
        }
        else if (secondaryStates.includes(location.state)) {
            score += 8;
        }
        else {
            score += 4;
        }
        // Urban vs rural consideration
        const urbanCities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Kaduna', 'Benin City'];
        if (urbanCities.some(city => location.city?.toLowerCase().includes(city.toLowerCase()))) {
            score += 8;
        }
        else {
            score += 4; // Rural areas also needed
        }
        return Math.min(score, this.WEIGHTS.location);
    }
    /**
     * Evaluate financial viability
     */
    static async evaluateFinancialViability(application) {
        let score = 0;
        // Check for financial documents
        const hasFinancialDocs = application.documents.some((doc) => doc.documentType === 'BANK_STATEMENT' ||
            doc.documentType === 'FINANCIAL_PROJECTION' ||
            doc.documentType === 'BUSINESS_PLAN');
        if (hasFinancialDocs)
            score += 10;
        // Check business plan quality
        if (application.businessPlan) {
            const planLength = application.businessPlan.length;
            if (planLength > 1000)
                score += 5;
            if (application.businessPlan.includes('revenue') || application.businessPlan.includes('financial')) {
                score += 5;
            }
        }
        return Math.min(score, this.WEIGHTS.financialViability);
    }
    /**
     * Calculate total weighted score
     */
    static calculateTotalScore(criteria) {
        return Object.values(criteria).reduce((sum, score) => sum + score, 0);
    }
    /**
     * Get recommendation based on total score
     */
    static getRecommendation(totalScore) {
        if (totalScore >= this.THRESHOLDS.approve) {
            return 'APPROVE';
        }
        else if (totalScore >= this.THRESHOLDS.review) {
            return 'PENDING_REVIEW';
        }
        else {
            return 'REJECT';
        }
    }
    /**
     * Generate evaluation notes based on criteria scores
     */
    static generateEvaluationNotes(criteria, application) {
        const notes = [];
        // Infrastructure notes
        if (criteria.infrastructure < 10) {
            notes.push('Infrastructure score is low. Consider requesting facility upgrade plans.');
        }
        else if (criteria.infrastructure >= 15) {
            notes.push('Strong infrastructure capabilities demonstrated.');
        }
        // Staffing notes
        if (criteria.staffing < 10) {
            notes.push('Staffing plan needs improvement. Request detailed personnel credentials.');
        }
        else if (criteria.staffing >= 15) {
            notes.push('Excellent staffing credentials and planning.');
        }
        // Equipment notes
        if (criteria.equipment < 10) {
            notes.push('Equipment documentation insufficient. Need detailed inventory list.');
        }
        // Location notes
        if (criteria.location >= 15) {
            notes.push('Strategic location with high market potential.');
        }
        // Financial notes
        if (criteria.financialViability < 10) {
            notes.push('Financial viability concerns. Request additional financial documentation.');
        }
        else if (criteria.financialViability >= 15) {
            notes.push('Strong financial foundation and projections.');
        }
        // Document completeness
        const docCount = application.documents?.length || 0;
        if (docCount < 3) {
            notes.push(`Only ${docCount} documents submitted. Minimum 3 required documents needed.`);
        }
        // Bed capacity notes
        if (application.proposedBedCapacity < 20) {
            notes.push('Small facility size may limit service capabilities.');
        }
        else if (application.proposedBedCapacity >= 100) {
            notes.push('Large facility with significant service capacity.');
        }
        return notes;
    }
    /**
     * Calculate commission rate based on evaluation score and hospital size
     */
    static calculateCommissionRate(evaluationScore, bedCapacity) {
        let baseRate = 10; // Base commission rate of 10%
        // Adjust based on evaluation score
        if (evaluationScore >= 90) {
            baseRate -= 2; // High-quality hospitals get lower commission
        }
        else if (evaluationScore >= 70) {
            baseRate -= 1;
        }
        else if (evaluationScore < 60) {
            baseRate += 2; // Higher risk hospitals pay more commission
        }
        // Adjust based on size
        if (bedCapacity >= 100) {
            baseRate -= 1; // Volume discount for large hospitals
        }
        else if (bedCapacity < 20) {
            baseRate += 1; // Small hospitals pay slightly more
        }
        return Math.max(5, Math.min(15, baseRate)); // Keep between 5% and 15%
    }
    /**
     * Generate risk assessment for the application
     */
    static assessRisk(application, evaluationScore) {
        const riskFactors = [];
        const mitigationStrategies = [];
        // Assess various risk factors
        if (evaluationScore < 60) {
            riskFactors.push('Low evaluation score indicates operational concerns');
            mitigationStrategies.push('Require monthly performance reviews for first 6 months');
        }
        if (!application.businessPlan || application.businessPlan.length < 500) {
            riskFactors.push('Inadequate business planning');
            mitigationStrategies.push('Request detailed business plan with financial projections');
        }
        if (application.proposedBedCapacity < 20) {
            riskFactors.push('Small facility size may limit revenue potential');
            mitigationStrategies.push('Focus on specialized services to maximize revenue');
        }
        const docCount = application.documents?.length || 0;
        if (docCount < 5) {
            riskFactors.push('Incomplete documentation');
            mitigationStrategies.push('Require all mandatory documents before contract signing');
        }
        // Determine overall risk level
        let riskLevel;
        if (riskFactors.length === 0) {
            riskLevel = 'LOW';
        }
        else if (riskFactors.length <= 2) {
            riskLevel = 'MEDIUM';
        }
        else {
            riskLevel = 'HIGH';
        }
        return {
            riskLevel,
            riskFactors,
            mitigationStrategies,
        };
    }
}
exports.EvaluationService = EvaluationService;
//# sourceMappingURL=evaluation.service.js.map