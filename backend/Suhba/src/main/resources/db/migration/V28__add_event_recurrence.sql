-- A mosque programme that runs "jeden Samstag" is one series, not 52 rows. The series
-- is stored as a single event: `start_time` is the first occurrence and doubles as the
-- anchor, and `recurrence` says how it repeats from there.
--
-- Occurrences are never materialised. The service projects the next one that has not
-- passed yet onto the DTO at read time, so the series keeps one stable id (detail page,
-- upvotes) and never falls out of /upcoming the way a one-off does.
--
-- NULL recurrence means a one-off event, which is still the common case.
ALTER TABLE events ADD COLUMN recurrence VARCHAR(20);

-- Inclusive last date the series may still produce an occurrence on. NULL means the
-- series runs open-ended, which is what a weekly Quran circle usually does.
ALTER TABLE events ADD COLUMN recurrence_until DATE;

-- /upcoming has to consider every live series regardless of how long ago its anchor was,
-- so the recurring rows are read by recurrence, not by start_time.
CREATE INDEX idx_events_recurrence ON events (recurrence) WHERE recurrence IS NOT NULL;
