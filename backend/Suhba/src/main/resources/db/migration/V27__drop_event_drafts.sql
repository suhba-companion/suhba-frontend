-- Reverts V26. The Telegram flyer bot was removed again, so its two tables go with it.
--
-- V26 is deliberately left in place rather than deleted: Flyway records every migration
-- it has applied, and removing the file after it ran makes validation fail on the next
-- boot ("detected applied migration not resolved locally"), which takes the backend down.
-- Dropping forward is the only safe direction once a migration has shipped.
DROP TABLE IF EXISTS event_drafts;
DROP TABLE IF EXISTS telegram_processed_updates;
