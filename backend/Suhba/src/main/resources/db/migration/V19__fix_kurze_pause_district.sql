-- Fix the district of Kurze Pause Imbiss, confirmed by the directory owner.
--
-- The V14 import recorded district '1120 Wien' (Meidling) while the address says
-- 'Friedrich-Engels-Platz, 1200 Wien'. The address is the correct one: OpenStreetMap
-- places Friedrich-Engels-Platz in Brigittenau, which is the 20th district.
--
-- The wrong district also put the coordinates ~7.5 km away, because V14 assigned every
-- spot the centroid of its district column rather than geocoding the address. Both the
-- district and the coordinates are corrected here.
--
-- The coordinates are the square itself, not a house number: the address carries no
-- street number, so this is as precise as the source data allows.

UPDATE halal_spots
   SET district  = '1200 Wien',
       latitude  = 48.243638,
       longitude = 16.379450
 WHERE submitted_by = 'excel_import_halal'
   AND name = 'Kurze Pause Imbiss';
