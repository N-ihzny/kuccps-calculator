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
  BUILD_DATE: '2026-02-24',

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

  trim: function(str) {
    return str ? str.trim() : '';
  },

  isEmpty: function(str) {
    return !str || str.trim() === '';
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

  parseNumber: function(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
  },

  clamp: function(value, min, max) {
    return Math.min(Math.max(value, min), max);
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

  isToday: function(date) {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },

  isYesterday: function(date) {
    const d = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
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

  calculateClusterPoints: function(clusterPoints, totalPoints) {
    const r = clusterPoints || 0;
    const R = 48;
    const t = totalPoints || 0;
    const T = 84;
    
    const clusterResult = (r / R * 48) + (t / T * 36);
    return Math.round(clusterResult * 1000) / 1000;
  },

  getBestSubjects: function(grades, count = 7) {
    if (!grades || !Array.isArray(grades) || grades.length === 0) return [];
    
    return [...grades]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, count);
  },

  gradeToPoints: function(grade) {
    return this.gradePoints[grade] || 0;
  },

  pointsToGrade: function(points) {
    return this.calculateMeanGrade(points, 1);
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

  validateUrl: function(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  validatePassword: function(password) {
    return password && password.length >= 6;
  },

  validateName: function(name) {
    return name && name.length >= 2;
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

  formatBytes: function(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // =====================================================
  // Array Utilities
  // =====================================================
  groupBy: function(array, key) {
    if (!array || !Array.isArray(array) || array.length === 0) return {};
    
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },

  sortBy: function(array, key, order = 'asc') {
    if (!array || !Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  },

  unique: function(array) {
    if (!array || !Array.isArray(array)) return [];
    return [...new Set(array)];
  },

  chunk: function(array, size) {
    if (!array || !Array.isArray(array)) return [];
    
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  shuffle: function(array) {
    if (!array || !Array.isArray(array)) return [];
    
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  sum: function(array, key = null) {
    if (!array || !Array.isArray(array)) return 0;
    
    if (key) {
      return array.reduce((sum, item) => sum + (item[key] || 0), 0);
    }
    return array.reduce((sum, val) => sum + (val || 0), 0);
  },

  average: function(array, key = null) {
    if (!array || !Array.isArray(array) || array.length === 0) return 0;
    return this.sum(array, key) / array.length;
  },

  // =====================================================
  // Object Utilities
  // =====================================================
  pick: function(obj, keys) {
    if (!obj || typeof obj !== 'object') return {};
    
    return keys.reduce((result, key) => {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  omit: function(obj, keys) {
    if (!obj || typeof obj !== 'object') return {};
    
    return Object.keys(obj)
      .filter(key => !keys.includes(key))
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  },

  deepClone: function(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  },

  merge: function(target, source) {
    return Object.assign({}, target, source);
  },

  isEmptyObject: function(obj) {
    return !obj || Object.keys(obj).length === 0;
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

  setSession: function(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Session storage error:', e);
      return false;
    }
  },

  getSession: function(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Session storage error:', e);
      return null;
    }
  },

  // =====================================================
  // Cookie Utilities
  // =====================================================
  setCookie: function(name, value, days = 7) {
    try {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = 'expires=' + date.toUTCString();
      document.cookie = name + '=' + value + ';' + expires + ';path=/';
      return true;
    } catch (e) {
      console.error('Cookie error:', e);
      return false;
    }
  },

  getCookie: function(name) {
    try {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
        }
      }
      return null;
    } catch (e) {
      console.error('Cookie error:', e);
      return null;
    }
  },

  deleteCookie: function(name) {
    try {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      return true;
    } catch (e) {
      console.error('Cookie error:', e);
      return false;
    }
  },

  // =====================================================
  // URL Utilities
  // =====================================================
  getQueryParams: function() {
    try {
      const params = new URLSearchParams(window.location.search);
      const result = {};
      for (const [key, value] of params.entries()) {
        result[key] = value;
      }
      return result;
    } catch (e) {
      console.error('URL error:', e);
      return {};
    }
  },

  buildUrl: function(base, params) {
    try {
      const url = new URL(base, window.location.origin);
      Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });
      return url.toString();
    } catch (e) {
      console.error('URL error:', e);
      return base;
    }
  },

  getBaseUrl: function() {
    return window.location.origin;
  },

  getCurrentPath: function() {
    return window.location.pathname;
  },

  // =====================================================
  // Device Detection
  // =====================================================
  isMobile: function() {
    return window.innerWidth <= 768;
  },

  isTablet: function() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },

  isDesktop: function() {
    return window.innerWidth > 1024;
  },

  isIOS: function() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  isAndroid: function() {
    return /Android/.test(navigator.userAgent);
  },

  isTouchDevice: function() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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

  memoize: function(fn) {
    const cache = new Map();
    return function() {
      const key = JSON.stringify(arguments);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn.apply(this, arguments);
      cache.set(key, result);
      return result;
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

  showConfirm: function(message, onConfirm, onCancel) {
    if (confirm(message)) {
      if (onConfirm) onConfirm();
    } else {
      if (onCancel) onCancel();
    }
  },

  showPrompt: function(message, defaultValue = '', callback) {
    const result = prompt(message, defaultValue);
    if (callback) callback(result);
  },

  // =====================================================
  // Form Utilities
  // =====================================================
  serializeForm: function(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  },

  resetForm: function(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  },

  getFormData: function(formId) {
    return this.serializeForm(formId);
  },

  setFormData: function(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"], #${key}`);
      if (input) {
        input.value = data[key];
      }
    });
  },

  // =====================================================
  // Data Export
  // =====================================================
  exportToCSV: function(data, filename = 'export.csv') {
    if (!data || !Array.isArray(data) || data.length === 0) {
      this.showNotification('No data to export', 'warning');
      return;
    }
    
    try {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => {
        return Object.values(row).map(val => {
          if (typeof val === 'string' && val.includes(',')) {
            return '"' + val + '"';
          }
          return val;
        }).join(',');
      });
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      this.showNotification('Export successful!', 'success');
    } catch (e) {
      console.error('Export error:', e);
      this.showNotification('Export failed', 'error');
    }
  },

  exportToJson: function(data, filename = 'export.json') {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      this.showNotification('Export successful!', 'success');
    } catch (e) {
      console.error('Export error:', e);
      this.showNotification('Export failed', 'error');
    }
  },

  // =====================================================
  // Random Utilities
  // =====================================================
  generateId: function(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomColor: function() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },

  // =====================================================
  // Error Handling
  // =====================================================
  tryCatch: async function(fn, errorHandler) {
    try {
      return await fn();
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        console.error('Unhandled error:', error);
        this.showNotification(error.message || 'An error occurred', 'error');
      }
      return null;
    }
  },

  logError: function(error, context = '') {
    console.error(`Error${context ? ' in ' + context : ''}:`, error);
    
    // Could also send to logging service
    if (window.errorTracker) {
      window.errorTracker.capture(error, context);
    }
  },

  // =====================================================
  // Copy to Clipboard
  // =====================================================
  copyToClipboard: async function(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('Copied to clipboard!', 'success');
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      
      // Fallback for older browsers
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showNotification('Copied to clipboard!', 'success');
        return true;
      } catch (e) {
        this.showNotification('Failed to copy to clipboard', 'error');
        return false;
      }
    }
  },

  // =====================================================
  // Color Utilities
  // =====================================================
  hexToRgb: function(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHex: function(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  // =====================================================
  // Text Utilities
  // =====================================================
  stripHtml: function(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  escapeHtml: function(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  truncateHtml: function(html, length = 100) {
    const text = this.stripHtml(html);
    return this.truncate(text, length);
  },

  // =====================================================
  // Grade Comparison
  // =====================================================
  compareGrades: function(grade1, grade2) {
    const points1 = this.gradePoints[grade1] || 0;
    const points2 = this.gradePoints[grade2] || 0;
    
    if (points1 > points2) return 1;
    if (points1 < points2) return -1;
    return 0;
  },

  getGradePoints: function(grade) {
    return this.gradePoints[grade] || 0;
  },

  isGradeBetter: function(grade, than) {
    return this.compareGrades(grade, than) > 0;
  },

  // =====================================================
  // Window Utilities
  // =====================================================
  scrollToTop: function(behavior = 'smooth') {
    window.scrollTo({
      top: 0,
      behavior: behavior
    });
  },

  scrollToElement: function(elementId, offset = 0, behavior = 'smooth') {
    const element = document.getElementById(elementId);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: y, behavior: behavior });
    }
  },

  getScrollPosition: function() {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  },

  // =====================================================
  // Browser Detection
  // =====================================================
  getBrowser: function() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';
    return 'Unknown';
  },

  getOS: function() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'MacOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  },

  // =====================================================
  // Network Utilities
  // =====================================================
  isOnline: function() {
    return navigator.onLine;
  },

  checkConnectivity: function() {
    if (!navigator.onLine) {
      this.showNotification('You are offline. Please check your internet connection.', 'warning');
      return false;
    }
    return true;
  },

  getConnectionType: function() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        type: conn.effectiveType,
        slow: conn.saveData,
        downlink: conn.downlink
      };
    }
    return null;
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

// Initialize with some defaults
Utils.VERSION = '2.0.0';
Utils.BUILD_DATE = '2026-02-24';

// =====================================================
// Export for module use if needed
// =====================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}