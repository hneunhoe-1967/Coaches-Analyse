VERSION 3.5.14 – Spielanalysen für den Scouting-Report

Reiter Daten > Spielanalysen importieren: DOCX oder Analyse-JSON.
Zugeordnete Team- und Spieleraufgaben erscheinen im Scouting-Report
für das EIGENE Team (auch in der bestehenden Report-PDF-Ausgabe,
sofern der Scouting-Report zuvor erstellt wurde).

Die mitgelieferte Datei examples/bbc-coburg-vs-tv-langen-2026-11-01.json
enthält bereits 4 Team- und 8 Spieleraufgaben nach der vorliegenden
Coburg-Analyse. Für diesen Test bitte die JSON-Datei importieren –
sie ist gezielter als eine automatische DOCX-Texterkennung.

DOCX-Import: heuristische Texterkennung nach Überschriften.
Browser muss DecompressionStream('deflate-raw') unterstützen.
Dies ist keine KI-Textanalyse und Aufgaben sind manuell zu prüfen.

Achtung: Analysen werden unter localStorage im Browser gespeichert,
NICHT im bisherigen Mannschafts-JSON. Zur Weitergabe den neuen
Button 'Spielanalysen sichern (JSON)' verwenden. Keine Änderungen
an IndexedDB, CSV-Importen oder bereits bestehenden Coach-Zielen.

Installation (im Repository-Root):
  rm -f .github/workflows/Coaches-Analyse-v3-5-13-PDF-Vergleich-Layout.zip
  unzip -o .github/workflows/Coaches-Analyse-v3-5-14-Spielanalysen-Import.zip
  python scripts/install_v3514.py
  node --check docs/game-analysis-v3514.js
  python tests/test_v3514.py

Erst nach erfolgreichem Test git commit und push.

Beispiel fuer Browser-Download nach Veroeffentlichung: docs/examples/bbc-coburg-vs-tv-langen-2026-11-01.json
