// =====================================================
// KUCCPS COURSE CHECKER - MAIN APPLICATION
// Professional Application Controller
// UPDATED FOR RENDER DEPLOYMENT
// =====================================================

class KUCCPSApp {
  constructor() {
    this.currentUser = null;
    this.currentPage = this.getCurrentPageFromUrl();
    this.notifications = [];
    this.apiAvailable = false;
    this.offlineMode = false;
    this.init();
  }

  // =====================================================
  // Initialization
  // =====================================================
  async init() {
    console.log('🚀 KUCCPS App v2.0 initializing...');
    
    await this.checkApiHealth();
    this.setupEventListeners();
    this.checkUserSession();
    this.loadNotifications();
    this.setupPWA();
    this.setupAnimations();
    this.initTooltips();
    this.loadSavedData();
    this.setupOfflineDetection();
    this.initializePageComponents();
    
    console.log('✅ App initialized successfully');
  }

  // =====================================================
  // Get Current Page from URL
  // =====================================================
  getCurrentPageFromUrl() {
    const path = window.location.pathname;
    if (path.includes('degree')) return 'degree';
    if (path.includes('diploma')) return 'diploma';
    if (path.includes('certificate')) return 'certificate';
    if (path.includes('kmtc')) return 'kmtc';
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('payment')) return 'payment';
    if (path.includes('results')) return 'results';
    if (path.includes('userguide')) return 'guide';
    return 'home';
  }

  // =====================================================
  // Check API Health
  // =====================================================
  async checkApiHealth() {
    try {
      if (typeof API !== 'undefined' && API.healthCheck) {
        const isHealthy = await API.healthCheck();
        this.apiAvailable = isHealthy;
        console.log(`📡 API Status: ${isHealthy ? 'Connected ✅' : 'Disconnected ❌'}`);
      } else {
        console.log('📡 API not available, using offline mode');
        this.offlineMode = true;
      }
    } catch (error) {
      console.log('📡 API health check failed, using offline mode');
      this.offlineMode = true;
    }
  }

  // =====================================================
  // Setup Event Listeners
  // =====================================================
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
      link.addEventListener('click', (e) => this.handleNavigation(e));
    });

    // Forms
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
      registrationForm.addEventListener('submit', (e) => this.handleRegistration(e));
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Payment
    const payNowBtn = document.getElementById('pay-now-btn');
    if (payNowBtn) {
      payNowBtn.addEventListener('click', () => this.handlePayment());
    }

    // Grade entry
    const calculateBtn = document.getElementById('calculate-eligibility');
    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => this.handleEligibilityCheck());
    }

    // Search
    const searchInput = document.getElementById('university-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (typeof Utils !== 'undefined' && Utils.debounce) {
          Utils.debounce(() => this.handleSearch(e), 300);
        } else {
          this.handleSearch(e);
        }
      });
    }

    // Filter
    const filterSelect = document.getElementById('university-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => this.handleFilter(e));
    }

    // Download
    const downloadBtn = document.getElementById('download-results');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadResults());
    }

    // Share
    const shareBtn = document.getElementById('share-whatsapp');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareResults());
    }

    // Print
    const printBtn = document.getElementById('print-results');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // Back button
    const backBtn = document.getElementById('back-to-grades');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goBack());
    }

    // Support button
    const supportBtn = document.getElementById('support-btn');
    if (supportBtn) {
      supportBtn.addEventListener('click', () => this.openSupportModal());
    }

    // Window events
    window.addEventListener('popstate', () => this.handleRouting());
    window.addEventListener('online', () => this.handleOnlineStatus());
    window.addEventListener('offline', () => this.handleOnlineStatus());
    window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));

    // Document ready
    document.addEventListener('DOMContentLoaded', () => {
      this.highlightCurrentNav();
    });
  }

  // =====================================================
  // Highlight Current Navigation
  // =====================================================
  highlightCurrentNav() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace('.html', ''))) {
        link.classList.add('active');
      } else if (currentPath === '/' && href === '/') {
        link.classList.add('active');
      }
    });
  }

  // =====================================================
  // Initialize Page Components
  // =====================================================
  initializePageComponents() {
    // Load grade entry if on calculator page
    if (document.getElementById('subjects-container')) {
      if (typeof loadGradeEntry === 'function') {
        loadGradeEntry();
      }
    }

    // Initialize payment form if on payment page
    if (document.getElementById('payment-form')) {
      this.initializePaymentForm();
    }

    // Load user data on dashboard
    if (document.getElementById('user-name-display')) {
      this.updateDashboardUserInfo();
    }
  }

  // =====================================================
  // Initialize Payment Form
  // =====================================================
  initializePaymentForm() {
    const amountInput = document.getElementById('payment-amount');
    if (amountInput) {
      amountInput.value = 200;
    }
  }

  // =====================================================
  // Update Dashboard User Info
  // =====================================================
  updateDashboardUserInfo() {
    const user = this.getCurrentUser();
    if (!user) return;

    const userNameEl = document.getElementById('user-name-display');
    const userInitialsEl = document.getElementById('user-initials');
    const paymentStatusEl = document.getElementById('payment-status');

    if (userNameEl) {
      userNameEl.textContent = user.fullName || 'User';
    }

    if (userInitialsEl && user.fullName) {
      const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      userInitialsEl.textContent = initials;
    }

    if (paymentStatusEl) {
      if (user.paymentStatus) {
        paymentStatusEl.innerHTML = '<span class="badge bg-success">✓ Payment Verified</span>';
      } else {
        paymentStatusEl.innerHTML = '<span class="badge bg-warning">⚠ Payment Required</span>';
      }
    }
  }

  // =====================================================
  // User Session Management
  // =====================================================
  checkUserSession() {
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
      this.currentUser = Auth.getCurrentUser();
    } else {
      // Fallback to localStorage
      const user = Utils.getStorage('currentUser');
      if (user) {
        this.currentUser = user;
      }
    }
    
    if (this.currentUser) {
      this.updateUserInterface();
    }
  }

  getCurrentUser() {
    return this.currentUser || Utils.getStorage('currentUser');
  }

  updateUserInterface() {
    const user = this.getCurrentUser();
    if (!user) return;

    // Update user name displays
    document.querySelectorAll('.user-name, #user-name-display, #welcome-name').forEach(el => {
      if (el) {
        const firstName = user.fullName ? user.fullName.split(' ')[0] : 'User';
        el.textContent = firstName;
      }
    });

    // Update summary sections
    const summaryName = document.getElementById('summary-name');
    const summaryPhone = document.getElementById('summary-phone');
    const summaryIndex = document.getElementById('summary-index');

    if (summaryName) summaryName.textContent = user.fullName || 'N/A';
    if (summaryPhone) summaryPhone.textContent = user.phone || 'N/A';
    if (summaryIndex) summaryIndex.textContent = user.indexNumber || 'N/A';

    // Show/hide payment badge
    const paymentBadge = document.getElementById('payment-badge');
    if (paymentBadge) {
      if (user.paymentStatus) {
        paymentBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i> Payment Verified';
        paymentBadge.className = 'payment-badge verified';
      } else {
        paymentBadge.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i> Payment Required';
        paymentBadge.className = 'payment-badge';
      }
    }

    // Update user avatar
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar && user.fullName) {
      const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      userAvatar.textContent = initials;
    }
  }

  // =====================================================
  // Navigation
  // =====================================================
  handleNavigation(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const href = link.getAttribute('href');
    
    if (href && !href.startsWith('http')) {
      this.navigateTo(href);
    }
  }

  navigateTo(url) {
    if (url.startsWith('/')) {
      window.location.href = url;
    } else {
      window.location.href = '/' + url;
    }
  }

  goBack() {
    window.history.back();
  }

  handleRouting() {
    const path = window.location.pathname;
    this.currentPage = this.getCurrentPageFromUrl();
    this.highlightCurrentNav();
  }

  // =====================================================
  // Login Handler
  // =====================================================
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    const remember = document.getElementById('remember-me')?.checked;

    if (!email || !password) {
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification('Please enter email and password', 'warning');
      }
      return;
    }

    if (typeof Auth !== 'undefined' && Auth.login) {
      await Auth.login(email, password, remember);
    } else {
      // Fallback login
      if (email === 'student@example.com' && password === '123456') {
        const user = {
          id: 'USR001',
          fullName: 'John Student',
          email: email,
          paymentStatus: false
        };
        Utils.setStorage('currentUser', user);
        window.location.href = '/dashboard.html';
      } else {
        Utils.showNotification('Invalid credentials', 'error');
      }
    }
  }

  // =====================================================
  // Registration Handler
  // =====================================================
  async handleRegistration(e) {
    e.preventDefault();
    
    const formData = {
      fullName: document.getElementById('fullName')?.value,
      phoneNumber: document.getElementById('phoneNumber')?.value,
      email: document.getElementById('email')?.value,
      indexNumber: document.getElementById('indexNumber')?.value,
      examYear: document.getElementById('examYear')?.value,
      schoolName: document.getElementById('schoolName')?.value,
      county: document.getElementById('county')?.value,
      password: document.getElementById('password')?.value,
      confirmPassword: document.getElementById('confirm-password')?.value
    };

    // Validate
    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.password) {
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification('Please fill in all required fields', 'warning');
      }
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Utils.showNotification('Passwords do not match', 'error');
      return;
    }

    if (typeof Auth !== 'undefined' && Auth.register) {
      await Auth.register(formData);
    } else {
      // Fallback registration
      const userData = {
        id: 'USR' + Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        indexNumber: formData.indexNumber,
        paymentStatus: false,
        createdAt: new Date().toISOString()
      };

      Utils.setStorage('currentUser', userData);
      Utils.showNotification('Registration successful!', 'success');
      
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    }
  }

  // =====================================================
  // Payment Handler
  // =====================================================
  async handlePayment() {
    const user = this.getCurrentUser();
    if (!user) {
      Utils.showNotification('Please login first', 'warning');
      window.location.href = '/index.html';
      return;
    }

    if (typeof paymentHandler !== 'undefined' && paymentHandler.initiatePayment) {
      await paymentHandler.initiatePayment(user);
    } else {
      // Fallback payment simulation
      Utils.showNotification('Processing payment...', 'info');
      
      setTimeout(() => {
        user.paymentStatus = true;
        Utils.setStorage('currentUser', user);
        Utils.showNotification('Payment successful!', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1500);
      }, 3000);
    }
  }

  // =====================================================
  // Eligibility Check Handler
  // =====================================================
  async handleEligibilityCheck() {
    const user = this.getCurrentUser();
    if (!user) {
      Utils.showNotification('Please login first', 'warning');
      window.location.href = '/index.html';
      return;
    }

    if (!user.paymentStatus) {
      Utils.showNotification('Please complete payment first', 'warning');
      const paymentModal = document.getElementById('paymentModal');
      if (paymentModal) {
        paymentModal.style.display = 'flex';
      } else {
        window.location.href = '/payment.html';
      }
      return;
    }

    if (typeof calculator !== 'undefined' && calculator.calculateAll) {
      // Get program type from current page
      let programType = null;
      const path = window.location.pathname;
      if (path.includes('degree')) programType = 'degree';
      else if (path.includes('diploma')) programType = 'diploma';
      else if (path.includes('certificate')) programType = 'certificate';
      else if (path.includes('kmtc')) programType = 'kmtc';
      
      await calculator.calculateAll(user.id, programType);
    } else {
      Utils.showNotification('Calculator not available', 'error');
    }
  }

  // =====================================================
  // Search and Filter
  // =====================================================
  handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.result-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const matches = text.includes(searchTerm);
      card.style.display = matches ? 'block' : 'none';
      if (matches) visibleCount++;
    });
    
    // Show no results message
    const noResultsMsg = document.getElementById('no-results-message');
    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  handleFilter(e) {
    const filter = e.target.value;
    const cards = document.querySelectorAll('.result-card');
    
    cards.forEach(card => {
      if (filter === 'all') {
        card.style.display = 'block';
      } else if (filter === 'eligible') {
        card.style.display = card.classList.contains('eligible') ? 'block' : 'none';
      } else if (filter === 'not-eligible') {
        card.style.display = card.classList.contains('not-eligible') ? 'block' : 'none';
      }
    });
  }

  // =====================================================
  // Results Export
  // =====================================================
  downloadResults() {
    if (typeof calculator !== 'undefined' && calculator.downloadResults) {
      calculator.downloadResults();
    } else {
      Utils.showNotification('Download feature not available', 'warning');
    }
  }

  shareResults() {
    if (typeof calculator !== 'undefined' && calculator.shareWhatsApp) {
      calculator.shareWhatsApp();
    } else {
      // Fallback sharing
      const text = `Check your KUCCPS results at ${window.location.origin}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  // =====================================================
  // Support Modal
  // =====================================================
  openSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closeSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // =====================================================
  // Notifications
  // =====================================================
  async loadNotifications() {
    try {
      // Try to load from API
      if (this.apiAvailable && API.getNotifications) {
        const response = await API.getNotifications();
        if (response && response.success) {
          this.notifications = response.data;
        }
      } else {
        // Fallback notifications
        this.notifications = [
          {
            id: 1,
            title: '🎓 Welcome to KUCCPS Course Checker',
            message: 'Start by entering your KCSE grades',
            time: 'Just now',
            read: false
          },
          {
            id: 2,
            title: '💰 Payment Required',
            message: 'Complete payment to unlock full access',
            time: '1 hour ago',
            read: false
          },
          {
            id: 3,
            title: '📊 2026 Cutoff Points',
            message: 'Latest cutoff points are now available',
            time: '2 hours ago',
            read: true
          }
        ];
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }

    this.updateNotificationBadge();
    this.renderNotifications();
  }

  updateNotificationBadge() {
    const unread = this.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notification-badge');
    
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  renderNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = '<div class="text-center p-3 text-muted">No notifications</div>';
      return;
    }

    let html = '';
    this.notifications.slice(0, 5).forEach(notification => {
      html += `
        <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}" onclick="app.markNotificationRead(${notification.id})">
          <div class="notification-content">
            <p class="mb-1"><strong>${notification.title}</strong></p>
            <p class="small text-muted mb-1">${notification.message}</p>
            <small class="text-primary">${notification.time}</small>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  markNotificationRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.updateNotificationBadge();
      this.renderNotifications();
    }
  }

  // =====================================================
  // PWA Support
  // =====================================================
  setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('✅ ServiceWorker registered:', registration);
          })
          .catch(error => {
            console.error('❌ ServiceWorker registration failed:', error);
          });
      });
    }

    // Handle PWA install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      const installBtn = document.getElementById('install-pwa-btn');
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted PWA install');
            }
            deferredPrompt = null;
          });
        });
      }
    });
  }

  // =====================================================
  // Animations
  // =====================================================
  setupAnimations() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.stat-card, .feature-card, .main-btn-card, .course-card, .result-card').forEach(el => {
      if (el) observer.observe(el);
    });
  }

  // =====================================================
  // Tooltips
  // =====================================================
  initTooltips() {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltips.forEach(el => new bootstrap.Tooltip(el));
    }
  }

  // =====================================================
  // Load Saved Data
  // =====================================================
  loadSavedData() {
    // Load saved form data
    const savedData = Utils.getStorage('formData');
    if (savedData) {
      Object.keys(savedData).forEach(key => {
        const input = document.getElementById(key);
        if (input && input.type !== 'password') {
          input.value = savedData[key];
        }
      });
    }

    // Load remembered email
    const rememberedEmail = Utils.getStorage('rememberedEmail');
    if (rememberedEmail) {
      const emailInput = document.getElementById('login-email');
      const rememberCheck = document.getElementById('remember-me');
      if (emailInput) emailInput.value = rememberedEmail;
      if (rememberCheck) rememberCheck.checked = true;
    }
  }

  // =====================================================
  // Offline Detection
  // =====================================================
  setupOfflineDetection() {
    this.offlineMode = !navigator.onLine;
    
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      offlineIndicator.style.display = this.offlineMode ? 'block' : 'none';
    }
  }

  handleOnlineStatus() {
    this.offlineMode = !navigator.onLine;
    
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      offlineIndicator.style.display = this.offlineMode ? 'block' : 'none';
    }
    
    if (typeof Utils !== 'undefined' && Utils.showNotification) {
      if (navigator.onLine) {
        Utils.showNotification('You are back online', 'success');
      } else {
        Utils.showNotification('You are offline. Some features may be limited.', 'warning');
      }
    }
  }

  // =====================================================
  // Before Unload
  // =====================================================
  handleBeforeUnload(e) {
    // Save form data for non-sensitive fields
    const formData = {};
    document.querySelectorAll('input:not([type="password"]), select').forEach(input => {
      if (input.id && input.value) {
        formData[input.id] = input.value;
      }
    });
    
    if (Object.keys(formData).length > 0) {
      Utils.setStorage('formData', formData);
    }

    // Warn about pending payment
    const user = this.getCurrentUser();
    if (user && !user.paymentStatus && window.location.pathname.includes('payment')) {
      e.preventDefault();
      e.returnValue = 'You have pending payment. Are you sure you want to leave?';
    }
  }

  // =====================================================
  // Utility Methods
  // =====================================================
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }

  reloadPage() {
    window.location.reload();
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// Initialize app
let app;
try {
  app = new KUCCPSApp();
} catch (error) {
  console.error('Failed to initialize app:', error);
  app = {
    navigateTo: (url) => { window.location.href = url; },
    showNotification: (msg) => { alert(msg); }
  };
}

// Make app globally available
window.app = app;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (app && app.highlightCurrentNav) {
    app.highlightCurrentNav();
  }
});

// =====================================================
// Export for module use if needed
// =====================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KUCCPSApp;
}