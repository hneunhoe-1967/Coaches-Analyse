# Coaches-Analyse 3.3 – Update

Dieses Update ergänzt die bestehende Version 3.2, ohne die aktuelle `docs/index.html` durch einen älteren Stand zu ersetzen. Es nimmt keine Netzabrufe vor.

## Funktionen
- Datenqualität pro Mannschaft: Abdeckung, fehlende Daten, doppelte Spieler, Wurf-/Punktesummen, Datenstand; Rebounds mit separatem Warnhinweis (Teamaktionen).
- Statistische Spielerrollen: Scorer, Spielmacher, Rebounder, Dreierschütze, Defensiv-Aktivität, jeweils als heuristische Kennzeichnung.
- Erweiterter Gameplan: drei datenbasierte Prüfaufträge mit Spielerbezug und Unsicherheitshinweisen.
- Ausgabe im bestehenden druckbaren Scouting-Report; keine Änderung an CSV-Import oder IndexedDB.

## Installation im vorhandenen Codespace
1. Die ZIP in den Explorer hochladen. Sie darf auch im Ordner `.github/workflows` liegen.
2. Vom Terminal im Repository-Stamm (`/workspaces/Coaches-Analyse`) entpacken, z. B.:

```bash
unzip -o .github/workflows/Coaches-Analyse-v3-3-Update.zip
```

   Falls sie stattdessen in `.github` liegt, `unzip -o .github/Coaches-Analyse-v3-3-Update.zip` verwenden. Falls sie im Stamm liegt, `unzip -o Coaches-Analyse-v3-3-Update.zip` verwenden.

3. Bestehende Web-App-Datei gezielt ergänzen:

```bash
python scripts/install_v33.py
```

4. Prüfen:

```bash
node tests/test_scouting_v33.cjs
node tests/test_scouting_report.cjs
node tests/test_csv_import.cjs
python -m unittest discover -s tests -v
grep -n 'scouting-v33.js' docs/index.html
```

5. ZIP aus dem Upload-Ordner löschen (z. B. `rm .github/workflows/Coaches-Analyse-v3-3-Update.zip`).
6. Nur diese Update-Dateien und die automatisch aktualisierte index.html committen:

```bash
git add docs/index.html docs/scouting-v33.js tests/test_scouting_v33.cjs scripts/install_v33.py README-VERSION-3.3.md
git commit -m "Coaches-Analyse 3.3 Quality Roles Gameplan"
git pull --rebase origin main
git push origin main
```

Bei Konflikten nach `pull` vor `push` stoppen.

## Erwartetes Verhalten
Nach erfolgreichem GitHub-Pages-Deployment die App in Safari neu laden, anmelden, Coburg und Reutlingen wählen, `Scouting-Report erstellen` drücken. Nach dem bisherigen 3.2-Bericht erscheinen **Datenqualität · Version 3.3**, **Spielerrollen des Gegners**, **Gameplan**. Alle Werte stammen aus dem lokalen Browser-Datensatz, nicht automatisch aus aktuellen Ligadaten.

## Fachliche Grenzen
Der Abgleich der Spieler-Summen mit den Team-Summen erkennt mögliche Abweichungen, ersetzt aber keine vollständige Quellprüfung. Team-Rebounds können Teamaktionen enthalten; erfasste Spielerlisten können unterschiedliche Stände haben. Die Spielerrollen sind schwellenwertbasiert, keine Beobachtungen des tatsächlichen Spielstils. Taktische Empfehlungen sind Prüfaufträge, keine belastbaren Aussagen zu individueller Defensive oder Spielausgang. Öffentlich abrufbare Inhalte werden nicht automatisch eingelesen.
