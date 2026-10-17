-- Benefizbasar für die Menschen im Sudan im Islamischen Zentrum Wien,
-- 25.10.2026. Quelle: Ankündigungsplakat des IZW (Büro der Muslimischen
-- Weltliga in Österreich / IZW, gemeinsam mit Takaful, Abrar, FAL und
-- Human Relief).
--
-- Das Plakat nennt echte Uhrzeiten (10:00–17:00 Uhr), deshalb kein
-- `start_prayer`, sondern `start_time` und `end_time`.
--
-- Achtung Zeitzone: Am 25.10.2026 endet die Sommerzeit (letzter Sonntag im
-- Oktober, Umstellung um 03:00). Die Basar-Zeiten liegen danach, also gilt
-- für beide Zeitstempel `+01` und nicht `+02`.
--
-- Koordinaten und Adresse stimmen mit dem bestehenden IZW-Eintrag in
-- V9__seed_events.sql überein (Am Bruckhaufen 3, 1210 Wien). Kontakt aus
-- der Fußzeile des Plakats.
WITH new_events AS (
    INSERT INTO events (title, description, address, district, latitude, longitude,
                        start_time, end_time, start_prayer, organizer, contact_info,
                        is_free, google_maps_url, status, submitted_by, upvotes)
    VALUES
      ('Benefizbasar für den Sudan',
       'Das Islamische Zentrum Wien veranstaltet gemeinsam mit Hilfsorganisationen und Vereinen in Österreich einen Benefizbasar für die Menschen im Sudan. Mit dabei sind Takaful, Abrar, FAL und Human Relief sowie das Büro der Muslimischen Weltliga in Österreich. Der Erlös geht an die Menschen im Sudan. Für alle, Eintritt frei.',
       'Am Bruckhaufen 3, 1210 Wien', '1210 Wien',
       48.2451678, 16.3977581,
       '2026-10-25 10:00:00+01', '2026-10-25 17:00:00+01', NULL,
       'Islamisches Zentrum Wien', 'office@islamiccentre.at, +43 1 2933194',
       true, NULL,
       'APPROVED', 'seed', 0)
    RETURNING id
)
INSERT INTO event_categories (event_id, category)
SELECT id, c FROM new_events, UNNEST(ARRAY['FUNDRAISER', 'COMMUNITY']) AS c;
