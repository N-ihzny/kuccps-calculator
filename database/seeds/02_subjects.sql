-- Seed: All KCSE Subjects (with INSERT IGNORE)
USE kuccps_calculator;

INSERT IGNORE INTO subjects (name, code, subject_group, is_compulsory) VALUES
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

SELECT 'Subjects seeded successfully (duplicates skipped)' as result;