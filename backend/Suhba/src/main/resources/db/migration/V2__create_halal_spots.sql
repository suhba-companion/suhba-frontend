CREATE TABLE halal_spots (
    id                 BIGSERIAL        PRIMARY KEY,
    name               VARCHAR(255)     NOT NULL,
    description        VARCHAR(1000),
    address            VARCHAR(500)     NOT NULL,
    district           VARCHAR(10)      NOT NULL,
    latitude           DOUBLE PRECISION NOT NULL,
    longitude          DOUBLE PRECISION NOT NULL,
    category           VARCHAR(50)      NOT NULL,
    phone              VARCHAR(50),
    website            VARCHAR(255),
    certified          BOOLEAN,
    certification_body VARCHAR(255),
    featured           BOOLEAN          NOT NULL DEFAULT FALSE,
    status             VARCHAR(50)      NOT NULL DEFAULT 'PENDING',
    submitted_by       VARCHAR(255)     NOT NULL,
    created_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    upvotes            INTEGER          NOT NULL DEFAULT 0
);

CREATE TABLE halal_spot_cuisines (
    spot_id BIGINT       NOT NULL REFERENCES halal_spots(id) ON DELETE CASCADE,
    cuisine VARCHAR(100) NOT NULL
);

CREATE INDEX idx_halal_spots_location ON halal_spots (latitude, longitude);
CREATE INDEX idx_halal_spots_status   ON halal_spots (status);
CREATE INDEX idx_halal_spots_featured ON halal_spots (featured);
