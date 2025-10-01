/**
 * Validate Nigerian phone number
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Nigerian number
  // Should be 11 digits starting with 0, or 13 digits starting with 234
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return true;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return true;
  }
  
  return false;
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate NHIS number
 */
export const validateNHISNumber = (nhis: string): boolean => {
  // NHIS number should be 12 digits
  const cleaned = nhis.replace(/\D/g, '');
  return cleaned.length === 12;
};

/**
 * Validate Nigerian state
 */
export const validateNigerianState = (state: string): boolean => {
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
    'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];
  
  return nigerianStates.includes(state);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate BVN (Bank Verification Number)
 */
export const validateBVN = (bvn: string): boolean => {
  // BVN should be 11 digits
  const cleaned = bvn.replace(/\D/g, '');
  return cleaned.length === 11;
};

/**
 * Validate NIN (National Identification Number)
 */
export const validateNIN = (nin: string): boolean => {
  // NIN should be 11 digits
  const cleaned = nin.replace(/\D/g, '');
  return cleaned.length === 11;
};

/**
 * Validate date format (DD/MM/YYYY)
 */
export const validateDateFormat = (date: string): boolean => {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
  if (!regex.test(date)) return false;
  
  const [day, month, year] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return (
    dateObj.getDate() === day &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getFullYear() === year
  );
};

/**
 * Validate amount (positive number with up to 2 decimal places)
 */
export const validateAmount = (amount: string): boolean => {
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(amount) && parseFloat(amount) > 0;
};
