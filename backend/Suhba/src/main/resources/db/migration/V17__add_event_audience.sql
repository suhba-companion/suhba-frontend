ALTER TABLE events ADD COLUMN audience VARCHAR(50);

UPDATE events SET audience = category, category = 'OTHER'
WHERE category IN ('SISTERS_ONLY', 'BROTHERS_ONLY');
