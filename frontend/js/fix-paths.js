// =====================================================
// KUCCPS COURSE CHECKER - PATH FIXER SCRIPT
// Updates file paths for production deployment
// UPDATED FOR RENDER DEPLOYMENT
// =====================================================

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Set to true for production build
  PRODUCTION: process.env.NODE_ENV === 'production' || true,
  
  // Path mappings
  PATHS: {
    'css/': 'frontend/assets/css/',
    'responsive.css': 'frontend/assets/responsive.css',
    'js/': 'frontend/js/',
    'images/': 'frontend/images/'
  },
  
  // Files to process
  HTML_FILES: [
    'index.html',
    'degree_calculator.html',
    'diploma.html',
    'certificate.html',
    'kmtc.html',
    'userguide.html',
    'alreadypaid.html',
    'new_payment.html',
    'dashboard.html',
    'admin-dashboard.html',
    'payment.html',
    'payment-callback.html'
  ],
  
  // Additional asset types
  ASSET_EXTENSIONS: ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2'],
  
  // URL patterns to fix
  URL_PATTERNS: [
    { from: 'https://kuccps-api.onrender.com', to: 'https://kuccps-api.onrender.com' },
    { from: 'https://kuccps-api.onrender.com', to: 'https://kuccps-api.onrender.com' },
    { from: 'ws://localhost:5000', to: 'wss://kuccps-api.onrender.com' }
  ]
};

/**
 * Main fix function
 */
function fixPaths() {
  console.log('🔧 KUCCPS Course Checker - Path Fixer');
  console.log('=======================================');
  console.log(`Mode: ${CONFIG.PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log('');
  
  let fixedCount = 0;
  let errorCount = 0;
  
  // Process each HTML file
  CONFIG.HTML_FILES.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const result = processFile(file);
        if (result) {
          fixedCount++;
          console.log(`✅ Fixed: ${file}`);
        } else {
          console.log(`⚠️  No changes needed: ${file}`);
        }
      } else {
        console.log(`❌ File not found: ${file}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      errorCount++;
    }
  });
  
  // Process CSS/JS files if needed
  fixAssetPaths();
  
  console.log('');
  console.log('=======================================');
  console.log(`✅ Fixed: ${fixedCount} files`);
  if (errorCount > 0) console.log(`❌ Errors: ${errorCount} files`);
  console.log('=======================================');
}

/**
 * Process a single HTML file
 */
function processFile(file) {
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
  
  // Fix relative paths for production
  if (CONFIG.PRODUCTION) {
    // Add base tag if not present
    if (!content.includes('<base href="/">')) {
      content = content.replace('<head>', '<head>\n  <base href="/">');
    }
    
    // Fix absolute paths
    content = content.replace(/src="\//g, 'src="');
    content = content.replace(/href="\//g, 'href="');
    
    // Add cache busting for production
    const timestamp = Date.now();
    content = content.replace(/\.css"/g, `.css?v=${timestamp}"`);
    content = content.replace(/\.js"/g, `.js?v=${timestamp}"`);
  }
  
  // Only write if changes were made
  if (content !== original) {
    fs.writeFileSync(file, content);
    return true;
  }
  
  return false;
}

/**
 * Fix asset paths in CSS/JS files
 */
function fixAssetPaths() {
  console.log('');
  console.log('📁 Processing assets...');
  
  const assetDirs = ['frontend/assets/css', 'frontend/js', 'frontend/images'];
  let assetCount = 0;
  
  assetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const ext = path.extname(file);
        
        if (CONFIG.ASSET_EXTENSIONS.includes(ext)) {
          try {
            let content = fs.readFileSync(filePath, 'utf8');
            const original = content;
            
            // Fix image paths in CSS
            if (ext === '.css') {
              content = content.replace(/url\(['"]?\.\.\/images\//g, 'url(\'../images/');
              content = content.replace(/url\(['"]?\/images\//g, 'url(\'../images/');
            }
            
            // Fix API URLs in JS
            if (ext === '.js') {
              CONFIG.URL_PATTERNS.forEach(pattern => {
                const regex = new RegExp(pattern.from, 'g');
                content = content.replace(regex, pattern.to);
              });
            }
            
            if (content !== original) {
              fs.writeFileSync(filePath, content);
              console.log(`  ✅ Fixed: ${dir}/${file}`);
              assetCount++;
            }
          } catch (error) {
            console.log(`  ⚠️  Skipped binary file: ${file}`);
          }
        }
      });
    }
  });
  
  if (assetCount > 0) {
    console.log(`  📊 Total assets fixed: ${assetCount}`);
  }
}

/**
 * Generate a new sitemap for production
 */
function generateSitemap() {
  if (!CONFIG.PRODUCTION) return;
  
  const baseUrl = 'https://kuccps-app.onrender.com';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/degree-calculator</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/diploma</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/certificate</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/kmtc</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/dashboard</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/userguide</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
  
  fs.writeFileSync('sitemap.xml', sitemap);
  console.log('📑 Generated sitemap.xml');
}

/**
 * Create a robots.txt file
 */
function createRobotsTxt() {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://kuccps-app.onrender.com/sitemap.xml`;
  
  fs.writeFileSync('robots.txt', robots);
  console.log('🤖 Created robots.txt');
}

/**
 * Generate a _redirects file for Netlify/Render
 */
function createRedirects() {
  const redirects = `# Redirects for SPA
/*    /index.html    200

# API proxy (if needed)
/api/*  https://kuccps-api.onrender.com/api/:splat  200`;
  
  fs.writeFileSync('_redirects', redirects);
  console.log('🔄 Created _redirects file');
}

// Run the main function
console.log('');
fixPaths();

// Generate additional files for production
if (CONFIG.PRODUCTION) {
  console.log('');
  console.log('📦 Generating production files...');
  generateSitemap();
  createRobotsTxt();
  createRedirects();
}

console.log('');
console.log('✨ Path fixing complete!');

// =====================================================
// Usage instructions
// =====================================================
console.log('');
console.log('📌 Next steps:');
console.log('1. Run: node fix-paths.js');
console.log('2. Commit changes to git');
console.log('3. Deploy to Render');
console.log('');