# Coaches-Analyse

Gegner-Scouting für die BARMER 2. Basketball Bundesliga (ProA, ProB Nord, ProB Süd).
Die App zeigt Tabelle, nächste Spiele, Teamvergleich und die Top 5 des Gegners.
Die Daten liest ein Skript von 2basketballbundesliga.de ein und legt sie in einer Datei ab, die die App lädt.

## Aufbau

| Ordner / Datei | Inhalt |
|---|---|
| `docs/index.html` | Die App (eine einzige HTML-Datei) |
| `docs/daten/daten.json` | Der Datenbestand, den die App lädt. Enthält zum Start den Stand von Prototyp 3. |
| `scraper/einlesen.py` | Das Einlese-Skript |
| `.github/workflows/einlesen.yml` | Startet das Skript automatisch (täglich) und auf Knopfdruck |
| `worker/worker.js` | Optional: Start-Dienst, damit der Button in der App das Einlesen auslösen kann |

## Was das Skript einliest

Je Liga die Teamstatistik und die Tabelle, dazu die Kader-Seite jedes Teams
(Kader, Spielplan, Spielerstatistik der Hauptrunde). Ein vollständiger Lauf sind 53 Abrufe
mit 1,5 Sekunden Pause dazwischen, also etwa zwei Minuten.

- **Modus `aktualisieren`** (täglich abends): liest die 6 Übersichtsseiten und nur die Kader-Seiten
  der Teams, deren Teamstatistik sich seit dem letzten Lauf geändert hat. Ohne neue Spiele sind das 6 Abrufe.
- **Modus `voll`** (montags früh): liest alle 47 Kader-Seiten, damit auch Spielverlegungen und Kaderänderungen ankommen.

**Prüfungen:** Für jedes Team müssen die Punkte aller Spieler zusammen die Teampunkte der Teamstatistik
ergeben. Passt das nicht (Kader-Seite noch nicht aktualisiert), erscheint ein Hinweis in der App und das
Team wird beim nächsten Lauf erneut eingelesen.
Erkennt das Skript, dass sich der Aufbau der Liga-Seiten geändert hat, bricht es ab (Exit-Code 1) und die
bisherige `daten.json` bleibt unverändert. GitHub meldet den fehlgeschlagenen Lauf dann per E-Mail.

## Einrichtung (ca. 15 Minuten)

1. **Repository anlegen:** Auf GitHub ein neues Repository erstellen (z. B. `coaches-analyse`) und den
   gesamten Inhalt dieses Ordners hochladen, inklusive des Ordners `.github`.
2. **Schreibrecht für Workflows:** *Settings → Actions → General → Workflow permissions →
   „Read and write permissions“* auswählen und speichern.
3. **App veröffentlichen:** *Settings → Pages → Source: „Deploy from a branch“*, Branch `main`,
   Ordner `/docs`. Nach etwa einer Minute ist die App unter `https://<name>.github.io/coaches-analyse/` erreichbar.
4. **Erster vollständiger Lauf:** *Actions → „Daten einlesen“ → „Run workflow“*, Modus `voll`.
   Nach etwa drei Minuten zeigt die Zusammenfassung des Laufs, wie viele Teams eingelesen und geprüft wurden.
   Danach liegen Spielerwerte für alle 47 Teams vor.

Ab jetzt läuft das Einlesen jeden Abend automatisch. Der Button „Aktualisieren“ in der App lädt den
neuesten Stand.

### Optional: Button startet das Einlesen selbst

Ohne diesen Schritt lädt der Button nur den zuletzt automatisch eingelesenen Stand. Soll er das Einlesen
direkt auslösen (z. B. am Spieltag kurz nach Spielende), braucht es einen kleinen Start-Dienst, denn der
dafür nötige GitHub-Schlüssel darf nicht in der öffentlichen App stehen.

1. **Schlüssel erstellen:** GitHub → *Settings → Developer settings → Fine-grained tokens → Generate new token*.
   Nur dieses Repository auswählen, Berechtigung *Actions: Read and write*.
2. **Worker anlegen:** Bei Cloudflare (kostenloses Konto) *Workers → Create → Hello World*,
   den Inhalt von `worker/worker.js` einfügen und veröffentlichen.
3. **Einstellungen des Workers** (*Settings → Variables and Secrets*):
   `REPO` = `<name>/coaches-analyse`, `WORKFLOW` = `einlesen.yml`, `BRANCH` = `main`,
   `ERLAUBTE_HERKUNFT` = `https://<name>.github.io`, und als **Secret** `GITHUB_TOKEN` = der Schlüssel aus Schritt 1.
4. **App verbinden:** In `docs/index.html` bei `KONFIG.startUrl` die Adresse des Workers eintragen,
   z. B. `https://coaches-analyse.<name>.workers.dev`.

Der Start-Dienst lässt höchstens einen Lauf pro 15 Minuten zu, damit der Server der Liga nicht unnötig belastet wird.
Nach dem Klick lädt die App die neuen Daten selbstständig, sobald sie veröffentlicht sind (meist nach 2 bis 4 Minuten).

## Lokal testen

```bash
pip install -r scraper/requirements.txt
python scraper/einlesen.py --team 527                 # eine Kader-Seite einlesen und anzeigen
python scraper/einlesen.py --modus voll               # alles einlesen, schreibt docs/daten/daten.json
python -m http.server 8000 --directory docs           # App unter http://localhost:8000 öffnen
```

Die App muss über einen Webserver geöffnet werden; als Datei per Doppelklick geöffnet kann sie die Daten nicht laden.

## Wichtig vor dem Einsatz

- **Freigabe der Liga:** Automatisiertes Einlesen sollte mit der BARMER 2. Basketball Bundesliga abgestimmt sein.
- **Kontakt eintragen:** In `scraper/einlesen.py` bei `USER_AGENT` eine Kontaktadresse ergänzen, damit die Liga weiß, wer die Seiten abruft.
- **Sichtbarkeit:** Eine über GitHub Pages veröffentlichte App ist für jeden mit dem Link erreichbar. Die Daten selbst sind öffentlich.
- **Erster Lauf ist der Praxistest:** Das Skript wurde mit nachgebauten Liga-Seiten getestet, nicht gegen die echte Website.
  Zeigt die Zusammenfassung des ersten Laufs Prüfungsfehler, bitte die Meldungen weitergeben.
