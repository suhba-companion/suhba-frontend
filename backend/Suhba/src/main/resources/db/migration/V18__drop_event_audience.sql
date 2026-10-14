-- The `audience` column added in V17 is no longer part of the Event model.
-- V17 is left untouched because it may already be applied to the dev database and
-- editing or deleting an applied migration breaks Flyway's checksum validation.
ALTER TABLE events DROP COLUMN IF EXISTS audience;
