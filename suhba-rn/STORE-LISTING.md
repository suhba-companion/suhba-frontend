# App Store Connect — Metadaten (de-DE)

Primärsprache: **Deutsch (Österreich)**. Alles unten ist fertig zum Einfügen; die
Zeichenzahl steht jeweils dabei, Apples Limit in Klammern.

---

## App-Name (30)

```
Suhba – Muslimisch in Wien
```
26 Zeichen.

## Untertitel (30)

```
Gebetszeiten, Orte & Azkar
```
26 Zeichen.

## Keywords (100, kommagetrennt, keine Leerzeichen)

```
moschee,gebetszeiten,wien,muslim,islam,azkar,duaa,dhikr,gebet,moscheen,juma,österreich,gebetsort
```
96 Zeichen. Der App-Name wird von Apple ohnehin indexiert, steht deshalb nicht drin.
„Halal" fehlt bewusst: der Tab ist in dieser Version nicht erreichbar.

## Werbetext / Promotional Text (170)

```
Gebetszeiten für Wien, die nächste Moschee auf der Karte, Veranstaltungen in deiner Nähe und die Morgen- und Abend-Azkar — alles mit Quellenangabe, alles ohne Konto.
```
164 Zeichen. Lässt sich jederzeit ohne neue App-Version ändern.

## Beschreibung (4000)

```
Suhba ist dein muslimischer Begleiter in Wien.

Ob du hier lebst oder nur zu Besuch bist: Suhba beantwortet die Fragen, die im Alltag
zählen. Wann ist Maghrib? Wo kann ich jetzt beten? Was ist diese Woche los?

GEBETSZEITEN
Die Zeiten für Wien auf einen Blick, mit Countdown bis zum nächsten Gebet. Fajr,
Shorouk, Dhuhr, Asr, Maghrib und Isha, dazu Sonnenaufgang und Mitternacht.

GEBETSORTE UND MOSCHEEN
Über 50 Gebetsorte in ganz Wien, als Liste oder auf der Karte. Jeder Eintrag zeigt
Entfernung und Fußweg, und du startest die Route mit einem Tipp.

Filtere nach dem, was dir wichtig ist:
• Freitagsgebet
• Wudu-Möglichkeit
• Frauenbereich
• Parkplatz
• Hijab verfügbar
• Gebetskleidung verfügbar

EVENTS
Vorträge, Kurse, Iftar-Einladungen und Gemeinschaftsveranstaltungen in Wien. Filtere
nach Heute oder Diese Woche, sieh auf einen Blick was kostenlos ist, und teile einen
Termin mit einem Tipp.

AZKAR UND DUAA
Die Morgen-Azkar (Sabah) und Abend-Azkar (Masa'), dazu zählbare Dhikr-Formeln mit
eingebautem Tasbih-Zähler. Jede Karte zeigt den arabischen Text, die Umschrift und die
deutsche Bedeutung.

Und das Wichtigste: jede Karte nennt ihre Quelle. Suhba nimmt ausschließlich auf, was
wörtlich im Qur'an steht oder in einem sahih Hadith überliefert ist. Hasan reicht nicht.
Du sollst nachschlagen können, was du rezitierst.

VON DER COMMUNITY, FÜR DIE COMMUNITY
Du kennst einen Gebetsort, der fehlt? Oder eine Veranstaltung, von der alle wissen
sollten? Du kannst beides direkt in der App vorschlagen.

OHNE KONTO, OHNE TRACKING
Keine Registrierung, keine Anmeldung, keine Werbung. Suhba sammelt keine Profile und
gibt nichts an Dritte weiter. Deinen Standort nutzt die App nur, um Entfernungen zu
berechnen, und nur solange sie offen ist. Erlaubst du ihn nicht, rechnet Suhba einfach
ab Wien-Mitte weiter.

Suhba (صُحبة) ist arabisch für Begleitung.
```
Rund 1.750 Zeichen.

## Was ist neu (4000) — Version 1.0.0

```
Die erste Version von Suhba.

Gebetszeiten für Wien, über 50 Gebetsorte auf Karte und Liste, Veranstaltungen aus der
Wiener Community und die Morgen- und Abend-Azkar mit Quellenangabe.
```

---

## Pflichtfelder, die noch von dir kommen müssen

| Feld | Status |
|---|---|
| **Datenschutz-URL** | ✅ `https://suhba-companion.com/datenschutz`, seit 2026-11-11 live. |
| Support-URL | ✅ `https://suhba-companion.com/impressum`, enthält suhba.companion@gmail.com. |
| Marketing-URL | Optional, darf leer bleiben. |
| Kategorie | Primär **Referenz**, sekundär **Lifestyle**. |
| Altersfreigabe | Über den Fragebogen; bei diesem Inhalt wird **4+** herauskommen. |
| Urheberrecht | `2026 Amal Mostafa, Mona Imam` |

### Zur Datenschutz-URL

Erledigt. `useLegalRoute` gibt `/datenschutz` und `/impressum` echte Adressen
(`history.pushState`, `vercel.json` schreibt jeden Pfad auf `index.html` um). Beide
URLs sind im Produktions-Bundle verifiziert und direkt aufrufbar.

---

## Screenshots

Apple verlangt mindestens **ein** Set, nämlich 6.9" (1320 × 2868). Ältere Größen leitet
Apple davon ab. Simulator dafür: **iPhone 17 Pro Max**.

Vorschlag für die vier Aufnahmen, in dieser Reihenfolge:
1. **Start** — Gebetszeiten-Widget mit Countdown und Dhikr-Karte
2. **Gebetsorte, Karte** — Pins über Wien mit Legende
3. **Events** — Liste mit Filterzeile
4. **Azkar** — eine Karte mit Arabisch, Umschrift, Deutsch und Quellzeile
