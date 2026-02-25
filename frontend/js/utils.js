// =====================================================
// KUCCPS COURSE CHECKER - UTILITIES
// Professional Utility Functions
// UPDATED FOR RENDER DEPLOYMENT
// =====================================================

const Utils = {
  // =====================================================
  // Version Info
  // =====================================================
  VERSION: '2.0.0',
  BUILD_DATE: '2026-02-25',

  // =====================================================
  // String Utilities
  // =====================================================
  capitalize: function(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  capitalizeWords: function(str) {
    if (!str || typeof str !== 'string') return '';
    return str.split(' ').map(word => this.capitalize(word)).join(' ');
  },

  truncate: function(str, length = 50, suffix = '...') {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  slugify: function(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  },

  // =====================================================
  // Number Utilities
  // =====================================================
  formatNumber: function(num) {
    if (num === undefined || num === null) return '0';
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-KE').format(num);
  },

  formatCurrency: function(amount, currency = 'KES') {
    if (amount === undefined || amount === null) return 'KES 0';
    if (isNaN(amount)) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  formatPercentage: function(value, decimals = 1) {
    if (value === undefined || value === null) return '0%';
    if (isNaN(value)) return '0%';
    return `${value.toFixed(decimals)}%`;
  },

  // =====================================================
  // Date Utilities
  // =====================================================
  formatDate: function(date, format = 'medium') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const options = {
      short: { month: 'numeric', day: 'numeric', year: '2-digit' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };

    return new Intl.DateTimeFormat('en-KE', options[format] || options.medium).format(d);
  },

  timeAgo: function(date) {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const seconds = Math.floor((now - d) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years === 1 ? '' : 's'} ago`;
    if (months > 0) return `${months} month${months === 1 ? '' : 's'} ago`;
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return 'just now';
  },

  // =====================================================
  // Grade Calculations
  // =====================================================
  gradePoints: {
    'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
    'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3,
    'D-': 2, 'E': 1
  },

  calculateMeanGrade: function(totalPoints, subjectCount = 7) {
    if (!totalPoints || totalPoints < 0) return 'E';
    
    const meanPoints = totalPoints / subjectCount;
    
    if (meanPoints >= 12) return 'A';
    if (meanPoints >= 11) return 'A-';
    if (meanPoints >= 10) return 'B+';
    if (meanPoints >= 9) return 'B';
    if (meanPoints >= 8) return 'B-';
    if (meanPoints >= 7) return 'C+';
    if (meanPoints >= 6) return 'C';
    if (meanPoints >= 5) return 'C-';
    if (meanPoints >= 4) return 'D+';
    if (meanPoints >= 3) return 'D';
    if (meanPoints >= 2) return 'D-';
    return 'E';
  },

  calculateTotalPoints: function(grades) {
    if (!grades || typeof grades !== 'object') return 0;
    
    let total = 0;
    for (const grade of Object.values(grades)) {
      if (grade && grade !== '') {
        total += this.gradePoints[grade] || 0;
      }
    }
    return total;
  },

  // =====================================================
  // Validation
  // =====================================================
  validateEmail: function(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone: function(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/\s/g, '');
    const re = /^(?:(?:\+|00)254|0)[17]\d{8}$/;
    return re.test(cleaned);
  },

  validateIndexNumber: function(index) {
    if (!index || typeof index !== 'string') return false;
    const re = /^\d{4}\/\d{5,6}$/;
    return re.test(index);
  },

  validateGrade: function(grade) {
    if (!grade) return false;
    const validGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
    return validGrades.includes(grade);
  },

  // =====================================================
  // Formatting
  // =====================================================
  formatPhoneNumber: function(phone) {
    if (!phone) return '';
    
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      cleaned = '254' + cleaned;
    }
    
    // Format as +254 XXX XXX XXX
    if (cleaned.length === 12) {
      return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
    }
    
    return cleaned;
  },

  formatIndexNumber: function(index) {
    if (!index) return '';
    
    const parts = index.split('/');
    if (parts.length === 2) {
      return `${parts[0]}/${parts[1].padStart(6, '0')}`;
    }
    return index;
  },

  // =====================================================
  // Storage Utilities
  // =====================================================
  setStorage: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  getStorage: function(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage error:', e);
      return null;
    }
  },

  removeStorage: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  clearStorage: function() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  // =====================================================
  // Performance Utilities
  // =====================================================
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const context = this;
      const args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  },

  // =====================================================
  // UI Utilities
  // =====================================================
  showNotification: function(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    
    const icon = type === 'success' ? 'check-circle-fill' : 
                 type === 'error' ? 'x-circle-fill' :
                 type === 'warning' ? 'exclamation-triangle-fill' : 'info-circle-fill';
    
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-title">
          <i class="bi bi-${icon} me-2"></i>
          ${this.capitalize(type)}
        </span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="notification-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  },

  showLoading: function(message = 'Loading...') {
    const existingLoader = document.getElementById('global-loader');
    if (existingLoader) existingLoader.remove();
    
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.id = 'global-loader';
    loader.innerHTML = `
      <div class="loader-container text-center">
        <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-white">${message}</p>
      </div>
    `;
    
    document.body.appendChild(loader);
  },

  hideLoading: function() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.remove();
  },

  // =====================================================
  // Environment Detection
  // =====================================================
  isDevelopment: function() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  },

  isProduction: function() {
    return !this.isDevelopment();
  },

  getEnvironment: function() {
    return this.isDevelopment() ? 'development' : 'production';
  }
};

// Make Utils globally available
window.Utils = Utils;
