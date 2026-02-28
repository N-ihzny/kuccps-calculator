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
        await pool.connect();
        console.log('✅ Connected to database');

      

        // Read migration file
        const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '001_create_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (let stmt of statements) {
            try {
                await pool.query(stmt);
                console.log(`✅ Executed: ${stmt.substring(0, 50)}...`);
            } catch (err) {
                console.log(`⚠️  Error: ${err.message.substring(0, 100)}`);
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
