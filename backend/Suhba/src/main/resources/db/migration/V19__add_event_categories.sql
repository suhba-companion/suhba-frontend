-- An event can now carry several categories, so the single `events.category` column
-- moves into a child table. Mirrors the `halal_spot_cuisines` precedent from V2.
CREATE TABLE event_categories (
    event_id BIGINT      NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    PRIMARY KEY (event_id, category)
);

-- Carry every existing single category over before the column goes away.
INSERT INTO event_categories (event_id, category)
SELECT id, category FROM events;

ALTER TABLE events DROP COLUMN category;

-- Same reasoning as V15__lock_down_public_schema.sql: Supabase auto-exposes the public
-- schema through PostgREST and pre-grants anon/authenticated on its tables, and those
-- grants are gated only by row level security. Flyway's plain CREATE TABLE leaves RLS
-- off, so a new table would be world-readable with the project's public anon key.
-- V15 also revoked schema USAGE, but enabling RLS here keeps the table closed even if
-- the grants are ever restored. The owner role Flyway/Hibernate connects as bypasses RLS.
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
