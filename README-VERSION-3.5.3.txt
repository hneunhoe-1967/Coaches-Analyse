Version 3.5.3 – Kaderidentität und Datenstand

Änderungen:
- Bekannte Kontamination Langen/Reutlingen anhand historischer Namen erkennen.
- Bei Auffälligkeiten Top-5 und individuelle Rollen sperren, statt falsche Spieler zu zeigen.
- Datum und Herkunft des Gegnerkaders direkt an den Ranglisten und im Report darstellen.
- Keine bestehenden lokalen Daten löschen oder importierte Datensätze verändern.

WICHTIG: Dieses Update repariert keine falsch gespeicherten CSV-Dateien automatisch.
Wenn eine Warnung erscheint, die offizielle CSV für die richtige Mannschaft mit
korrekter Mannschaftsauswahl erneut prüfen und importieren.
Nach Installation mit Coburg gegen Langen und gegen Reutlingen prüfen.

Installation ab Repository-Stammordner:
unzip -o .github/workflows/Coaches-Analyse-v3-5-3-Update.zip
python scripts/install_v353.py
node --check docs/coach-v352.js
node --check docs/scouting-v33.js
node --check docs/scouting-ui.js
python tests/test_install_v353.py

Git nach erfolgreichem Test:
git add docs/index.html docs/coach-v352.js docs/scouting-v33.js docs/scouting-ui.js scripts/install_v353.py tests/test_install_v353.py README-VERSION-3.5.3.txt
git commit -m "Coaches-Analyse 3.5.3 Kaderintegritaet und Datenstand"
git pull --rebase origin main
git push origin main
