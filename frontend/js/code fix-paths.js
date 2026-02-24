// =====================================================
// KUCCPS COURSE CHECKER - PATH FIXER SCRIPT
// Updates file paths for production deployment
// =====================================================

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  PRODUCTION: true,
  PATHS: {
    'css/': 'frontend/assets/css/',
    'responsive.css': 'frontend/assets/responsive.css',
    'js/': 'frontend/js/',
    'images/': 'frontend/images/'
  },
  HTML_FILES: [
    'index.html',
    'degree_calculator.html',
    'diploma.html',
    'certificate.html',
    'kmtc.html',
    'userguide.html',
    'alreadypaid.html',
    'new_payment.html',
    'dashboard.html'
  ],
  URL_PATTERNS: [
    { from: 'https://kuccps-api.onrender.com', to: 'https://kuccps-api.onrender.com' },
    { from: 'https://kuccps-api.onrender.com', to: 'https://kuccps-api.onrender.com' }
  ]
};

console.log('🔧 KUCCPS Course Checker - Path Fixer');
console.log('=======================================');

let fixedCount = 0;

// Process each HTML file
CONFIG.HTML_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Fix CSS paths
    Object.entries(CONFIG.PATHS).forEach(([from, to]) => {
      const regex = new RegExp(`(href|src)="${from}`, 'g');
      content = content.replace(regex, `$1="${to}`);
    });
    
    // Fix API URLs
    CONFIG.URL_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.from, 'g');
      content = content.replace(regex, pattern.to);
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } else {
    console.log(`⚠️  Not found: ${file}`);
  }
});

console.log(`\n✅ Total files fixed: ${fixedCount}`);
console.log('✨ Path fixing complete!');