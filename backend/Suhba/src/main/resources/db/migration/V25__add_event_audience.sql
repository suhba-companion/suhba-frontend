-- Some events are announced as open only to sisters or only to brothers. NULL means
-- the event is open to everyone, which is the common case and carries no badge.
--
-- V17 added an `audience` column while this was first tried out and V18 dropped it
-- again, so re-adding it here is safe on a database that has both applied.
ALTER TABLE events ADD COLUMN audience VARCHAR(20);
