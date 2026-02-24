// =====================================================
// KUCCPS COURSE CHECKER - CONFIGURATION
// Professional Configuration Management
// UPDATED FOR RENDER DEPLOYMENT
// =====================================================

const CONFIG = {
  // Application Settings
  APP: {
    NAME: 'KUCCPS Course Checker',
    VERSION: '2.0.0',
    DESCRIPTION: 'Official KUCCPS Course Eligibility Checker',
    URL: window.location.origin,
    // Updated API_URL for Render deployment
    API_URL: (() => {
      // Check if running on localhost
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'https://kuccps-api.onrender.com/api/v1';
      }
      // For Render deployment - replace with your actual Render backend URL
      // After deployment, change this to: https://kuccps-api.onrender.com/api/v1
      return 'https://kuccps-api.onrender.com/api/v1';
    })(),
    // Backup API URL in case primary fails
    API_URL_BACKUP: 'https://kuccps-api-backup.onrender.com/api/v1',
  },

  // Payment Configuration
  PAYMENT: {
    AMOUNT: 200,
    CURRENCY: 'KES',
    PROVIDER: 'Paystack',
    GATEWAY: 'Paystack',
    // Your actual Paystack public key
    PUBLISHABLE_KEY: 'pk_live_ff445561a3226d3adb26c22f9e0578c9f5b895a2',
    PAYMENT_LINK: 'https://paystack.shop/pay/8gkdge-pmq',
    WEBHOOK_URL: `${window.location.origin}/api/webhooks/paystack`,
    // Callback URL after payment
    CALLBACK_URL: `${window.location.origin}/payment-callback.html`,
  },

  // KCSE Configuration
  KCSE: {
    MIN_SUBJECTS: 7,
    MAX_SUBJECTS: 9,
    SUBJECT_GROUPS: {
      1: 'Compulsory',
      2: 'Sciences',
      3: 'Humanities',
      4: 'Technical',
      5: 'Languages'
    },
    GRADE_POINTS: {
      'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
      'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3,
      'D-': 2, 'E': 1
    },
    MEAN_GRADE_RANGES: {
      'A': { min: 81, max: 100 },
      'A-': { min: 75, max: 80 },
      'B+': { min: 70, max: 74 },
      'B': { min: 65, max: 69 },
      'B-': { min: 60, max: 64 },
      'C+': { min: 55, max: 59 },
      'C': { min: 50, max: 54 },
      'C-': { min: 45, max: 49 },
      'D+': { min: 40, max: 44 },
      'D': { min: 35, max: 39 },
      'D-': { min: 30, max: 34 },
      'E': { min: 0, max: 29 }
    }
  },

  // Subjects Database
  SUBJECTS: [
    // Group 1: Compulsory
    { code: 'ENG', name: 'English', group: 1, compulsory: true },
    { code: 'KIS', name: 'Kiswahili', group: 1, compulsory: true },
    { code: 'MAT', name: 'Mathematics', group: 1, compulsory: true },
    
    // Group 2: Sciences
    { code: 'BIO', name: 'Biology', group: 2, compulsory: false },
    { code: 'PHY', name: 'Physics', group: 2, compulsory: false },
    { code: 'CHE', name: 'Chemistry', group: 2, compulsory: false },
    
    // Group 3: Humanities
    { code: 'HIS', name: 'History', group: 3, compulsory: false },
    { code: 'GEO', name: 'Geography', group: 3, compulsory: false },
    { code: 'CRE', name: 'CRE', group: 3, compulsory: false },
    { code: 'IRE', name: 'IRE', group: 3, compulsory: false },
    { code: 'HIN', name: 'Hindu', group: 3, compulsory: false },
    
    // Group 4: Technical
    { code: 'BUS', name: 'Business Studies', group: 4, compulsory: false },
    { code: 'AGR', name: 'Agriculture', group: 4, compulsory: false },
    { code: 'COM', name: 'Computer Studies', group: 4, compulsory: false },
    { code: 'HSC', name: 'Home Science', group: 4, compulsory: false },
    { code: 'ART', name: 'Art & Design', group: 4, compulsory: false },
    { code: 'MUS', name: 'Music', group: 4, compulsory: false },
    
    // Group 5: Languages
    { code: 'FRE', name: 'French', group: 5, compulsory: false },
    { code: 'GER', name: 'German', group: 5, compulsory: false },
    { code: 'ARA', name: 'Arabic', group: 5, compulsory: false },
    { code: 'KSL', name: 'Kenya Sign Language', group: 5, compulsory: false }
  ],

  // Grade Options
  GRADES: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'],

  // Institution Types
  INSTITUTION_TYPES: {
    UNIVERSITY: 'University',
    KMTC: 'KMTC',
    TTC: 'Teacher Training College',
    TVET: 'TVET Institution',
    NATIONAL_POLYTECHNIC: 'National Polytechnic'
  },

  // Programme Levels
  PROGRAMME_LEVELS: {
    DEGREE: 'Degree',
    DIPLOMA: 'Diploma',
    CERTIFICATE: 'Certificate',
    ARTISAN: 'Artisan',
    CRAFT: 'Craft'
  },

  // Portal Links
  PORTALS: {
    KUCCPS: 'https://students.kuccps.net',
    HEF: 'https://www.hef.co.ke',
    KNEC: 'https://www.knec.ac.ke',
    TVETA: 'https://www.tveta.go.ke',
    HELB: 'https://www.helb.co.ke'
  },

  // API Endpoints (relative paths - base URL is in APP.API_URL)
  API: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      VERIFY: '/auth/verify-token',
      PAYMENT_STATUS: '/auth/payment-status',
      CHANGE_PASSWORD: '/auth/change-password',
      REQUEST_RESET: '/auth/request-password-reset',
      RESET_PASSWORD: '/auth/reset-password',
      SOCIAL_LOGIN: '/auth/social-login'
    },
    PAYMENTS: {
      INITIALIZE: '/payments/initialize',
      VERIFY: '/payments/verify',
      VERIFY_EXISTING: '/payments/verify-existing',
      STATUS: '/payments/status',
      USER_TRANSACTIONS: '/payments/user'
    },
    GRADES: {
      SAVE: '/grades',
      GET: '/grades/user',
      LATEST: '/grades/latest',
      UPDATE: '/grades',
      DELETE: '/grades',
      VALIDATE: '/grades/validate'
    },
    INSTITUTIONS: {
      ALL: '/institutions',
      UNIVERSITIES: '/institutions/type/university',
      KMTC: '/institutions/type/kmtc',
      TTC: '/institutions/type/ttc',
      TVET: '/institutions/type/tvet',
      COURSES: '/institutions/:id/courses',
      SEARCH: '/institutions/search'
    },
    CALCULATIONS: {
      ELIGIBILITY: '/calculations/eligibility',
      CLUSTER: '/calculations/cluster-points',
      COMPARE: '/calculations/compare',
      RECOMMENDATIONS: '/calculations/recommendations'
    },
    COURSES: {
      ALL: '/courses',
      BY_PROGRAM: '/courses/program',
      BY_ID: '/courses',
      SEARCH: '/courses/search'
    }
  },

  // Cache Settings
  CACHE: {
    TTL: 3600, // 1 hour
    STORAGE_PREFIX: 'kuccps_'
  },

  // UI Settings
  UI: {
    THEME: {
      PRIMARY: '#2563eb',
      SECONDARY: '#10b981',
      ACCENT: '#8b5cf6'
    },
    ANIMATIONS_ENABLED: true,
    TOAST_DURATION: 5000,
    MODAL_ANIMATION: true
  },

  // Feature Flags
  FEATURES: {
    OFFLINE_MODE: true,
    PWA_ENABLED: true,
    NOTIFICATIONS: true,
    SHARE_RESULTS: true,
    DOWNLOAD_PDF: true,
    COMPARE_COURSES: true
  },

  // EmailJS Configuration
  EMAILJS: {
    PUBLIC_KEY: 'OJTlrpQojM9U40Ez3',
    SERVICE_ID: 'service_ufnfstc',
    TEMPLATE_ID: 'template_h0uyc6s'
  },

  // Deployment info
  DEPLOYMENT: {
    PLATFORM: 'render',
    ENVIRONMENT: window.location.hostname === 'localhost' ? 'development' : 'production',
    FRONTEND_URL: window.location.origin,
    BACKEND_URL: (() => {
      if (window.location.hostname === 'localhost') return 'https://kuccps-api.onrender.com';
      return 'https://kuccps-api.onrender.com';
    })(),
    VERSION: '2.0.0'
  }
};

// Helper function to get full API URL
CONFIG.getApiUrl = (endpoint) => {
  return `${CONFIG.APP.API_URL}${endpoint}`;
};

// Helper function to check if running in production
CONFIG.isProduction = () => {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

// Helper function to get backend URL
CONFIG.getBackendUrl = () => {
  return CONFIG.DEPLOYMENT.BACKEND_URL;
};

// Freeze configuration to prevent modifications
Object.freeze(CONFIG);

// Make CONFIG globally available
window.CONFIG = CONFIG;