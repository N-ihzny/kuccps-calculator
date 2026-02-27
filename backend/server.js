const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { testConnection, pool } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const gradeRoutes = require('./routes/grades');
const calculationRoutes = require('./routes/calculation');
const courseRoutes = require('./routes/courses');
const institutionRoutes = require('./routes/institutions');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// ✅ FIXED: Updated CORS configuration to allow your frontend domains
app.use(cors({
    origin: [
        'https://kuccps-calculator-1.onrender.com',
        'http://localhost:5500',
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        process.env.FRONTEND_URL
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID']
}));

// ✅ ADDED: Handle preflight requests explicitly
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ADDED: Raw body parser for webhooks (Paystack sends raw JSON)
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'KUCCPS Course Checker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            payments: '/api/payments',
            grades: '/api/grades',
            calculations: '/api/calculations',
            courses: '/api/courses',
            institutions: '/api/institutions'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Function to run migrations
const runMigrations = async () => {
    try {
        console.log('🔄 Checking if migrations need to run...');
        
        // Check if users table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('📦 Tables not found. Running migrations...');
            
            const { exec } = require('child_process');
            exec('npm run migrate', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Migration failed:', error);
                    return;
                }
                console.log(stdout);
                if (stderr) console.error(stderr);
                console.log('✅ Migrations completed');
            });
        } else {
            console.log('✅ Tables already exist');
        }
    } catch (error) {
        console.error('❌ Error checking tables:', error);
    }
};

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (dbConnected) {
            console.log('✅ Database connected successfully');
            // Run migrations if database is connected
            await runMigrations();
        } else {
            console.warn('⚠️  Warning: Database connection failed. Server will start but database features may not work.');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
            console.log(`📚 Database: ${dbConnected ? 'Connected ✅' : 'Disconnected ❌'}`);
            console.log(`🌐 Allowed origins: https://kuccps-calculator-1.onrender.com, localhost`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
