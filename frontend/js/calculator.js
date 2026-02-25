// =====================================================
// KUCCPS COURSE CHECKER - ELIGIBILITY CALCULATOR
// Cluster Points and Course Matching
// UPDATED FOR RENDER DEPLOYMENT
// =====================================================

class EligibilityCalculator {
  constructor() {
    this.results = {
      universities: [],
      kmtc: [],
      ttc: [],
      tvet: []
    };
    this.gradePoints = {
      'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
      'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3,
      'D-': 2, 'E': 1
    };
  }

  // =====================================================
  // Calculate All Eligibility using API
  // =====================================================
  async calculateAll(userId, programType = null) {
    try {
      if (typeof Utils !== 'undefined' && Utils.showLoading) {
        Utils.showLoading('Calculating your eligibility...');
      }

      // Get grades from grade handler
      const grades = this.getCurrentGrades();
      
      if (!grades || Object.keys(grades).length < 7) {
        throw new Error('Please enter at least 7 subjects');
      }

      // If program type is specified, calculate for that program
      if (programType) {
        const response = await API.calculateEligibility(userId, programType, grades);
        
        if (response && response.success) {
          this.results = this.formatResults(response.data, programType);
        } else {
          throw new Error(response?.message || 'Failed to calculate eligibility');
        }
      } 
      // Otherwise calculate for all programs
      else {
        // Calculate for each program type
        const programTypes = ['degree', 'diploma', 'certificate', 'kmtc'];
        
        for (const type of programTypes) {
          try {
            const response = await API.calculateEligibility(userId, type, grades);
            if (response && response.success) {
              this.results[this.getResultKey(type)] = response.data.courses || [];
            }
          } catch (error) {
            console.log(`Error calculating ${type}:`, error);
            this.results[this.getResultKey(type)] = [];
          }
        }
      }

      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }

      // Display results
      this.displayResults();
      
      return { success: true, results: this.results };

    } catch (error) {
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      
      console.error('Error calculating eligibility:', error);
      
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(error.message || 'Error calculating eligibility', 'error');
      }
      
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // Get Current Grades from Grade Handler
  // =====================================================
  getCurrentGrades() {
    // Try to get from gradeHandler
    if (window.gradeHandler && typeof window.gradeHandler.getGrades === 'function') {
      const grades = window.gradeHandler.getGrades();
      if (grades && grades.length > 0) {
        // Convert array format to object format
        const gradesObj = {};
        grades.forEach(g => {
          gradesObj[g.subject] = g.grade;
        });
        return gradesObj;
      }
    }
    
    // Try to get from session storage
    const savedGrades = Utils.getStorage('currentGrades');
    if (savedGrades) {
      return savedGrades;
    }
    
    return null;
  }

  // =====================================================
  // Get Result Key from Program Type
  // =====================================================
  getResultKey(programType) {
    const keyMap = {
      'degree': 'universities',
      'diploma': 'tvet',
      'certificate': 'tvet',
      'kmtc': 'kmtc'
    };
    return keyMap[programType] || programType;
  }

  // =====================================================
  // Format Results
  // =====================================================
  formatResults(data, programType) {
    const formatted = {};
    
    if (programType === 'degree') {
      formatted.universities = data.courses || [];
    } else if (programType === 'kmtc') {
      formatted.kmtc = data.courses || [];
    } else {
      formatted.tvet = data.courses || [];
    }
    
    return formatted;
  }

  // =====================================================
  // Display Results
  // =====================================================
  displayResults() {
    this.updateSummary();
    this.displayInstitutionResults('universities', this.results.universities);
    this.displayInstitutionResults('kmtc', this.results.kmtc);
    this.displayInstitutionResults('ttc', this.results.ttc);
    this.displayInstitutionResults('tvet', this.results.tvet);
    
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
      resultsSection.style.display = 'block';
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // =====================================================
  // Update Summary
  // =====================================================
  updateSummary() {
    const user = Utils.getStorage('currentUser');
    const grades = this.getCurrentGrades();
    
    if (!grades) return;
    
    // Calculate total points and mean grade
    const totalPoints = this.calculateTotalPoints(grades);
    const meanGrade = this.calculateMeanGrade(totalPoints);
    
    // Update UI elements
    const meanGradeEl = document.getElementById('result-mean-grade');
    const totalPointsEl = document.getElementById('result-total-points');
    const clusterRangeEl = document.getElementById('result-cluster-range');
    
    if (meanGradeEl) meanGradeEl.textContent = meanGrade;
    if (totalPointsEl) totalPointsEl.textContent = totalPoints;
    
    // Calculate average cluster points
    let totalClusterPoints = 0;
    let courseCount = 0;
    
    Object.values(this.results).forEach(category => {
      if (Array.isArray(category)) {
        category.forEach(course => {
          if (course.clusterPoints) {
            totalClusterPoints += parseFloat(course.clusterPoints);
            courseCount++;
          }
        });
      }
    });
    
    const avgClusterPoints = courseCount > 0 ? (totalClusterPoints / courseCount).toFixed(3) : 'N/A';
    if (clusterRangeEl) clusterRangeEl.textContent = avgClusterPoints;
  }

  // =====================================================
  // Calculate Total Points from Grades
  // =====================================================
  calculateTotalPoints(grades) {
    let total = 0;
    for (const grade of Object.values(grades)) {
      if (grade && grade !== '') {
        total += this.gradePoints[grade] || 0;
      }
    }
    return total;
  }

  // =====================================================
  // Calculate Mean Grade from Points
  // =====================================================
  calculateMeanGrade(totalPoints, subjectCount = 7) {
    const mean = totalPoints / subjectCount;
    
    if (mean >= 12) return 'A';
    if (mean >= 11) return 'A-';
    if (mean >= 10) return 'B+';
    if (mean >= 9) return 'B';
    if (mean >= 8) return 'B-';
    if (mean >= 7) return 'C+';
    if (mean >= 6) return 'C';
    if (mean >= 5) return 'C-';
    if (mean >= 4) return 'D+';
    if (mean >= 3) return 'D';
    if (mean >= 2) return 'D-';
    return 'E';
  }

  // =====================================================
  // Display Institution Results
  // =====================================================
  displayInstitutionResults(type, data) {
    const container = document.getElementById(`${type}-results`);
    if (!container) return;

    if (!data || data.length === 0) {
      container.innerHTML = '<div class="no-results"><p class="text-center text-muted">No results found</p></div>';
      return;
    }

    // Sort by cluster points for universities
    const sorted = type === 'universities' 
      ? [...data].sort((a, b) => (b.clusterPoints || 0) - (a.clusterPoints || 0))
      : data;

    let html = '';
    sorted.forEach((item, index) => {
      const eligible = this.isEligible(item);
      const eligibleClass = eligible ? 'eligible' : 'not-eligible';
      const eligibleIcon = eligible ? '✅' : '❌';
      const badgeClass = eligible ? 'success' : 'secondary';
      
      // Format institution name
      const institutionName = item.institution_name || item.institution || item.campusName || 'Various Institutions';
      
      // Format course name
      const courseName = item.name || item.courseName || 'Unknown Course';
      
      html += `
        <div class="result-card ${eligibleClass} stagger-item" data-index="${index}">
          <div class="result-card-header">
            <h4>${courseName}</h4>
            <span class="badge bg-${badgeClass} eligibility-badge">${eligibleIcon} ${eligible ? 'Eligible' : 'Not Eligible'}</span>
          </div>
          <div class="result-card-body">
            <p class="institution-name"><i class="bi bi-building"></i> ${institutionName}</p>
            
            ${item.clusterPoints ? `
              <div class="points-display">
                <span class="label">Your Cluster:</span>
                <span class="value cluster-points">${item.clusterPoints}</span>
              </div>
            ` : ''}
            
            ${item.cut_off_points || item.cutoff ? `
              <div class="points-display">
                <span class="label">Cut-off:</span>
                <span class="value cut-off ${(item.clusterPoints || 0) >= (item.cut_off_points || item.cutoff || 0) ? 'text-success' : 'text-danger'}">
                  ${item.cut_off_points || item.cutoff}
                </span>
              </div>
            ` : ''}
            
            ${item.requirements ? `
              <div class="requirements">
                <strong>Requirements:</strong>
                <div class="requirements-list">
                  ${this.formatRequirements(item.requirements)}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // =====================================================
  // Check if Course is Eligible
  // =====================================================
  isEligible(course) {
    // If explicitly marked
    if (course.eligible !== undefined) {
      return course.eligible;
    }
    
    // Check based on cluster points vs cutoff
    if (course.clusterPoints && (course.cut_off_points || course.cutoff)) {
      const cutoff = course.cut_off_points || course.cutoff;
      return parseFloat(course.clusterPoints) >= parseFloat(cutoff);
    }
    
    // Default to true if no criteria
    return true;
  }

  // =====================================================
  // Format Requirements
  // =====================================================
  formatRequirements(requirements) {
    if (!requirements) return '<span class="text-muted">No specific requirements</span>';
    
    // If requirements is an array
    if (Array.isArray(requirements)) {
      return requirements.map(req => {
        const subject = req.subject || req.subject_code || 'Subject';
        const grade = req.minimum_grade || req.grade || 'N/A';
        return `<div><span class="subject">${subject}:</span> <span class="grade">${grade}</span></div>`;
      }).join('');
    }
    
    // If requirements is an object
    if (typeof requirements === 'object') {
      return Object.entries(requirements)
        .map(([subject, grade]) => `<div><span class="subject">${subject}:</span> <span class="grade">${grade}</span></div>`)
        .join('');
    }
    
    return String(requirements);
  }

  // =====================================================
  // Filter Results
  // =====================================================
  filterResults(searchTerm) {
    const cards = document.querySelectorAll('.result-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const matches = text.includes(searchTerm.toLowerCase());
      card.style.display = matches ? 'block' : 'none';
      if (matches) visibleCount++;
    });
    
    // Show no results message if needed
    const noResultsMsg = document.getElementById('no-results-message');
    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      if (visibleCount === 0) {
        noResultsMsg.innerHTML = `<p class="text-center text-muted">No courses match "${searchTerm}"</p>`;
      }
    }
  }

  // =====================================================
  // Download Results as Text File
  // =====================================================
  downloadResults() {
    const user = Utils.getStorage('currentUser');
    const results = this.results;
    const date = new Date().toLocaleString();
    
    let content = `========================================\n`;
    content += `    KUCCPS COURSE ELIGIBILITY RESULTS\n`;
    content += `========================================\n\n`;
    content += `Student: ${user?.fullName || 'N/A'}\n`;
    content += `Index: ${user?.indexNumber || 'N/A'}\n`;
    content += `Date: ${date}\n\n`;
    
    // Universities
    content += `========================================\n`;
    content += `UNIVERSITY PROGRAMS\n`;
    content += `========================================\n`;
    if (results.universities && results.universities.length > 0) {
      results.universities.filter(c => this.isEligible(c)).forEach(c => {
        content += `\n✅ ${c.name || c.courseName}\n`;
        content += `   Institution: ${c.institution_name || c.institution || 'N/A'}\n`;
        if (c.clusterPoints) content += `   Your Cluster: ${c.clusterPoints}\n`;
        if (c.cut_off_points || c.cutoff) content += `   Cut-off: ${c.cut_off_points || c.cutoff}\n`;
      });
    } else {
      content += `\nNo eligible university programs found.\n`;
    }
    
    // KMTC
    content += `\n========================================\n`;
    content += `KMTC PROGRAMS\n`;
    content += `========================================\n`;
    if (results.kmtc && results.kmtc.length > 0) {
      results.kmtc.filter(c => this.isEligible(c)).forEach(c => {
        content += `\n✅ ${c.name || c.courseName}\n`;
        content += `   Campus: ${c.campusName || c.institution_name || 'N/A'}\n`;
      });
    } else {
      content += `\nNo eligible KMTC programs found.\n`;
    }
    
    // TVET
    content += `\n========================================\n`;
    content += `TVET PROGRAMS (Diploma & Certificate)\n`;
    content += `========================================\n`;
    if (results.tvet && results.tvet.length > 0) {
      results.tvet.filter(c => this.isEligible(c)).forEach(c => {
        content += `\n✅ ${c.name || c.courseName}\n`;
        content += `   Institution: ${c.institution_name || c.institution || 'N/A'}\n`;
      });
    } else {
      content += `\nNo eligible TVET programs found.\n`;
    }
    
    content += `\n========================================\n`;
    content += `Generated by KUCCPS Course Checker\n`;
    content += `========================================\n`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KUCCPS-Results-${user?.indexNumber || 'download'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof Utils !== 'undefined' && Utils.showNotification) {
      Utils.showNotification('Results downloaded successfully!', 'success');
    }
  }

  // =====================================================
  // Share via WhatsApp
  // =====================================================
  shareWhatsApp() {
    const user = Utils.getStorage('currentUser');
    const results = this.results;
    
    const meanGrade = document.getElementById('result-mean-grade')?.textContent || 'N/A';
    const totalPoints = document.getElementById('result-total-points')?.textContent || 'N/A';
    
    let message = `*KUCCPS Course Results* 🎓\n\n`;
    message += `*Student:* ${user?.fullName || 'N/A'}\n`;
    message += `*Mean Grade:* ${meanGrade}\n`;
    message += `*Total Points:* ${totalPoints}\n\n`;
    
    // Get top eligible universities
    const topUniversities = (results.universities || [])
      .filter(c => this.isEligible(c))
      .slice(0, 5);
    
    if (topUniversities.length > 0) {
      message += `*Top University Programs:*\n`;
      topUniversities.forEach(c => {
        message += `✅ ${c.name || c.courseName}\n`;
      });
    }
    
    // Get top KMTC programs
    const topKmtc = (results.kmtc || [])
      .filter(c => this.isEligible(c))
      .slice(0, 3);
    
    if (topKmtc.length > 0) {
      message += `\n*Top KMTC Programs:*\n`;
      topKmtc.forEach(c => {
        message += `✅ ${c.name || c.courseName}\n`;
      });
    }
    
    message += `\n🔗 Check full results at: ${window.location.origin}`;
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  // =====================================================
  // Clear Results
  // =====================================================
  clearResults() {
    this.results = {
      universities: [],
      kmtc: [],
      ttc: [],
      tvet: []
    };
    
    // Clear display
    ['universities', 'kmtc', 'ttc', 'tvet'].forEach(type => {
      const container = document.getElementById(`${type}-results`);
      if (container) {
        container.innerHTML = '';
      }
    });
    
    // Clear summary
    const meanGradeEl = document.getElementById('result-mean-grade');
    const totalPointsEl = document.getElementById('result-total-points');
    const clusterRangeEl = document.getElementById('result-cluster-range');
    
    if (meanGradeEl) meanGradeEl.textContent = '-';
    if (totalPointsEl) totalPointsEl.textContent = '-';
    if (clusterRangeEl) clusterRangeEl.textContent = '-';
  }
}

// Create global instance
const calculator = new EligibilityCalculator();
window.calculator = calculator;
