Coaches-Analyse 3.5.7 – kombinierte Prognose und Coach-Ziele

Version 3.5.6 NICHT installieren. Dieses Paket enthält deren Prognosefunktion vollständig.

Installation in Codespaces:
unzip -o .github/workflows/Coaches-Analyse-v3-5-7-Prognose-Coachziele.zip
python scripts/install_v357.py
node --check docs/prognose-v357.js
node --check docs/coachziele-v357.js
python tests/test_v357.py

git add docs/index.html docs/ux-v35.js docs/prognose-v357.js docs/prognose-v357.css docs/coachziele-v357.js docs/coachziele-v357.css scripts/install_v357.py tests/test_v357.py README-VERSION-3.5.7.txt
git commit -m "Coaches-Analyse 3.5.7 Prognose und Coach-Ziele"
git pull --rebase origin main
git push origin main

Hinweise: Zielwerte sind Trainingsziele, keine statistisch gesicherte Wirkung auf die Siegchance. Vorhersagemodell vorlaeufig nicht kalibriert. Ziele pro Teamkombination in localStorage, CSV-Spielerdaten weiter in IndexedDB.
