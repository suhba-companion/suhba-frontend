-- Kinderunterricht der Firdeus-Moschee, wöchentlich samstags.
-- Quelle: Instagram-Story-Plakat der Firdeus-Moschee.
--
-- Jahr: Das Plakat druckt "17. OKTOBER 2025", nennt aber zugleich "jeden
-- Samstag" und "Start ab nächstem Samstag". Der 17.10.2025 war ein Freitag,
-- der 17.10.2026 ist ein Samstag. Das Plakat kam im Oktober 2026 herein,
-- also ist 2026 gemeint und die Jahreszahl auf dem Plakat ein Druckfehler.
--
-- Wöchentliche Reihe, deshalb eine Zeile mit `recurrence = 'WEEKLY'` (V28).
-- `start_time` ist der Anker und zugleich der erste Termin, die nächste
-- Wiederholung projiziert EventServiceImpl beim Lesen. Das Plakat nennt kein
-- Ende, also bleibt `recurrence_until` NULL.
--
-- Zeiten: Das Plakat nennt mit 10:00 Uhr einen echten Beginn, deshalb kein
-- `start_prayer`. Das Ende ist mit "bis zum Mittagsgebet" angegeben; dafür
-- gibt es keine eigene Spalte, also steht in `end_time` der Dhuhr des
-- Ankertags aus V12 (17.10.2026: 12:45). Achtung: Für spätere Termine
-- verschiebt EventServiceImpl `end_time` um dieselbe Dauer wie den Beginn,
-- das Ende bleibt also bei 2h45 und wandert nicht mit dem echten Dhuhr mit.
-- Deshalb steht "bis zum Mittagsgebet" zusätzlich in der Beschreibung.
--
-- Zeitzone: Am 17.10.2026 gilt noch die Sommerzeit (Umstellung erst am
-- 25.10.), also `+02`.
--
-- Kein Gratis-Angebot: 20 Euro pro Kind und Monat, deshalb `is_free` false.
-- Die Anmeldung läuft über das Büro der Moschee, es gibt keine URL auf dem
-- Plakat, also kein `registration_url`.
--
-- Adresse und Koordinaten stammen vom bestehenden Eintrag "Firdeus Moschee"
-- (Raxstraße 14, 1100 Wien) in V7__seed_excel_spots.sql.
WITH new_events AS (
    INSERT INTO events (title, description, address, district, latitude, longitude,
                        start_time, end_time, start_prayer, organizer, contact_info,
                        is_free, google_maps_url, status, submitted_by, upvotes,
                        recurrence, recurrence_until)
    VALUES
      ('Firdeus: Unterricht für Kinder',
       'Wissen, Glauben, eine bessere Zukunft: Die Firdeus-Moschee gibt jeden Samstag von 10:00 Uhr bis zum Mittagsgebet Unterricht für Kinder. Themen sind die Grundlagen des Islam, gute Werte und Charakter sowie Gemeinschaft und Freundschaft. Für Jungen und Mädchen ab 6 Jahren. Die Anmeldung läuft über das Büro der Firdeus-Moschee, der monatliche Beitrag beträgt 20 Euro pro Kind.',
       'Raxstraße 14, 1100 Wien', '1100 Wien',
       48.165874, 16.3631607,
       '2026-10-17 10:00:00+02', '2026-10-17 12:45:00+02', NULL,
       'Firdeus Moschee', NULL,
       false, NULL,
       'APPROVED', 'seed', 0,
       'WEEKLY', NULL)
    RETURNING id
)
INSERT INTO event_categories (event_id, category)
SELECT id, c FROM new_events, UNNEST(ARRAY['CLASS', 'YOUTH']) AS c;
