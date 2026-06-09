CREATE TABLE prayer_times (
    id      BIGSERIAL PRIMARY KEY,
    date    DATE NOT NULL UNIQUE,
    fajr    TIME NOT NULL,
    shuruq  TIME NOT NULL,
    dhuhr   TIME NOT NULL,
    asr     TIME NOT NULL,
    maghrib TIME NOT NULL,
    isha    TIME NOT NULL
);

CREATE INDEX idx_prayer_times_date ON prayer_times (date);
