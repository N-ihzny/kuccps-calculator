-- Seed: Historical Cut-off Points (FULLY FIXED)
USE kuccps_calculator;

-- Update cut-off points for courses using JOIN instead of subquery
UPDATE courses c
INNER JOIN (SELECT 'UON-MED' as code, 41.5 as points) t ON c.code = t.code
SET c.cut_off_points = t.points
WHERE c.code = 'UON-MED';

UPDATE courses c
INNER JOIN (SELECT 'UON-DENT' as code, 40.2 as points) t ON c.code = t.code
SET c.cut_off_points = t.points
WHERE c.code = 'UON-DENT';

UPDATE courses c
INNER JOIN (SELECT 'UON-PHARM' as code, 38.5 as points) t ON c.code = t.code
SET c.cut_off_points = t.points
WHERE c.code = 'UON-PHARM';

UPDATE courses c
INNER JOIN (SELECT 'UON-LLB' as code, 39.5 as points) t ON c.code = t.code
SET c.cut_off_points = t.points
WHERE c.code = 'UON-LLB';

UPDATE courses c
INNER JOIN (SELECT 'UON-CS' as code, 35.0 as points) t ON c.code = t.code
SET c.cut_off_points = t.points
WHERE c.code = 'UON-CS';

-- KMTC courses using LIKE with JOIN
UPDATE courses c
INNER JOIN (SELECT 'KMTC-NRB-KRN' as pattern, 30.5 as points) t ON c.code LIKE t.pattern
SET c.cut_off_points = t.points
WHERE c.code LIKE 'KMTC-NRB-KRN';

UPDATE courses c
INNER JOIN (SELECT 'KMTC-NRB-MLS' as pattern, 28.5 as points) t ON c.code LIKE t.pattern
SET c.cut_off_points = t.points
WHERE c.code LIKE 'KMTC-NRB-MLS';

UPDATE courses c
INNER JOIN (SELECT 'KMTC-NRB-PHRM' as pattern, 29.0 as points) t ON c.code LIKE t.pattern
SET c.cut_off_points = t.points
WHERE c.code LIKE 'KMTC-NRB-PHRM';

-- Set demand levels based on cut-off points (safe update)
UPDATE courses 
SET demand_level = 
    CASE 
        WHEN cut_off_points >= 40 THEN 95
        WHEN cut_off_points >= 35 THEN 85
        WHEN cut_off_points >= 30 THEN 75
        WHEN cut_off_points >= 25 THEN 65
        ELSE 50
    END
WHERE cut_off_points IS NOT NULL;

-- Show summary
SELECT 
    'Cutoff points updated successfully' as result,
    COUNT(*) as total_courses_updated,
    ROUND(AVG(cut_off_points), 2) as avg_cut_off,
    MAX(cut_off_points) as max_cut_off,
    MIN(cut_off_points) as min_cut_off
FROM courses WHERE cut_off_points IS NOT NULL;