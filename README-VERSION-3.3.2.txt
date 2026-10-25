Coaches-Analyse 3.3.2 - iPad Update

Änderungen:
- Bei der Mannschaftsliste erscheint eine gefilterte Liga ohne inneren vertikalen Scrollbalken.
- Vor dem Speichern aktualisierter öffentlicher Daten wird ein Download der bisherigen JSON-Daten ausgelöst.
- Die Aktualisierung wird verweigert, wenn bereits lokal vorhandene Spielerkader verloren gingen.
- Beide UI-Aktualisierungsbuttons nutzen bereits denselben syncDataset()-Pfad (3.3.1).

Installation (ZIP bei .github/ hochgeladen):
  unzip -o .github/Coaches-Analyse-v3-3-2-Update.zip
  python scripts/install_v332.py
  python tests/test_install_v332.py

Vor dem ersten echten Update zusätzlich händisch 'Daten exportieren' und das JSON auf dem iPad kontrollieren.
Bitte in Safari prüfen, dass ein automatischer Sicherungsdownload erscheint. GitHub Pages ist eine statische Web-App; kein Serverbackup.
