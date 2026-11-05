Henrik's Analyse-App für Coaches – Version 3.5.5
ProB Süd CSV-Sammelimport (Erweiterung für installierte Version 3.5.4)

- Bis zu 18 CSV-Dateien in einem Vorgang wählen.
- Jede Datei muss ausdrücklich einer vorhandenen ProB-Süd-Mannschaft zugeordnet werden.
- Keine automatische Mannschaftserkennung allein aus Dateinamen.
- Doppelte Teams, ungültige IDs und ungültige statistische Daten werden abgelehnt.
- Alle CSV-Dateien werden vor dem Speichern gemeinsam geprüft.
- Bereits vorhandene Kader werden standardmäßig nicht überschrieben.
- Die lokale Datenbank wird erst nach Bestätigung einmalig aktualisiert.
- Unterstützt alle vorhandenen Team-IDs, nicht nur die drei alten CSV-Dropdown-Teams.
- Kein automatischer Websiteabruf; nur manuelle CSV-Exporte verwenden, deren Nutzung zulässig ist.
- WICHTIG: vor Installation und Import über 'Daten exportieren' eine JSON-Sicherung erstellen.
- Das Update verändert keine bereits gespeicherten Datensätze.

INSTALLATION:
  unzip -o .github/workflows/Coaches-Analyse-v3-5-5-Sammelimport.zip
  python scripts/install_v355.py
  node --check docs/bulk-import-v355.js
  python tests/test_v355.py

Danach Änderungen committen und auf GitHub Pages bereitstellen.
