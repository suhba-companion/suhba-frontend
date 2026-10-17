---
name: event-from-flyer
description: Turn an event flyer image (or screenshot/poster, usually German or Arabic) into Suhba event rows. Use whenever the user drops a flyer, poster, or announcement picture and wants the event added to Suhba, entered into the app, or "eingetragen".
---

# Event aus Flyer eintragen

Ein Plakat wird zu einer Flyway-Seed-Migration mit einer `events`-Zeile pro Termin.
Kuratierte Daten kommen in Suhba immer über Migrationen (`V9__seed_events.sql`,
`V13`/`V14` für Halal), nicht über die öffentliche `POST /api/v1/events`-Route,
die nur `PENDING` erzeugt.

## 1. Flyer auslesen

Aus dem Bild ziehen und als kurze Liste an die Nutzerin zurückmelden, **bevor**
geschrieben wird. Bei Unklarheiten (fehlendes Jahr, unleserliche Hausnummer)
nachfragen statt raten:

| Feld | Woher |
|---|---|
| Titel je Termin | Vortragsthema; bei Reihen Sprecher voranstellen |
| Datum(e) | Jedes Kästchen = ein eigener Event-Datensatz |
| Uhrzeit | Echte Uhrzeit **oder** „nach dem Maghrib-Gebet" → siehe Schritt 3 |
| Ort + Adresse | Moscheename + Straße/PLZ |
| Veranstalter | Logo/Fußzeile |
| Sprache, Zielgruppe, Preis | Fußzeile („Für Männer und Frauen", „Auf Arabisch und Deutsch") |
| Anmeldung/Link | Nur wenn eine echte URL auf dem Plakat steht |

Fehlt das Jahr: aus Wochentag + Datum herleiten (z. B. „Freitag, 16.10." passt
2026) und die Herleitung im Kommentar der Migration festhalten.

## 2. Ort auflösen

Venue-Namen oder Adresse zuerst im Repo suchen, damit Koordinaten konsistent bleiben:

```bash
grep -rn "Stöbergasse" backend/Suhba/src/main/resources/db/migration/
```

Treffer in `V9__seed_events.sql`, `V4`/`V7` (prayer_spots) oder `V13`/`V14`
liefern `latitude`, `longitude`, `district`. Nur wenn nichts existiert, Koordinaten
neu bestimmen und das in der Antwort offenlegen. `district` ist immer die Form
`'1050 Wien'`. `google_maps_url` darf `NULL` bleiben, die App baut die Route aus
der Adresse (`@utils/maps`).

## 3. Zeitangabe

Nennt das Plakat eine Uhrzeit, kommt sie nach `start_time` (plus `end_time`, wenn
ein Ende angekündigt ist). Nennt es nur ein Gebet („nach dem Maghrib-Gebet"),
wird **keine Uhrzeit erfunden**. Dafür gibt es `start_prayer`:

- `start_prayer` = `'FAJR' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA'`. Nur diese
  Spalte zeigt die App an, als „nach dem Maghrib-Gebet".
- `start_time` bleibt trotzdem Pflicht (Sortierung, `/upcoming`, Umkreissuche) und
  ist der Gebetszeitpunkt des Tages aus dem Kalender:

```bash
grep -E "2026-10-1[5-9]" backend/Suhba/src/main/resources/db/migration/V12__seed_prayer_times.sql
# ('2026-10-16', fajr, shuruq, dhuhr, asr, '18:07', '19:37')
```

- `end_time` bleibt `NULL`: das Plakat kündigt kein Ende an, und die App zeigt
  neben einem Gebetsbeginn ohnehin keine Endzeit.
- Jeder Tag hat eigene Gebetszeiten, also pro Datum neu nachschlagen.

Zeitzonen-Offset explizit schreiben: `+02` in der Sommerzeit, sonst `+01`. Die
Umstellung passiert am letzten Sonntag im März (02:00, vor) und am letzten Sonntag
im Oktober (03:00, zurück). An diesen beiden Tagen genau hinsehen: ein Event am
25.10.2026 um 10:00 liegt schon in der Normalzeit, also `+01`.

Über die API (`POST /api/v1/events`) oder das Admin-Panel läuft es genauso: dort
reicht das Datum plus das Gebet, `EventServiceImpl.resolveStartTime` setzt
`start_time` selbst aus `prayer_times`. Deckt der Kalender das Datum nicht ab,
wirft es eine `BLException`. Dann muss zuerst das Jahr in `prayer_times` liegen.

## 4. Migration schreiben

Nächste freie Nummer ermitteln (lexikalisches `ls` sortiert falsch):

```bash
ls backend/Suhba/src/main/resources/db/migration/ | sort -V | tail -1
```

Datei: `V<n>__seed_event_<kurzname>.sql`. Seit `V19` liegen Kategorien in der
Kindtabelle `event_categories`, deshalb ein CTE:

```sql
WITH new_events AS (
    INSERT INTO events (title, description, address, district, latitude, longitude,
                        start_time, end_time, start_prayer, organizer, contact_info,
                        is_free, google_maps_url, status, submitted_by, upvotes)
    VALUES
      ('…', '…', 'Stöbergasse 5, 1050 Wien', '1050 Wien', 48.1848382, 16.3557627,
       '2026-10-16 18:07:00+02', NULL, 'MAGHRIB',
       'Aisha As-Siddiqa Moschee', NULL, true, NULL, 'APPROVED', 'seed', 0)
    RETURNING id
)
INSERT INTO event_categories (event_id, category)
SELECT id, 'LECTURE' FROM new_events;
```

Hat **ein** Termin eine andere Kategorie als die anderen, braucht er ein eigenes
CTE, denn `RETURNING id` unterscheidet die Zeilen sonst nicht.

Feldregeln:
- `status` = `'APPROVED'` (kuratiert, kein Nutzer-Submit), `submitted_by` = `'seed'`, `upvotes` = `0`
- `categories`: `PRAYER, LECTURE, CLASS, COMMUNITY, YOUTH, SPORT, FUNDRAISER,
  NEW_MUSLIMS, OTHER`. Mehrere sind erlaubt und oft richtig: ein Kurs, der sich laut
  Plakat ausdrücklich an neue Musliminnen und Muslime richtet, bekommt `CLASS`
  **und** `NEW_MUSLIMS`. Zielgruppen-Kategorien nur vergeben, wenn das Plakat sie
  selbst nennt.
- Es gibt **kein** Audience-Feld mehr (`V17` angelegt, `V18` entfernt). Zielgruppe
  und Sprache gehören in die `description`.
- Der Beginn gehört nicht in die `description`, dafür ist `start_prayer` da.
- `registration_url` muss mit `http://`/`https://` beginnen, sonst weglassen.
- Kopf der Migration: Kommentar mit Quelle („Ankündigungsplakat der Moschee") und
  jeder Herleitung (Zeiten aus `V12`, Koordinaten aus `V9`).

Deutsche Texte:
- Titel kurz und scanbar, max. 255 Zeichen
- Mehrteilige Reihen: jeder Abend ist ein eigener Datensatz und wird einzeln
  angezeigt, also muss jeder Titel für sich verständlich sein. Position direkt
  hinter den Sprecher, dann Thema: `'Scheich Al-Hibishi (3/3): Fragen und
  Antworten zur Behandlung'`. Die Position gehört nach vorne, weil die Event-Karte
  lange Titel hinten abschneidet. Vornamen und das Wort „Vortragsreihe" in die
  Beschreibung, damit der Titel kurz bleibt.
- Beschreibung: vollständiges Originalthema + Beginn + Zielgruppe + Sprache,
  ein Absatz, keine Emojis
- Umlaute direkt schreiben, kein Escaping; `''` für Apostrophe in SQL

## 5. Prüfen

Migration gegen die laufende lokale DB in einer zurückgerollten Transaktion testen
(Flyway soll sie später selbst anwenden, also nichts dauerhaft einspielen):

```bash
{ echo "BEGIN;"; cat backend/Suhba/src/main/resources/db/migration/V20__....sql; \
  echo "SELECT title, start_time, start_prayer FROM events WHERE submitted_by='seed' ORDER BY id DESC LIMIT 5;"; \
  echo "ROLLBACK;"; } | docker exec -i suhba-db-1 psql -U suhba -d suhba -v ON_ERROR_STOP=1
```

Läuft kein `suhba-db-1`: `docker compose up -d db`. Ausgabe ist UTC, `18:07+02`
erscheint also als `16:07+00`, das ist korrekt.

Danach berichten: welche Termine angelegt wurden, welche Zeiten gesetzt sind und
woher sie stammen. Die Migration greift beim nächsten Backend-Start (lokal und
auf Render/Supabase beim Deploy).
