-- Plakate nennen als Beginn oft nur ein Gebet ("nach dem Maghrib-Gebet") und keine
-- Uhrzeit. `start_prayer` hält diese Angabe fest, damit die App sie genauso anzeigt,
-- statt eine Uhrzeit zu behaupten, die so nicht angekündigt wurde.
--
-- `start_time` bleibt trotzdem NOT NULL: Sortierung, /upcoming und die Umkreissuche
-- brauchen einen echten Zeitpunkt. Das Backend füllt ihn aus `prayer_times`, sobald
-- `start_prayer` gesetzt ist. Die Spalte ist also die Anzeige, `start_time` der Anker.
ALTER TABLE events ADD COLUMN start_prayer VARCHAR(20);
