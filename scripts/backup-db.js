const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
require('dotenv').config();

const execPromise = promisify(exec);

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
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const backupDir = path.join(__dirname, '..', 'backups');

async function ensureBackupDir() {
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (error) {
    console.error(`${colors.red}Error creating backup directory:${colors.reset}`, error.message);
    throw error;
  }
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function getDatabase(conn) {
  try {
    const [databases] = await conn.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [config.database]
    );
    return databases.length > 0;
  } catch (error) {
    console.error(`${colors.red}Error checking database:${colors.reset}`, error.message);
    throw error;
  }
}

async function getTables(conn) {
  try {
    const [tables] = await conn.query(`SHOW TABLES FROM \`${config.database}\``);
    return tables.map(row => Object.values(row)[0]);
  } catch (error) {
    console.error(`${colors.red}Error getting tables:${colors.reset}`, error.message);
    throw error;
  }
}

async function dumpDatabase(conn, targetPath) {
  try {
    console.log(`${colors.blue}Retrieving table structures and data...${colors.reset}`);
    
    let sqlContent = `-- Database Backup: ${config.database}\n`;
    sqlContent += `-- Timestamp: ${new Date().toISOString()}\n`;
    sqlContent += `-- Host: ${config.host}\n\n`;
    
    sqlContent += `CREATE DATABASE IF NOT EXISTS \`${config.database}\`;\n`;
    sqlContent += `USE \`${config.database}\`;\n\n`;
    
    // Get all tables
    const tables = await getTables(conn);
    
    if (tables.length === 0) {
      console.log(`${colors.yellow}⚠ No tables found in database${colors.reset}`);
    }
    
    // Dump each table
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      process.stdout.write(`${colors.cyan}  Processing table ${i + 1}/${tables.length}: ${table}${colors.reset}\r`);
      
      // Get table structure
      const [[tableStructure]] = await conn.query(`SHOW CREATE TABLE \`${config.database}\`.\`${table}\``);
      sqlContent += `\n-- Table structure for table \`${table}\`\n`;
      sqlContent += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlContent += tableStructure['Create Table'] + ';\n\n';
      
      // Get table data
      const [rows] = await conn.query(`SELECT * FROM \`${config.database}\`.\`${table}\``);
      
      if (rows.length > 0) {
        sqlContent += `-- Data for table \`${table}\`\n`;
        
        // Get column names
        const [columns] = await conn.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
          [config.database, table]
        );
        
        const columnNames = columns.map(col => col.COLUMN_NAME);
        const insertStartSize = sqlContent.length;
        
        // Build insert statements
        for (const row of rows) {
          const values = columnNames.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 1 : 0;
            if (Buffer.isBuffer(value)) return `0x${value.toString('hex')}`;
            return value;
          });
          
          sqlContent += `INSERT INTO \`${table}\` (${columnNames.map(c => `\`${c}\``).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
      }
    }
    
    console.log(`${colors.green}                                                                     ${colors.reset}`);
    
    // Write to file
    await fs.writeFile(targetPath, sqlContent, 'utf8');
    
    return {
      success: true,
      size: sqlContent.length,
      tables: tables.length
    };
  } catch (error) {
    console.error(`${colors.red}Error dumping database:${colors.reset}`, error.message);
    throw error;
  }
}

async function createBackup(compress = false) {
  let conn;
  
  try {
    console.log(`${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.blue}Database Backup Script${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}\n`);
    
    // Ensure backup directory exists
    await ensureBackupDir();
    
    // Connect to database
    console.log(`${colors.blue}Connecting to ${config.database} database...${colors.reset}`);
    conn = await mysql.createConnection(config);
    console.log(`${colors.green}✓ Connected to database${colors.reset}\n`);
    
    // Check database exists
    const dbExists = await getDatabase(conn);
    if (!dbExists) {
      throw new Error(`Database ${config.database} does not exist`);
    }
    
    // Create backup file
    const timestamp = getTimestamp();
    const filename = `${config.database}_${timestamp}.sql`;
    const backupPath = path.join(backupDir, filename);
    
    console.log(`${colors.blue}Creating backup: ${filename}${colors.reset}\n`);
    
    // Dump database
    const dumpResult = await dumpDatabase(conn, backupPath);
    
    console.log(`${colors.green}✓ Backup created${colors.reset}`);
    console.log(`${colors.gray}  Size: ${formatFileSize(dumpResult.size)}${colors.reset}`);
    console.log(`${colors.gray}  Tables: ${dumpResult.tables}${colors.reset}\n`);
    
    // Compress if requested
    if (compress) {
      console.log(`${colors.blue}Compressing backup...${colors.reset}`);
      try {
        const compressPath = `${backupPath}.gz`;
        const gzipCmd = process.platform === 'win32'
          ? `powershell -Command "Compress-Archive -Path '${backupPath}' -DestinationPath '${compressPath}' -Force"`
          : `gzip -f '${backupPath}'`;
        
        await execPromise(gzipCmd);
        
        const stats = await fs.stat(compressPath);
        console.log(`${colors.green}✓ Backup compressed${colors.reset}`);
        console.log(`${colors.gray}  Compressed size: ${formatFileSize(stats.size)}${colors.reset}\n`);
        
        // Remove original file
        await fs.unlink(backupPath);
      } catch (error) {
        console.log(`${colors.yellow}⚠ Could not compress backup: ${error.message}${colors.reset}\n`);
      }
    }
    
    console.log(`${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.green}Backup completed successfully!${colors.reset}`);
    console.log(`${colors.gray}Location: ${backupPath}${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}========================================${colors.reset}`);
    console.error(`${colors.red}Backup failed:${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}`);
    console.error(`${colors.red}========================================${colors.reset}\n`);
    process.exit(1);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

async function listBackups() {
  try {
    console.log(`${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.blue}Available Backups${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}\n`);
    
    await ensureBackupDir();
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.startsWith(config.database) && (f.endsWith('.sql') || f.endsWith('.sql.gz')));
    
    if (backupFiles.length === 0) {
      console.log(`${colors.yellow}No backups found${colors.reset}\n`);
      return;
    }
    
    backupFiles.sort().reverse();
    
    for (const file of backupFiles) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      const date = stats.mtime.toLocaleString();
      const size = formatFileSize(stats.size);
      
      console.log(`${colors.cyan}${file}${colors.reset}`);
      console.log(`${colors.gray}  Modified: ${date} | Size: ${size}${colors.reset}`);
    }
    
    console.log(`\n${colors.blue}========================================${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Error listing backups:${colors.reset}`, error.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    await listBackups();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`${colors.blue}Database Backup Script${colors.reset}\n`);
    console.log(`Usage: node backup-db.js [options]\n`);
    console.log(`Options:`);
    console.log(`  --compress, -c      Compress backup with gzip`);
    console.log(`  --list, -l          List all backups`);
    console.log(`  --help, -h          Show this help message\n`);
    console.log(`Examples:`);
    console.log(`  node backup-db.js                # Create uncompressed backup`);
    console.log(`  node backup-db.js --compress     # Create compressed backup`);
    console.log(`  node backup-db.js --list         # List all backups\n`);
    return;
  }
  
  const shouldCompress = args.includes('--compress') || args.includes('-c');
  await createBackup(shouldCompress);
}

main();
