-- Remove three rows that are not halal businesses at all.
--
-- These came in from the V14 spreadsheet with certified = true, so neither the
-- certified flag nor the certification_body text marks them as doubtful. Only
-- researching the businesses themselves showed they do not belong in a halal
-- directory; no automated check over the seed would have caught them.
--
--   Kaisers   - "Kaiser's - Kaiser'schmarrn", an Austrian dessert franchise (27+ branches)
--               selling Kaiserschmarrn. Clear mis-import: the name collided with a
--               restaurant name during the spreadsheet build.
--   Apapika   - Hawaiian poke bowl / Asian fusion chain, 9 Vienna branches, makes no
--               halal claim anywhere.
--   Sajado    - Asian sushi / teppanyaki / all-you-can-eat chain, 6 Vienna branches,
--               makes no halal claim anywhere.
--
-- If the community does want non-certified mainstream chains listed, revert this
-- migration rather than editing it - the rows are correct data, just the wrong directory.

DELETE FROM halal_spot_cuisines
  WHERE spot_id IN (
    SELECT id FROM halal_spots
    WHERE submitted_by = 'excel_import_halal'
      AND name IN ('Kaisers', 'Apapika', 'Sajado')
  );

DELETE FROM halal_spots
  WHERE submitted_by = 'excel_import_halal'
    AND name IN ('Kaisers', 'Apapika', 'Sajado');
