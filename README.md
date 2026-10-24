# Coaches-Analyse – GitHub Pages / local-first

## Funktionen
- Öffentliche Links zu Ligaquellen
- Bestehende umfangreiche Gegneranalyse, Tabellen, Spielplan, Top 5 und Teamvergleich
- Lokaler Analysebereich mit Passphrase (nur **lokale Zugriffshürde**, keine Server-Authentifizierung)
- IndexedDB mit Team-, Spieler-, Spiel- und Statistiktabellen im JSON-Datensatz je Browser
- Manuelle Aktualisierung: neue veröffentlichte JSON-Datei abrufen, strukturell prüfen, lokal persistieren
- Manueller JSON-Import und JSON-Export
- Anzahl aller Teams wird aus dem Datensatz abgeleitet, nicht auf 47/57 fest kodiert

## Installieren
Alle Verzeichnisse `.github`, `docs`, `scraper`, `scripts`, `worker` und `README.md` im Repo-Root von `hneunhoe-1967/Coaches-Analyse` hochladen. KEIN zusätzlicher Unterordner.

GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Danach **Actions → GitHub Pages veröffentlichen → Run workflow**.

Webseite: https://hneunhoe-1967.github.io/Coaches-Analyse/

Lokaler Test: `python -m http.server 8000 --directory docs`; dann `http://localhost:8000/`. Nicht `file://`, sonst funktioniert JSON-fetch nicht.

## Vor Freigabe
- Alle vorliegenden Tabellen- und Spielerwerte sind ein **mitgelieferter Beispiel-/Startdatensatz**, nicht garantiert vollständig/aktuell.
- **Keine Echtzeit-Scraping-Funktion aktiv**, keine automatischen zeitgesteuerten Scraper-Läufe.
- `ENABLE_LIVE_IMPORT` bleibt standardmäßig unset. Nur **nach schriftlicher Klärung** der zulässigen Nutzungsbedingungen als Repository-Variable auf `true` setzen. Dann kann der Owner `Actions → Daten einlesen (nur mit Freigabe)` auslösen.
- Der gesperrte Button `Neue Online-Erfassung anstoßen` wird absichtlich nicht funktionsfähig gemacht, bis ein sicherer authentifizierter serverseitiger Endpunkt existiert. Browser-Code darf nie GitHub Tokens beinhalten.
- Ein neuer GitHub-Actions-Deploy veröffentlicht `docs/daten/daten.json` nach erfolgreichem Import; Nutzer drücken `Veröffentlichte Daten prüfen & lokal aktualisieren`, um ihren IndexedDB-Datensatz zu aktualisieren.
- Das Datenmodell des bestehenden Scrapers liest dynamisch Teams aus Teamstatistik- und Tabellenquellen ein; Teamanzahl schwankt saisonal. Der Live-Scraper ist vor Freischaltung mit echten Ligaseiten funktional zu testen.

## Sicherheit / Rechte
Eine auf GitHub Pages veröffentlichte JSON ist **öffentlich abrufbar, auch wenn die Webseite eine lokale Passphrase verlangt**. Die Passphrase ist mit Salt+PBKDF2 lokal im Browser gespeichert, schützt aber weder den öffentlichen Download noch vor Zugriff über Browser-Entwicklertools. Die Daten werden nicht verschlüsselt abgelegt. Zur echten Einschränkung der Analyse- und Datenzugriffe ist ein Backend mit Identity Provider, Autorisierung und geschütztem API/Storage nötig.

**Für vertrauliche oder nur privat lizenzierte Rohdaten dürfen Daten nicht im öffentlichen `docs`-Verzeichnis liegen.** Bis das geklärt ist, nur freigegebene Inhalte veröffentlichen.

## Offline-Datenimport 2.0 – vor Datenfreigabe

**Kein Live-Abruf wird aktiviert.** Die produktive Datei `docs/daten/daten.json` bleibt beim Offline-Test unverändert. Die bisherigen (teilweise realen) Startdaten werden nicht durch erfundene Spielerstatistiken ersetzt. `tests/fixtures/` ist **nicht** Bestandteil der veröffentlichten Website.

```bash
python -m unittest discover -s tests -v
python scripts/validate_data.py docs/daten/daten.json --report /tmp/validierung.json
python scripts/create_test_data.py
python scripts/validate_data.py tests/fixtures/offline-testdaten.json --allow-synthetic
```

Der mitgelieferte Testdatensatz liegt unter `tests/fixtures/offline-testdaten.json`; er wird nicht nach GitHub Pages ausgeliefert. Der Generator ergänzt ausschließlich fehlende Teamkader durch eindeutig als `TEST` gekennzeichnete synthetische Spieler (festgelegter Seed, reproduzierbar). Bereits vorhandene Spielerstatistiken bleiben unangetastet. Der Testdatensatz enthält ein dauerhaftes `testdaten: true`-Merkmal. Standardmäßig lehnt die produktive Validierung solche Datensätze ab; nur `--allow-synthetic` lässt sie für Offline-Prüfungen zu. **Nicht in `docs/daten/daten.json` übernehmen!**

Der CI-Workflow `Offline-Import Tests (kein Live-Abruf)` prüft ohne Netzwerkabruf die Datenkonsistenz und Fehlerfälle. Das bisherige `einlesen.yml` bleibt weiterhin gesperrt, solange `ENABLE_LIVE_IMPORT` nicht ausdrücklich freigegeben wurde. Die Prüfung deckt u. a. Team-/Ligazuordnung, Tabellen, fehlende und doppelte Spieler, negative Werte, Spiel-IDs sowie Ergebnisse ab. Sie ist eine Struktur-/Plausibilitätsprüfung, kein Abgleich mit offiziellen Webseiten.
