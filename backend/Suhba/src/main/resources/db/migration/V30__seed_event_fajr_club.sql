-- Fajr Club des Mizan Collective in Kooperation mit Muslim Space, wöchentlich
-- ab 01.11.2026. Quelle: Instagram-Post von @mizancollective ("Every Sunday",
-- "Start: Sun, 01. November 2026").
--
-- Das Plakat nennt eine echte Uhrzeit (06:10), deshalb `start_time` und kein
-- `start_prayer`. Laut V12 ist am 01.11.2026 Fajr um 05:10 und Shuruq um
-- 06:40, der Termin liegt also wie angekündigt vor Sonnenaufgang.
--
-- Wöchentliche Reihe, deshalb eine einzige Zeile mit `recurrence = 'WEEKLY'`
-- (siehe V28): `start_time` ist der Anker und zugleich der erste Termin, die
-- nächste Wiederholung projiziert EventServiceImpl beim Lesen. Das Plakat
-- nennt kein Ende, also bleibt `recurrence_until` NULL.
--
-- Zeitzone: Die Sommerzeit endete am 25.10.2026, also gilt `+01`.
--
-- Den Ort nennt das Plakat selbst nicht, er kommt aus der Angabe der
-- Nutzerin (Dua Center, 1. Bezirk). Adresse und Koordinaten stammen vom
-- bestehenden Eintrag "Dua Center Moschee" (Kantgasse 3, 1010 Wien) in
-- V7__seed_excel_spots.sql.
WITH new_events AS (
    INSERT INTO events (title, description, address, district, latitude, longitude,
                        start_time, end_time, start_prayer, organizer, contact_info,
                        is_free, google_maps_url, status, submitted_by, upvotes,
                        recurrence, recurrence_until)
    VALUES
      ('Fajr Club',
       'Das Mizan Collective lädt in Kooperation mit Muslim Space jeden Sonntag um 06:10 Uhr zum gemeinsamen Fajr-Gebet ins Dua Center. Der erste Termin war am 01.11.2026, danach läuft die Reihe wöchentlich weiter. Für alle, Eintritt frei.',
       'Kantgasse 3, 1010 Wien', '1010 Wien',
       48.2024213, 16.3773561,
       '2026-11-01 06:10:00+01', NULL, NULL,
       'Mizan Collective', '@mizancollective',
       true, NULL,
       'APPROVED', 'seed', 0,
       'WEEKLY', NULL)
    RETURNING id
)
INSERT INTO event_categories (event_id, category)
SELECT id, c FROM new_events, UNNEST(ARRAY['PRAYER', 'COMMUNITY']) AS c;
