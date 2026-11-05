Coaches-Analyse 3.5.9 – Reset und Abmelden
============================================
- Button im Coach-Tab: "Ziele und Szenario zurücksetzen".
- Entfernt nur die lokalen Coach-Ziele der aktuell gewählten Paarung.
- Leert die aktuell berechnete Was-wäre-wenn-Ausgabe und setzt Eingabe-Zielwerte zurück.
- Belässt die drei Zieltypen als Orientierung, aber ohne Zielwerte (neue Zielwerte erforderlich).
- Bestätigungsdialog, falls für die Paarung bereits Ziele gespeichert sind.
- Verschiebt den vorhandenen Button "Abmelden" in die Kopfleiste über der Navigation.
- Statistiken, Spieler, CSV-Import, Ausgangsprognose und andere Paarungen unverändert.

Im GitHub Codespace (nach ZIP-Upload in .github/workflows):
  unzip -o .github/workflows/Coaches-Analyse-v3-5-9-Reset-Abmelden.zip
  python scripts/install_v359.py
  node --check docs/coachziele-v357.js
  node --check docs/logout-v359.js
  python tests/test_v359.py

Dateien zum Commit:
  git add docs/index.html docs/coachziele-v357.js docs/logout-v359.js docs/logout-v359.css scripts/install_v359.py tests/test_v359.py README-VERSION-3.5.9.txt
  git commit -m "Coaches-Analyse 3.5.9 Coach Reset und Abmelden"
  git pull --rebase origin main
  git push origin main
