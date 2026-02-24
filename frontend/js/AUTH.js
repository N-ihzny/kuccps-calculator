// =====================================================
// KUCCPS COURSE CHECKER - AUTHENTICATION SYSTEM
// UPDATED FOR PRODUCTION
// =====================================================

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.sessionTimeout = 3600000;
    this.init();
  }

  init() {
    this.checkSession();
  }

  checkSession() {
    const user = Utils.getStorage('currentUser');
    const token = API.getToken();

    if (user && token) {
      this.currentUser = user;
      return true;
    }
    return false;
  }

  async login(email, password, remember = false) {
    try {
      Utils.showLoading('Logging in...');

      const response = await API.login(email, password);
      
      if (response && response.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        this.currentUser = userData;
        Utils.setStorage('currentUser', userData);
        API.setToken(token);
        
        if (remember) {
          Utils.setStorage('rememberedEmail', email);
        }

        Utils.hideLoading();
        Utils.showNotification('Login successful!', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1500);

        return { success: true, user: userData };
      }

      Utils.hideLoading();
      Utils.showNotification('Invalid email or password', 'error');
      return { success: false };

    } catch (error) {
      Utils.hideLoading();
      Utils.showNotification('Login failed. Please try again.', 'error');
      return { success: false };
    }
  }

  logout() {
    this.currentUser = null;
    API.removeToken();
    Utils.removeStorage('currentUser');
    Utils.removeStorage('session');
    window.location.href = '/index.html';
  }

  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = Utils.getStorage('currentUser');
    }
    return this.currentUser;
  }
}

const Auth = new AuthSystem();
window.Auth = Auth;
