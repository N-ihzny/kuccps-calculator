const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kuccps_course_checker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const defaultConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function executeSQL(conn, sqlPath) {
  try {
    const sql = await fs.readFile(sqlPath, 'utf8');
    // Split by semicolon and filter empty statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await conn.query(statement);
      }
    }
    return true;
  } catch (error) {
    console.error(`${colors.red}Error executing SQL from ${sqlPath}:${colors.reset}`, error.message);
    return false;
  }
}

async function createDatabase(conn) {
  try {
    console.log(`${colors.blue}Creating database if not exists...${colors.reset}`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    console.log(`${colors.green}✓ Database created/verified${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error creating database:${colors.reset}`, error.message);
    return false;
  }
}

async function runMigrations(conn) {
  try {
    console.log(`${colors.blue}Running migrations...${colors.reset}`);
    
    const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();
    
    if (migrationFiles.length === 0) {
      console.log(`${colors.yellow}⚠ No migration files found${colors.reset}`);
      return true;
    }
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`${colors.blue}  Executing ${file}...${colors.reset}`);
      const success = await executeSQL(conn, filePath);
      if (success) {
        console.log(`${colors.green}  ✓ ${file} completed${colors.reset}`);
      } else {
        console.log(`${colors.red}  ✗ ${file} failed${colors.reset}`);
        return false;
      }
    }
    
    console.log(`${colors.green}✓ All migrations completed${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error running migrations:${colors.reset}`, error.message);
    return false;
  }
}

async function loadSeeds(conn) {
  try {
    console.log(`${colors.blue}Loading seed data...${colors.reset}`);
    
    const seedsDir = path.join(__dirname, '..', 'database', 'seeds');
    const files = await fs.readdir(seedsDir);
    const seedFiles = files.filter(f => f.endsWith('.sql')).sort();
    
    if (seedFiles.length === 0) {
      console.log(`${colors.yellow}⚠ No seed files found${colors.reset}`);
      return true;
    }
    
    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      console.log(`${colors.blue}  Loading ${file}...${colors.reset}`);
      const success = await executeSQL(conn, filePath);
      if (success) {
        console.log(`${colors.green}  ✓ ${file} loaded${colors.reset}`);
      } else {
        console.log(`${colors.red}  ✗ ${file} failed${colors.reset}`);
        return false;
      }
    }
    
    console.log(`${colors.green}✓ All seeds loaded${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error loading seeds:${colors.reset}`, error.message);
    return false;
  }
}

async function main() {
  let defaultConn;
  let dbConn;
  
  try {
    console.log(`${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.blue}Database Initialization Script${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}\n`);
    
    // Connect without specifying database
    console.log(`${colors.blue}Connecting to MySQL server...${colors.reset}`);
    defaultConn = await mysql.createConnection(defaultConfig);
    console.log(`${colors.green}✓ Connected to MySQL server${colors.reset}\n`);
    
    // Create database
    const dbCreated = await createDatabase(defaultConn);
    if (!dbCreated) {
      throw new Error('Failed to create database');
    }
    
    // Close default connection and connect to specific database
    await defaultConn.end();
    
    console.log(`${colors.blue}Connecting to ${config.database} database...${colors.reset}`);
    dbConn = await mysql.createConnection(config);
    console.log(`${colors.green}✓ Connected to ${config.database} database${colors.reset}\n`);
    
    // Run migrations
    const migrationsSuccess = await runMigrations(dbConn);
    if (!migrationsSuccess) {
      throw new Error('Migrations failed');
    }
    
    console.log();
    
    // Load seeds
    const seedsSuccess = await loadSeeds(dbConn);
    if (!seedsSuccess) {
      throw new Error('Seed loading failed');
    }
    
    console.log(`\n${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.green}Database initialization completed successfully!${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}========================================${colors.reset}`);
    console.error(`${colors.red}Database initialization failed:${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}`);
    console.error(`${colors.red}========================================${colors.reset}\n`);
    process.exit(1);
  } finally {
    if (defaultConn) await defaultConn.end().catch(() => {});
    if (dbConn) await dbConn.end().catch(() => {});
  }
}

main();
