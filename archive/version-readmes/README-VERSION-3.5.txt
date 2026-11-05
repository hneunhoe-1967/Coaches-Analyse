Coaches-Analyse – Version 3.5

Schwerpunkt:
- Neue Navigation mit fünf Reitern
- Arena Dark Mode mit stärkerer visueller Führung
- Kompaktere Spielauswahl
- Weniger Scrollen durch fokussierte Hauptbereiche
- Bessere Darstellung der Coach Summary

Enthaltene Dateien:
- docs/ux-v35.css
- docs/ux-v35.js
- docs/assets/coach-hero.png
- scripts/install_v35.py
- tests/test_install_v35.py

Installation (im Repo-Stammordner):
1. ZIP in das Repo laden und entpacken
2. python scripts/install_v35.py
3. python tests/test_install_v35.py
4. git add docs/index.html docs/ux-v35.css docs/ux-v35.js docs/assets/coach-hero.png scripts/install_v35.py tests/test_install_v35.py README-VERSION-3.5.txt
5. git commit -m "Coaches-Analyse 3.5 Navigation, Arena Dark Mode und Coach Summary"
6. git pull --rebase origin main
7. git push origin main

Hinweise:
- Die Version 3.5 ist bewusst als UX-Layer umgesetzt und verändert keine bestehende Datenlogik.
- Bestehende lokale Imports und Browser-Speicher sollen erhalten bleiben.
