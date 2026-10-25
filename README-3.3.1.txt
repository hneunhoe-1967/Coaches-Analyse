Coaches-Analyse 3.3.1 – Ligafilter und geschützte manuelle Spielerwerte

1) ZIP ins Codespace hochladen (zum Beispiel nach .github/workflows).
2) Im Repository-Root ausführen:
   unzip -o .github/workflows/Coaches-Analyse-v3-3-1-Update.zip
   python scripts/install_v331.py
3) Prüfen:
   grep -n 'admin-league-filter' docs/index.html
   grep -n 'lokal importierte Mannschaftskader beibehalten' docs/index.html
4) Mit vorhandenen Node- und Python-Tests testen.
5) Änderungen committen und nach GitHub übertragen.

Die Filterung betrifft nur die angezeigte Tabelle; gespeichert bleiben alle 47 Teams.
Beim veröffentlichten Datenupdate werden manuell importierte Kader (kaderStand/importQuelle) bewahrt; Unterschiedlichkeit der Datenstände bleibt als Warnhinweis.
Vorher Daten exportieren. Keine automatische Scraping-Aktivierung.
