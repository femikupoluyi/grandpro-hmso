// Application Configuration
export const config = {
  // API Configuration
  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'GrandPro HMSO',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env.VITE_ENV || 'development',
  },

  // Nigerian Context Settings
  locale: {
    currency: import.meta.env.VITE_CURRENCY || 'NGN',
    currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || '₦',
    timezone: import.meta.env.VITE_TIMEZONE || 'Africa/Lagos',
    countryCode: import.meta.env.VITE_COUNTRY_CODE || '+234',
    dateFormat: import.meta.env.VITE_DATE_FORMAT || 'DD/MM/YYYY',
    timeFormat: import.meta.env.VITE_TIME_FORMAT || 'HH:mm',
  },

  // Feature Toggles
  features: {
    telemedicine: import.meta.env.VITE_ENABLE_TELEMEDICINE === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  },

  // External Services
  externalServices: {
    whatsappApiUrl: import.meta.env.VITE_WHATSAPP_API_URL || '',
    smsApiUrl: import.meta.env.VITE_SMS_API_URL || '',
    nhisApiUrl: import.meta.env.VITE_NHIS_API_URL || '',
  },

  // Nigerian States
  nigerianStates: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
    'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ],
};

export default config;
