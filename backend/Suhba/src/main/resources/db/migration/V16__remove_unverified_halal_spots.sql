-- Remove halal spots whose halal status was never confirmed.
--
-- The V14 import carried a `certified` flag straight from the community spreadsheet.
-- 27 rows came in with certified = false AND certification_body 'Nicht verifiziert' or
-- 'Halal-Optionen verfuegbar'. Every one of them also carries the warning
-- "Halal-Status vor Besuch telefonisch bestaetigen" in its description, i.e. the
-- spreadsheet itself never established that these venues serve halal food.
--
-- The frontend maps certified = false onto the badge "Selbst-zertifiziert", which reads as a
-- claim the venue never made. Removing them is safer than showing an unverified halal claim.
--
-- NOT removed, deliberately:
--   * self-declared spots (certified = true, 347 rows) - self-declaration is the norm here
--     and the PRD gives it its own badge
--   * the 4 hotels below, which do arrange halal on request. They keep their row and
--     get the dedicated "Auf Anfrage" badge instead of being mislabelled self-certified:
--   Grand Hotel Wien – Grand Brasserie (1010 Wien)
--   Hotel Imperial – OPUS Restaurant (1010 Wien)
--   Hotel Sacher – Anna Sacher (1010 Wien)
--   Park Hyatt Vienna – The Bank (1010 Wien)
--
-- Rows removed:
--   Toranj Restaurant (1030 Wien)
--   Nayeb Restaurant (1040 Wien)
--   Restaurant Sarajevo (1040 Wien)
--   Apadana Restaurant (1050 Wien)
--   Jas (1060 Wien)
--   KOLBE – Persisches Restaurant (1070 Wien)
--   Café-Restaurant Shiraz (1080 Wien)
--   Pars Restaurant (1080 Wien)
--   Santoor (1080 Wien)
--   مطعم فارس ايراني (Pars Schwesterbetrieb) (1080 Wien)
--   Hatam (1090 Wien)
--   Safran Vienna (09) (1090 Wien)
--   Balkan Burek (Buchengasse) (1100 Wien)
--   Hafes Persian Restaurant (1100 Wien)
--   Ali & Baba Restaurant (1120 Wien)
--   Ava Meidling (1120 Wien)
--   Merak (Bosnische Ćevapi) (1150 Wien)
--   Restaurant Galaxie (Bosnisch) (1150 Wien)
--   Sofra (Bosnisch) (1150 Wien)
--   Illyrian Restaurant (Albanisch) (1160 Wien)
--   Balkan Burek & Grill (Hernals) (1170 Wien)
--   Tausend und eine Nacht (1170 Wien)
--   Ashpazkhane Irani Mamanpaz (1190 Wien)
--   Figls (1190 Wien)
--   Termeh Restaurant (1190 Wien)
--   Bosna Grill OG (1200 Wien)
--   Morvarid Food House (1220 Wien)

DELETE FROM halal_spot_cuisines
  WHERE spot_id IN (
    SELECT id FROM halal_spots
    WHERE submitted_by = 'excel_import_halal'
      AND certified = false
      AND certification_body IS DISTINCT FROM 'Hotel arrangiert auf Anfrage'
  );

DELETE FROM halal_spots
  WHERE submitted_by = 'excel_import_halal'
    AND certified = false
    AND certification_body IS DISTINCT FROM 'Hotel arrangiert auf Anfrage';
