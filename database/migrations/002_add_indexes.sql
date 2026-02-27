-- Migration 002: Add all indexes for performance

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_index_number ON users(index_number);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- INSTITUTIONS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);
CREATE INDEX IF NOT EXISTS idx_institutions_category ON institutions(category);
CREATE INDEX IF NOT EXISTS idx_institutions_county ON institutions(county);
CREATE INDEX IF NOT EXISTS idx_institutions_code ON institutions(code);
CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions(name);
CREATE INDEX IF NOT EXISTS idx_institutions_is_active ON institutions(is_active);

-- =====================================================
-- SUBJECTS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_subjects_group ON subjects(subject_group);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);

-- =====================================================
-- COURSES TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_courses_institution_id ON courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_courses_program_type ON courses(program_type);
CREATE INDEX IF NOT EXISTS idx_courses_cut_off_points ON courses(cut_off_points);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);

-- =====================================================
-- TRANSACTIONS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- =====================================================
-- GRADES TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_grades_user_id ON grades(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_created_at ON grades(created_at);

-- =====================================================
-- RESULTS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_program_type ON results(program_type);

-- =====================================================
-- NOTIFICATIONS TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- FEEDBACK TABLE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

SELECT 'All indexes created successfully' as result;
