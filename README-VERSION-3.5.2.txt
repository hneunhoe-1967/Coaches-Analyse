Henrik's Analyse-App – Version 3.5.2
======================================
- Dynamische Top-5-Berechnung ausschließlich aus dem ausgewählten Teamkader.
- Plausibilitätsprüfung: hohe Überschneidungen mit einem anderen Team sperren Spieler-Ranglisten und warnen vor falschen CSV-Zuordnungen.
- Scouting-Report übernimmt dieselbe Prüfung und zeigt bei Konflikten keine möglicherweise falschen Namen.
- Reportüberschrift Version 3.5.2; Datenstand und eigener/gegnerischer Verein bleiben aus den ausgewählten Daten abgeleitet.
- Lokale Speicherstände bleiben unverändert. Keine automatische Datenerhebung.

Im Codespace-Repository-Stammverzeichnis:
  unzip -o .github/workflows/Coaches-Analyse-v3-5-2-Update.zip
  python scripts/install_v352.py
  node --check docs/coach-v352.js
  node --check docs/scouting-ui.js
  python tests/test_install_v352.py

Danach bei Erfolg:
  git add docs/index.html docs/scouting-ui.js docs/coach-v352.js docs/coach-v352.css scripts/install_v352.py tests/test_install_v352.py README-VERSION-3.5.2.txt
  git commit -m "Coaches-Analyse 3.5.2 Gegnerkader und Report validieren"
  git pull --rebase origin main
  git push origin main

Achtung: Die Kaderprüfung erkennt starke Überschneidungen und unvollständige Zeilen; sie kann nicht bestätigen, dass eine ursprünglich falsch zugeordnete CSV ohne weitere Quellenprüfung korrekt ist. In diesem Fall CSV erneut aus der offiziellen Quelle importieren.
