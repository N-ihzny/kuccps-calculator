-- Seed: Institution Types and Grade Points (Using INSERT IGNORE to skip duplicates)
USE kuccps_calculator;

-- Insert grade points, skipping any that already exist
INSERT IGNORE INTO grade_points (grade, points, description) VALUES
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

-- Insert counties, skipping any that already exist
INSERT IGNORE INTO counties (name, code) VALUES
('Nairobi', '001'), ('Mombasa', '002'), ('Kisumu', '003'), ('Nakuru', '004'),
('Kiambu', '005'), ('Uasin Gishu', '006'), ('Kakamega', '007'), ('Kericho', '008'),
('Meru', '009'), ('Machakos', '010'), ('Kisii', '011'), ('Kilifi', '012'),
('Bungoma', '013'), ('Garissa', '014'), ('Kitui', '015'), ('Mandera', '016'),
('Marsabit', '017'), ('Migori', '018'), ('Muranga', '019'), ('Nyamira', '020'),
('Nyandarua', '021'), ('Nyeri', '022'), ('Samburu', '023'), ('Siaya', '024'),
('Taita Taveta', '025'), ('Tharaka Nithi', '026'), ('Trans Nzoia', '027'),
('Turkana', '028'), ('Vihiga', '029'), ('Wajir', '030'), ('West Pokot', '031'),
('Baringo', '032'), ('Bomet', '033'), ('Elgeyo Marakwet', '034'), ('Embu', '035'),
('Homa Bay', '036'), ('Isiolo', '037'), ('Kajiado', '038'), ('Kirinyaga', '039'),
('Kwale', '040'), ('Laikipia', '041'), ('Lamu', '042'), ('Makueni', '043'),
('Nandi', '044'), ('Narok', '045'), ('Tana River', '046');

-- Show success message
SELECT 'Grade points and counties seeded successfully (duplicates skipped)' as result;