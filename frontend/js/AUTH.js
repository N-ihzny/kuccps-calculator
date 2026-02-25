// =====================================================
// KUCCPS COURSE CHECKER - AUTHENTICATION SYSTEM
// PROFESSIONAL VERSION - NO POPUPS, LIVE BACKEND ONLY
// =====================================================

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.sessionTimeout = 3600000; // 1 hour
    this.init();
  }

  init() {
    this.checkSession();
    this.setupEventListeners();
  }

  // =====================================================
  // Session Management
  // =====================================================
  checkSession() {
    const user = Utils.getStorage('currentUser');
    const token = API.getToken();

    if (user && token) {
      this.currentUser = user;
      this.updateSession();
      return true;
    }
    return false;
  }

  updateSession() {
    Utils.setStorage('session', {
      lastActivity: new Date().getTime(),
      userId: this.currentUser ? this.currentUser.id : null
    });
  }

  // =====================================================
  // Login - NO POPUPS, just redirect
  // =====================================================
  async login(email, password, remember = false) {
    try {
      // Call real API only - NO DEMO MODE
      const response = await API.login(email, password);
      
      if (response && response.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Save user
        this.currentUser = userData;
        Utils.setStorage('currentUser', userData);
        API.setToken(token);
        
        // Create session
        Utils.setStorage('session', {
          lastActivity: new Date().getTime(),
          userId: userData.id
        });

        // Remember email
        if (remember) {
          Utils.setStorage('rememberedEmail', email);
        }

        // SILENT REDIRECT - no popup
        if (userData.role === 'admin') {
          window.location.href = '/admin-dashboard.html';
        } else {
          window.location.href = '/dashboard.html';
        }

        return { success: true, user: userData };
      }

      // Show error only (no success messages)
      Utils.showNotification('Invalid email or password', 'error');
      return { success: false };

    } catch (error) {
      Utils.showNotification('Login failed. Please try again.', 'error');
      return { success: false };
    }
  }

  // =====================================================
  // Registration - NO POPUPS
  // =====================================================
  async register(userData) {
    try {
      // Validate
      const errors = this.validateRegistration(userData);
      if (errors.length > 0) {
        Utils.showNotification(errors[0], 'error');
        return { success: false, errors };
      }

      // Call real API
      const response = await API.register({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        indexNumber: userData.indexNumber,
        examYear: userData.examYear,
        schoolName: userData.schoolName,
        county: userData.county
      });

      if (response && response.success) {
        const newUser = response.data.user;
        const token = response.data.token;

        // Save user
        Utils.setStorage('currentUser', newUser);
        API.setToken(token);
        
        Utils.setStorage('session', {
          lastActivity: new Date().getTime(),
          userId: newUser.id
        });

        // SILENT REDIRECT - no popup
        window.location.href = '/dashboard.html';

        return { success: true, user: newUser };
      }

      Utils.showNotification('Registration failed', 'error');
      return { success: false };

    } catch (error) {
      Utils.showNotification('Registration failed. Please try again.', 'error');
      return { success: false };
    }
  }

  // =====================================================
  // Validation
  // =====================================================
  validateRegistration(data) {
    const errors = [];

    if (!data.fullName || data.fullName.length < 3) {
      errors.push('Full name must be at least 3 characters');
    }

    if (!Utils.validateEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!Utils.validatePhone(data.phone)) {
      errors.push('Please enter a valid Kenyan phone number');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  }

  // =====================================================
  // Logout
  // =====================================================
  logout() {
    this.currentUser = null;
    API.removeToken();
    Utils.removeStorage('currentUser');
    Utils.removeStorage('session');
    Utils.removeStorage('rememberedEmail');
    window.location.href = '/index.html';
  }

  // =====================================================
  // Get Current User
  // =====================================================
  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = Utils.getStorage('currentUser');
    }
    return this.currentUser;
  }

  // =====================================================
  // Check Authentication
  // =====================================================
  requireAuth(redirectTo = '/index.html') {
    if (!this.checkSession()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  // =====================================================
  // Admin Check
  // =====================================================
  requireAdmin() {
    const user = this.getCurrentUser();
    if (!user || user.role !== 'admin') {
      window.location.href = '/index.html';
      return false;
    }
    return true;
  }

  // =====================================================
  // Setup Event Listeners
  // =====================================================
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        const remember = document.getElementById('remember-me')?.checked;
        if (email && password) {
          this.login(email, password, remember);
        }
      });
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
          fullName: document.getElementById('signup-name')?.value,
          email: document.getElementById('signup-email')?.value,
          phone: document.getElementById('signup-phone')?.value,
          password: document.getElementById('signup-password')?.value,
          confirmPassword: document.getElementById('signup-confirm-password')?.value,
          indexNumber: document.getElementById('index-number')?.value,
          examYear: document.getElementById('exam-year')?.value,
          schoolName: document.getElementById('school-name')?.value,
          county: document.getElementById('county')?.value
        };
        this.register(userData);
      });
    }
  }
}

// Initialize Auth System
const Auth = new AuthSystem();
window.Auth = Auth;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getCurrentUser();
  if (user) {
    // Update UI if needed
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = user.fullName ? user.fullName.split(' ')[0] : 'User';
    });
  }
});
