// =====================================================
// KUCCPS COURSE CHECKER - API SERVICE
// Professional API Integration
// FIXED - Proper Authentication for Render
// =====================================================

class ApiService {
  constructor() {
    // Use CONFIG for base URL - FIXED to use correct URL
    this.baseUrl = window.CONFIG ? CONFIG.APP.API_URL : 
      (window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'https://kuccps-calculator.onrender.com/api');
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Request timeout (30 seconds)
    this.timeout = 30000;
    
    // Max retries for failed requests
    this.maxRetries = 3;
  }

  // =====================================================
  // Core Request Method with Retry Logic
  // =====================================================
  async request(endpoint, method = 'GET', data = null, retryCount = 0) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const options = {
      method,
      headers: { ...this.defaultHeaders },
      signal: controller.signal
    };

    // FIXED: Add both token and user ID for authentication
    const token = this.getToken();
    const user = this.getUser();
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add user ID in header as fallback
    if (user && user.id) {
      options.headers['X-User-ID'] = user.id;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        try {
          result = JSON.parse(text);
        } catch {
          result = { message: text };
        }
      }

      if (!response.ok) {
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            // Unauthorized - clear token and redirect to login
            console.log('401 Unauthorized - redirecting to login');
            this.removeToken();
            // Don't redirect if already on index page
            if (!window.location.pathname.includes('index.html') && 
                window.location.pathname !== '/') {
              window.location.href = '/index.html';
            }
            throw new Error(result.message || 'Session expired. Please login again.');
          
          case 403:
            throw new Error('You do not have permission to perform this action.');
          
          case 404:
            throw new Error('Resource not found.');
          
          case 429:
            throw new Error('Too many requests. Please try again later.');
          
          case 500:
            throw new Error('Server error. Please try again later.');
          
          default:
            throw new Error(result.message || 'Request failed');
        }
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.');
      }
      
      // Handle network errors
      if (error.message === 'Failed to fetch') {
        // Retry logic for network failures
        if (retryCount < this.maxRetries) {
          console.log(`Retrying request (${retryCount + 1}/${this.maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request(endpoint, method, data, retryCount + 1);
        }
        throw new Error('Network error. Please check your internet connection.');
      }
      
      console.error('API Error:', error);
      throw error;
    }
  }

  // =====================================================
  // Auth Endpoints
  // =====================================================
  async register(userData) {
    return this.request('/auth/register', 'POST', userData);
  }

  async login(email, password) {
    const response = await this.request('/auth/login', 'POST', { email, password });
    // Store token if returned
    if (response && response.success && response.data && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async socialLogin(provider, email, fullName, phone) {
    const response = await this.request('/auth/social-login', 'POST', {
      provider,
      email,
      fullName,
      phone
    });
    // Store token if returned
    if (response && response.success && response.data && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async verifyToken() {
    return this.request('/auth/verify-token', 'POST');
  }

  async checkPaymentStatus(userId) {
    return this.request(`/auth/payment-status/${userId}`);
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', 'POST', {
      currentPassword,
      newPassword
    });
  }

  async requestPasswordReset(email) {
    return this.request('/auth/request-password-reset', 'POST', { email });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', 'POST', { token, newPassword });
  }

  // =====================================================
  // Payment Endpoints
  // =====================================================
  async initializePayment(userId, email, amount = 200, metadata = {}) {
    return this.request('/payments/initialize', 'POST', {
      userId,
      email,
      amount,
      metadata
    });
  }

  async verifyPayment(reference) {
    return this.request('/payments/verify', 'POST', { reference });
  }

  async verifyExistingPayment(data) {
    return this.request('/payments/verify-existing', 'POST', data);
  }

  async getUserTransactions(userId) {
    return this.request(`/payments/user/${userId}`);
  }

  async getPaymentStatus(userId) {
    return this.request(`/payments/status/${userId}`);
  }

  // =====================================================
  // Grades Endpoints
  // =====================================================
  async saveGrades(userId, grades) {
    return this.request('/grades', 'POST', { userId, grades });
  }

  async getUserGrades(userId) {
    return this.request(`/grades/user/${userId}`);
  }

  async getLatestGrades(userId) {
    return this.request(`/grades/latest/${userId}`);
  }

  async updateGrades(gradeId, grades) {
    return this.request(`/grades/${gradeId}`, 'PUT', { grades });
  }

  async deleteGrades(gradeId) {
    return this.request(`/grades/${gradeId}`, 'DELETE');
  }

  async validateGrades(grades) {
    return this.request('/grades/validate', 'POST', { grades });
  }

  // =====================================================
  // Calculation Endpoints
  // =====================================================
  async calculateEligibility(userId, programType, grades) {
    return this.request('/calculations/eligibility', 'POST', {
      userId,
      programType,
      grades
    });
  }

  async calculateClusterPoints(grades, clusterSubjects) {
    return this.request('/calculations/cluster-points', 'POST', {
      grades,
      clusterSubjects
    });
  }

  async compareCourses(courseIds, grades) {
    return this.request('/calculations/compare', 'POST', {
      courseIds,
      grades
    });
  }

  async getRecommendations(grades, limit = 10) {
    return this.request('/calculations/recommendations', 'POST', {
      grades,
      limit
    });
  }

  // =====================================================
  // Institution Endpoints
  // =====================================================
  async getAllInstitutions(type = null, limit = 50, offset = 0) {
    let url = '/institutions';
    const params = [];
    if (type) params.push(`type=${type}`);
    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.request(url);
  }

  async getInstitutionById(id) {
    return this.request(`/institutions/${id}`);
  }

  async getInstitutionsByType(type) {
    return this.request(`/institutions/type/${type}`);
  }

  async searchInstitutions(query) {
    return this.request(`/institutions/search?q=${encodeURIComponent(query)}`);
  }

  async getInstitutionCourses(institutionId, programType = null) {
    let url = `/institutions/${institutionId}/courses`;
    if (programType) url += `?programType=${programType}`;
    return this.request(url);
  }

  async getInstitutionStats(institutionId) {
    return this.request(`/institutions/${institutionId}/stats`);
  }

  // =====================================================
  // Course Endpoints
  // =====================================================
  async getAllCourses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.programType) params.append('programType', filters.programType);
    if (filters.institution) params.append('institution', filters.institution);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const url = `/courses${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request(url);
  }

  async getCourseById(id) {
    return this.request(`/courses/${id}`);
  }

  async getCoursesByProgram(programType) {
    return this.request(`/courses/program/${programType}`);
  }

  async searchCourses(query) {
    return this.request(`/courses/search?q=${encodeURIComponent(query)}`);
  }

  // =====================================================
  // Token Management
  // =====================================================
  setToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  removeToken() {
    localStorage.removeItem('auth_token');
  }

  // =====================================================
  // User Session Management
  // =====================================================
  setUser(user) {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  getUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  removeUser() {
    localStorage.removeItem('currentUser');
  }

  logout() {
    this.removeToken();
    this.removeUser();
    window.location.href = '/index.html';
  }

  // =====================================================
  // Health Check
  // =====================================================
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create global instance
const API = new ApiService();

// Make API available globally
window.API = API;
