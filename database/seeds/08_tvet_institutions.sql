-- Seed: TVET Institutions (with IGNORE to prevent duplicate errors)
USE kuccps_calculator;

INSERT IGNORE INTO institutions (name, code, type, category, location, county) VALUES
('Kenya Institute of Management', 'KIM', 'tvet', 'private', 'Nairobi', 'Nairobi'),
('Kenya Utalii College', 'KUC', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Railway Training Institute', 'RTI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Water Institute', 'KEWI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Nairobi Technical Training Institute', 'NTTI', 'tvet', 'public', 'Nairobi', 'Nairobi'),
('Kenya Coast National Polytechnic', 'KCNP', 'tvet', 'public', 'Mombasa', 'Mombasa'),
('Eldoret National Polytechnic', 'ENP', 'tvet', 'public', 'Eldoret', 'Uasin Gishu'),
('Kisumu National Polytechnic', 'KNP', 'tvet', 'public', 'Kisumu', 'Kisumu'),
('North Eastern National Polytechnic', 'NENP', 'tvet', 'public', 'Garissa', 'Garissa'),
('Rift Valley Technical Training Institute', 'RVTTI', 'tvet', 'public', 'Eldoret', 'Uasin Gishu'),
('Mombasa Technical Training Institute', 'MTTI', 'tvet', 'public', 'Mombasa', 'Mombasa'),
('Thika Technical Training Institute', 'TTTI', 'tvet', 'public', 'Thika', 'Kiambu');

-- Show completion message
SELECT CONCAT('TVET institutions processed. Total: ', COUNT(*)) as result FROM institutions WHERE type = 'tvet';