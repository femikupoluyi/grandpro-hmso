export interface EvaluationCriteria {
    infrastructure: number;
    staffing: number;
    equipment: number;
    location: number;
    financialViability: number;
}
export interface EvaluationResult {
    totalScore: number;
    criteria: EvaluationCriteria;
    recommendation: 'APPROVE' | 'REJECT' | 'PENDING_REVIEW';
    notes: string[];
}
export declare class EvaluationService {
    private static readonly WEIGHTS;
    private static readonly THRESHOLDS;
    /**
     * Perform automated evaluation of hospital application
     */
    static evaluateApplication(applicationId: string): Promise<EvaluationResult>;
    /**
     * Evaluate infrastructure based on bed capacity and facilities
     */
    private static evaluateInfrastructure;
    /**
     * Evaluate staffing capabilities
     */
    private static evaluateStaffing;
    /**
     * Evaluate equipment and medical resources
     */
    private static evaluateEquipment;
    /**
     * Evaluate location strategic value
     */
    private static evaluateLocation;
    /**
     * Evaluate financial viability
     */
    private static evaluateFinancialViability;
    /**
     * Calculate total weighted score
     */
    private static calculateTotalScore;
    /**
     * Get recommendation based on total score
     */
    private static getRecommendation;
    /**
     * Generate evaluation notes based on criteria scores
     */
    private static generateEvaluationNotes;
    /**
     * Calculate commission rate based on evaluation score and hospital size
     */
    static calculateCommissionRate(evaluationScore: number, bedCapacity: number): number;
    /**
     * Generate risk assessment for the application
     */
    static assessRisk(application: any, evaluationScore: number): {
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        riskFactors: string[];
        mitigationStrategies: string[];
    };
}
//# sourceMappingURL=evaluation.service.d.ts.map