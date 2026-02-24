-- Migration 002: Add all indexes for performance (with proper existence checks)
USE kuccps_calculator;

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================
SET @dbname = DATABASE();
SET @tablename = 'users';

-- Check and create idx_users_email
SET @idxname = 'idx_users_email';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (email)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_users_index_number
SET @idxname = 'idx_users_index_number';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (index_number)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_users_phone
SET @idxname = 'idx_users_phone';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (phone)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_users_payment_status
SET @idxname = 'idx_users_payment_status';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (payment_status)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_users_role
SET @idxname = 'idx_users_role';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (role)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_users_created_at
SET @idxname = 'idx_users_created_at';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (created_at)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- INSTITUTIONS TABLE INDEXES
-- =====================================================
SET @tablename = 'institutions';

-- Check and create idx_institutions_type
SET @idxname = 'idx_institutions_type';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (type)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_institutions_category
SET @idxname = 'idx_institutions_category';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (category)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_institutions_county
SET @idxname = 'idx_institutions_county';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (county)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_institutions_code
SET @idxname = 'idx_institutions_code';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (code)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_institutions_name
SET @idxname = 'idx_institutions_name';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (name(100))'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_institutions_is_active
SET @idxname = 'idx_institutions_is_active';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (is_active)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- SUBJECTS TABLE INDEXES
-- =====================================================
SET @tablename = 'subjects';

-- Check and create idx_subjects_group
SET @idxname = 'idx_subjects_group';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (subject_group)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_subjects_code
SET @idxname = 'idx_subjects_code';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (code)'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create idx_subjects_name
SET @idxname = 'idx_subjects_name';
SET @exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = @idxname);
SET @sql = IF(@exists = 0, CONCAT('CREATE INDEX ', @idxname, ' ON ', @tablename, ' (name(50))'), 'SELECT "Index already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Add more indexes as needed following the same pattern
-- =====================================================

SELECT 'All indexes processed' as result;