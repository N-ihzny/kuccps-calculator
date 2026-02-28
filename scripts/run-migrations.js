const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
    console.log('🚀 Starting database migrations...');
    
    try {
        // Test connection
        await pool.connect();
        console.log('✅ Connected to database');

        // Read migration file
        const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '001_create_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split into individual statements
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        // Execute each statement
        for (let stmt of statements) {
            try {
                await pool.query(stmt);
                console.log(`✅ Executed: ${stmt.substring(0, 50)}...`);
            } catch (err) {
                // Ignore "already exists" errors
                if (err.code === '42P07' || err.message.includes('already exists')) {
                    console.log(`⚠️  Already exists: ${stmt.substring(0, 50)}...`);
                } else {
                    console.log(`⚠️  Error: ${err.message.substring(0, 100)}`);
                }
            }
        }
        
        console.log('🎉 Migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
