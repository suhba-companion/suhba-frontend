-- Fix the district of Doener Point Wien, confirmed by the directory owner.
--
-- The V14 import recorded district '1010 Wien' while the address says
-- 'U2 Museumsquartier, 1070 Wien'. The address is the correct one: the U2 station
-- sits on Museumsplatz, which OpenStreetMap places in Neubau with postcode 1070.
--
-- As with Kurze Pause Imbiss (V19), the wrong district also meant the wrong
-- coordinates, because V14 assigned every spot the centroid of its district column.
--
-- The coordinates are Museumsplatz itself. The source gives a metro station rather
-- than a street address, so the pin marks the station, not the shop door. This row
-- stays on the review list in backend/Suhba/data-review until a street address is known.

UPDATE halal_spots
   SET district  = '1070 Wien',
       latitude  = 48.203614,
       longitude = 16.359664
 WHERE submitted_by = 'excel_import_halal'
   AND name = 'Döner Point Wien';
