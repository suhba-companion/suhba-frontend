-- „Das Gebet" aus der Reihe „Islam Basiskurs PLUS" im Islamischen Zentrum Wien,
-- 25.10.2026. Quelle: Ankündigungsplakat (IZW + Büro der Muslimischen Weltliga).
--
-- Das Plakat nennt eine feste Uhrzeit (10:00 bis 11:30), also `start_prayer = NULL`.
--
-- Offset ist `+01`, nicht `+02`: Die Sommerzeit endet am letzten Sonntag im Oktober,
-- also genau an diesem 25.10.2026 um 03:00. Um 10:00 gilt bereits Normalzeit.
--
-- Als Ort steht auf dem Plakat nur „im Veranstaltungssaal". Die Logos weisen das IZW
-- als Gastgeber aus, deshalb dessen Adresse und Koordinaten aus V7__seed_excel_spots.sql
-- (Am Bruckhaufen 3, 1210 Wien).
--
-- Kategorien: CLASS für den Kurscharakter, NEW_MUSLIMS für die Zielgruppe, die das
-- Plakat ausdrücklich anspricht („für Anfänger und neue Musliminnen und Muslime").
WITH new_event AS (
    INSERT INTO events (title, description, address, district, latitude, longitude,
                        start_time, end_time, start_prayer, organizer, contact_info,
                        is_free, google_maps_url, status, submitted_by, upvotes)
    VALUES
      ('Islam Basiskurs PLUS: Das Gebet',
       'Kurseinheit über das Gebet für Anfänger und neue Musliminnen und Muslime, mit Imam Salim Mujkanović. Teil der Reihe „Islam Basiskurs PLUS" des Islamischen Zentrums Wien und des Büros der Muslimischen Weltliga in Österreich. „Betet, wie ihr mich beten gesehen habt." (Bukhari)',
       'Am Bruckhaufen 3, 1210 Wien', '1210 Wien',
       48.2451678, 16.3977581,
       '2026-10-25 10:00:00+01', '2026-10-25 11:30:00+01', NULL,
       'Islamisches Zentrum Wien', NULL,
       true, 'https://maps.app.goo.gl/SE5rcuwPpdBh1VKTA',
       'APPROVED', 'seed', 0)
    RETURNING id
)
INSERT INTO event_categories (event_id, category)
SELECT id, category FROM new_event, (VALUES ('CLASS'), ('NEW_MUSLIMS')) AS c(category);
