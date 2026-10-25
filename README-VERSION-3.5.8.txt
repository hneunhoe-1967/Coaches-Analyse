Coaches-Analyse 3.5.8 – Coach-Ziele und mögliche Ergebniswirkung

Voraussetzung: Version 3.5.7 (3.5.6 braucht NICHT installiert zu werden).
Die vorhandenen Coach-Ziele aus 3.5.7 und die Basisprognose bleiben bestehen.

Ablauf:
1. Eigene Mannschaft und Gegner wählen
2. Bestehende Statistiken auswerten
3. Im Coach-Reiter drei Zielwerte definieren und speichern
4. "Aus meinen drei Zielen Szenario berechnen" klicken
5. Ausgangsprognose und hypothetisches Ziel-Szenario vergleichen

Keine Netzwerkzugriffe, kein automatischer Datenimport, keine Modifikation von IndexedDB.
Lokale Coach-Ziele bleiben im selben Browser gespeichert.

Modellhinweis: Alle angenommene Punktwirkungen sind illustrativ und NICHT historisch kalibriert.
Nur der stärkste offensive und defensive Hebel wird verwendet, um Doppelzählungen zu reduzieren.
Das Szenario ist eine Wenn-dann-Rechnung, keine Aussage über tatsächliche Zielerreichung.

Installation:
unzip -o .github/workflows/Coaches-Analyse-v3-5-8-Coach-Szenario.zip
python scripts/install_v358.py
node --check docs/coach-szenario-v358.js
node tests/test_v358.js
python tests/test_v358.py
