Version 3.5.4 - Kaderidentitaet korrigiert

Grund: Der in Version 3.5.3 eingebaute Vergleich vertauschte die Vereine.
Offiziell bestaetigte Teams:
- TV Langen (Team-ID 482): Noah Kamdem, Cooper Creek, Henk Droste, Carlos Hidalgo Guijo.
- BBC Coburg (Team-ID 559): Savion Brown, Erik Neunhoeffer, Nico Wenzl.
- TSG Reutlingen (Team-ID 591): Roy Krupnikas, Miles Mallory, Kedar Salam Nkosi Wright.

Korrektur: Entfernt nur die falsche harte Namenstabelle aus docs/coach-v352.js.
Die Doppel-, Vollstaendigkeits- und roster-overlap-Pruefungen bleiben erhalten.
Keine gespeicherten Spieler-Daten werden geloescht oder ersetzt.

Installation aus Projektverzeichnis:
  unzip -o .github/workflows/Coaches-Analyse-v3-5-4-Kaderfix.zip
  python scripts/install_v354.py
  node --check docs/coach-v352.js
  node tests/test_roster_v354.cjs

GitHub nach erfolgreichem Test:
  git add docs/coach-v352.js scripts/install_v354.py tests/test_roster_v354.cjs README-VERSION-3.5.4.txt
  git commit -m "Coaches-Analyse 3.5.4 Kaderidentitaet berichtigt"
  git pull --rebase origin main
  git push origin main

Pruefe anschliessend im Browser die Team-Auswahl gegen Langen, Coburg, Reutlingen.
Wichtig: Die urspruenglichen CSV-Dateien waren bereits korrekt benannt.
