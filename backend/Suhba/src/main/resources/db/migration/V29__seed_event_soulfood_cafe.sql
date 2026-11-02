-- Soulfood Café im Džemat Bosna, 02.11.2026. Quelle: Instagram-Story von
-- @soulfood_cafe_wien, das Plakat nennt @dzematbosnabec als Gastgeber.
--
-- Das Plakat nennt eine echte Uhrzeit ("18:30 h"), deshalb `start_time` und
-- kein `start_prayer`. Der Zusatz "nach dem Gebet" nennt kein bestimmtes
-- Gebet; laut V12 ist am 02.11.2026 Isha um 18:09, der Beginn liegt also
-- danach. Da die Uhrzeit auf dem Plakat führt, bleibt sie die Anzeige und
-- der Hinweis steht in der Beschreibung.
--
-- Zeitzone: Die Sommerzeit endete am 25.10.2026, also gilt `+01`.
--
-- Ein Ende kündigt das Plakat nicht an, deshalb `end_time` NULL.
--
-- Adresse und Koordinaten stimmen mit dem bestehenden Eintrag
-- "Dzemat Bosna" (Hippgasse 32, 1160 Wien) in V7__seed_excel_spots.sql überein.
WITH new_events AS (
    INSERT INTO events (title, description, address, district, latitude, longitude,
                        start_time, end_time, start_prayer, organizer, contact_info,
                        is_free, google_maps_url, status, submitted_by, upvotes)
    VALUES
      ('Soulfood Café: Gespräche über Wachstum',
       'Das Soulfood Café lädt zu Gesprächen über persönliches und spirituelles Wachstum in den Džemat Bosna. Beginn um 18:30 Uhr im Anschluss an das Gebet. Für alle, Eintritt frei.',
       'Hippgasse 32, 1160 Wien', '1160 Wien',
       48.2074267, 16.3360743,
       '2026-11-02 18:30:00+01', NULL, NULL,
       'Soulfood Café', '@soulfood_cafe_wien',
       true, NULL,
       'APPROVED', 'seed', 0)
    RETURNING id
)
INSERT INTO event_categories (event_id, category)
SELECT id, 'COMMUNITY' FROM new_events;
