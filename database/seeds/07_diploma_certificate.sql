-- Seed: Diploma and Certificate Courses for TVET (FULLY FIXED)
USE kuccps_calculator;

-- First, let's make sure all TVET institutions exist
INSERT IGNORE INTO institutions (name, code, type, category, location, county) VALUES
('Kenya Institute of Management', 'KIM', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('Kenya Utalii College', 'KUC', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Nairobi Technical Training Institute', 'NTTI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Coast National Polytechnic', 'KCNP', 'tvet', 'public', 'Mombasa', 'Mombasa'),
('Eldoret National Polytechnic', 'ENP', 'tvet', 'public', 'Eldoret', 'Uasin Gishu'),
('Kisumu National Polytechnic', 'KNP', 'tvet', 'public', 'Kisumu', 'Kisumu'),
('Railway Training Institute', 'RTI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Water Institute', 'KEWI', 'tvet', 'public', 'Nairobi', 'Nairobi');

-- Get institution IDs using variables
SET @kim = (SELECT id FROM institutions WHERE code = 'KIM' LIMIT 1);
SET @kuc = (SELECT id FROM institutions WHERE code = 'KUC' LIMIT 1);
SET @ntti = (SELECT id FROM institutions WHERE code = 'NTTI' LIMIT 1);
SET @kcnp = (SELECT id FROM institutions WHERE code = 'KCNP' LIMIT 1);
SET @enp = (SELECT id FROM institutions WHERE code = 'ENP' LIMIT 1);
SET @knp = (SELECT id FROM institutions WHERE code = 'KNP' LIMIT 1);

-- Diploma Courses (using INSERT IGNORE to prevent duplicates)
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) 
SELECT @kim, 'Diploma in Business Management', 'KIM-DBM', 'diploma', 2, 25.0
WHERE @kim IS NOT NULL
UNION ALL
SELECT @kim, 'Diploma in Human Resource Management', 'KIM-DHRM', 'diploma', 2, 24.5
WHERE @kim IS NOT NULL
UNION ALL
SELECT @kim, 'Diploma in Marketing', 'KIM-DMKT', 'diploma', 2, 24.0
WHERE @kim IS NOT NULL
UNION ALL
SELECT @kuc, 'Diploma in Hotel Management', 'KUC-DHM', 'diploma', 2, 25.5
WHERE @kuc IS NOT NULL
UNION ALL
SELECT @kuc, 'Diploma in Food and Beverage', 'KUC-DFB', 'diploma', 2, 24.5
WHERE @kuc IS NOT NULL
UNION ALL
SELECT @ntti, 'Diploma in Information Technology', 'NTTI-DIT', 'diploma', 2, 24.5
WHERE @ntti IS NOT NULL
UNION ALL
SELECT @ntti, 'Diploma in Electrical Engineering', 'NTTI-DEE', 'diploma', 3, 23.5
WHERE @ntti IS NOT NULL
UNION ALL
SELECT @ntti, 'Diploma in Mechanical Engineering', 'NTTI-DME', 'diploma', 3, 23.0
WHERE @ntti IS NOT NULL;

-- Certificate Courses (using INSERT IGNORE)
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) 
SELECT @ntti, 'Certificate in Information Technology', 'NTTI-CIT', 'certificate', 1, 20.0
WHERE @ntti IS NOT NULL
UNION ALL
SELECT @ntti, 'Certificate in Computer Applications', 'NTTI-CCA', 'certificate', 0.5, 18.0
WHERE @ntti IS NOT NULL
UNION ALL
SELECT @ntti, 'Certificate in Electrical Installation', 'NTTI-CEI', 'certificate', 1, 17.5
WHERE @ntti IS NOT NULL
UNION ALL
SELECT @kim, 'Certificate in Business Management', 'KIM-CBM', 'certificate', 1, 19.0
WHERE @kim IS NOT NULL
UNION ALL
SELECT @kuc, 'Certificate in Food and Beverage', 'KUC-CFB', 'certificate', 1, 19.5
WHERE @kuc IS NOT NULL;

-- Add course requirements (using INSERT IGNORE)
INSERT IGNORE INTO course_requirements (course_id, subject_code, minimum_grade, weight)
SELECT c.id, 'ENG', 'C', 2 FROM courses c WHERE c.code IN ('KIM-DBM', 'KIM-DHRM', 'KIM-DMKT', 'KUC-DHM', 'KUC-DFB', 'NTTI-DIT')
UNION ALL
SELECT c.id, 'MAT', 'C', 2 FROM courses c WHERE c.code IN ('KIM-DBM', 'NTTI-DIT', 'NTTI-DEE', 'NTTI-DME')
UNION ALL
SELECT c.id, 'ENG', 'D+', 2 FROM courses c WHERE c.code IN ('NTTI-CIT', 'NTTI-CCA', 'KIM-CBM', 'KUC-CFB');

-- Show success message
SELECT CONCAT('Diploma & Certificate courses seeded successfully. Total courses: ', COUNT(*)) as result FROM courses WHERE program_type IN ('diploma', 'certificate');