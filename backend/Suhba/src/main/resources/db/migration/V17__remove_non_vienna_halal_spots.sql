-- Remove halal spots that are not in Vienna.
--
-- Suhba is a Vienna directory, but the V14 import carried four rows outside the city:
--
--   Zushi Market SCS Voesendorf - Buffet (2334 Voesendorf)
--   Zushi Market SCS Voesendorf - Kiosk  (2334 Voesendorf)
--     Both sit in Westfield Shopping City Sued, in Lower Austria. They were the only
--     rows whose district column was never a Vienna postal code.
--
--   Su! Streetfood
--   Zafer Doener
--     Both were imported with the address literally 'Wien'. Research established that
--     Su! Streetfood trades in SCS Wiener Neudorf (Lower Austria) and that Zafer Doener
--     exists only in Unna, Germany - there is no Vienna venue of either name.
--
-- Note: the directory's nearby search uses a 15 km radius, so the Voesendorf rows (~12 km
-- from the centre) did surface in results. If the directory should cover the SCS malls
-- that Viennese shoppers actually use, revert this migration rather than editing it.

DELETE FROM halal_spot_cuisines
  WHERE spot_id IN (
    SELECT id FROM halal_spots
    WHERE submitted_by = 'excel_import_halal'
      AND (district = '2334 Vösendorf' OR name IN ('Su! Streetfood', 'Zafer Döner'))
  );

DELETE FROM halal_spots
  WHERE submitted_by = 'excel_import_halal'
    AND (district = '2334 Vösendorf' OR name IN ('Su! Streetfood', 'Zafer Döner'));
