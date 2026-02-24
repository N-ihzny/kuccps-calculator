const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kuccps_course_checker'
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const seedDefinitions = {
  institutions: {
    file: '01_institution_types.sql',
    description: 'Institution types'
  },
  subjects: {
    file: '02_subjects.sql',
    description: 'Subject data'
  },
  universities: {
    file: '03_universities.sql',
    description: 'Universities'
  },
  kmtcCampuses: {
    file: '04_kmtc_campuses.sql',
    description: 'KMTC campuses'
  },
  kmtcCourses: {
    file: '05_kmtc_courses.sql',
    description: 'KMTC courses'
  },
  degreeCourses: {
    file: '06_degree_courses.sql',
    description: 'Degree courses'
  },
  diplomaCertificate: {
    file: '07_diploma_certificate.sql',
    description: 'Diploma & Certificate courses'
  },
  tvetInstitutions: {
    file: '08_tvet_institutions.sql',
    description: 'TVET institutions'
  },
  teacherColleges: {
    file: '09_teacher_colleges.sql',
    description: 'Teacher colleges'
  },
  cutoffPoints: {
    file: '10_cutoff_points.sql',
    description: 'Cutoff points'
  }
};

async function executeSSQL(conn, sqlPath) {
  try {
    const sql = await fs.readFile(sqlPath, 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await conn.query(statement);
      }
    }
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function seedDatabase(seedNames = null) {
  let conn;
  
  try {
    console.log(`${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.blue}Database Seeding Script${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}\n`);
    
    console.log(`${colors.blue}Connecting to ${config.database} database...${colors.reset}`);
    conn = await mysql.createConnection(config);
    console.log(`${colors.green}✓ Connected to database${colors.reset}\n`);
    
    const seedsDir = path.join(__dirname, '..', 'database', 'seeds');
    const seedsToRun = seedNames || Object.keys(seedDefinitions);
    
    let successful = 0;
    let failed = 0;
    
    for (const seedKey of seedsToRun) {
      const seedDef = seedDefinitions[seedKey];
      
      if (!seedDef) {
        console.log(`${colors.yellow}⚠ Unknown seed: ${seedKey}${colors.reset}`);
        continue;
      }
      
      const filePath = path.join(seedsDir, seedDef.file);
      
      try {
        await fs.access(filePath);
      } catch {
        console.log(`${colors.yellow}⚠ Seed file not found: ${seedDef.file}${colors.reset}`);
        failed++;
        continue;
      }
      
      console.log(`${colors.cyan}Loading ${seedDef.description}...${colors.reset}`);
      const result = await executeSSQL(conn, filePath);
      
      if (result.success) {
        console.log(`${colors.green}  ✓ ${seedDef.description} loaded successfully${colors.reset}`);
        successful++;
      } else {
        console.log(`${colors.red}  ✗ ${seedDef.description} failed: ${result.error}${colors.reset}`);
        failed++;
      }
    }
    
    console.log(`\n${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.green}Seeding completed!${colors.reset}`);
    console.log(`${colors.green}  ✓ Successful: ${successful}${colors.reset}`);
    if (failed > 0) {
      console.log(`${colors.red}  ✗ Failed: ${failed}${colors.reset}`);
    }
    console.log(`${colors.blue}========================================${colors.reset}\n`);
    
    return failed === 0;
    
  } catch (error) {
    console.error(`\n${colors.red}========================================${colors.reset}`);
    console.error(`${colors.red}Seeding failed:${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}`);
    console.error(`${colors.red}========================================${colors.reset}\n`);
    process.exit(1);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

async function listSeeds() {
  console.log(`${colors.blue}Available seeds:${colors.reset}\n`);
  Object.entries(seedDefinitions).forEach(([key, def]) => {
    console.log(`  ${colors.cyan}${key}${colors.reset}: ${def.description}`);
  });
  console.log();
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    await listSeeds();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`${colors.blue}Database Seeding Script${colors.reset}\n`);
    console.log(`Usage: node seed-data.js [options] [seeds...]\n`);
    console.log(`Options:`);
    console.log(`  --list, -l          List all available seeds`);
    console.log(`  --help, -h          Show this help message\n`);
    console.log(`Examples:`);
    console.log(`  node seed-data.js                    # Load all seeds`);
    console.log(`  node seed-data.js institutions subjects    # Load specific seeds`);
    console.log(`  node seed-data.js --list             # List available seeds\n`);
    return;
  }
  
  const seedNames = args.length > 0 ? args : null;
  await seedDatabase(seedNames);
}

main();
