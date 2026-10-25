Coaches-Analyse 3.5.4 – UI-Erweiterung
=====================================
Voraussetzung: vorhandene Version 3.5.4 Kaderfix und UX 3.5.
Änderungen: handgezeichnetes Basketball/Taktik/Statistik-Motiv im Seitenkopf, neu
geordnete Liga- und Mannschafts-Dropdowns und sauber ausgerichtete CSV-Eingaben.
Keine Veränderung der Spielerdaten oder Berechnung.

Installation (im Repository-Hauptordner):
  unzip -o .github/workflows/Coaches-Analyse-v3-5-4-UI-Update.zip
  python scripts/install_v354_ui.py
  python tests/test_v354_ui.py

Veröffentlichung nach erfolgreichem Test:
  git add docs/index.html docs/ux-v354-ui.css docs/assets/coach-hero-sketch.png scripts/install_v354_ui.py tests/test_v354_ui.py README-VERSION-3.5.4-UI.txt
  git commit -m "Coaches-Analyse 3.5.4 Header und Datenverwaltung"
  git pull --rebase origin main
  git push origin main

Hinweis: Archiv nur als Transport; es muss nicht eingecheckt werden.
