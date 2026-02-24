-- Seed: Teacher Training Colleges (with INSERT IGNORE)
USE kuccps_calculator;

INSERT IGNORE INTO institutions (name, code, type, category, location, county) VALUES
('Kenya Science Teachers College', 'KSTC-01', 'ttc', 'public', 'Nairobi', 'Nairobi'),
('Kagumo Teachers College', 'KGTC-01', 'ttc', 'public', 'Kagumo', 'Nyeri'),
('Eregi Teachers College', 'EGTC-01', 'ttc', 'public', 'Eregi', 'Kakamega'),
('Machakos Teachers College', 'MKTC-01', 'ttc', 'public', 'Machakos', 'Machakos'),
('Meru Teachers College', 'MRTC-01', 'ttc', 'public', 'Meru', 'Meru'),
('Kisii Teachers College', 'KSTC-02', 'ttc', 'public', 'Kisii', 'Kisii'),
('Mombasa Teachers College', 'MBTC-01', 'ttc', 'public', 'Mombasa', 'Mombasa'),
('Nakuru Teachers College', 'NKTC-01', 'ttc', 'public', 'Nakuru', 'Nakuru'),
('Kitui Teachers College', 'KTTC-01', 'ttc', 'public', 'Kitui', 'Kitui'),
('Kilimambogo Teachers College', 'KLTC-01', 'ttc', 'public', 'Kilimambogo', 'Kiambu'),
('Kamwenja Teachers College', 'KWTC-01', 'ttc', 'public', 'Nyeri', 'Nyeri'),
('Thogoto Teachers College', 'TGTC-01', 'ttc', 'public', 'Thogoto', 'Kiambu'),
('Narok Teachers College', 'NRTC-01', 'ttc', 'public', 'Narok', 'Narok'),
('Shanzu Teachers College', 'SZT-01', 'ttc', 'public', 'Shanzu', 'Mombasa'),
('Asumbi Teachers College', 'ASTC-01', 'ttc', 'public', 'Asumbi', 'Homa Bay'),
('Kagwe Teachers College', 'KGWC-01', 'ttc', 'public', 'Kagwe', 'Kiambu'),
('Mosoriot Teachers College', 'MSTC-01', 'ttc', 'public', 'Mosoriot', 'Nandi'),
('Kericho Teachers College', 'KRTC-01', 'ttc', 'public', 'Kericho', 'Kericho'),
('Bondo Teachers College', 'BDTC-01', 'ttc', 'public', 'Bondo', 'Siaya'),
('Kakamega Teachers College', 'KKTC-01', 'ttc', 'public', 'Kakamega', 'Kakamega');

SELECT CONCAT('Teacher colleges seeded successfully. Total: ', COUNT(*)) as result FROM institutions WHERE type = 'ttc';