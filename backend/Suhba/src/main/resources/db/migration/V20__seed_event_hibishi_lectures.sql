-- Vortragsreihe mit Scheich Khalid Al-Hibishi in der Aisha As-Siddiqa Moschee,
-- 16.–18.10.2026. Quelle: Ankündigungsplakat der Moschee.
--
-- Das Plakat nennt als Zeit nur „nach dem Maghrib-Gebet". Start- und Endzeit
-- kommen deshalb aus der IZW-Tabelle in V12__seed_prayer_times.sql: Start =
-- Maghrib des Tages, Ende = Isha, der übliche Rahmen für einen Abendvortrag.
--
-- Koordinaten und Adresse stimmen mit dem bestehenden Eintrag derselben
-- Moschee in V9__seed_events.sql überein (Stöbergasse 5, 1050 Wien).
WITH new_events AS (
    INSERT INTO events (title, description, address, district, latitude, longitude,
                        start_time, end_time, organizer, contact_info, is_free,
                        google_maps_url, status, submitted_by, upvotes)
    VALUES
      ('Scheich Khalid Al-Hibishi: Spirituelle vs. psychische Erkrankungen',
       'Erster Abend der Vortragsreihe mit Scheich Khalid Al-Hibishi: Unterscheidung zwischen spirituellen Erkrankungen, psychischen Erkrankungen und Wahnvorstellungen (Waswasa). Beginn nach dem Maghrib-Gebet. Für Männer und Frauen. Vortrag auf Arabisch und Deutsch.',
       'Stöbergasse 5, 1050 Wien', '1050 Wien',
       48.1848382, 16.3557627,
       '2026-10-16 18:07:00+02', '2026-10-16 19:37:00+02',
       'Aisha As-Siddiqa Moschee', NULL,
       true, NULL,
       'APPROVED', 'seed', 0),

      ('Scheich Khalid Al-Hibishi: Lösungen für chronische Fälle',
       'Zweiter Abend der Vortragsreihe mit Scheich Khalid Al-Hibishi: Programme und Lösungen für langjährige bzw. chronische Fälle. Beginn nach dem Maghrib-Gebet. Für Männer und Frauen. Vortrag auf Arabisch und Deutsch.',
       'Stöbergasse 5, 1050 Wien', '1050 Wien',
       48.1848382, 16.3557627,
       '2026-10-17 18:05:00+02', '2026-10-17 19:35:00+02',
       'Aisha As-Siddiqa Moschee', NULL,
       true, NULL,
       'APPROVED', 'seed', 0),

      ('Scheich Khalid Al-Hibishi: Fragen und Antworten zur Behandlung',
       'Abschluss der Vortragsreihe mit Scheich Khalid Al-Hibishi: Fragen und Antworten zur Behandlung von Erkrankungen. Beginn nach dem Maghrib-Gebet. Für Männer und Frauen. Vortrag auf Arabisch und Deutsch.',
       'Stöbergasse 5, 1050 Wien', '1050 Wien',
       48.1848382, 16.3557627,
       '2026-10-18 18:03:00+02', '2026-10-18 19:33:00+02',
       'Aisha As-Siddiqa Moschee', NULL,
       true, NULL,
       'APPROVED', 'seed', 0)
    RETURNING id
)
INSERT INTO event_categories (event_id, category)
SELECT id, 'LECTURE' FROM new_events;
