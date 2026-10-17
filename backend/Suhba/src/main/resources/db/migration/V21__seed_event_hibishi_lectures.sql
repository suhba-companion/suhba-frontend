-- Vortragsreihe mit Scheich Khalid Al-Hibishi in der Aisha As-Siddiqa Moschee,
-- 16.–18.10.2026. Quelle: Ankündigungsplakat der Moschee.
--
-- Das Plakat nennt als Beginn nur „nach dem Maghrib-Gebet" und kein Ende. Deshalb
-- `start_prayer = 'MAGHRIB'` (das zeigt die App an) und `end_time = NULL`.
-- `start_time` ist der Maghrib-Zeitpunkt des Tages aus V12__seed_prayer_times.sql
-- und dient nur der Sortierung, angezeigt wird er nicht.
--
-- Jeder Abend ist ein eigener Datensatz und taucht einzeln in der Liste auf, deshalb
-- trägt jeder Titel seine Position in der Reihe (1/3). Die steht vorne, weil die
-- Event-Karte lange Titel hinten abschneidet.
--
-- Koordinaten und Adresse stimmen mit dem bestehenden Eintrag derselben
-- Moschee in V9__seed_events.sql überein (Stöbergasse 5, 1050 Wien).
WITH new_events AS (
    INSERT INTO events (title, description, address, district, latitude, longitude,
                        start_time, end_time, start_prayer, organizer, contact_info,
                        is_free, google_maps_url, status, submitted_by, upvotes)
    VALUES
      ('Scheich Al-Hibishi (1/3): Spirituelle vs. psychische Erkrankungen',
       'Erster Abend der Vortragsreihe mit Scheich Khalid Al-Hibishi: Unterscheidung zwischen spirituellen Erkrankungen, psychischen Erkrankungen und Wahnvorstellungen (Waswasa). Für Männer und Frauen. Vortrag auf Arabisch und Deutsch.',
       'Stöbergasse 5, 1050 Wien', '1050 Wien',
       48.1848382, 16.3557627,
       '2026-10-16 18:07:00+02', NULL, 'MAGHRIB',
       'Aisha As-Siddiqa Moschee', NULL,
       true, NULL,
       'APPROVED', 'seed', 0),

      ('Scheich Al-Hibishi (2/3): Lösungen für chronische Fälle',
       'Zweiter Abend der Vortragsreihe mit Scheich Khalid Al-Hibishi: Programme und Lösungen für langjährige bzw. chronische Fälle. Für Männer und Frauen. Vortrag auf Arabisch und Deutsch.',
       'Stöbergasse 5, 1050 Wien', '1050 Wien',
       48.1848382, 16.3557627,
       '2026-10-17 18:05:00+02', NULL, 'MAGHRIB',
       'Aisha As-Siddiqa Moschee', NULL,
       true, NULL,
       'APPROVED', 'seed', 0),

      ('Scheich Al-Hibishi (3/3): Fragen und Antworten zur Behandlung',
       'Abschluss der Vortragsreihe mit Scheich Khalid Al-Hibishi: Fragen und Antworten zur Behandlung von Erkrankungen. Für Männer und Frauen. Vortrag auf Arabisch und Deutsch.',
       'Stöbergasse 5, 1050 Wien', '1050 Wien',
       48.1848382, 16.3557627,
       '2026-10-18 18:03:00+02', NULL, 'MAGHRIB',
       'Aisha As-Siddiqa Moschee', NULL,
       true, NULL,
       'APPROVED', 'seed', 0)
    RETURNING id
)
INSERT INTO event_categories (event_id, category)
SELECT id, 'LECTURE' FROM new_events;
