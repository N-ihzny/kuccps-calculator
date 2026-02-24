-- Seed degree courses for major universities (FULLY FIXED with INSERT IGNORE)
USE kuccps_calculator;

-- Get university IDs
SET @uon = (SELECT id FROM institutions WHERE code = 'UON' LIMIT 1);
SET @ku = (SELECT id FROM institutions WHERE code = 'KU' LIMIT 1);
SET @jkuat = (SELECT id FROM institutions WHERE code = 'JKUAT' LIMIT 1);
SET @mu = (SELECT id FROM institutions WHERE code = 'MU' LIMIT 1);
SET @egu = (SELECT id FROM institutions WHERE code = 'EGU' LIMIT 1);
SET @msu = (SELECT id FROM institutions WHERE code = 'MSU' LIMIT 1);
SET @strath = (SELECT id FROM institutions WHERE code = 'STRATH' LIMIT 1);
SET @usiu = (SELECT id FROM institutions WHERE code = 'USIU' LIMIT 1);
SET @mku = (SELECT id FROM institutions WHERE code = 'MKU' LIMIT 1);
SET @kca = (SELECT id FROM institutions WHERE code = 'KCA' LIMIT 1);

-- University of Nairobi Courses (with INSERT IGNORE)
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points, demand_level) VALUES
(@uon, 'Bachelor of Medicine and Surgery', 'UON-MED', 'degree', 6, 41.5, 98),
(@uon, 'Bachelor of Dental Surgery', 'UON-DENT', 'degree', 5, 40.2, 95),
(@uon, 'Bachelor of Pharmacy', 'UON-PHARM', 'degree', 5, 38.5, 92),
(@uon, 'Bachelor of Nursing', 'UON-NURS', 'degree', 4, 37.0, 88),
(@uon, 'Bachelor of Law (LLB)', 'UON-LLB', 'degree', 4, 39.5, 94),
(@uon, 'Bachelor of Computer Science', 'UON-CS', 'degree', 4, 35.0, 85),
(@uon, 'Bachelor of Electrical Engineering', 'UON-ELEC', 'degree', 5, 36.5, 86),
(@uon, 'Bachelor of Mechanical Engineering', 'UON-MECH', 'degree', 5, 36.0, 85),
(@uon, 'Bachelor of Civil Engineering', 'UON-CIVIL', 'degree', 5, 35.8, 84),
(@uon, 'Bachelor of Architecture', 'UON-ARCH', 'degree', 5, 34.5, 80),
(@uon, 'Bachelor of Quantity Surveying', 'UON-QS', 'degree', 4, 33.5, 78),
(@uon, 'Bachelor of Land Economics', 'UON-LAND', 'degree', 4, 33.0, 77),
(@uon, 'Bachelor of Real Estate', 'UON-RE', 'degree', 4, 32.5, 76),
(@uon, 'Bachelor of Economics', 'UON-ECON', 'degree', 4, 32.0, 75),
(@uon, 'Bachelor of Statistics', 'UON-STAT', 'degree', 4, 32.5, 76),
(@uon, 'Bachelor of Actuarial Science', 'UON-ACT', 'degree', 4, 34.0, 82),
(@uon, 'Bachelor of Commerce', 'UON-COMM', 'degree', 4, 33.0, 78),
(@uon, 'Bachelor of Business Administration', 'UON-BBA', 'degree', 4, 32.5, 76),
(@uon, 'Bachelor of Education (Arts)', 'UON-EDU-ARTS', 'degree', 4, 29.5, 65),
(@uon, 'Bachelor of Education (Science)', 'UON-EDU-SCI', 'degree', 4, 31.0, 68),
(@uon, 'Bachelor of Arts in Economics', 'UON-BA-ECON', 'degree', 4, 30.5, 66),
(@uon, 'Bachelor of Arts in Sociology', 'UON-SOC', 'degree', 4, 28.5, 60),
(@uon, 'Bachelor of Arts in Political Science', 'UON-POL', 'degree', 4, 29.0, 62),
(@uon, 'Bachelor of Arts in History', 'UON-HIS', 'degree', 4, 28.0, 58),
(@uon, 'Bachelor of Arts in Geography', 'UON-GEO', 'degree', 4, 28.0, 58),
(@uon, 'Bachelor of Arts in Kiswahili', 'UON-KIS', 'degree', 4, 27.5, 55),
(@uon, 'Bachelor of Arts in Literature', 'UON-LIT', 'degree', 4, 28.0, 57),
(@uon, 'Bachelor of Journalism', 'UON-JOURN', 'degree', 4, 31.0, 72),
(@uon, 'Bachelor of Mass Communication', 'UON-MASS', 'degree', 4, 32.0, 74),
(@uon, 'Bachelor of Public Relations', 'UON-PR', 'degree', 4, 31.5, 71),
(@uon, 'Bachelor of Veterinary Medicine', 'UON-VET', 'degree', 5, 35.0, 80),
(@uon, 'Bachelor of Agriculture', 'UON-AGRI', 'degree', 4, 30.5, 68),
(@uon, 'Bachelor of Food Science', 'UON-FOOD', 'degree', 4, 31.5, 70),
(@uon, 'Bachelor of Environmental Science', 'UON-ENV', 'degree', 4, 31.0, 69),
(@uon, 'Bachelor of Forestry', 'UON-FOREST', 'degree', 4, 30.0, 65),
(@uon, 'Bachelor of Wildlife Management', 'UON-WILDLIFE', 'degree', 4, 30.5, 66),
(@uon, 'Bachelor of Tourism Management', 'UON-TOUR', 'degree', 4, 32.0, 73),
(@uon, 'Bachelor of Hospitality Management', 'UON-HOSP', 'degree', 4, 31.5, 71),
(@uon, 'Bachelor of Geospatial Engineering', 'UON-GEOENG', 'degree', 4, 34.0, 78),
(@uon, 'Bachelor of Surveying', 'UON-SURV', 'degree', 4, 33.0, 74);

-- Kenyatta University Courses
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points, demand_level) VALUES
(@ku, 'Bachelor of Medicine and Surgery', 'KU-MED', 'degree', 6, 40.5, 96),
(@ku, 'Bachelor of Pharmacy', 'KU-PHARM', 'degree', 5, 37.8, 90),
(@ku, 'Bachelor of Nursing', 'KU-NURS', 'degree', 4, 36.2, 86),
(@ku, 'Bachelor of Public Health', 'KU-PH', 'degree', 4, 34.5, 82),
(@ku, 'Bachelor of Education (Arts)', 'KU-EDU-ARTS', 'degree', 4, 30.5, 70),
(@ku, 'Bachelor of Education (Science)', 'KU-EDU-SCI', 'degree', 4, 32.0, 72),
(@ku, 'Bachelor of Commerce', 'KU-COMM', 'degree', 4, 32.5, 74),
(@ku, 'Bachelor of Economics', 'KU-ECON', 'degree', 4, 31.5, 71),
(@ku, 'Bachelor of Economics and Statistics', 'KU-ECON-STAT', 'degree', 4, 32.0, 73),
(@ku, 'Bachelor of Business Administration', 'KU-BBA', 'degree', 4, 32.0, 72),
(@ku, 'Bachelor of Hospitality Management', 'KU-HOSP', 'degree', 4, 30.0, 68),
(@ku, 'Bachelor of Tourism Management', 'KU-TOUR', 'degree', 4, 30.5, 69),
(@ku, 'Bachelor of Computer Science', 'KU-CS', 'degree', 4, 34.0, 80),
(@ku, 'Bachelor of Information Technology', 'KU-IT', 'degree', 4, 33.5, 78),
(@ku, 'Bachelor of Business Information Technology', 'KU-BIT', 'degree', 4, 33.0, 76),
(@ku, 'Bachelor of Environmental Studies', 'KU-ENV', 'degree', 4, 29.0, 65),
(@ku, 'Bachelor of Geography', 'KU-GEO', 'degree', 4, 28.5, 62),
(@ku, 'Bachelor of History', 'KU-HIS', 'degree', 4, 28.0, 60),
(@ku, 'Bachelor of Political Science', 'KU-POL', 'degree', 4, 28.5, 61),
(@ku, 'Bachelor of Sociology', 'KU-SOC', 'degree', 4, 28.0, 60),
(@ku, 'Bachelor of Psychology', 'KU-PSYCH', 'degree', 4, 31.0, 70),
(@ku, 'Bachelor of Counselling Psychology', 'KU-COUNS', 'degree', 4, 30.5, 69),
(@ku, 'Bachelor of Kiswahili', 'KU-KIS', 'degree', 4, 27.5, 58),
(@ku, 'Bachelor of English', 'KU-ENG', 'degree', 4, 28.0, 59),
(@ku, 'Bachelor of Literature', 'KU-LIT', 'degree', 4, 27.5, 58),
(@ku, 'Bachelor of French', 'KU-FRE', 'degree', 4, 27.0, 55),
(@ku, 'Bachelor of German', 'KU-GER', 'degree', 4, 27.0, 55),
(@ku, 'Bachelor of Music', 'KU-MUSIC', 'degree', 4, 28.0, 59),
(@ku, 'Bachelor of Fine Art', 'KU-FINE', 'degree', 4, 28.5, 60),
(@ku, 'Bachelor of Film and Theatre Arts', 'KU-FILM', 'degree', 4, 29.0, 62),
(@ku, 'Bachelor of Journalism', 'KU-JOURN', 'degree', 4, 31.5, 72),
(@ku, 'Bachelor of Mass Communication', 'KU-MASS', 'degree', 4, 32.0, 73),
(@ku, 'Bachelor of Agriculture', 'KU-AGRI', 'degree', 4, 30.0, 67),
(@ku, 'Bachelor of Food Science', 'KU-FOOD', 'degree', 4, 31.0, 69),
(@ku, 'Bachelor of Nutrition', 'KU-NUTR', 'degree', 4, 32.0, 72),
(@ku, 'Bachelor of Dietetics', 'KU-DIET', 'degree', 4, 32.5, 73);

-- JKUAT Courses
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points, demand_level) VALUES
(@jkuat, 'Bachelor of Medicine and Surgery', 'JKUAT-MED', 'degree', 6, 40.0, 95),
(@jkuat, 'Bachelor of Pharmacy', 'JKUAT-PHARM', 'degree', 5, 37.5, 89),
(@jkuat, 'Bachelor of Nursing', 'JKUAT-NURS', 'degree', 4, 36.0, 85),
(@jkuat, 'Bachelor of Public Health', 'JKUAT-PH', 'degree', 4, 34.0, 80),
(@jkuat, 'Bachelor of Computer Science', 'JKUAT-CS', 'degree', 4, 34.5, 82),
(@jkuat, 'Bachelor of Information Technology', 'JKUAT-IT', 'degree', 4, 34.0, 80),
(@jkuat, 'Bachelor of Business Information Technology', 'JKUAT-BIT', 'degree', 4, 33.5, 78),
(@jkuat, 'Bachelor of Electrical Engineering', 'JKUAT-ELEC', 'degree', 5, 35.5, 83),
(@jkuat, 'Bachelor of Mechanical Engineering', 'JKUAT-MECH', 'degree', 5, 35.0, 82),
(@jkuat, 'Bachelor of Civil Engineering', 'JKUAT-CIVIL', 'degree', 5, 34.8, 81),
(@jkuat, 'Bachelor of Geospatial Engineering', 'JKUAT-GEO', 'degree', 5, 33.5, 78),
(@jkuat, 'Bachelor of Architecture', 'JKUAT-ARCH', 'degree', 5, 33.0, 76),
(@jkuat, 'Bachelor of Quantity Surveying', 'JKUAT-QS', 'degree', 4, 32.5, 75),
(@jkuat, 'Bachelor of Construction Management', 'JKUAT-CONST', 'degree', 4, 32.0, 73),
(@jkuat, 'Bachelor of Food Science', 'JKUAT-FOOD', 'degree', 4, 31.5, 72),
(@jkuat, 'Bachelor of Biotechnology', 'JKUAT-BIO', 'degree', 4, 32.5, 74),
(@jkuat, 'Bachelor of Agriculture', 'JKUAT-AGRI', 'degree', 4, 30.5, 69),
(@jkuat, 'Bachelor of Horticulture', 'JKUAT-HORT', 'degree', 4, 31.0, 70);

-- Moi University Courses
INSERT IGNORE INTO courses (institution_id, name, code, program_type, duration_years, cut_off_points, demand_level) VALUES
(@mu, 'Bachelor of Medicine and Surgery', 'MU-MED', 'degree', 6, 39.5, 94),
(@mu, 'Bachelor of Dental Surgery', 'MU-DENT', 'degree', 5, 38.0, 90),
(@mu, 'Bachelor of Pharmacy', 'MU-PHARM', 'degree', 5, 36.5, 87),
(@mu, 'Bachelor of Nursing', 'MU-NURS', 'degree', 4, 35.0, 83),
(@mu, 'Bachelor of Public Health', 'MU-PH', 'degree', 4, 33.5, 78),
(@mu, 'Bachelor of Law (LLB)', 'MU-LLB', 'degree', 4, 37.0, 88),
(@mu, 'Bachelor of Engineering', 'MU-ENG', 'degree', 5, 34.0, 79),
(@mu, 'Bachelor of Computer Science', 'MU-CS', 'degree', 4, 32.5, 75),
(@mu, 'Bachelor of Information Technology', 'MU-IT', 'degree', 4, 32.0, 73),
(@mu, 'Bachelor of Business Management', 'MU-BM', 'degree', 4, 31.0, 70),
(@mu, 'Bachelor of Economics', 'MU-ECON', 'degree', 4, 30.5, 68),
(@mu, 'Bachelor of Education', 'MU-EDU', 'degree', 4, 29.0, 64),
(@mu, 'Bachelor of Environmental Science', 'MU-ENV', 'degree', 4, 29.5, 65),
(@mu, 'Bachelor of Forestry', 'MU-FOREST', 'degree', 4, 30.0, 66),
(@mu, 'Bachelor of Wildlife Management', 'MU-WILDLIFE', 'degree', 4, 30.5, 67);

-- Show success message
SELECT CONCAT('Degree courses seeded successfully. Total: ', COUNT(*)) as result FROM courses WHERE program_type = 'degree';