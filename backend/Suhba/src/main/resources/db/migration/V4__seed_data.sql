INSERT INTO prayer_spots (name, address, district, latitude, longitude, type, wudu_available, sistan_available, friday_prayer, juma_time, parking, opening_hours, status, submitted_by, upvotes)
VALUES
  ('Islamisches Zentrum Wien',  'Am Bruckhaufen 4',       '1210 Wien',            48.2636, 16.3986, 'MOSQUE',  true,  true,  true,  '12:30', true,  'Mo–So 08:00–22:00',          'APPROVED', 'seed', 0),
  ('ATIB Moschee Favoriten',    'Laxenburger Str. 37',    '1100 Wien',            48.1817, 16.3764, 'MOSQUE',  true,  false, true,  '13:00', false, 'Mo–So 07:00–21:00',          'APPROVED', 'seed', 0),
  ('Albanische Moschee',        'Darnautgasse 10',         '1100 Wien',            48.1809, 16.3572, 'MOSQUE',  true,  true,  true,  '12:30', false, 'Mo–So 09:00–18:00',          'APPROVED', 'seed', 0),
  ('IGGÖ Hauptstelle',          'Bernardgasse 3',          '1070 Wien',            48.2034, 16.3491, 'MOSQUE',  true,  true,  true,  '12:15', false, 'Mo–Fr 09:00–17:00',          'APPROVED', 'seed', 0),
  ('Gebetsraum Brigittenau',    'Pappenheimgasse 35',      '1200 Wien',            48.2267, 16.3625, 'MUSALLA', false, false, false, NULL,    false, 'Mo–Fr 12:00–20:00',          'APPROVED', 'seed', 0),
  ('Masjid ar-Rahma',           'Quellenstraße 51',        '1100 Wien',            48.1756, 16.3809, 'MOSQUE',  true,  true,  true,  '13:15', false, 'Mo–So 07:00–22:00',          'APPROVED', 'seed', 0),
  ('Gebetsraum Flughafen Wien', 'Terminal 3, Gate E',      '1300 Wien Flughafen',  48.1103, 16.5697, 'MUSALLA', false, true,  false, NULL,    false, 'Täglich 00:00–24:00',        'APPROVED', 'seed', 0);

INSERT INTO halal_spots (name, address, district, latitude, longitude, category, certified, certification_body, featured, opening_hours, rating, status, submitted_by, upvotes)
VALUES
  ('Taqwa Restaurant',       'Quellenstraße 26',          '1100 Wien', 48.193, 16.367, 'RESTAURANT', true,  'HMA',          true,  'Mo–So 11:00–22:00',               4.7, 'APPROVED', 'seed', 0),
  ('Vienna Halal Market',    'Mariahilfer Str. 140',      '1150 Wien', 48.198, 16.330, 'GROCERY',    true,  'HMA',          true,  'Mo–Sa 08:00–20:00',               4.5, 'APPROVED', 'seed', 0),
  ('Özlem Café',             'Praterstraße 34',           '1020 Wien', 48.214, 16.390, 'CAFE',       false, NULL,           true,  'Mo–Fr 07:30–19:00, Sa 09:00–18:00', 4.3, 'APPROVED', 'seed', 0),
  ('Al-Sham Restaurant',     'Favoritenstraße 62',        '1100 Wien', 48.185, 16.370, 'RESTAURANT', false, NULL,           false, 'Mo–So 12:00–23:00',               4.1, 'APPROVED', 'seed', 0),
  ('Bosphorus Grill',        'Margaretenstraße 48',       '1050 Wien', 48.191, 16.358, 'RESTAURANT', false, 'Muslim-Owned', false, 'Mo–So 11:00–22:30',               4.4, 'APPROVED', 'seed', 0),
  ('Halal Metzgerei Özkan',  'Schönbrunner Str. 77',      '1050 Wien', 48.189, 16.340, 'BUTCHER',    true,  'HMA',          false, 'Mo–Fr 08:00–18:00, Sa 08:00–14:00', 4.6, 'APPROVED', 'seed', 0),
  ('Orient Express Café',    'Brigittenauer Lände 14',    '1200 Wien', 48.232, 16.371, 'CAFE',       false, 'Muslim-Owned', false, 'Mo–Sa 08:00–20:00',               4.0, 'APPROVED', 'seed', 0),
  ('Nour Lebensmittel',      'Thaliastraße 102',          '1160 Wien', 48.208, 16.336, 'GROCERY',    false, NULL,           false, 'Mo–Sa 09:00–19:00',               3.8, 'APPROVED', 'seed', 0),
  ('Istanbul Grill',         'Reinprechtsdorfer Str. 21', '1050 Wien', 48.195, 16.355, 'RESTAURANT', false, NULL,           false, 'Mo–So 10:00–23:00',               4.2, 'APPROVED', 'seed', 0);
