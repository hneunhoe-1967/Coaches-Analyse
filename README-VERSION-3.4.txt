Coaches Analyse Tool – Version 3.4
Offizieller Anzeigename: Henrik’s Analyse-App für Coaches
Unterzeile: Aktuell: Gegner-Scouting für die BARMER 2. Basketball Bundesliga

NEU: Basketball-Header, sticky Schnellnavigation, Coach Summary aus gespeicherten Teamsaisonwerten, eingeklappte Datenverwaltung, Spielübersicht und Statistikdetails, ausklappbarer Scouting-Report, Rollen-Badges, vereinheitlichte Hauptversion.

Dieses Update ändert keine Datenbank, keine Import- oder Rechenfunktionen. Alte Daten werden nicht gelöscht. Der Bericht behält intern seine Modulversion 3.2 bzw. 3.3.

Installieren aus Repo-Root:
  unzip -o .github/workflows/Coaches-Analyse-v3-4-Update.zip
  python scripts/install_v34.py
  python tests/test_install_v34.py
  node --check docs/ux-v34.js
Dann vorhandene Tests laufen lassen und erst danach commiten und pushen.

Rückgängig: Referenzen ux-v34.css und ux-v34.js in docs/index.html entfernen; optionale Zusatzdateien löschen.

Achtung: Version 3.4 muss im echten Safari auf einem iPad geprüft werden, insbesondere Sichtbarkeit von ein-/ausgeklappten Bereichen und PDF-Druck. Die Beispielgrafik im Header darf nicht als Statistikquelle verstanden werden.
