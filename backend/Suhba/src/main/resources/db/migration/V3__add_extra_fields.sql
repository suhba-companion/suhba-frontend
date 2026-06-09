ALTER TABLE prayer_spots
    ALTER COLUMN district TYPE VARCHAR(50),
    ADD COLUMN opening_hours VARCHAR(255),
    ADD COLUMN juma_time     VARCHAR(10),
    ADD COLUMN parking       BOOLEAN;

ALTER TABLE halal_spots
    ALTER COLUMN district TYPE VARCHAR(50),
    ADD COLUMN opening_hours VARCHAR(255),
    ADD COLUMN rating        NUMERIC(3,1);
