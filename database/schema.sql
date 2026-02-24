-- KUCCPS Course Calculator Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS kuccps_calculator;
USE kuccps_calculator;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    index_number VARCHAR(50) UNIQUE,
    exam_year INT,
    school_name VARCHAR(255),
    county VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user',
    payment_status BOOLEAN DEFAULT FALSE,
    auth_provider ENUM('local', 'google', 'facebook', 'apple') DEFAULT 'local',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_index_number (index_number),
    INDEX idx_phone (phone)
);

-- =====================================================
-- SUBJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    subject_group INT NOT NULL COMMENT '1=Compulsory, 2=Sciences, 3=Humanities, 4=Technical, 5=Languages',
    is_compulsory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_group (subject_group),
    INDEX idx_code (code)
);

-- =====================================================
-- INSTITUTIONS TABLE (ALL Kenyan Institutions)
-- =====================================================
CREATE TABLE IF NOT EXISTS institutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    type ENUM('university', 'kmtc', 'ttc', 'tvet', 'national_polytechnic', 'other') NOT NULL,
    category ENUM('public', 'private', 'constituent') DEFAULT 'public',
    location VARCHAR(255),
    county VARCHAR(100),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    established_year INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_county (county),
    INDEX idx_location (location),
    INDEX idx_active (is_active)
);

-- =====================================================
-- COURSES TABLE (ALL Kenyan Courses)
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    program_type ENUM('degree', 'diploma', 'certificate', 'kmtc', 'artisan', 'craft', 'higher_diploma', 'masters', 'phd') NOT NULL,
    duration_years DECIMAL(3,1),
    degree_type VARCHAR(100) DEFAULT 'Bachelor',
    description TEXT,
    career_opportunities TEXT,
    cut_off_points DECIMAL(5,2),
    demand_level INT DEFAULT 50 COMMENT '1-100, higher means more competitive',
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    INDEX idx_program_type (program_type),
    INDEX idx_institution (institution_id),
    INDEX idx_cut_off (cut_off_points),
    INDEX idx_active (is_active),
    INDEX idx_name_search (name(100))
);

-- =====================================================
-- COURSE REQUIREMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_requirements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    minimum_grade VARCHAR(5) NOT NULL,
    weight INT DEFAULT 1 COMMENT 'Subject weight in cluster calculation',
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_subject (subject_code)
);

-- =====================================================
-- GRADE POINTS MAPPING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS grade_points (
    grade VARCHAR(2) PRIMARY KEY,
    points INT NOT NULL,
    description VARCHAR(50)
);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount INT NOT NULL COMMENT 'Amount in KES',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('mpesa', 'card', 'bank') DEFAULT 'mpesa',
    metadata JSON,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_reference (reference),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- =====================================================
-- GRADES TABLE (Student entered grades)
-- =====================================================
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    grades_data JSON NOT NULL COMMENT 'JSON object of subject:grade pairs',
    mean_grade VARCHAR(5),
    total_points INT,
    subject_count INT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_grades (user_id),
    INDEX idx_created_grades (created_at)
);

-- =====================================================
-- RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    program_type ENUM('degree', 'diploma', 'certificate', 'kmtc', 'artisan', 'craft', 'higher_diploma') NOT NULL,
    results_data JSON NOT NULL,
    summary JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_results (user_id),
    INDEX idx_program_results (program_type)
);

-- =====================================================
-- INSERT GRADE POINTS
-- =====================================================
INSERT INTO grade_points (grade, points, description) VALUES
('A', 12, 'Excellent'),
('A-', 11, 'Very Good'),
('B+', 10, 'Good'),
('B', 9, 'Above Average'),
('B-', 8, 'Average'),
('C+', 7, 'Below Average'),
('C', 6, 'Credit'),
('C-', 5, 'Pass'),
('D+', 4, 'Weak Pass'),
('D', 3, 'Fail'),
('D-', 2, 'Poor'),
('E', 1, 'Very Poor');

-- =====================================================
-- INSERT ALL SUBJECTS
-- =====================================================
INSERT INTO subjects (name, code, subject_group, is_compulsory) VALUES
-- Group 1: Compulsory
('Mathematics', 'MAT', 1, TRUE),
('English', 'ENG', 1, TRUE),
('Kiswahili', 'KIS', 1, TRUE),

-- Group 2: Sciences
('Chemistry', 'CHE', 2, FALSE),
('Biology', 'BIO', 2, FALSE),
('Physics', 'PHY', 2, FALSE),
('General Science', 'SCI', 2, FALSE),
('Physical Science', 'PHS', 2, FALSE),
('Biological Science', 'BIS', 2, FALSE),

-- Group 3: Humanities
('History and Government', 'HIS', 3, FALSE),
('Geography', 'GEO', 3, FALSE),
('Christian Religious Education', 'CRE', 3, FALSE),
('Islamic Religious Education', 'IRE', 3, FALSE),
('Hindu Religious Education', 'HRE', 3, FALSE),

-- Group 4: Technical
('Business Studies', 'BUS', 4, FALSE),
('Agriculture', 'AGR', 4, FALSE),
('Computer Studies', 'COM', 4, FALSE),
('Home Science', 'HSC', 4, FALSE),
('Art and Design', 'ART', 4, FALSE),
('Woodwork', 'WDW', 4, FALSE),
('Metalwork', 'MTW', 4, FALSE),
('Building and Construction', 'BLD', 4, FALSE),
('Electricity and Electronics', 'ELE', 4, FALSE),
('Power Mechanics', 'PWR', 4, FALSE),
('Drawing and Design', 'DRW', 4, FALSE),
('Music', 'MUS', 4, FALSE),
('Aviation Technology', 'AVT', 4, FALSE),
('Marine Engineering', 'MAR', 4, FALSE),

-- Group 5: Languages
('French', 'FRE', 5, FALSE),
('German', 'GER', 5, FALSE),
('Arabic', 'ARA', 5, FALSE),
('Kenya Sign Language', 'KSL', 5, FALSE),
('Chinese (Mandarin)', 'CHI', 5, FALSE);

-- =====================================================
-- INSERT ALL KENYAN INSTITUTIONS
-- =====================================================

-- =====================================================
-- PUBLIC UNIVERSITIES (31)
-- =====================================================
INSERT INTO institutions (name, code, type, category, location, county, website) VALUES
('University of Nairobi', 'UON', 'university', 'public', 'Nairobi', 'Nairobi', 'https://www.uonbi.ac.ke'),
('Kenyatta University', 'KU', 'university', 'public', 'Nairobi', 'Nairobi', 'https://www.ku.ac.ke'),
('Moi University', 'MU', 'university', 'public', 'Eldoret', 'Uasin Gishu', 'https://www.mu.ac.ke'),
('Jomo Kenyatta University of Agriculture and Technology', 'JKUAT', 'university', 'public', 'Juja', 'Kiambu', 'https://www.jkuat.ac.ke'),
('Egerton University', 'EGU', 'university', 'public', 'Njoro', 'Nakuru', 'https://www.egerton.ac.ke'),
('Maseno University', 'MSU', 'university', 'public', 'Maseno', 'Kisumu', 'https://www.maseno.ac.ke'),
('Masinde Muliro University of Science and Technology', 'MMUST', 'university', 'public', 'Kakamega', 'Kakamega', 'https://www.mmust.ac.ke'),
('Technical University of Kenya', 'TUK', 'university', 'public', 'Nairobi', 'Nairobi', 'https://www.tuk.ac.ke'),
('Technical University of Mombasa', 'TUM', 'university', 'public', 'Mombasa', 'Mombasa', 'https://www.tum.ac.ke'),
('Dedan Kimathi University of Technology', 'DKUT', 'university', 'public', 'Nyeri', 'Nyeri', 'https://www.dkut.ac.ke'),
('Chuka University', 'CUK', 'university', 'public', 'Chuka', 'Tharaka Nithi', 'https://www.chuka.ac.ke'),
('South Eastern Kenya University', 'SEKU', 'university', 'public', 'Kitui', 'Kitui', 'https://www.seku.ac.ke'),
('Meru University of Science and Technology', 'MUST', 'university', 'public', 'Meru', 'Meru', 'https://www.must.ac.ke'),
('Kisii University', 'KSU', 'university', 'public', 'Kisii', 'Kisii', 'https://www.kisiiuniversity.ac.ke'),
('University of Eldoret', 'UOE', 'university', 'public', 'Eldoret', 'Uasin Gishu', 'https://www.uoeld.ac.ke'),
('Maasai Mara University', 'MMU', 'university', 'public', 'Narok', 'Narok', 'https://www.mmarau.ac.ke'),
('Laikipia University', 'LAIKI', 'university', 'public', 'Nyahururu', 'Laikipia', 'https://www.laikipia.ac.ke'),
('University of Kabianga', 'UOK', 'university', 'public', 'Kericho', 'Kericho', 'https://www.kabianga.ac.ke'),
('Karatu University', 'KARU', 'university', 'public', 'Karatu', 'Narok', NULL),
('Muranga University of Technology', 'MUT', 'university', 'public', 'Muranga', 'Muranga', 'https://www.mut.ac.ke'),
('Multimedia University of Kenya', 'MMU', 'university', 'public', 'Nairobi', 'Nairobi', 'https://www.mmu.ac.ke'),
('Kaimosi Friends University College', 'KAFUCO', 'university', 'public', 'Kaimosi', 'Vihiga', NULL),
('Rongo University', 'RU', 'university', 'public', 'Rongo', 'Migori', 'https://www.rongovarsity.ac.ke'),
('Taita Taveta University', 'TTU', 'university', 'public', 'Voi', 'Taita Taveta', 'https://www.ttu.ac.ke'),
('Garissa University', 'GUA', 'university', 'public', 'Garissa', 'Garissa', 'https://www.gu.ac.ke'),
('Kirinyaga University', 'KYU', 'university', 'public', 'Kerugoya', 'Kirinyaga', 'https://www.kyu.ac.ke'),
('Machakos University', 'MKS', 'university', 'public', 'Machakos', 'Machakos', 'https://www.mksu.ac.ke'),
('Cooperative University of Kenya', 'CUK', 'university', 'public', 'Nairobi', 'Nairobi', 'https://www.cuk.ac.ke'),
('University of Embu', 'UOEM', 'university', 'public', 'Embu', 'Embu', 'https://www.embuni.ac.ke'),
('Alupe University', 'ALUPE', 'university', 'public', 'Alupe', 'Busia', NULL),
('Kibabii University', 'KIBU', 'university', 'public', 'Bungoma', 'Bungoma', 'https://www.kibu.ac.ke');

-- =====================================================
-- PRIVATE UNIVERSITIES (18)
-- =====================================================
INSERT INTO institutions (name, code, type, category, location, county, website) VALUES
('Strathmore University', 'STRATH', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.strathmore.edu'),
('United States International University Africa', 'USIU', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.usiu.ac.ke'),
('Catholic University of Eastern Africa', 'CUEA', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.cuea.edu'),
('Daystar University', 'DAY', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.daystar.ac.ke'),
('Africa Nazarene University', 'ANU', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.anu.ac.ke'),
('Mount Kenya University', 'MKU', 'university', 'private', 'Thika', 'Kiambu', 'https://www.mku.ac.ke'),
('KCA University', 'KCA', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.kca.ac.ke'),
('Kabarak University', 'KAB', 'university', 'private', 'Nakuru', 'Nakuru', 'https://www.kabarak.ac.ke'),
('Scott Christian University', 'SCU', 'university', 'private', 'Machakos', 'Machakos', 'https://www.scott.ac.ke'),
('Pan Africa Christian University', 'PAC', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.pacuniversity.ac.ke'),
('St. Paul\'s University', 'SPU', 'university', 'private', 'Limuru', 'Kiambu', 'https://www.spu.ac.ke'),
('Presbyterian University of East Africa', 'PUEA', 'university', 'private', 'Kikuyu', 'Kiambu', 'https://www.puea.ac.ke'),
('Great Lakes University of Kisumu', 'GLUK', 'university', 'private', 'Kisumu', 'Kisumu', 'https://www.gluk.ac.ke'),
('Kenya Methodist University', 'KEMU', 'university', 'private', 'Meru', 'Meru', 'https://www.kemu.ac.ke'),
('Adventist University of Africa', 'AUA', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.aua.ac.ke'),
('University of Eastern Africa, Baraton', 'UEAB', 'university', 'private', 'Eldoret', 'Uasin Gishu', 'https://www.ueab.ac.ke'),
('Inoorero University', 'INU', 'university', 'private', 'Nairobi', 'Nairobi', NULL),
('Riara University', 'RIARA', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.riarauniversity.ac.ke'),
('Zetech University', 'ZETECH', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.zetech.ac.ke'),
('Kiriri Women\'s University of Science and Technology', 'KWUST', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.kwust.ac.ke'),
('Management University of Africa', 'MUA', 'university', 'private', 'Nairobi', 'Nairobi', 'https://www.mua.ac.ke'),
('Pioneer International University', 'PIU', 'university', 'private', 'Nairobi', 'Nairobi', NULL),
('Uzima University College', 'UZIMA', 'university', 'private', 'Kisumu', 'Kisumu', NULL),
('Genco University', 'GENCO', 'university', 'private', 'Nairobi', 'Nairobi', NULL);

-- =====================================================
-- CONSTITUENT UNIVERSITY COLLEGES (15)
-- =====================================================
INSERT INTO institutions (name, code, type, category, location, county) VALUES
('Embu University College', 'EMBU-UC', 'university', 'constituent', 'Embu', 'Embu'),
('Kabianga University College', 'KAB-UC', 'university', 'constituent', 'Kericho', 'Kericho'),
('Kisii University College', 'KIS-UC', 'university', 'constituent', 'Kisii', 'Kisii'),
('Mombasa Campus', 'MBS-C', 'university', 'constituent', 'Mombasa', 'Mombasa'),
('Nairobi Campus', 'NRB-C', 'university', 'constituent', 'Nairobi', 'Nairobi'),
('Kitui Campus', 'KTU-C', 'university', 'constituent', 'Kitui', 'Kitui'),
('Garissa Campus', 'GRS-C', 'university', 'constituent', 'Garissa', 'Garissa'),
('Lodwar Campus', 'LDW-C', 'university', 'constituent', 'Lodwar', 'Turkana'),
('Marsabit Campus', 'MRS-C', 'university', 'constituent', 'Marsabit', 'Marsabit'),
('Wajir Campus', 'WJR-C', 'university', 'constituent', 'Wajir', 'Wajir'),
('Mandera Campus', 'MND-C', 'university', 'constituent', 'Mandera', 'Mandera'),
('Lamu Campus', 'LMU-C', 'university', 'constituent', 'Lamu', 'Lamu'),
('Isiolo Campus', 'ISL-C', 'university', 'constituent', 'Isiolo', 'Isiolo'),
('Samburu Campus', 'SBR-C', 'university', 'constituent', 'Maralal', 'Samburu'),
('Kakamega Campus', 'KKM-C', 'university', 'constituent', 'Kakamega', 'Kakamega');

-- =====================================================
-- KMTC CAMPUSES (ALL 71 Campuses)
-- =====================================================
INSERT INTO institutions (name, code, type, category, location, county) VALUES
('KMTC Nairobi', 'KMTC-NRB', 'kmtc', 'public', 'Nairobi', 'Nairobi'),
('KMTC Mombasa', 'KMTC-MSA', 'kmtc', 'public', 'Mombasa', 'Mombasa'),
('KMTC Kisumu', 'KMTC-KSM', 'kmtc', 'public', 'Kisumu', 'Kisumu'),
('KMTC Eldoret', 'KMTC-ELD', 'kmtc', 'public', 'Eldoret', 'Uasin Gishu'),
('KMTC Nakuru', 'KMTC-NKR', 'kmtc', 'public', 'Nakuru', 'Nakuru'),
('KMTC Meru', 'KMTC-MRU', 'kmtc', 'public', 'Meru', 'Meru'),
('KMTC Machakos', 'KMTC-MKS', 'kmtc', 'public', 'Machakos', 'Machakos'),
('KMTC Nyeri', 'KMTC-NYI', 'kmtc', 'public', 'Nyeri', 'Nyeri'),
('KMTC Kakamega', 'KMTC-KKG', 'kmtc', 'public', 'Kakamega', 'Kakamega'),
('KMTC Kisii', 'KMTC-KSI', 'kmtc', 'public', 'Kisii', 'Kisii'),
('KMTC Thika', 'KMTC-THK', 'kmtc', 'public', 'Thika', 'Kiambu'),
('KMTC Embu', 'KMTC-EMB', 'kmtc', 'public', 'Embu', 'Embu'),
('KMTC Kitale', 'KMTC-KTL', 'kmtc', 'public', 'Kitale', 'Trans Nzoia'),
('KMTC Kericho', 'KMTC-KRC', 'kmtc', 'public', 'Kericho', 'Kericho'),
('KMTC Garissa', 'KMTC-GRS', 'kmtc', 'public', 'Garissa', 'Garissa'),
('KMTC Bungoma', 'KMTC-BGM', 'kmtc', 'public', 'Bungoma', 'Bungoma'),
('KMTC Busia', 'KMTC-BSA', 'kmtc', 'public', 'Busia', 'Busia'),
('KMTC Homa Bay', 'KMTC-HBY', 'kmtc', 'public', 'Homa Bay', 'Homa Bay'),
('KMTC Kapenguria', 'KMTC-KPG', 'kmtc', 'public', 'Kapenguria', 'West Pokot'),
('KMTC Kitui', 'KMTC-KTI', 'kmtc', 'public', 'Kitui', 'Kitui'),
('KMTC Lodwar', 'KMTC-LDW', 'kmtc', 'public', 'Lodwar', 'Turkana'),
('KMTC Makueni', 'KMTC-MKN', 'kmtc', 'public', 'Makueni', 'Makueni'),
('KMTC Mandera', 'KMTC-MDR', 'kmtc', 'public', 'Mandera', 'Mandera'),
('KMTC Marsabit', 'KMTC-MRS', 'kmtc', 'public', 'Marsabit', 'Marsabit'),
('KMTC Migori', 'KMTC-MGR', 'kmtc', 'public', 'Migori', 'Migori'),
('KMTC Muranga', 'KMTC-MRA', 'kmtc', 'public', 'Muranga', 'Muranga'),
('KMTC Nyamira', 'KMTC-NYM', 'kmtc', 'public', 'Nyamira', 'Nyamira'),
('KMTC Nyandarua', 'KMTC-NDR', 'kmtc', 'public', 'Ol Kalou', 'Nyandarua'),
('KMTC Samburu', 'KMTC-SBR', 'kmtc', 'public', 'Maralal', 'Samburu'),
('KMTC Siaya', 'KMTC-SYA', 'kmtc', 'public', 'Siaya', 'Siaya'),
('KMTC Taita Taveta', 'KMTC-TTV', 'kmtc', 'public', 'Voi', 'Taita Taveta'),
('KMTC Tharaka Nithi', 'KMTC-TNI', 'kmtc', 'public', 'Chuka', 'Tharaka Nithi'),
('KMTC Turkana', 'KMTC-TRK', 'kmtc', 'public', 'Lodwar', 'Turkana'),
('KMTC Vihiga', 'KMTC-VHG', 'kmtc', 'public', 'Vihiga', 'Vihiga'),
('KMTC Wajir', 'KMTC-WJR', 'kmtc', 'public', 'Wajir', 'Wajir'),
('KMTC West Pokot', 'KMTC-WPK', 'kmtc', 'public', 'Kapenguria', 'West Pokot'),
('KMTC Baringo', 'KMTC-BRG', 'kmtc', 'public', 'Kabarnet', 'Baringo'),
('KMTC Bomet', 'KMTC-BMT', 'kmtc', 'public', 'Bomet', 'Bomet'),
('KMTC Elgeyo Marakwet', 'KMTC-EMR', 'kmtc', 'public', 'Iten', 'Elgeyo Marakwet'),
('KMTC Isiolo', 'KMTC-ISO', 'kmtc', 'public', 'Isiolo', 'Isiolo'),
('KMTC Kajiado', 'KMTC-KJD', 'kmtc', 'public', 'Kajiado', 'Kajiado'),
('KMTC Kilifi', 'KMTC-KLF', 'kmtc', 'public', 'Kilifi', 'Kilifi'),
('KMTC Kirinyaga', 'KMTC-KRG', 'kmtc', 'public', 'Kerugoya', 'Kirinyaga'),
('KMTC Kwale', 'KMTC-KWL', 'kmtc', 'public', 'Kwale', 'Kwale'),
('KMTC Laikipia', 'KMTC-LKP', 'kmtc', 'public', 'Nanyuki', 'Laikipia'),
('KMTC Lamu', 'KMTC-LMU', 'kmtc', 'public', 'Lamu', 'Lamu'),
('KMTC Narok', 'KMTC-NRK', 'kmtc', 'public', 'Narok', 'Narok'),
('KMTC Nandi', 'KMTC-NDI', 'kmtc', 'public', 'Kapsabet', 'Nandi'),
('KMTC Tana River', 'KMTC-TRV', 'kmtc', 'public', 'Hola', 'Tana River'),
('KMTC Trans Nzoia', 'KMTC-TNZ', 'kmtc', 'public', 'Kitale', 'Trans Nzoia'),
('KMTC Uasin Gishu', 'KMTC-UGS', 'kmtc', 'public', 'Eldoret', 'Uasin Gishu');

-- =====================================================
-- TEACHER TRAINING COLLEGES (ALL TTCs)
-- =====================================================
INSERT INTO institutions (name, code, type, category, location, county) VALUES
('Kenya Science Teachers College', 'KSTC', 'ttc', 'public', 'Nairobi', 'Nairobi'),
('Kagumo Teachers College', 'KGTC', 'ttc', 'public', 'Kagumo', 'Nyeri'),
('Eregi Teachers College', 'EGTC', 'ttc', 'public', 'Eregi', 'Kakamega'),
('Machakos Teachers College', 'MKTC', 'ttc', 'public', 'Machakos', 'Machakos'),
('Meru Teachers College', 'MRTC', 'ttc', 'public', 'Meru', 'Meru'),
('Kisii Teachers College', 'KSTC', 'ttc', 'public', 'Kisii', 'Kisii'),
('Mombasa Teachers College', 'MBTC', 'ttc', 'public', 'Mombasa', 'Mombasa'),
('Nakuru Teachers College', 'NKTC', 'ttc', 'public', 'Nakuru', 'Nakuru'),
('Kitui Teachers College', 'KTTC', 'ttc', 'public', 'Kitui', 'Kitui'),
('Kilimambogo Teachers College', 'KLTC', 'ttc', 'public', 'Kilimambogo', 'Kiambu'),
('Kamwenja Teachers College', 'KWTC', 'ttc', 'public', 'Nyeri', 'Nyeri'),
('Thogoto Teachers College', 'TGTC', 'ttc', 'public', 'Thogoto', 'Kiambu'),
('Narok Teachers College', 'NRTC', 'ttc', 'public', 'Narok', 'Narok'),
('Shanzu Teachers College', 'SZT', 'ttc', 'public', 'Shanzu', 'Mombasa'),
('Asumbi Teachers College', 'ASTC', 'ttc', 'public', 'Asumbi', 'Homa Bay'),
('Kagwe Teachers College', 'KGWC', 'ttc', 'public', 'Kagwe', 'Kiambu'),
('Mosoriot Teachers College', 'MSTC', 'ttc', 'public', 'Mosoriot', 'Nandi'),
('Kericho Teachers College', 'KRTC', 'ttc', 'public', 'Kericho', 'Kericho'),
('Bondo Teachers College', 'BDTC', 'ttc', 'public', 'Bondo', 'Siaya'),
('Kakamega Teachers College', 'KKTC', 'ttc', 'public', 'Kakamega', 'Kakamega'),
('Riabai Teachers College', 'RBTC', 'ttc', 'public', 'Riabai', 'Meru'),
('Kibabii Diploma Teachers College', 'KBDTC', 'ttc', 'public', 'Kibabii', 'Bungoma'),
('Garissa Teachers College', 'GRTC', 'ttc', 'public', 'Garissa', 'Garissa'),
('Mandera Teachers College', 'MDTC', 'ttc', 'public', 'Mandera', 'Mandera'),
('Wajir Teachers College', 'WJTC', 'ttc', 'public', 'Wajir', 'Wajir'),
('Marsabit Teachers College', 'MBTC', 'ttc', 'public', 'Marsabit', 'Marsabit'),
('Lodwar Teachers College', 'LDTC', 'ttc', 'public', 'Lodwar', 'Turkana');

-- =====================================================
-- NATIONAL POLYTECHNICS (11)
-- =====================================================
INSERT INTO institutions (name, code, type, category, location, county) VALUES
('Kenya Coast National Polytechnic', 'KCNP', 'national_polytechnic', 'public', 'Mombasa', 'Mombasa'),
('Eldoret National Polytechnic', 'ENP', 'national_polytechnic', 'public', 'Eldoret', 'Uasin Gishu'),
('Kisumu National Polytechnic', 'KNP', 'national_polytechnic', 'public', 'Kisumu', 'Kisumu'),
('Nyeri National Polytechnic', 'NNP', 'national_polytechnic', 'public', 'Nyeri', 'Nyeri'),
('Meru National Polytechnic', 'MNP', 'national_polytechnic', 'public', 'Meru', 'Meru'),
('Machakos National Polytechnic', 'MKN', 'national_polytechnic', 'public', 'Machakos', 'Machakos'),
('Nairobi Technical Training Institute', 'NTTI', 'national_polytechnic', 'public', 'Nairobi', 'Nairobi'),
('Kabete National Polytechnic', 'KBNP', 'national_polytechnic', 'public', 'Kabete', 'Kiambu'),
('Kaiboi National Polytechnic', 'KBN', 'national_polytechnic', 'public', 'Kaiboi', 'Nandi'),
('Kitale National Polytechnic', 'KTNP', 'national_polytechnic', 'public', 'Kitale', 'Trans Nzoia'),
('Sigalame National Polytechnic', 'SNP', 'national_polytechnic', 'public', 'Sigalame', 'Kakamega');

-- =====================================================
-- TVET INSTITUTIONS (ALL TVETs)
-- =====================================================
INSERT INTO institutions (name, code, type, category, location, county) VALUES
('Kenya Institute of Management', 'KIM', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('Kenya Utalii College', 'KUC', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Railway Training Institute', 'RTI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Institute of Highways and Building Technology', 'KIHBT', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Medical Training College (Headquarters)', 'KMTC-HQ', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Forestry College', 'KFC', 'tvet', 'public', 'Londiani', 'Kericho'),
('Kenya Water Institute', 'KEWI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Institute of Mass Communication', 'KIMC', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Institute of Special Education', 'KISE', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Institute of Social Work and Community Development', 'KISWCD', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('Strathmore College', 'STRATH-C', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('Nairobi Aviation College', 'NAC', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('East African School of Aviation', 'EASA', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya School of Monetary Studies', 'KSMS', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Institute of Bankers', 'KIB', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('Kenya Institute of Insurance', 'KII', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('Kenya Institute of Supplies Management', 'KISM', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('Kenya Institute of Public Policy and Research Analysis', 'KIPPRA', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya School of Government', 'KSG', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Industrial Training Institute', 'KITI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Industrial Research and Development Institute', 'KIRDI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Plant Health Inspectorate Service', 'KEPHIS', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Bureau of Standards', 'KEBS', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Wildlife Service Training Institute', 'KWSTI', 'tvet', 'public', 'Nanyuki', 'Laikipia'),
('Kenya Marine and Fisheries Research Institute', 'KMFRI', 'tvet', 'public', 'Kisumu', 'Kisumu'),
('Kenya Agricultural and Livestock Research Organization', 'KALRO', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Forest Research Institute', 'KEFRI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Medical Research Institute', 'KEMRI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Trypanosomiasis Research Institute', 'KETRI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Veterinary Vaccines Production Institute', 'KEVEVAPI', 'tvet', 'public', 'Nairobi', 'Nairobi');

-- =====================================================
-- INSERT ALL DEGREE COURSES
-- =====================================================

-- University of Nairobi Courses (UON)
INSERT INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points, demand_level) VALUES
(1, 'Bachelor of Medicine and Surgery', 'UON-MED', 'degree', 6, 41.5, 98),
(1, 'Bachelor of Dental Surgery', 'UON-DENT', 'degree', 5, 40.2, 95),
(1, 'Bachelor of Pharmacy', 'UON-PHARM', 'degree', 5, 38.5, 92),
(1, 'Bachelor of Nursing', 'UON-NURS', 'degree', 4, 37.0, 88),
(1, 'Bachelor of Law (LLB)', 'UON-LLB', 'degree', 4, 39.5, 94),
(1, 'Bachelor of Computer Science', 'UON-CS', 'degree', 4, 35.0, 85),
(1, 'Bachelor of Electrical Engineering', 'UON-ELEC', 'degree', 5, 36.5, 86),
(1, 'Bachelor of Mechanical Engineering', 'UON-MECH', 'degree', 5, 36.0, 85),
(1, 'Bachelor of Civil Engineering', 'UON-CIVIL', 'degree', 5, 35.8, 84),
(1, 'Bachelor of Architecture', 'UON-ARCH', 'degree', 5, 34.5, 80),
(1, 'Bachelor of Economics', 'UON-ECON', 'degree', 4, 32.0, 75),
(1, 'Bachelor of Commerce', 'UON-COMM', 'degree', 4, 33.0, 78),
(1, 'Bachelor of Science in Actuarial Science', 'UON-ACT', 'degree', 4, 34.0, 82),
(1, 'Bachelor of Science in Statistics', 'UON-STAT', 'degree', 4, 32.5, 76),
(1, 'Bachelor of Science in Mathematics', 'UON-MATH', 'degree', 4, 31.0, 70),
(1, 'Bachelor of Education (Arts)', 'UON-EDU-ARTS', 'degree', 4, 29.5, 65),
(1, 'Bachelor of Education (Science)', 'UON-EDU-SCI', 'degree', 4, 31.0, 68),
(1, 'Bachelor of Arts in Economics', 'UON-BA-ECON', 'degree', 4, 30.5, 66),
(1, 'Bachelor of Arts in Sociology', 'UON-SOC', 'degree', 4, 28.5, 60),
(1, 'Bachelor of Arts in Political Science', 'UON-POL', 'degree', 4, 29.0, 62),
(1, 'Bachelor of Arts in History', 'UON-HIS', 'degree', 4, 28.0, 58),
(1, 'Bachelor of Arts in Geography', 'UON-GEO', 'degree', 4, 28.0, 58),
(1, 'Bachelor of Arts in Kiswahili', 'UON-KIS', 'degree', 4, 27.5, 55),
(1, 'Bachelor of Arts in Literature', 'UON-LIT', 'degree', 4, 28.0, 57),
(1, 'Bachelor of Journalism', 'UON-JOURN', 'degree', 4, 31.0, 72),
(1, 'Bachelor of Mass Communication', 'UON-MASS', 'degree', 4, 32.0, 74),
(1, 'Bachelor of Public Relations', 'UON-PR', 'degree', 4, 31.5, 71),
(1, 'Bachelor of Fine Art', 'UON-FINE', 'degree', 4, 29.0, 63),
(1, 'Bachelor of Design', 'UON-DESIGN', 'degree', 4, 29.5, 64),
(1, 'Bachelor of Music', 'UON-MUSIC', 'degree', 4, 28.5, 59),
(1, 'Bachelor of Theatre Arts', 'UON-THEATRE', 'degree', 4, 28.0, 56),
(1, 'Bachelor of Veterinary Medicine', 'UON-VET', 'degree', 5, 35.0, 80),
(1, 'Bachelor of Agriculture', 'UON-AGRI', 'degree', 4, 30.5, 68),
(1, 'Bachelor of Food Science', 'UON-FOOD', 'degree', 4, 31.5, 70),
(1, 'Bachelor of Environmental Science', 'UON-ENV', 'degree', 4, 31.0, 69),
(1, 'Bachelor of Forestry', 'UON-FOREST', 'degree', 4, 30.0, 65),
(1, 'Bachelor of Wildlife Management', 'UON-WILDLIFE', 'degree', 4, 30.5, 66),
(1, 'Bachelor of Tourism Management', 'UON-TOUR', 'degree', 4, 32.0, 73),
(1, 'Bachelor of Hospitality Management', 'UON-HOSP', 'degree', 4, 31.5, 71),
(1, 'Bachelor of Real Estate', 'UON-RE', 'degree', 4, 32.5, 74),
(1, 'Bachelor of Land Economics', 'UON-LAND', 'degree', 4, 33.0, 76),
(1, 'Bachelor of Quantity Surveying', 'UON-QS', 'degree', 4, 33.5, 77),
(1, 'Bachelor of Construction Management', 'UON-CONST', 'degree', 4, 32.0, 72),
(1, 'Bachelor of Urban Planning', 'UON-URBAN', 'degree', 4, 33.0, 75),
(1, 'Bachelor of Spatial Planning', 'UON-SPATIAL', 'degree', 4, 32.5, 73),
(1, 'Bachelor of Geospatial Engineering', 'UON-GEOENG', 'degree', 4, 34.0, 78),
(1, 'Bachelor of Surveying', 'UON-SURV', 'degree', 4, 33.0, 74);

-- Kenyatta University Courses (KU)
INSERT INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points, demand_level) VALUES
(2, 'Bachelor of Medicine and Surgery', 'KU-MED', 'degree', 6, 40.5, 96),
(2, 'Bachelor of Pharmacy', 'KU-PHARM', 'degree', 5, 37.8, 90),
(2, 'Bachelor of Nursing', 'KU-NURS', 'degree', 4, 36.2, 86),
(2, 'Bachelor of Public Health', 'KU-PH', 'degree', 4, 34.5, 82),
(2, 'Bachelor of Education (Arts)', 'KU-EDU-ARTS', 'degree', 4, 30.5, 70),
(2, 'Bachelor of Education (Science)', 'KU-EDU-SCI', 'degree', 4, 32.0, 72),
(2, 'Bachelor of Commerce', 'KU-COMM', 'degree', 4, 32.5, 74),
(2, 'Bachelor of Economics', 'KU-ECON', 'degree', 4, 31.5, 71),
(2, 'Bachelor of Economics and Statistics', 'KU-ECON-STAT', 'degree', 4, 32.0, 73),
(2, 'Bachelor of Business Administration', 'KU-BBA', 'degree', 4, 32.0, 72),
(2, 'Bachelor of Hospitality Management', 'KU-HOSP', 'degree', 4, 30.0, 68),
(2, 'Bachelor of Tourism Management', 'KU-TOUR', 'degree', 4, 30.5, 69),
(2, 'Bachelor of Computer Science', 'KU-CS', 'degree', 4, 34.0, 80),
(2, 'Bachelor of Information Technology', 'KU-IT', 'degree', 4, 33.5, 78),
(2, 'Bachelor of Business Information Technology', 'KU-BIT', 'degree', 4, 33.0, 76),
(2, 'Bachelor of Environmental Studies', 'KU-ENV', 'degree', 4, 29.0, 65),
(2, 'Bachelor of Environmental Science', 'KU-ENV-SCI', 'degree', 4, 29.5, 66),
(2, 'Bachelor of Geography', 'KU-GEO', 'degree', 4, 28.5, 62),
(2, 'Bachelor of History', 'KU-HIS', 'degree', 4, 28.0, 60),
(2, 'Bachelor of Political Science', 'KU-POL', 'degree', 4, 28.5, 61),
(2, 'Bachelor of Sociology', 'KU-SOC', 'degree', 4, 28.0, 60),
(2, 'Bachelor of Psychology', 'KU-PSYCH', 'degree', 4, 31.0, 70),
(2, 'Bachelor of Counselling Psychology', 'KU-COUNS', 'degree', 4, 30.5, 69),
(2, 'Bachelor of Kiswahili', 'KU-KIS', 'degree', 4, 27.5, 58),
(2, 'Bachelor of English', 'KU-ENG', 'degree', 4, 28.0, 59),
(2, 'Bachelor of Literature', 'KU-LIT', 'degree', 4, 27.5, 58),
(2, 'Bachelor of French', 'KU-FRE', 'degree', 4, 27.0, 55),
(2, 'Bachelor of German', 'KU-GER', 'degree', 4, 27.0, 55),
(2, 'Bachelor of Arabic', 'KU-ARA', 'degree', 4, 26.5, 53),
(2, 'Bachelor of Music', 'KU-MUSIC', 'degree', 4, 28.0, 59),
(2, 'Bachelor of Fine Art', 'KU-FINE', 'degree', 4, 28.5, 60),
(2, 'Bachelor of Film and Theatre Arts', 'KU-FILM', 'degree', 4, 29.0, 62),
(2, 'Bachelor of Journalism', 'KU-JOURN', 'degree', 4, 31.5, 72),
(2, 'Bachelor of Mass Communication', 'KU-MASS', 'degree', 4, 32.0, 73),
(2, 'Bachelor of Public Relations', 'KU-PR', 'degree', 4, 31.0, 70),
(2, 'Bachelor of Agriculture', 'KU-AGRI', 'degree', 4, 30.0, 67),
(2, 'Bachelor of Food Science', 'KU-FOOD', 'degree', 4, 31.0, 69),
(2, 'Bachelor of Nutrition', 'KU-NUTR', 'degree', 4, 32.0, 72),
(2, 'Bachelor of Dietetics', 'KU-DIET', 'degree', 4, 32.5, 73),
(2, 'Bachelor of Veterinary Medicine', 'KU-VET', 'degree', 5, 34.5, 78);

-- Moi University Courses (MU)
INSERT INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points, demand_level) VALUES
(3, 'Bachelor of Medicine and Surgery', 'MU-MED', 'degree', 6, 39.5, 94),
(3, 'Bachelor of Dental Surgery', 'MU-DENT', 'degree', 5, 38.0, 90),
(3, 'Bachelor of Pharmacy', 'MU-PHARM', 'degree', 5, 36.5, 87),
(3, 'Bachelor of Nursing', 'MU-NURS', 'degree', 4, 35.0, 83),
(3, 'Bachelor of Public Health', 'MU-PH', 'degree', 4, 33.5, 78),
(3, 'Bachelor of Law (LLB)', 'MU-LLB', 'degree', 4, 37.0, 88),
(3, 'Bachelor of Engineering', 'MU-ENG', 'degree', 5, 34.0, 79),
(3, 'Bachelor of Computer Science', 'MU-CS', 'degree', 4, 32.5, 75),
(3, 'Bachelor of Information Technology', 'MU-IT', 'degree', 4, 32.0, 73),
(3, 'Bachelor of Business Management', 'MU-BM', 'degree', 4, 31.0, 70),
(3, 'Bachelor of Economics', 'MU-ECON', 'degree', 4, 30.5, 68),
(3, 'Bachelor of Education', 'MU-EDU', 'degree', 4, 29.0, 64),
(3, 'Bachelor of Environmental Science', 'MU-ENV', 'degree', 4, 29.5, 65),
(3, 'Bachelor of Forestry', 'MU-FOREST', 'degree', 4, 30.0, 66),
(3, 'Bachelor of Wildlife Management', 'MU-WILDLIFE', 'degree', 4, 30.5, 67);

-- JKUAT Courses
INSERT INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points, demand_level) VALUES
(4, 'Bachelor of Medicine and Surgery', 'JKUAT-MED', 'degree', 6, 40.0, 95),
(4, 'Bachelor of Pharmacy', 'JKUAT-PHARM', 'degree', 5, 37.5, 89),
(4, 'Bachelor of Nursing', 'JKUAT-NURS', 'degree', 4, 36.0, 85),
(4, 'Bachelor of Public Health', 'JKUAT-PH', 'degree', 4, 34.0, 80),
(4, 'Bachelor of Computer Science', 'JKUAT-CS', 'degree', 4, 34.5, 82),
(4, 'Bachelor of Information Technology', 'JKUAT-IT', 'degree', 4, 34.0, 80),
(4, 'Bachelor of Business Information Technology', 'JKUAT-BIT', 'degree', 4, 33.5, 78),
(4, 'Bachelor of Electrical Engineering', 'JKUAT-ELEC', 'degree', 5, 35.5, 83),
(4, 'Bachelor of Mechanical Engineering', 'JKUAT-MECH', 'degree', 5, 35.0, 82),
(4, 'Bachelor of Civil Engineering', 'JKUAT-CIVIL', 'degree', 5, 34.8, 81),
(4, 'Bachelor of Geospatial Engineering', 'JKUAT-GEO', 'degree', 5, 33.5, 78),
(4, 'Bachelor of Architecture', 'JKUAT-ARCH', 'degree', 5, 33.0, 76),
(4, 'Bachelor of Quantity Surveying', 'JKUAT-QS', 'degree', 4, 32.5, 75),
(4, 'Bachelor of Construction Management', 'JKUAT-CONST', 'degree', 4, 32.0, 73),
(4, 'Bachelor of Food Science', 'JKUAT-FOOD', 'degree', 4, 31.5, 72),
(4, 'Bachelor of Biotechnology', 'JKUAT-BIO', 'degree', 4, 32.5, 74),
(4, 'Bachelor of Agriculture', 'JKUAT-AGRI', 'degree', 4, 30.5, 69),
(4, 'Bachelor of Horticulture', 'JKUAT-HORT', 'degree', 4, 31.0, 70);

-- =====================================================
-- INSERT ALL DIPLOMA COURSES
-- =====================================================

-- KMTC Diploma Courses (for each campus, similar programs)
INSERT INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
-- Nairobi KMTC
(51, 'Diploma in Kenya Registered Nursing', 'KMTC-NRB-KRN', 'diploma', 3, 30.5),
(51, 'Diploma in Kenya Registered Community Health Nursing', 'KMTC-NRB-KRCHN', 'diploma', 3, 30.0),
(51, 'Diploma in Medical Laboratory Sciences', 'KMTC-NRB-MLS', 'diploma', 3, 28.5),
(51, 'Diploma in Pharmacy', 'KMTC-NRB-PHRM', 'diploma', 3, 29.0),
(51, 'Diploma in Public Health', 'KMTC-NRB-PH', 'diploma', 3, 27.5),
(51, 'Diploma in Health Records and Information', 'KMTC-NRB-HRI', 'diploma', 3, 25.0),
(51, 'Diploma in Nutrition and Dietetics', 'KMTC-NRB-ND', 'diploma', 3, 26.5),
(51, 'Diploma in Orthopaedic Technology', 'KMTC-NRB-ORTH', 'diploma', 3, 26.0),
(51, 'Diploma in Radiography', 'KMTC-NRB-RAD', 'diploma', 3, 27.0),
(51, 'Diploma in Physiotherapy', 'KMTC-NRB-PHY', 'diploma', 3, 27.5),
(51, 'Diploma in Occupational Therapy', 'KMTC-NRB-OT', 'diploma', 3, 26.5),
(51, 'Diploma in Dental Technology', 'KMTC-NRB-DENT', 'diploma', 3, 26.0),
(51, 'Diploma in Dental Therapy', 'KMTC-NRB-DENT-TH', 'diploma', 3, 25.5),
(51, 'Diploma in Optometry', 'KMTC-NRB-OPTO', 'diploma', 3, 27.0),
(51, 'Diploma in Environmental Health', 'KMTC-NRB-ENV', 'diploma', 3, 26.5),
(51, 'Diploma in Health Promotion', 'KMTC-NRB-HP', 'diploma', 3, 25.5),
(51, 'Diploma in Epidemiology', 'KMTC-NRB-EPI', 'diploma', 3, 26.0),
(51, 'Diploma in Clinical Medicine', 'KMTC-NRB-CM', 'diploma', 3, 29.5);

-- Repeat similar courses for other major KMTC campuses
-- Mombasa KMTC
(52, 'Diploma in Kenya Registered Nursing', 'KMTC-MSA-KRN', 'diploma', 3, 29.5),
(52, 'Diploma in Medical Laboratory Sciences', 'KMTC-MSA-MLS', 'diploma', 3, 27.5),
(52, 'Diploma in Pharmacy', 'KMTC-MSA-PHRM', 'diploma', 3, 28.0),
(52, 'Diploma in Public Health', 'KMTC-MSA-PH', 'diploma', 3, 26.5);

-- Kisumu KMTC
(53, 'Diploma in Kenya Registered Nursing', 'KMTC-KSM-KRN', 'diploma', 3, 29.0),
(53, 'Diploma in Medical Laboratory Sciences', 'KMTC-KSM-MLS', 'diploma', 3, 27.0),
(53, 'Diploma in Pharmacy', 'KMTC-KSM-PHRM', 'diploma', 3, 27.5);

-- TVET Diploma Courses
INSERT INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
-- Kenya Institute of Management
(111, 'Diploma in Business Management', 'KIM-BM', 'diploma', 2, 25.0),
(111, 'Diploma in Human Resource Management', 'KIM-HRM', 'diploma', 2, 24.5),
(111, 'Diploma in Marketing', 'KIM-MKT', 'diploma', 2, 24.0),
(111, 'Diploma in Sales Management', 'KIM-SALES', 'diploma', 2, 23.5),
(111, 'Diploma in Entrepreneurship', 'KIM-ENT', 'diploma', 2, 23.0),
(111, 'Diploma in Project Management', 'KIM-PM', 'diploma', 2, 25.5),

-- Kenya Utalii College
(112, 'Diploma in Hotel Management', 'KUC-HM', 'diploma', 2, 25.5),
(112, 'Diploma in Food and Beverage Production', 'KUC-FB', 'diploma', 2, 24.5),
(112, 'Diploma in Food and Beverage Service', 'KUC-FBS', 'diploma', 2, 24.0),
(112, 'Diploma in Tourism Management', 'KUC-TOUR', 'diploma', 2, 24.0),
(112, 'Diploma in Travel Operations', 'KUC-TRAVEL', 'diploma', 2, 23.5),
(112, 'Diploma in Airline Operations', 'KUC-AIR', 'diploma', 2, 24.5),

-- Nairobi Technical Training Institute
(107, 'Diploma in Information Technology', 'NTTI-IT', 'diploma', 2, 24.5),
(107, 'Diploma in Electrical Engineering', 'NTTI-ELEC', 'diploma', 3, 23.5),
(107, 'Diploma in Mechanical Engineering', 'NTTI-MECH', 'diploma', 3, 23.0),
(107, 'Diploma in Automotive Engineering', 'NTTI-AUTO', 'diploma', 3, 22.5),
(107, 'Diploma in Building and Construction', 'NTTI-BLD', 'diploma', 3, 22.0),
(107, 'Diploma in Quantity Surveying', 'NTTI-QS', 'diploma', 2, 23.0),
(107, 'Diploma in Architecture', 'NTTI-ARCH', 'diploma', 2, 23.5),
(107, 'Diploma in Business Administration', 'NTTI-BA', 'diploma', 2, 22.5),
(107, 'Diploma in Accounting', 'NTTI-ACC', 'diploma', 2, 23.0);

-- =====================================================
-- INSERT ALL CERTIFICATE COURSES
-- =====================================================

-- TVET Certificate Courses
INSERT INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
-- Nairobi Technical Training Institute
(107, 'Certificate in Information Technology', 'NTTI-CIT', 'certificate', 1, 20.0),
(107, 'Certificate in Computer Applications', 'NTTI-CA', 'certificate', 0.5, 18.0),
(107, 'Certificate in Electrical Installation', 'NTTI-ELEC-CERT', 'certificate', 1, 17.5),
(107, 'Certificate in Plumbing', 'NTTI-PLUMB', 'certificate', 1, 16.0),
(107, 'Certificate in Masonry', 'NTTI-MASON', 'certificate', 1, 15.5),
(107, 'Certificate in Carpentry', 'NTTI-CARP', 'certificate', 1, 15.5),
(107, 'Certificate in Welding', 'NTTI-WELD', 'certificate', 1, 16.0),
(107, 'Certificate in Motor Vehicle Mechanics', 'NTTI-MVM', 'certificate', 1, 16.5),
(107, 'Certificate in Business Management', 'NTTI-BM-CERT', 'certificate', 1, 18.5),
(107, 'Certificate in Accounting', 'NTTI-ACC-CERT', 'certificate', 1, 19.0),
(107, 'Certificate in Supply Chain Management', 'NTTI-SCM', 'certificate', 1, 18.5),

-- Kenya Institute of Management
(111, 'Certificate in Business Management', 'KIM-CBM', 'certificate', 1, 19.0),
(111, 'Certificate in Sales and Marketing', 'KIM-CSM', 'certificate', 1, 18.5),
(111, 'Certificate in Human Resource Management', 'KIM-CHRM', 'certificate', 1, 18.5),
(111, 'Certificate in Entrepreneurship', 'KIM-CENT', 'certificate', 1, 17.5),

-- Kenya Utalii College
(112, 'Certificate in Food and Beverage', 'KUC-CFB', 'certificate', 1, 19.5),
(112, 'Certificate in Housekeeping', 'KUC-HK', 'certificate', 1, 18.0),
(112, 'Certificate in Laundry Operations', 'KUC-LAUNDRY', 'certificate', 1, 17.0),
(112, 'Certificate in Front Office Operations', 'KUC-FO', 'certificate', 1, 18.5),
(112, 'Certificate in Travel Agency Operations', 'KUC-TRAVEL-CERT', 'certificate', 1, 18.0);

-- =====================================================
-- INSERT COURSE REQUIREMENTS
-- =====================================================

-- Medicine Requirements
INSERT INTO course_requirements (course_id, subject_code, minimum_grade, weight) VALUES
(1, 'ENG', 'B+', 2),
(1, 'BIO', 'B+', 3),
(1, 'CHE', 'B+', 3),
(1, 'MAT', 'B-', 1),
(1, 'PHY', 'B-', 1),

(2, 'ENG', 'B+', 2),
(2, 'BIO', 'B+', 3),
(2, 'CHE', 'B+', 3),
(2, 'MAT', 'B-', 1),

(3, 'ENG', 'B', 2),
(3, 'BIO', 'B', 2),
(3, 'CHE', 'B', 3),
(3, 'MAT', 'B-', 1),

-- Computer Science Requirements
(7, 'ENG', 'B', 2),
(7, 'MAT', 'B+', 3),
(7, 'PHY', 'B-', 2),

-- Engineering Requirements
(8, 'ENG', 'B', 2),
(8, 'MAT', 'B+', 3),
(8, 'PHY', 'B', 3),

-- Nursing Requirements (KMTC)
(161, 'ENG', 'C+', 2),
(161, 'BIO', 'C+', 3),
(161, 'CHE', 'C+', 2),
(161, 'MAT', 'C', 1),
(161, 'KIS', 'C', 1),

-- Pharmacy Requirements
(163, 'ENG', 'C+', 2),
(163, 'BIO', 'C+', 3),
(163, 'CHE', 'B-', 3),
(163, 'MAT', 'C', 1),

-- Business Courses
(191, 'ENG', 'C', 2),
(191, 'BUS', 'C+', 3),
(191, 'MAT', 'C', 2),

-- IT Courses
(201, 'ENG', 'C', 2),
(201, 'MAT', 'C', 3),
(201, 'COM', 'C+', 3),

-- Certificate Courses
(221, 'ENG', 'D+', 2),
(221, 'COM', 'C-', 3);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_courses_program_cutoff ON courses(program_type, cut_off_points);
CREATE INDEX idx_requirements_course_subject ON course_requirements(course_id, subject_code);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_results_user_program ON results(user_id, program_type);
CREATE INDEX idx_courses_institution_program ON courses(institution_id, program_type);
CREATE INDEX idx_courses_name_search ON courses(name(255));
CREATE INDEX idx_institutions_name_search ON institutions(name(255));
CREATE INDEX idx_institutions_type_county ON institutions(type, county);

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger to update user payment status when transaction completed
DELIMITER //
CREATE TRIGGER after_transaction_completed
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE users SET payment_status = TRUE WHERE id = NEW.user_id;
    END IF;
END//

-- Trigger to create welcome notification for new users
CREATE TRIGGER after_user_created
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, title, message, type) VALUES
    (NEW.id, 'Welcome to KUCCPS Course Checker!', 'Thank you for registering. Start exploring courses that match your KCSE grades.', 'success');
END//

DELIMITER ;

-- =====================================================
-- CREATE VIEWS
-- =====================================================

-- View for active courses with institution details
CREATE VIEW active_courses_view AS
SELECT 
    c.id,
    c.name AS course_name,
    c.code AS course_code,
    c.program_type,
    c.duration_years,
    c.cut_off_points,
    c.demand_level,
    i.name AS institution_name,
    i.code AS institution_code,
    i.type AS institution_type,
    i.category AS institution_category,
    i.location,
    i.county
FROM courses c
JOIN institutions i ON c.institution_id = i.id
WHERE c.is_active = TRUE;

-- View for institutions by county
CREATE VIEW institutions_by_county AS
SELECT 
    county,
    COUNT(*) as total_institutions,
    SUM(CASE WHEN type = 'university' THEN 1 ELSE 0 END) as universities,
    SUM(CASE WHEN type = 'kmtc' THEN 1 ELSE 0 END) as kmtc_campuses,
    SUM(CASE WHEN type = 'ttc' THEN 1 ELSE 0 END) as teacher_colleges,
    SUM(CASE WHEN type = 'tvet' THEN 1 ELSE 0 END) as tvet_institutions
FROM institutions
GROUP BY county;

-- =====================================================
-- VERIFY DATA COUNTS
-- =====================================================
SELECT 'USERS' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'INSTITUTIONS', COUNT(*) FROM institutions
UNION ALL
SELECT 'COURSES', COUNT(*) FROM courses
UNION ALL
SELECT 'COURSE_REQUIREMENTS', COUNT(*) FROM course_requirements
UNION ALL
SELECT 'SUBJECTS', COUNT(*) FROM subjects
UNION ALL
SELECT 'GRADE_POINTS', COUNT(*) FROM grade_points;