-- Seed KMTC courses for each campus (FULLY FIXED with INSERT IGNORE)
USE kuccps_calculator;

-- Get KMTC institution IDs
SET @kmtc_nrb = (SELECT id FROM institutions WHERE code = 'KMTC-NRB' LIMIT 1);
SET @kmtc_msa = (SELECT id FROM institutions WHERE code = 'KMTC-MSA' LIMIT 1);
SET @kmtc_ksm = (SELECT id FROM institutions WHERE code = 'KMTC-KSM' LIMIT 1);
SET @kmtc_eld = (SELECT id FROM institutions WHERE code = 'KMTC-ELD' LIMIT 1);
SET @kmtc_nkr = (SELECT id FROM institutions WHERE code = 'KMTC-NKR' LIMIT 1);
SET @kmtc_mru = (SELECT id FROM institutions WHERE code = 'KMTC-MRU' LIMIT 1);
SET @kmtc_mks = (SELECT id FROM institutions WHERE code = 'KMTC-MKS' LIMIT 1);
SET @kmtc_nyi = (SELECT id FROM institutions WHERE code = 'KMTC-NYI' LIMIT 1);
SET @kmtc_kkg = (SELECT id FROM institutions WHERE code = 'KMTC-KKG' LIMIT 1);
SET @kmtc_ksi = (SELECT id FROM institutions WHERE code = 'KMTC-KSI' LIMIT 1);
SET @kmtc_thk = (SELECT id FROM institutions WHERE code = 'KMTC-THK' LIMIT 1);
SET @kmtc_emb = (SELECT id FROM institutions WHERE code = 'KMTC-EMB' LIMIT 1);
SET @kmtc_ktl = (SELECT id FROM institutions WHERE code = 'KMTC-KTL' LIMIT 1);
SET @kmtc_krc = (SELECT id FROM institutions WHERE code = 'KMTC-KRC' LIMIT 1);
SET @kmtc_grs = (SELECT id FROM institutions WHERE code = 'KMTC-GRS' LIMIT 1);

-- Nairobi KMTC Courses (with INSERT IGNORE)
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
(@kmtc_nrb, 'Diploma in Kenya Registered Nursing', 'KMTC-NRB-KRN', 'kmtc', 3, 30.5),
(@kmtc_nrb, 'Diploma in Kenya Registered Community Health Nursing', 'KMTC-NRB-KRCHN', 'kmtc', 3, 30.0),
(@kmtc_nrb, 'Diploma in Medical Laboratory Sciences', 'KMTC-NRB-MLS', 'kmtc', 3, 28.5),
(@kmtc_nrb, 'Diploma in Pharmacy', 'KMTC-NRB-PHRM', 'kmtc', 3, 29.0),
(@kmtc_nrb, 'Diploma in Public Health', 'KMTC-NRB-PH', 'kmtc', 3, 27.5),
(@kmtc_nrb, 'Diploma in Health Records and Information', 'KMTC-NRB-HRI', 'kmtc', 3, 25.0),
(@kmtc_nrb, 'Diploma in Nutrition and Dietetics', 'KMTC-NRB-ND', 'kmtc', 3, 26.5),
(@kmtc_nrb, 'Diploma in Orthopaedic Technology', 'KMTC-NRB-ORTH', 'kmtc', 3, 26.0),
(@kmtc_nrb, 'Diploma in Radiography', 'KMTC-NRB-RAD', 'kmtc', 3, 27.0),
(@kmtc_nrb, 'Diploma in Physiotherapy', 'KMTC-NRB-PHY', 'kmtc', 3, 27.5),
(@kmtc_nrb, 'Diploma in Occupational Therapy', 'KMTC-NRB-OT', 'kmtc', 3, 26.5),
(@kmtc_nrb, 'Diploma in Dental Technology', 'KMTC-NRB-DENT', 'kmtc', 3, 26.0),
(@kmtc_nrb, 'Diploma in Dental Therapy', 'KMTC-NRB-DENT-TH', 'kmtc', 3, 25.5),
(@kmtc_nrb, 'Diploma in Optometry', 'KMTC-NRB-OPTO', 'kmtc', 3, 27.0),
(@kmtc_nrb, 'Diploma in Environmental Health', 'KMTC-NRB-ENV', 'kmtc', 3, 26.5),
(@kmtc_nrb, 'Diploma in Health Promotion', 'KMTC-NRB-HP', 'kmtc', 3, 25.5),
(@kmtc_nrb, 'Diploma in Epidemiology', 'KMTC-NRB-EPI', 'kmtc', 3, 26.0),
(@kmtc_nrb, 'Diploma in Clinical Medicine', 'KMTC-NRB-CM', 'kmtc', 3, 29.5);

-- Mombasa KMTC
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
(@kmtc_msa, 'Diploma in Kenya Registered Nursing', 'KMTC-MSA-KRN', 'kmtc', 3, 29.5),
(@kmtc_msa, 'Diploma in Medical Laboratory Sciences', 'KMTC-MSA-MLS', 'kmtc', 3, 27.5),
(@kmtc_msa, 'Diploma in Pharmacy', 'KMTC-MSA-PHRM', 'kmtc', 3, 28.0),
(@kmtc_msa, 'Diploma in Public Health', 'KMTC-MSA-PH', 'kmtc', 3, 26.5),
(@kmtc_msa, 'Diploma in Health Records', 'KMTC-MSA-HR', 'kmtc', 3, 24.5),
(@kmtc_msa, 'Diploma in Nutrition', 'KMTC-MSA-NUT', 'kmtc', 3, 25.5);

-- Kisumu KMTC
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
(@kmtc_ksm, 'Diploma in Kenya Registered Nursing', 'KMTC-KSM-KRN', 'kmtc', 3, 29.0),
(@kmtc_ksm, 'Diploma in Medical Laboratory Sciences', 'KMTC-KSM-MLS', 'kmtc', 3, 27.0),
(@kmtc_ksm, 'Diploma in Pharmacy', 'KMTC-KSM-PHRM', 'kmtc', 3, 27.5),
(@kmtc_ksm, 'Diploma in Public Health', 'KMTC-KSM-PH', 'kmtc', 3, 26.0);

-- Eldoret KMTC
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
(@kmtc_eld, 'Diploma in Kenya Registered Nursing', 'KMTC-ELD-KRN', 'kmtc', 3, 28.5),
(@kmtc_eld, 'Diploma in Medical Laboratory Sciences', 'KMTC-ELD-MLS', 'kmtc', 3, 26.5),
(@kmtc_eld, 'Diploma in Pharmacy', 'KMTC-ELD-PHRM', 'kmtc', 3, 27.0);

-- Nakuru KMTC
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
(@kmtc_nkr, 'Diploma in Kenya Registered Nursing', 'KMTC-NKR-KRN', 'kmtc', 3, 28.0),
(@kmtc_nkr, 'Diploma in Medical Laboratory Sciences', 'KMTC-NKR-MLS', 'kmtc', 3, 26.0),
(@kmtc_nkr, 'Diploma in Pharmacy', 'KMTC-NKR-PHRM', 'kmtc', 3, 26.5);

-- Meru KMTC
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points) VALUES
(@kmtc_mru, 'Diploma in Kenya Registered Nursing', 'KMTC-MRU-KRN', 'kmtc', 3, 27.5),
(@kmtc_mru, 'Diploma in Medical Laboratory Sciences', 'KMTC-MRU-MLS', 'kmtc', 3, 25.5),
(@kmtc_mru, 'Diploma in Pharmacy', 'KMTC-MRU-PHRM', 'kmtc', 3, 26.0);

-- Course Requirements for KMTC programs (using INSERT IGNORE)
INSERT IGNORE INTO course_requirements (course_id, subject_code, minimum_grade, weight) 
SELECT DISTINCT c.id, 'ENG', 'C+', 2 FROM courses c WHERE c.code LIKE '%KRN%' OR c.code LIKE '%KRCHN%'
UNION ALL
SELECT DISTINCT c.id, 'BIO', 'C+', 3 FROM courses c WHERE c.code LIKE '%KRN%' OR c.code LIKE '%KRCHN%' OR c.code LIKE '%MLS%'
UNION ALL
SELECT DISTINCT c.id, 'CHE', 'C+', 2 FROM courses c WHERE c.code LIKE '%KRN%' OR c.code LIKE '%PHRM%' OR c.code LIKE '%MLS%'
UNION ALL
SELECT DISTINCT c.id, 'MAT', 'C', 1 FROM courses c WHERE c.code LIKE '%KRN%' OR c.code LIKE '%PHRM%';

-- Show success message
SELECT CONCAT('KMTC courses seeded successfully. Total: ', COUNT(*)) as result FROM courses WHERE program_type = 'kmtc';