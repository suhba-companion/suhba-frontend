ALTER TABLE events ADD COLUMN requires_registration BOOLEAN NOT NULL DEFAULT FALSE;

-- Until now the badge was inferred from a registration link, so keep those events marked.
UPDATE events SET requires_registration = TRUE WHERE registration_url IS NOT NULL;
