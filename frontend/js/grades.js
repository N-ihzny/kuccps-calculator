// =====================================================
// KUCCPS COURSE CHECKER - GRADE ENTRY HANDLER
// Supports 7-9 KCSE Subjects
// UPDATED FOR RENDER DEPLOYMENT
// =====================================================

class GradeHandler {
  constructor() {
    this.subjects = window.CONFIG ? CONFIG.SUBJECTS : this.getDefaultSubjects();
    this.grades = window.CONFIG ? CONFIG.GRADES : ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
    this.gradePoints = window.CONFIG ? CONFIG.KCSE.GRADE_POINTS : this.getDefaultGradePoints();
    this.studentGrades = [];
    this.maxSubjects = 9;
    this.minSubjects = 7;
    this.init();
  }

  init() {
    // Load subjects from API if available
    this.loadSubjectsFromAPI();
  }

  getDefaultSubjects() {
    return [
      { code: 'ENG', name: 'English', group: 1, compulsory: true },
      { code: 'KIS', name: 'Kiswahili', group: 1, compulsory: true },
      { code: 'MAT', name: 'Mathematics', group: 1, compulsory: true },
      { code: 'BIO', name: 'Biology', group: 2, compulsory: false },
      { code: 'PHY', name: 'Physics', group: 2, compulsory: false },
      { code: 'CHE', name: 'Chemistry', group: 2, compulsory: false },
      { code: 'HIS', name: 'History', group: 3, compulsory: false },
      { code: 'GEO', name: 'Geography', group: 3, compulsory: false },
      { code: 'CRE', name: 'CRE', group: 3, compulsory: false },
      { code: 'BUS', name: 'Business Studies', group: 4, compulsory: false },
      { code: 'AGR', name: 'Agriculture', group: 4, compulsory: false },
      { code: 'COM', name: 'Computer Studies', group: 4, compulsory: false }
    ];
  }

  getDefaultGradePoints() {
    return {
      'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
      'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3,
      'D-': 2, 'E': 1
    };
  }

  async loadSubjectsFromAPI() {
    try {
      if (typeof API !== 'undefined' && API.getSubjects) {
        const response = await API.getSubjects();
        if (response && response.success) {
          this.subjects = response.data;
        }
      }
    } catch (error) {
      console.log('Using default subjects (API unavailable)');
    }
  }

  async loadGradeEntry(savedGrades = null) {
    const container = document.getElementById('subjects-container');
    if (!container) return;

    const headerHtml = `
      <div class="grade-header mb-4">
        <div class="alert alert-info">
          <i class="bi bi-info-circle-fill me-2"></i>
          Enter your ${this.minSubjects} best subjects (up to ${this.maxSubjects})
        </div>
        <div class="subject-count" id="subject-count">
          Subjects: 0/${this.minSubjects} (minimum)
        </div>
      </div>
    `;
    
    let html = headerHtml;
    
    if (savedGrades && savedGrades.length > 0) {
      for (let i = 0; i < savedGrades.length; i++) {
        html += this.createSubjectRow(i, savedGrades[i].subject, savedGrades[i].grade);
      }
      for (let i = savedGrades.length; i < this.minSubjects; i++) {
        html += this.createSubjectRow(i);
      }
    } else {
      for (let i = 0; i < this.minSubjects; i++) {
        html += this.createSubjectRow(i);
      }
    }
    
    html += `
      <div class="subject-controls mt-3">
        <button type="button" id="add-subject-btn" class="btn btn-outline-primary btn-sm" ${savedGrades && savedGrades.length >= this.maxSubjects ? 'disabled' : ''}>
          <i class="bi bi-plus-circle"></i> Add Subject (Max ${this.maxSubjects})
        </button>
        <button type="button" id="remove-subject-btn" class="btn btn-outline-danger btn-sm" ${!savedGrades || savedGrades.length <= this.minSubjects ? 'disabled' : ''}>
          <i class="bi bi-dash-circle"></i> Remove Subject
        </button>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
    this.updateSubjectCount();
    
    if (savedGrades && savedGrades.length > 0) {
      setTimeout(() => this.validateAndCalculate(), 100);
    }
  }

  createSubjectRow(index, selectedSubject = '', selectedGrade = '') {
    return `
      <div class="subject-row mb-3 animate-slide-in" id="subject-row-${index}">
        <div class="row g-2">
          <div class="col-md-5">
            <select class="form-select subject-select" id="subject-${index}" data-index="${index}" required>
              <option value="">Select Subject</option>
              ${this.getSubjectOptions(selectedSubject)}
            </select>
          </div>
          <div class="col-md-5">
            <select class="form-select grade-select" id="grade-${index}" data-index="${index}" required>
              <option value="">Select Grade</option>
              ${this.getGradeOptions(selectedGrade)}
            </select>
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-link text-danger remove-row-btn" onclick="gradeHandler.removeSubjectRow(${index})" style="display: none;">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getSubjectOptions(selected = '') {
    const groupedSubjects = {};
    this.subjects.forEach(s => {
      const group = s.group || 1;
      if (!groupedSubjects[group]) {
        groupedSubjects[group] = [];
      }
      groupedSubjects[group].push(s);
    });

    let options = '';
    
    const groupNames = {
      1: '📚 Compulsory Subjects',
      2: '🔬 Sciences',
      3: '📖 Humanities',
      4: '🛠️ Technical Subjects',
      5: '🌍 Languages'
    };

    for (let group = 1; group <= 5; group++) {
      if (groupedSubjects[group] && groupedSubjects[group].length > 0) {
        options += `<optgroup label="${groupNames[group] || 'Other Subjects'}">`;
        groupedSubjects[group].forEach(s => {
          const selectedAttr = s.code === selected ? 'selected' : '';
          options += `<option value="${s.code}" ${selectedAttr}>${s.name} (${s.code})${s.compulsory ? ' *' : ''}</option>`;
        });
        options += '</optgroup>';
      }
    }
    
    return options;
  }

  getGradeOptions(selected = '') {
    return this.grades.map(g => 
      `<option value="${g}" ${g === selected ? 'selected' : ''}>${g}</option>`
    ).join('');
  }

  attachEventListeners() {
    const addBtn = document.getElementById('add-subject-btn');
    const removeBtn = document.getElementById('remove-subject-btn');
    
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addSubjectRow());
    }
    
    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.removeLastSubjectRow());
    }
    
    for (let i = 0; i < this.maxSubjects; i++) {
      const subjectSelect = document.getElementById(`subject-${i}`);
      const gradeSelect = document.getElementById(`grade-${i}`);
      
      if (subjectSelect) {
        subjectSelect.addEventListener('change', () => {
          this.validateAndCalculate();
          this.updateRemoveButtonsVisibility();
        });
      }
      
      if (gradeSelect) {
        gradeSelect.addEventListener('change', () => {
          this.validateAndCalculate();
          this.updateRemoveButtonsVisibility();
        });
      }
    }
  }

  addSubjectRow() {
    const currentRows = document.querySelectorAll('.subject-row').length;
    if (currentRows < this.maxSubjects) {
      const newRowHtml = this.createSubjectRow(currentRows);
      document.querySelector('.subject-controls').insertAdjacentHTML('beforebegin', newRowHtml);
      
      const newSubjectSelect = document.getElementById(`subject-${currentRows}`);
      const newGradeSelect = document.getElementById(`grade-${currentRows}`);
      
      newSubjectSelect.addEventListener('change', () => {
        this.validateAndCalculate();
        this.updateRemoveButtonsVisibility();
      });
      
      newGradeSelect.addEventListener('change', () => {
        this.validateAndCalculate();
        this.updateRemoveButtonsVisibility();
      });
      
      this.updateSubjectCount();
      this.updateRemoveButtonsVisibility();
    }
  }

  removeLastSubjectRow() {
    const rows = document.querySelectorAll('.subject-row');
    if (rows.length > this.minSubjects) {
      rows[rows.length - 1].remove();
      this.reindexRows();
      this.updateSubjectCount();
      this.updateRemoveButtonsVisibility();
      this.validateAndCalculate();
    }
  }

  removeSubjectRow(index) {
    const rows = document.querySelectorAll('.subject-row');
    if (rows.length > this.minSubjects) {
      const rowToRemove = document.getElementById(`subject-row-${index}`);
      if (rowToRemove) {
        rowToRemove.remove();
        this.reindexRows();
        this.updateSubjectCount();
        this.updateRemoveButtonsVisibility();
        this.validateAndCalculate();
      }
    }
  }

  reindexRows() {
    const rows = document.querySelectorAll('.subject-row');
    rows.forEach((row, newIndex) => {
      const select = row.querySelector('.subject-select');
      const gradeSelect = row.querySelector('.grade-select');
      
      if (select) {
        select.id = `subject-${newIndex}`;
        select.dataset.index = newIndex;
      }
      if (gradeSelect) {
        gradeSelect.id = `grade-${newIndex}`;
        gradeSelect.dataset.index = newIndex;
      }
      row.id = `subject-row-${newIndex}`;
      
      const removeBtn = row.querySelector('.remove-row-btn');
      if (removeBtn) {
        removeBtn.setAttribute('onclick', `gradeHandler.removeSubjectRow(${newIndex})`);
      }
    });
  }

  validateAndCalculate() {
    const grades = [];
    let totalPoints = 0;
    let subjectsEntered = 0;
    const selectedSubjects = new Set();
    const errors = [];

    const rows = document.querySelectorAll('.subject-row');
    rows.forEach((row, index) => {
      const subjectSelect = document.getElementById(`subject-${index}`);
      const gradeSelect = document.getElementById(`grade-${index}`);
      
      const subject = subjectSelect?.value;
      const grade = gradeSelect?.value;
      
      if (subjectSelect) subjectSelect.classList.remove('is-invalid');
      if (gradeSelect) gradeSelect.classList.remove('is-invalid');
      
      if (subject && grade) {
        if (selectedSubjects.has(subject)) {
          errors.push(`Duplicate subject: ${subject}`);
          if (subjectSelect) subjectSelect.classList.add('is-invalid');
        } else {
          selectedSubjects.add(subject);
          const points = this.gradePoints[grade] || 0;
          grades.push({ subject, grade, points });
          totalPoints += points;
          subjectsEntered++;
        }
      } else if (subject || grade) {
        if (!subject && grade) {
          if (subjectSelect) subjectSelect.classList.add('is-invalid');
        }
        if (subject && !grade) {
          if (gradeSelect) gradeSelect.classList.add('is-invalid');
        }
      }
    });

    const calculateBtn = document.getElementById('calculate-eligibility');
    const meanDisplay = document.getElementById('calculated-mean');
    const verificationDisplay = document.getElementById('mean-verification');
    
    if (subjectsEntered >= this.minSubjects && subjectsEntered <= this.maxSubjects && errors.length === 0) {
      calculateBtn.disabled = false;
      
      const best7Grades = this.getBestSubjects(grades, 7);
      const best7Total = best7Grades.reduce((sum, g) => sum + g.points, 0);
      const meanGrade = this.calculateMeanGrade(best7Total);
      const meanPoints = (best7Total / 7).toFixed(2);
      
      if (meanDisplay) {
        meanDisplay.textContent = `${meanGrade} (${meanPoints} points)`;
      }
      
      if (verificationDisplay) {
        if (grades.length > 7) {
          verificationDisplay.innerHTML = `<span class="badge bg-info">Based on best 7 of ${grades.length} subjects</span>`;
        } else {
          verificationDisplay.innerHTML = `<span class="badge bg-success">✓ Valid entry</span>`;
        }
      }
      
      this.studentGrades = this.normalizeGrades(grades);
      this.saveGradesToSession(this.studentGrades);
      
    } else {
      calculateBtn.disabled = true;
      if (meanDisplay) meanDisplay.textContent = '-';
      if (verificationDisplay) {
        if (subjectsEntered < this.minSubjects) {
          verificationDisplay.innerHTML = `<span class="badge bg-warning">Need ${this.minSubjects - subjectsEntered} more subject(s)</span>`;
        } else if (errors.length > 0) {
          verificationDisplay.innerHTML = `<span class="badge bg-danger">${errors[0]}</span>`;
        } else {
          verificationDisplay.innerHTML = '';
        }
      }
    }
    
    if (errors.length > 0 && typeof Utils !== 'undefined' && Utils.showNotification) {
      Utils.showNotification(errors[0], 'warning');
    }
  }

  getBestSubjects(grades, count = 7) {
    return [...grades]
      .sort((a, b) => b.points - a.points)
      .slice(0, count);
  }

  calculateMeanGrade(totalPoints) {
    const mean = totalPoints / 7;
    
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

  normalizeGrades(grades) {
    return this.getBestSubjects(grades, 7)
      .sort((a, b) => b.points - a.points);
  }

  saveGradesToSession(grades) {
    try {
      const gradesObj = {};
      grades.forEach(g => {
        gradesObj[g.subject] = g.grade;
      });
      
      if (typeof Utils !== 'undefined' && Utils.setStorage) {
        Utils.setStorage('currentGrades', gradesObj);
      } else {
        sessionStorage.setItem('currentGrades', JSON.stringify(gradesObj));
      }
    } catch (error) {
      console.error('Error saving grades to session:', error);
    }
  }

  loadGradesFromSession() {
    try {
      let gradesObj = null;
      
      if (typeof Utils !== 'undefined' && Utils.getStorage) {
        gradesObj = Utils.getStorage('currentGrades');
      } else {
        const stored = sessionStorage.getItem('currentGrades');
        if (stored) {
          gradesObj = JSON.parse(stored);
        }
      }
      
      if (gradesObj) {
        const grades = [];
        for (const [subject, grade] of Object.entries(gradesObj)) {
          if (subject && grade) {
            const points = this.gradePoints[grade] || 0;
            grades.push({ subject, grade, points });
          }
        }
        return this.normalizeGrades(grades);
      }
    } catch (error) {
      console.error('Error loading grades from session:', error);
    }
    
    return null;
  }

  updateSubjectCount() {
    const currentRows = document.querySelectorAll('.subject-row').length;
    const countElement = document.getElementById('subject-count');
    const addBtn = document.getElementById('add-subject-btn');
    const removeBtn = document.getElementById('remove-subject-btn');
    
    if (countElement) {
      countElement.textContent = `Subjects: ${currentRows}/${this.minSubjects} (minimum)`;
      countElement.className = currentRows >= this.minSubjects ? 'text-success fw-bold' : 'text-danger fw-bold';
    }
    
    if (addBtn) addBtn.disabled = currentRows >= this.maxSubjects;
    if (removeBtn) removeBtn.disabled = currentRows <= this.minSubjects;
  }

  updateRemoveButtonsVisibility() {
    const rows = document.querySelectorAll('.subject-row');
    rows.forEach((row, index) => {
      const removeBtn = row.querySelector('.remove-row-btn');
      if (removeBtn) {
        removeBtn.style.display = rows.length > this.minSubjects ? 'inline-block' : 'none';
      }
    });
  }

  async saveGrades(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const grades = this.getGradesForAPI();
      
      if (Object.keys(grades).length < 7) {
        throw new Error('Please enter at least 7 subjects');
      }
      
      if (typeof API !== 'undefined' && API.saveGrades) {
        const response = await API.saveGrades(userId, grades);
        return response && response.success;
      } else {
        if (typeof Utils !== 'undefined' && Utils.setStorage) {
          Utils.setStorage('savedGrades', grades);
        }
        return true;
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification(error.message || 'Error saving grades', 'error');
      }
      return false;
    }
  }

  getGradesForAPI() {
    const gradesObj = {};
    this.studentGrades.forEach(g => {
      gradesObj[g.subject] = g.grade;
    });
    return gradesObj;
  }

  getGrades() {
    return this.studentGrades;
  }

  clearGrades() {
    this.studentGrades = [];
    if (typeof Utils !== 'undefined' && Utils.removeStorage) {
      Utils.removeStorage('currentGrades');
    } else {
      sessionStorage.removeItem('currentGrades');
    }
    this.loadGradeEntry();
  }
}

// Create global instance
const gradeHandler = new GradeHandler();
window.gradeHandler = gradeHandler;

// Helper function for loading grade entry
function loadGradeEntry() {
  if (window.gradeHandler) {
    const savedGrades = window.gradeHandler.loadGradesFromSession();
    window.gradeHandler.loadGradeEntry(savedGrades);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('subjects-container')) {
    loadGradeEntry();
  }
});
