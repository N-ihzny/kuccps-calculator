const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigrations() {
    console.log('🚀 Starting database migrations...');
    
    try {
        // Test connection
        const client = await pool.connect();
        console.log('✅ Connected to database successfully');
        client.release();

        // Migration files in order
        const migrations = [
            '001_create_tables.sql',
            '002_add_indexes.sql'
        ];

        for (const migration of migrations) {
            console.log(`📝 Running migration: ${migration}`);
            
            // Read SQL file
            const sqlPath = path.join(__dirname, '..', 'database', 'migrations', migration);
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
                    console.log(`  ✅ Executed: ${stmt.substring(0, 50)}...`);
                } catch (err) {
                    // Ignore "already exists" errors
                    if (err.code === '42P07' || err.message.includes('already exists')) {
                        console.log(`  ⚠️ Table/index already exists: ${stmt.substring(0, 50)}...`);
                    } else {
                        throw err;
                    }
                }
            }
            
            console.log(`✅ Completed migration: ${migration}`);
        }

        console.log('🎉 All migrations completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migrations
runMigrations();
