// =====================================================
// KUCCPS COURSE CHECKER - AUTHENTICATION SYSTEM
// Professional Login, Registration & Session Management
// UPDATED FOR RENDER DEPLOYMENT WITH REAL API
// CORRECTED VERSION - NO ERRORS
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
    this.loadSocialProviders();
    this.setupTokenRefresh();
  }

  // =====================================================
  // Session Management
  // =====================================================
  checkSession() {
    const session = Utils.getStorage('session');
    const user = Utils.getStorage('currentUser');
    const token = API.getToken();

    if (session && user && token) {
      const now = new Date().getTime();
      if (now - session.lastActivity < this.sessionTimeout) {
        this.currentUser = user;
        this.updateSession();
        
        // Verify token with backend
        this.verifyTokenWithBackend();
        
        return true;
      } else {
        this.logout('Session expired');
      }
    }
    return false;
  }

  async verifyTokenWithBackend() {
    try {
      const response = await API.verifyToken();
      if (response && response.success) {
        this.currentUser = response.data.user;
        Utils.setStorage('currentUser', this.currentUser);
      }
    } catch (error) {
      console.log('Token verification skipped - using local session');
    }
  }

  updateSession() {
    Utils.setStorage('session', {
      lastActivity: new Date().getTime(),
      userId: this.currentUser ? this.currentUser.id : null
    });
  }

  setupTokenRefresh() {
    // Refresh token every 50 minutes (tokens usually expire after 1 hour)
    setInterval(() => {
      if (this.currentUser) {
        this.refreshToken();
      }
    }, 50 * 60 * 1000);
  }

  async refreshToken() {
    try {
      const response = await API.verifyToken();
      if (response && response.success) {
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.log('Token refresh failed');
    }
  }

  // =====================================================
  // Login Methods
  // =====================================================
  async login(email, password, remember = false) {
    try {
      if (typeof Utils !== 'undefined' && Utils.showLoading) {
        Utils.showLoading('Logging in...');
      }

      // Call real API
      const response = await API.login(email, password);
      
      if (response && response.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Save user
        this.currentUser = userData;
        Utils.setStorage('currentUser', userData);
        
        // Save token
        API.setToken(token);
        
        // Create session
        Utils.setStorage('session', {
          lastActivity: new Date().getTime(),
          userId: userData.id
        });

        // Remember email
        if (remember) {
          Utils.setStorage('rememberedEmail', email);
        } else {
          Utils.removeStorage('rememberedEmail');
        }

        if (typeof Utils !== 'undefined' && Utils.hideLoading) {
          Utils.hideLoading();
        }
        
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification('Welcome back, ' + userData.fullName + '!', 'success');
        }
        
        // Redirect based on role
        setTimeout(() => {
          if (userData.role === 'admin') {
            window.location.href = '/admin-dashboard.html';
          } else {
            window.location.href = '/dashboard.html';
          }
        }, 1500);

        return { success: true, user: userData };
      }

      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      const errorMsg = response && response.message ? response.message : 'Invalid email or password';
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(errorMsg, 'error');
      }
      
      return { success: false, error: errorMsg };

    } catch (error) {
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      // Fallback to demo users if API fails (for development)
      if (window.location.hostname === 'localhost') {
        return this.demoLogin(email, password, remember);
      }
      
      const errorMsg = error && error.message ? error.message : 'Login failed. Please try again.';
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(errorMsg, 'error');
      }
      
      return { success: false, error: errorMsg };
    }
  }

  // Fallback demo login for development
  async demoLogin(email, password, remember) {
    const demoUsers = {
      'student@example.com': {
        password: '123456',
        data: {
          id: 'USR001',
          fullName: 'John Student',
          email: 'student@example.com',
          phone: '0712345678',
          role: 'student',
          paymentStatus: false,
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      },
      'admin@example.com': {
        password: 'admin123',
        data: {
          id: 'ADM001',
          fullName: 'Admin User',
          email: 'admin@example.com',
          phone: '079876432',
          role: 'admin',
          paymentStatus: true,
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      }
    };

    if (demoUsers[email] && demoUsers[email].password === password) {
      const userData = demoUsers[email].data;
      
      this.currentUser = userData;
      Utils.setStorage('currentUser', userData);
      
      Utils.setStorage('session', {
        lastActivity: new Date().getTime(),
        userId: userData.id
      });

      if (remember) {
        Utils.setStorage('rememberedEmail', email);
      }

      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification('Welcome back, ' + userData.fullName + '! (Demo Mode)', 'success');
      }
      
      setTimeout(() => {
        window.location.href = userData.role === 'admin' ? '/admin-dashboard.html' : '/dashboard.html';
      }, 1500);

      return { success: true, user: userData };
    }

    if (typeof Utils !== 'undefined' && Utils.showNotification) {
      Utils.showNotification('Invalid email or password (Demo Mode)', 'error');
    }
    
    return { success: false };
  }

  // =====================================================
  // Registration
  // =====================================================
  async register(userData) {
    try {
      if (typeof Utils !== 'undefined' && Utils.showLoading) {
        Utils.showLoading('Creating account...');
      }

      // Validate
      const errors = this.validateRegistration(userData);
      if (errors.length > 0) {
        if (typeof Utils !== 'undefined' && Utils.hideLoading) {
          Utils.hideLoading();
        }
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification(errors[0], 'error');
        }
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

        if (typeof Utils !== 'undefined' && Utils.hideLoading) {
          Utils.hideLoading();
        }
        
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification('Account created successfully!', 'success');
        }
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1500);

        return { success: true, user: newUser };
      }

      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      const errorMsg = response && response.message ? response.message : 'Registration failed';
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(errorMsg, 'error');
      }
      
      return { success: false, error: errorMsg };

    } catch (error) {
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      const errorMsg = error && error.message ? error.message : 'Registration failed. Please try again.';
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(errorMsg, 'error');
      }
      
      return { success: false, error: errorMsg };
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

    if (typeof Utils !== 'undefined' && Utils.validateEmail && !Utils.validateEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (typeof Utils !== 'undefined' && Utils.validatePhone && !Utils.validatePhone(data.phone)) {
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
  // Social Login
  // =====================================================
  async socialLogin(provider) {
    try {
      if (typeof Utils !== 'undefined' && Utils.showLoading) {
        Utils.showLoading('Connecting to ' + provider + '...');
      }

      // In production, this would use OAuth flow
      // For now, simulate with a popup
      const email = await this.simulateOAuthPopup(provider);
      
      if (!email) {
        if (typeof Utils !== 'undefined' && Utils.hideLoading) {
          Utils.hideLoading();
        }
        return;
      }

      // Get name from provider
      let fullName = '';
      switch(provider) {
        case 'google':
          fullName = 'Google User';
          break;
        case 'facebook':
          fullName = 'Facebook User';
          break;
        case 'apple':
          fullName = 'Apple User';
          break;
        default:
          fullName = provider + ' User';
      }

      // Call social login API
      const response = await API.socialLogin(provider, email, fullName, '0712345678');
      
      if (response && response.success) {
        const userData = response.data.user;
        const token = response.data.token;

        Utils.setStorage('currentUser', userData);
        API.setToken(token);
        
        Utils.setStorage('session', {
          lastActivity: new Date().getTime(),
          userId: userData.id
        });

        if (typeof Utils !== 'undefined' && Utils.hideLoading) {
          Utils.hideLoading();
        }
        
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification('Logged in with ' + provider + '!', 'success');
        }
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1500);
      } else {
        throw new Error(response && response.message ? response.message : 'Login failed');
      }

    } catch (error) {
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      const errorMsg = error && error.message ? error.message : provider + ' login failed';
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(errorMsg, 'error');
      }
    }
  }

  simulateOAuthPopup(provider) {
    return new Promise((resolve) => {
      // In production, this would open an actual OAuth popup
      // For now, prompt for email
      const email = prompt('Enter your ' + provider + ' email for demo:', 'user@' + provider + '.com');
      resolve(email);
    });
  }

  // =====================================================
  // Logout
  // =====================================================
  logout(reason) {
    this.currentUser = null;
    
    // Clear all auth data
    if (typeof API !== 'undefined' && API.logout) {
      API.logout();
    }
    
    Utils.removeStorage('currentUser');
    Utils.removeStorage('session');
    Utils.removeStorage('rememberedEmail');
    
    if (reason) {
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(reason, 'info');
      }
    }
    
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  }

  // =====================================================
  // Password Management
  // =====================================================
  async requestPasswordReset(email) {
    try {
      if (typeof Utils !== 'undefined' && Utils.validateEmail && !Utils.validateEmail(email)) {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification('Please enter a valid email', 'error');
        }
        return false;
      }

      if (typeof Utils !== 'undefined' && Utils.showLoading) {
        Utils.showLoading('Sending reset link...');
      }
      
      const response = await API.requestPasswordReset(email);
      
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      if (response && response.success) {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification('Reset link sent to your email!', 'success');
        }
        return true;
      } else {
        const errorMsg = response && response.message ? response.message : 'Failed to send reset link';
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification(errorMsg, 'error');
        }
        return false;
      }
    } catch (error) {
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      const errorMsg = error && error.message ? error.message : 'Failed to send reset link';
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(errorMsg, 'error');
      }
      return false;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      if (typeof Utils !== 'undefined' && Utils.showLoading) {
        Utils.showLoading('Resetting password...');
      }
      
      const response = await API.resetPassword(token, newPassword);
      
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      if (response && response.success) {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification('Password reset successfully!', 'success');
        }
        return true;
      } else {
        const errorMsg = response && response.message ? response.message : 'Failed to reset password';
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification(errorMsg, 'error');
        }
        return false;
      }
    } catch (error) {
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      const errorMsg = error && error.message ? error.message : 'Failed to reset password';
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(errorMsg, 'error');
      }
      return false;
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      if (!this.currentUser) {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification('You must be logged in', 'error');
        }
        return false;
      }

      if (typeof Utils !== 'undefined' && Utils.showLoading) {
        Utils.showLoading('Changing password...');
      }
      
      const response = await API.changePassword(oldPassword, newPassword);
      
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      if (response && response.success) {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification('Password changed successfully!', 'success');
        }
        return true;
      } else {
        const errorMsg = response && response.message ? response.message : 'Failed to change password';
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
          Utils.showNotification(errorMsg, 'error');
        }
        return false;
      }
    } catch (error) {
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      const errorMsg = error && error.message ? error.message : 'Failed to change password';
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(errorMsg, 'error');
      }
      return false;
    }
  }

  // =====================================================
  // Session Activity Tracking
  // =====================================================
  trackActivity() {
    const updateHandler = () => this.updateSession();
    document.addEventListener('click', updateHandler);
    document.addEventListener('keypress', updateHandler);
    document.addEventListener('scroll', updateHandler);
    
    if (typeof Utils !== 'undefined' && Utils.throttle) {
      document.addEventListener('mousemove', Utils.throttle(updateHandler, 60000));
    } else {
      document.addEventListener('mousemove', updateHandler);
    }
  }

  // =====================================================
  // Load Social Providers
  // =====================================================
  loadSocialProviders() {
    // Initialize social login buttons
    const googleBtn = document.querySelector('.social-btn.google');
    const facebookBtn = document.querySelector('.social-btn.facebook');
    const appleBtn = document.querySelector('.social-btn.apple');

    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.socialLogin('google'));
    }
    if (facebookBtn) {
      facebookBtn.addEventListener('click', () => this.socialLogin('facebook'));
    }
    if (appleBtn) {
      appleBtn.addEventListener('click', () => this.socialLogin('apple'));
    }
  }

  // =====================================================
  // Setup Event Listeners
  // =====================================================
  setupEventListeners() {
    // Listen for login form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        const remember = document.getElementById('rememberMe')?.checked;
        if (email && password) {
          this.login(email, password, remember);
        }
      });
    }

    // Listen for signup form submissions
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
          fullName: document.getElementById('signupName')?.value,
          email: document.getElementById('signupEmail')?.value,
          phone: document.getElementById('signupPhone')?.value,
          password: document.getElementById('signupPassword')?.value,
          confirmPassword: document.getElementById('signupConfirmPassword')?.value,
          indexNumber: document.getElementById('indexNumber')?.value,
          examYear: document.getElementById('examYear')?.value,
          schoolName: document.getElementById('schoolName')?.value,
          county: document.getElementById('county')?.value
        };
        this.register(userData);
      });
    }
  }

  // =====================================================
  // Get Current User
  // =====================================================
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    
    const user = Utils.getStorage('currentUser');
    if (user) {
      this.currentUser = user;
    }
    return this.currentUser;
  }

  // =====================================================
  // Check Authentication
  // =====================================================
  requireAuth(redirectTo) {
    const target = redirectTo || '/index.html';
    if (!this.checkSession()) {
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification('Please login to continue', 'warning');
      }
      window.location.href = target;
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
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification('Admin access required', 'error');
      }
      window.location.href = '/index.html';
      return false;
    }
    return true;
  }

  // =====================================================
  // Update User Payment Status
  // =====================================================
  async updatePaymentStatus(status) {
    if (this.currentUser) {
      this.currentUser.paymentStatus = status;
      Utils.setStorage('currentUser', this.currentUser);
    }
  }

  // =====================================================
  // Get Auth Token
  // =====================================================
  getToken() {
    if (typeof API !== 'undefined' && API.getToken) {
      return API.getToken();
    }
    return null;
  }
}

// Initialize Auth System
let Auth;
try {
  Auth = new AuthSystem();
} catch (error) {
  console.error('Failed to initialize AuthSystem:', error);
  Auth = {
    getCurrentUser: () => null,
    login: () => Promise.resolve({ success: false }),
    logout: () => {},
    requireAuth: () => false
  };
}

// =====================================================
// UI Components for Authentication
// =====================================================
const AuthUI = {
  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
  },

  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
  },

  updateUIForUser(user) {
    // Update user name displays
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = user && user.fullName ? user.fullName.split(' ')[0] : 'Guest';
    });

    // Update payment status
    document.querySelectorAll('.user-status').forEach(el => {
      if (user && user.paymentStatus) {
        el.textContent = 'Payment Verified ✓';
        el.style.color = '#10b981';
      } else {
        el.textContent = 'Payment Required';
        el.style.color = '#ef4444';
      }
    });

    // Update login/logout buttons
    document.querySelectorAll('.auth-btn, .logout-btn').forEach(el => {
      if (user) {
        el.innerHTML = '<i class="bi bi-box-arrow-right"></i> Logout';
        el.onclick = () => Auth.logout();
        el.classList.add('logout-btn');
      } else {
        el.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
        el.onclick = () => AuthUI.showLoginModal();
        el.classList.remove('logout-btn');
      }
    });
  }
};

// Export
window.Auth = Auth;
window.AuthUI = AuthUI;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  try {
    const user = Auth.getCurrentUser();
    if (user) {
      AuthUI.updateUIForUser(user);
    }
  } catch (error) {
    console.error('Error initializing auth UI:', error);
  }
});