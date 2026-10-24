-- Drafts produced by the Telegram flyer bot.
--
-- A flyer becomes a draft first, the user corrects it in chat, and only a confirmed
-- draft is written to `events`. Nothing half-corrected ever reaches the pending queue.
--
-- The draft lives in Postgres rather than in a map because a correction has to survive
-- a deploy: the backend restarts on every push, and an in-memory draft lost mid-edit
-- means retyping the whole flyer. Same reasoning as the upvote-dedupe note in CLAUDE.md,
-- except here the state is user-visible, so losing it is worse.
CREATE TABLE event_drafts (
    id                BIGSERIAL    PRIMARY KEY,
    chat_id           BIGINT       NOT NULL,
    telegram_file_id  TEXT         NOT NULL,
    file_unique_id    VARCHAR(255) NOT NULL,
    -- The model's JSON draft. Re-sent verbatim on every correction so the next call
    -- revises the previous answer instead of re-reading the flyer from scratch.
    payload           TEXT         NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    created_event_ids VARCHAR(255),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- One open draft per chat is the whole conversational model: a new flyer supersedes the
-- previous one, so a plain text message is always unambiguously about this row.
CREATE UNIQUE INDEX idx_event_drafts_one_open_per_chat
    ON event_drafts (chat_id) WHERE status = 'OPEN';

CREATE INDEX idx_event_drafts_chat ON event_drafts (chat_id);

-- Telegram retries any webhook delivery it did not get a 2xx for, including ones the
-- backend actually processed before dying. Without this table a retry means a second
-- draft, or worse, a duplicate set of events for a flyer already confirmed.
CREATE TABLE telegram_processed_updates (
    update_id    BIGINT      PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Matches V15: every table in `public` is closed to the Supabase anon/authenticated
-- roles. Drafts hold flyer contents and chat ids, so this is not optional.
ALTER TABLE event_drafts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_processed_updates ENABLE ROW LEVEL SECURITY;
