CREATE TABLE events (
    id            BIGSERIAL        PRIMARY KEY,
    title         VARCHAR(255)     NOT NULL,
    description   TEXT,
    address       VARCHAR(500)     NOT NULL,
    district      VARCHAR(50)      NOT NULL,
    latitude      DOUBLE PRECISION NOT NULL,
    longitude     DOUBLE PRECISION NOT NULL,
    start_time    TIMESTAMPTZ      NOT NULL,
    end_time      TIMESTAMPTZ,
    category      VARCHAR(50)      NOT NULL,
    organizer     VARCHAR(255),
    contact_info  VARCHAR(255),
    is_free       BOOLEAN          NOT NULL DEFAULT TRUE,
    google_maps_url VARCHAR(500),
    status        VARCHAR(50)      NOT NULL DEFAULT 'PENDING',
    submitted_by  VARCHAR(255),
    created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    upvotes       INTEGER          NOT NULL DEFAULT 0
);

CREATE INDEX idx_events_start_time ON events (start_time);
CREATE INDEX idx_events_status     ON events (status);
CREATE INDEX idx_events_location   ON events (latitude, longitude);
