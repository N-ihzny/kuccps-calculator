// =====================================================
// KUCCPS COURSE CHECKER - PAYMENT HANDLER
// Paystack Integration for Production
// UPDATED FOR RENDER DEPLOYMENT
// =====================================================

class PaymentHandler {
  constructor() {
    this.currentUser = null;
    this.timerInterval = null;
    this.transactionId = null;
    this.paymentReference = null;
    this.paystackPopup = null;
  }

  // =====================================================
  // Initialize Payment with Paystack
  // =====================================================
  async initiatePayment(user, amount = 200, metadata = {}) {
    this.currentUser = user;
    
    try {
      this.showPaymentStatus('processing');
      
      // Get user email from current user or prompt
      let email = user.email;
      if (!email) {
        email = prompt('Please enter your email address for payment receipt:');
        if (!email) {
          this.showPaymentStatus('error', 'Email is required for payment');
          return;
        }
      }

      // Initialize payment with backend
      const response = await API.initializePayment(
        user.id,
        email,
        amount,
        {
          ...metadata,
          fullName: user.fullName,
          phone: user.phone,
          indexNumber: user.indexNumber
        }
      );
      
      if (response && response.success) {
        this.transactionId = response.data.reference;
        this.paymentReference = response.data.reference;
        
        // Open Paystack payment page
        this.openPaystackPayment(response.data);
        
        // Start checking payment status
        this.startPaymentTimer();
        this.checkPaymentStatus();
      } else {
        throw new Error(response?.message || 'Failed to initialize payment');
      }
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      this.showPaymentStatus('error', error.message || 'Failed to initialize payment');
    }
  }

  // =====================================================
  // Open Paystack Payment Page
  // =====================================================
  openPaystackPayment(paymentData) {
    // If Paystack library is available, use it
    if (typeof PaystackPop !== 'undefined') {
      const handler = PaystackPop.setup({
        key: CONFIG.PAYMENT.PUBLISHABLE_KEY,
        email: paymentData.email,
        amount: paymentData.amount * 100, // Convert to cents/kobo
        ref: paymentData.reference,
        currency: 'KES',
        callback: (response) => {
          // Payment successful, verify on backend
          this.verifyPaystackPayment(response.reference);
        },
        onClose: () => {
          // User closed payment window
          this.showPaymentStatus('timeout', 'Payment window closed');
        }
      });
      
      handler.openIframe();
      this.paystackPopup = handler;
    } 
    // Fallback to redirect
    else if (paymentData.authorization_url) {
      window.open(paymentData.authorization_url, '_blank');
    }
  }

  // =====================================================
  // Verify Paystack Payment
  // =====================================================
  async verifyPaystackPayment(reference) {
    try {
      this.showPaymentStatus('processing', 'Verifying payment...');
      
      const response = await API.verifyPayment(reference);
      
      if (response && response.success) {
        await this.handlePaymentSuccess(response.data);
      } else {
        throw new Error(response?.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      this.showPaymentStatus('error', error.message || 'Payment verification failed');
    }
  }

  // =====================================================
  // Payment Timer
  // =====================================================
  startPaymentTimer(duration = 300) { // 5 minutes default
    let timeLeft = duration;
    const timerElement = document.getElementById('payment-timer');
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      timeLeft--;
      
      if (timerElement) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      
      if (timeLeft <= 0) {
        this.stopPaymentTimer();
        this.showPaymentStatus('timeout');
      }
    }, 1000);
  }

  stopPaymentTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // =====================================================
  // Check Payment Status
  // =====================================================
  async checkPaymentStatus() {
    const checkInterval = setInterval(async () => {
      try {
        // Don't check if we already have a successful payment
        if (this.paymentVerified) {
          clearInterval(checkInterval);
          return;
        }

        const response = await API.getPaymentStatus(this.currentUser?.id);
        
        if (response && response.data) {
          if (response.data.status === 'completed' || response.data.hasPaid) {
            clearInterval(checkInterval);
            this.stopPaymentTimer();
            await this.handlePaymentSuccess(response.data);
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
        // Don't clear interval on error, just log
      }
    }, 5000); // Check every 5 seconds
    
    // Store interval for cleanup
    this.statusCheckInterval = checkInterval;
  }

  // =====================================================
  // Handle Successful Payment
  // =====================================================
  async handlePaymentSuccess(paymentData) {
    try {
      this.paymentVerified = true;
      
      // Clear any running intervals
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval);
      }
      this.stopPaymentTimer();
      
      const user = Utils.getStorage('currentUser');
      if (user) {
        // Update user payment status
        user.paymentStatus = true;
        user.transactionRef = paymentData?.transaction?.reference || this.paymentReference;
        Utils.setStorage('currentUser', user);
        
        // Also update in Auth system
        if (window.Auth && Auth.updatePaymentStatus) {
          Auth.updatePaymentStatus(true);
        }
        
        // Save transaction to history
        this.saveTransactionToHistory(paymentData, user);
        
        // Send email receipt
        this.sendPaymentReceipt(user, paymentData);
      }
      
      this.showPaymentStatus('success');
      
      // Redirect to dashboard after success
      setTimeout(() => {
        // Check if we're on a payment page
        if (window.location.pathname.includes('payment')) {
          window.location.href = '/dashboard.html';
        } else {
          // Refresh current page to update payment status
          window.location.reload();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error handling payment success:', error);
      this.showPaymentStatus('error', 'Payment succeeded but failed to update status');
    }
  }

  // =====================================================
  // Save Transaction to History
  // =====================================================
  saveTransactionToHistory(paymentData, user) {
    try {
      const transactions = Utils.getStorage('kuccps_transactions') || [];
      
      const transaction = {
        id: 'TXN' + Date.now(),
        reference: paymentData?.transaction?.reference || this.paymentReference,
        amount: paymentData?.transaction?.amount || 200,
        date: new Date().toISOString(),
        status: 'completed',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          indexNumber: user.indexNumber
        },
        metadata: paymentData
      };
      
      transactions.push(transaction);
      Utils.setStorage('kuccps_transactions', transactions);
      
      // Also store last transaction for quick access
      Utils.setStorage('last_transaction', transaction);
      
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  // =====================================================
  // Send Payment Receipt via Email
  // =====================================================
  async sendPaymentReceipt(user, paymentData) {
    try {
      // Check if EmailJS is available
      if (typeof emailjs !== 'undefined' && CONFIG.EMAILJS) {
        const templateParams = {
          to_email: user.email,
          to_name: user.fullName,
          from_name: 'KUCCPS Course Checker',
          transaction_ref: paymentData?.transaction?.reference || this.paymentReference,
          amount: paymentData?.transaction?.amount || 200,
          date: new Date().toLocaleString(),
          index_number: user.indexNumber || 'N/A',
          reply_to: 'kuccpscoursequeries@gmail.com'
        };

        await emailjs.send(
          CONFIG.EMAILJS.SERVICE_ID,
          CONFIG.EMAILJS.TEMPLATE_ID,
          templateParams,
          CONFIG.EMAILJS.PUBLIC_KEY
        );
        
        console.log('Payment receipt email sent');
      }
    } catch (error) {
      console.error('Failed to send receipt email:', error);
      // Don't show error to user, email is not critical
    }
  }

  // =====================================================
  // Show Payment Status
  // =====================================================
  showPaymentStatus(status, message = '') {
    const paymentStatus = document.getElementById('payment-status');
    const payNowBtn = document.getElementById('pay-now-btn');
    const paymentModal = document.getElementById('paymentModal');
    
    if (!paymentStatus) return;
    
    paymentStatus.classList.remove('hidden', 'success', 'error', 'warning');
    paymentStatus.style.display = 'block';
    
    let icon = '';
    let title = '';
    let description = '';
    let buttonHtml = '';
    
    switch(status) {
      case 'processing':
        icon = '<div class="spinner-border text-primary" role="status"></div>';
        title = 'Processing Payment';
        description = message || 'Please wait while we process your payment...';
        paymentStatus.innerHTML = `
          <div class="text-center">
            ${icon}
            <h4 class="mt-3">${title}</h4>
            <p>${description}</p>
            <p class="text-muted">Time remaining: <span id="payment-timer">5:00</span></p>
          </div>
        `;
        paymentStatus.classList.add('processing');
        break;
        
      case 'success':
        icon = '<i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>';
        title = 'Payment Successful!';
        description = message || 'Your payment has been confirmed.';
        paymentStatus.innerHTML = `
          <div class="text-center">
            ${icon}
            <h4 class="mt-3 text-success">${title}</h4>
            <p>${description}</p>
            <p class="text-muted">Redirecting to dashboard...</p>
          </div>
        `;
        paymentStatus.classList.add('success');
        
        // Close payment modal if open
        if (paymentModal) {
          setTimeout(() => {
            paymentModal.style.display = 'none';
          }, 1000);
        }
        break;
        
      case 'error':
        icon = '<i class="bi bi-x-circle-fill text-danger" style="font-size: 4rem;"></i>';
        title = 'Payment Failed';
        description = message || 'An error occurred during payment.';
        buttonHtml = '<button onclick="window.location.reload()" class="btn btn-primary mt-3">Try Again</button>';
        paymentStatus.innerHTML = `
          <div class="text-center">
            ${icon}
            <h4 class="mt-3 text-danger">${title}</h4>
            <p>${description}</p>
            ${buttonHtml}
          </div>
        `;
        paymentStatus.classList.add('error');
        
        if (payNowBtn) payNowBtn.disabled = false;
        break;
        
      case 'timeout':
        icon = '<i class="bi bi-clock-fill text-warning" style="font-size: 4rem;"></i>';
        title = 'Payment Timeout';
        description = message || 'The payment window was closed or timed out.';
        buttonHtml = `
          <button onclick="window.paymentHandler.retryPayment()" class="btn btn-primary mt-3">
            Retry Payment
          </button>
          <button onclick="window.paymentHandler.closePaymentModal()" class="btn btn-secondary mt-3 ms-2">
            Cancel
          </button>
        `;
        paymentStatus.innerHTML = `
          <div class="text-center">
            ${icon}
            <h4 class="mt-3 text-warning">${title}</h4>
            <p>${description}</p>
            ${buttonHtml}
          </div>
        `;
        paymentStatus.classList.add('warning');
        
        if (payNowBtn) payNowBtn.disabled = false;
        break;
    }
  }

  // =====================================================
  // Retry Payment
  // =====================================================
  async retryPayment() {
    const user = Utils.getStorage('currentUser');
    if (user) {
      await this.initiatePayment(user);
    }
  }

  // =====================================================
  // Close Payment Modal
  // =====================================================
  closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
      paymentModal.style.display = 'none';
    }
    this.stopPaymentTimer();
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }

  // =====================================================
  // Manual Transaction Verification (for Already Paid page)
  // =====================================================
  async verifyManualTransaction(indexNumber, email, phone) {
    try {
      Utils.showLoading('Verifying payment...');
      
      const response = await API.verifyExistingPayment(indexNumber, email, phone);
      
      Utils.hideLoading();
      
      if (response && response.success) {
        const userData = response.data.user;
        const transaction = response.data.transaction;
        
        // Save user data
        Utils.setStorage('currentUser', userData);
        
        // Save transaction
        Utils.setStorage('last_transaction', transaction);
        
        // Update payment status
        if (window.Auth) {
          Auth.currentUser = userData;
        }
        
        Utils.showNotification('Payment verified successfully!', 'success');
        
        // Show transaction details
        this.showTransactionDetails(transaction);
        
        return { success: true, data: response.data };
      } else {
        Utils.showNotification(response?.message || 'No payment found with these details', 'error');
        return { success: false };
      }
    } catch (error) {
      Utils.hideLoading();
      Utils.showNotification(error.message || 'Verification failed', 'error');
      return { success: false };
    }
  }

  // =====================================================
  // Show Transaction Details
  // =====================================================
  showTransactionDetails(transaction) {
    const detailsDiv = document.getElementById('transactionDetails');
    if (!detailsDiv) return;
    
    const date = new Date(transaction.date || transaction.created_at);
    const formattedDate = date.toLocaleString();
    
    detailsDiv.innerHTML = `
      <div class="transaction-details-card">
        <h5><i class="bi bi-check-circle-fill text-success"></i> Payment Found!</h5>
        <div class="transaction-item">
          <span class="label">Reference:</span>
          <span class="value">${transaction.reference || 'N/A'}</span>
        </div>
        <div class="transaction-item">
          <span class="label">Amount:</span>
          <span class="value">KES ${transaction.amount || 200}</span>
        </div>
        <div class="transaction-item">
          <span class="label">Date:</span>
          <span class="value">${formattedDate}</span>
        </div>
        <div class="transaction-item">
          <span class="label">Status:</span>
          <span class="value text-success">✓ Verified</span>
        </div>
      </div>
    `;
    
    detailsDiv.classList.add('show');
  }

  // =====================================================
  // Get Payment History
  // =====================================================
  getPaymentHistory() {
    return Utils.getStorage('kuccps_transactions') || [];
  }

  // =====================================================
  // Check if User Has Paid
  // =====================================================
  hasUserPaid(userId) {
    const user = Utils.getStorage('currentUser');
    return user?.paymentStatus === true;
  }
}

// Create global instance
const paymentHandler = new PaymentHandler();
window.paymentHandler = paymentHandler;

// =====================================================
// Event Listeners
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  // Pay Now button
  const payNowBtn = document.getElementById('pay-now-btn');
  if (payNowBtn) {
    payNowBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const user = Utils.getStorage('currentUser');
      if (!user) {
        Utils.showNotification('Please login first', 'warning');
        window.location.href = '/index.html';
        return;
      }
      
      // Get amount from button or input
      const amountInput = document.getElementById('payment-amount');
      const amount = amountInput ? parseInt(amountInput.value) : 200;
      
      payNowBtn.disabled = true;
      payNowBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';
      
      await paymentHandler.initiatePayment(user, amount);
      
      payNowBtn.disabled = false;
      payNowBtn.innerHTML = '<i class="bi bi-lock-fill"></i> Pay Now';
    });
  }
  
  // Verify Transaction button (for Already Paid page)
  const verifyBtn = document.getElementById('verify-transaction');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
      const indexNumber = document.getElementById('indexNumber')?.value;
      const email = document.getElementById('email')?.value;
      const phone = document.getElementById('phone')?.value;
      
      if (!indexNumber || !email) {
        Utils.showNotification('Please enter index number and email', 'warning');
        return;
      }
      
      await paymentHandler.verifyManualTransaction(indexNumber, email, phone);
    });
  }
  
  // Close payment modal button
  const closeModalBtn = document.getElementById('close-payment-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      paymentHandler.closePaymentModal();
    });
  }
  
  // Check for pending payment on page load
  const pendingPayment = Utils.getStorage('pendingPayment');
  if (pendingPayment) {
    const user = Utils.getStorage('currentUser');
    if (user && !user.paymentStatus) {
      // Ask user if they want to continue pending payment
      if (confirm('You have a pending payment. Would you like to continue?')) {
        paymentHandler.initiatePayment(user, pendingPayment.amount, pendingPayment.metadata);
      }
    }
  }
});

// =====================================================
// Export for module use if needed
// =====================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentHandler;
}
