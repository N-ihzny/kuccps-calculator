-- Migration 001: Create all tables for PostgreSQL with VARCHAR IDs

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    index_number VARCHAR(50) UNIQUE,
    exam_year INTEGER,
    school_name VARCHAR(255),
    county VARCHAR(100),
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    payment_status BOOLEAN DEFAULT FALSE,
    auth_provider VARCHAR(10) DEFAULT 'local' CHECK (auth_provider IN ('local', 'google', 'facebook', 'apple')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- GRADE POINTS MAPPING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS grade_points (
    grade VARCHAR(2) PRIMARY KEY,
    points INTEGER NOT NULL,
    description VARCHAR(50)
);

-- =====================================================
-- INSTITUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('university', 'kmtc', 'ttc', 'tvet', 'national_polytechnic', 'other')),
    category VARCHAR(20) DEFAULT 'public' CHECK (category IN ('public', 'private', 'constituent')),
    location VARCHAR(255),
    county VARCHAR(100),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    established_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    subject_group INTEGER NOT NULL,
    is_compulsory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COURSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    program_type VARCHAR(20) NOT NULL CHECK (program_type IN ('degree', 'diploma', 'certificate', 'kmtc', 'artisan', 'craft', 'higher_diploma', 'masters', 'phd')),
    duration_years DECIMAL(3,1),
    degree_type VARCHAR(100) DEFAULT 'Bachelor',
    description TEXT,
    career_opportunities TEXT,
    cut_off_points DECIMAL(5,2),
    demand_level INTEGER DEFAULT 50,
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COURSE REQUIREMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_requirements (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_code VARCHAR(20) NOT NULL,
    minimum_grade VARCHAR(5) NOT NULL,
    weight INTEGER DEFAULT 1,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRANSACTIONS TABLE (UPDATED with VARCHAR user_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(10) DEFAULT 'mpesa' CHECK (payment_method IN ('mpesa', 'card', 'bank')),
    metadata JSONB,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- GRADES TABLE (UPDATED with VARCHAR user_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grades_data JSONB NOT NULL,
    mean_grade VARCHAR(5),
    total_points INTEGER,
    subject_count INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- RESULTS TABLE (UPDATED with VARCHAR user_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_type VARCHAR(20) NOT NULL CHECK (program_type IN ('degree', 'diploma', 'certificate', 'kmtc', 'artisan', 'craft', 'higher_diploma')),
    results_data JSONB NOT NULL,
    summary JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- USER SESSIONS TABLE (UPDATED with VARCHAR user_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATIONS TABLE (UPDATED with VARCHAR user_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(10) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FEEDBACK TABLE (UPDATED with VARCHAR user_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COUNTIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS counties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
