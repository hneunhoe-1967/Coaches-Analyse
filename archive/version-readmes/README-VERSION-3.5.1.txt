Version 3.5.1 – Report-Tab repariert

Fehler in 3.5: Scouting-Report und Vergleich/Top-5 waren Kindknoten des Coach-Bereichs. Beim Reiterwechsel wurden sie zusammen mit Coach verborgen.

Korrektur:
- Unabhängige Statistik- und Report-Panels beim Start
- Eigener Scouting-Report-Button im Reiter Report
- Keine Änderung der Berechnungen, CSV-Daten oder Datenbank

Installation im Wurzelverzeichnis des Codespaces:
  unzip -o .github/workflows/Coaches-Analyse-v3-5-1-Report-Fix.zip
  python scripts/install_v351.py
  node --check docs/ux-v35.js
  python tests/test_install_v351.py

Danach in Safari Report öffnen und Top-5-Statistiken sowie Berichterstellung prüfen.
