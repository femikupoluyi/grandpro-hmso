/**
 * Evaluation Utilities
 * Functions for calculating and processing evaluation scores
 */

interface EvaluationScores {
  facilityScore: number;
  staffingScore: number;
  equipmentScore: number;
  complianceScore: number;
  financialScore: number;
  locationScore: number;
  servicesScore: number;
  reputationScore: number;
}

interface EvaluationWeights {
  facility: number;
  staffing: number;
  equipment: number;
  compliance: number;
  financial: number;
  location: number;
  services: number;
  reputation: number;
}

// Default weights for evaluation categories
const DEFAULT_WEIGHTS: EvaluationWeights = {
  facility: 0.15,
  staffing: 0.15,
  equipment: 0.15,
  compliance: 0.20,
  financial: 0.10,
  location: 0.10,
  services: 0.10,
  reputation: 0.05
};

/**
 * Calculate total evaluation score based on individual scores and weights
 */
export const calculateEvaluationScore = (
  scores: EvaluationScores,
  weights: EvaluationWeights = DEFAULT_WEIGHTS
): number => {
  const totalScore = 
    scores.facilityScore * weights.facility +
    scores.staffingScore * weights.staffing +
    scores.equipmentScore * weights.equipment +
    scores.complianceScore * weights.compliance +
    scores.financialScore * weights.financial +
    scores.locationScore * weights.location +
    scores.servicesScore * weights.services +
    scores.reputationScore * weights.reputation;
  
  return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
};

/**
 * Determine evaluation recommendation based on score
 */
export const getEvaluationRecommendation = (totalScore: number): string => {
  if (totalScore >= 80) return 'HIGHLY_RECOMMENDED';
  if (totalScore >= 70) return 'RECOMMENDED';
  if (totalScore >= 60) return 'ACCEPTABLE';
  if (totalScore >= 50) return 'NEEDS_IMPROVEMENT';
  return 'NOT_RECOMMENDED';
};

/**
 * Calculate facility score based on capacity and amenities
 */
export const calculateFacilityScore = (
  bedCapacity: number,
  hasEmergency: boolean,
  hasPharmacy: boolean,
  hasLaboratory: boolean,
  hasRadiology: boolean
): number => {
  let score = 0;
  
  // Bed capacity scoring
  if (bedCapacity >= 200) score += 40;
  else if (bedCapacity >= 100) score += 35;
  else if (bedCapacity >= 50) score += 30;
  else if (bedCapacity >= 25) score += 20;
  else if (bedCapacity >= 10) score += 15;
  else score += 10;
  
  // Amenities scoring (each worth up to 15 points)
  if (hasEmergency) score += 15;
  if (hasPharmacy) score += 15;
  if (hasLaboratory) score += 15;
  if (hasRadiology) score += 15;
  
  return Math.min(score, 100);
};

/**
 * Calculate staffing score based on staff count and ratio
 */
export const calculateStaffingScore = (
  staffCount: number,
  bedCapacity: number,
  hasDoctors: boolean = true,
  hasNurses: boolean = true,
  hasSpecialists: boolean = false
): number => {
  let score = 0;
  
  // Staff count scoring
  if (staffCount >= 100) score += 30;
  else if (staffCount >= 50) score += 25;
  else if (staffCount >= 25) score += 20;
  else if (staffCount >= 10) score += 15;
  else score += 10;
  
  // Staff to bed ratio scoring
  const staffBedRatio = bedCapacity > 0 ? staffCount / bedCapacity : 0;
  if (staffBedRatio >= 3) score += 30;
  else if (staffBedRatio >= 2) score += 25;
  else if (staffBedRatio >= 1.5) score += 20;
  else if (staffBedRatio >= 1) score += 15;
  else score += 10;
  
  // Staff qualification scoring
  if (hasDoctors) score += 15;
  if (hasNurses) score += 15;
  if (hasSpecialists) score += 10;
  
  return Math.min(score, 100);
};

/**
 * Calculate compliance score based on verified documents
 */
export const calculateComplianceScore = (
  verifiedDocuments: string[],
  requiredDocuments: string[] = [
    'LICENSE',
    'REGISTRATION',
    'TAX_CERTIFICATE',
    'INSURANCE'
  ]
): number => {
  const totalRequired = requiredDocuments.length;
  const verified = requiredDocuments.filter(doc => 
    verifiedDocuments.includes(doc)
  ).length;
  
  const baseScore = (verified / totalRequired) * 80;
  const bonusScore = Math.min(verifiedDocuments.length - totalRequired, 5) * 4;
  
  return Math.min(baseScore + bonusScore, 100);
};

/**
 * Calculate location score based on area and accessibility
 */
export const calculateLocationScore = (
  state: string,
  isUrban: boolean = false,
  hasParking: boolean = false,
  hasPublicTransport: boolean = false
): number => {
  let score = 0;
  
  // Priority states (underserved areas) get higher scores
  const priorityStates = [
    'Borno', 'Yobe', 'Adamawa', 'Bauchi', 'Gombe', 'Taraba',
    'Jigawa', 'Kebbi', 'Sokoto', 'Zamfara'
  ];
  
  const moderatePriorityStates = [
    'Katsina', 'Niger', 'Plateau', 'Nasarawa', 'Benue',
    'Kogi', 'Kwara', 'Ekiti', 'Ebonyi'
  ];
  
  // State-based scoring
  if (priorityStates.includes(state)) {
    score += 50; // High priority for underserved areas
  } else if (moderatePriorityStates.includes(state)) {
    score += 40;
  } else {
    score += 30; // Well-served areas
  }
  
  // Urban/Rural consideration
  if (!isUrban) {
    score += 20; // Bonus for rural areas
  } else {
    score += 10;
  }
  
  // Accessibility scoring
  if (hasParking) score += 15;
  if (hasPublicTransport) score += 15;
  
  return Math.min(score, 100);
};

/**
 * Calculate services score based on variety and specialization
 */
export const calculateServicesScore = (
  servicesOffered: string[],
  specializations: string[]
): number => {
  let score = 0;
  
  // Essential services
  const essentialServices = [
    'Emergency Care',
    'Outpatient Services',
    'Inpatient Services',
    'Laboratory Services',
    'Pharmacy Services'
  ];
  
  // Specialized services
  const specializedServices = [
    'Surgery',
    'Pediatrics',
    'Obstetrics',
    'Radiology',
    'ICU',
    'Dialysis',
    'Oncology',
    'Cardiology'
  ];
  
  // Count essential services
  const essentialCount = servicesOffered.filter(service =>
    essentialServices.some(essential => 
      service.toLowerCase().includes(essential.toLowerCase())
    )
  ).length;
  
  // Count specialized services
  const specializedCount = servicesOffered.filter(service =>
    specializedServices.some(specialized => 
      service.toLowerCase().includes(specialized.toLowerCase())
    )
  ).length;
  
  // Essential services scoring (up to 50 points)
  score += (essentialCount / essentialServices.length) * 50;
  
  // Specialized services scoring (up to 30 points)
  score += Math.min(specializedCount * 5, 30);
  
  // Specialization scoring (up to 20 points)
  score += Math.min(specializations.length * 5, 20);
  
  return Math.min(score, 100);
};

/**
 * Calculate financial score based on revenue potential and stability
 */
export const calculateFinancialScore = (
  estimatedRevenue?: number,
  hasInsurancePartnerships: boolean = false,
  hasHMOPartnerships: boolean = false,
  hasGovernmentContracts: boolean = false,
  yearsInOperation: number = 0
): number => {
  let score = 0;
  
  // Revenue potential scoring
  if (estimatedRevenue) {
    if (estimatedRevenue >= 100000000) score += 40; // 100M+ NGN
    else if (estimatedRevenue >= 50000000) score += 35; // 50M+ NGN
    else if (estimatedRevenue >= 25000000) score += 30; // 25M+ NGN
    else if (estimatedRevenue >= 10000000) score += 25; // 10M+ NGN
    else if (estimatedRevenue >= 5000000) score += 20; // 5M+ NGN
    else score += 15;
  } else {
    score += 20; // Default if no revenue data
  }
  
  // Partnership scoring
  if (hasInsurancePartnerships) score += 15;
  if (hasHMOPartnerships) score += 15;
  if (hasGovernmentContracts) score += 20;
  
  // Stability scoring based on years in operation
  if (yearsInOperation >= 10) score += 10;
  else if (yearsInOperation >= 5) score += 8;
  else if (yearsInOperation >= 3) score += 6;
  else if (yearsInOperation >= 1) score += 4;
  else score += 2;
  
  return Math.min(score, 100);
};

/**
 * Generate evaluation summary
 */
export const generateEvaluationSummary = (
  scores: EvaluationScores,
  totalScore: number
): string => {
  const recommendation = getEvaluationRecommendation(totalScore);
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Identify strengths and weaknesses
  const scoreEntries = Object.entries(scores) as [keyof EvaluationScores, number][];
  
  scoreEntries.forEach(([category, score]) => {
    if (score >= 70) {
      strengths.push(category.replace('Score', ''));
    } else if (score < 50) {
      weaknesses.push(category.replace('Score', ''));
    }
  });
  
  let summary = `Overall Score: ${totalScore}/100\n`;
  summary += `Recommendation: ${recommendation.replace(/_/g, ' ')}\n\n`;
  
  if (strengths.length > 0) {
    summary += `Strengths:\n`;
    strengths.forEach(strength => {
      summary += `- Strong ${strength} capabilities\n`;
    });
    summary += '\n';
  }
  
  if (weaknesses.length > 0) {
    summary += `Areas for Improvement:\n`;
    weaknesses.forEach(weakness => {
      summary += `- ${weakness} needs enhancement\n`;
    });
  }
  
  return summary;
};

/**
 * Calculate risk score
 */
export const calculateRiskScore = (
  complianceScore: number,
  financialScore: number,
  reputationScore: number
): { score: number; level: string } => {
  const riskScore = 100 - ((complianceScore + financialScore + reputationScore) / 3);
  
  let level: string;
  if (riskScore <= 20) level = 'LOW';
  else if (riskScore <= 40) level = 'MODERATE';
  else if (riskScore <= 60) level = 'HIGH';
  else level = 'CRITICAL';
  
  return { score: riskScore, level };
};
