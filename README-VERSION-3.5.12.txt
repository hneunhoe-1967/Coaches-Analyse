Coaches-Analyse 3.5.12: PDF-Ausgabe für Vergleichsstatistik und Report
====================================================================
Voraussetzung: veröffentlichte Version 3.5.11.

1. ZIP nach .github/workflows hochladen.
2. Im Repository-Hauptordner entpacken:
   unzip -o .github/workflows/Coaches-Analyse-v3-5-12-PDF-Export.zip
3. Installer ausführen:
   python scripts/install_v3512.py
4. Prüfen:
   node --check docs/pdf-export-v3512.js
   python tests/test_v3512.py
5. Git:
   git add docs/index.html docs/pdf-export-v3512.js docs/pdf-export-v3512.css scripts/install_v3512.py tests/test_v3512.py README-VERSION-3.5.12.txt
   git commit -m "Coaches-Analyse 3.5.12 PDF-Export Vergleich und Report"
   git pull --rebase origin main
   git push origin main

Bedienung:
- Mannschaft und Gegner wählen.
- Vergleichsstatistik > Vergleichsstatistik als PDF exportieren.
- Report > Report als PDF exportieren (oder bestehende Schaltfläche im Scouting-Report).
- Neue druckfertige Ansicht öffnet sich. "Drucken / als PDF sichern" auswählen;
  im Systemdruckdialog als PDF speichern bzw. auf dem iPad PDF über Druckansicht/Teilen sichern.
- Falls keine Ansicht öffnet: Pop-ups für diese Seite erlauben.

Hinweise:
- Kein automatischer PDF-Download: Browser-/Systemdruck erzeugt lokal die PDF-Datei.
- Erzeugt keine Daten-Updates und sendet nichts an einen PDF-Dienst.
- PDF enthält nur die aktuelle Spielpaarung und Daten aus dem gewählten Reiter.
