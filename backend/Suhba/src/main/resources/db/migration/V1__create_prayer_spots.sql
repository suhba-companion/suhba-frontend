CREATE TABLE prayer_spots (
    id               BIGSERIAL        PRIMARY KEY,
    name             VARCHAR(255)     NOT NULL,
    description      VARCHAR(1000),
    address          VARCHAR(500)     NOT NULL,
    district         VARCHAR(10)      NOT NULL,
    latitude         DOUBLE PRECISION NOT NULL,
    longitude        DOUBLE PRECISION NOT NULL,
    type             VARCHAR(50)      NOT NULL,
    wudu_available   BOOLEAN,
    sistan_available BOOLEAN,
    friday_prayer    BOOLEAN,
    status           VARCHAR(50)      NOT NULL DEFAULT 'PENDING',
    submitted_by     VARCHAR(255)     NOT NULL,
    created_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    upvotes          INTEGER          NOT NULL DEFAULT 0
);

CREATE INDEX idx_prayer_spots_location ON prayer_spots (latitude, longitude);
CREATE INDEX idx_prayer_spots_status   ON prayer_spots (status);
