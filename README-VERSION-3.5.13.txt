Coaches-Analyse Version 3.5.13 – PDF-Layout Vergleichsstatistik

Problem in 3.5.12: Beim Drucken wurden die in der Web-App definierten
Vergleichs-Spalten und Balken nicht korrekt übernommen. Auf den ersten
PDF-Seiten standen Coburg und Langen zeilenweise untereinander.

Behebung: Eine zusätzliche, nur für das PDF verwendete CSS-Regelsammlung
stellt exakt das Dreispaltenlayout der Web-App her:
Mannschaft 1 / Kennzahl mit Ligabalken / Mannschaft 2.

Top-4-Listen und der getrennte Report-PDF-Export werden nicht verändert.
Kein Lesen oder Schreiben von IndexedDB, kein Ändern von Team- und Spielerwerten.

Installation auf Version 3.5.12:
  unzip -o .github/workflows/Coaches-Analyse-v3-5-13-PDF-Vergleich-Layout.zip
  python scripts/install_v3513.py
  node --check docs/pdf-export-v3512.js
  python tests/test_v3513.py

Hinweis: PDF-Ausgabe erfolgt weiterhin über das Druckmenü des Browsers.
Bei iPad Safari im Dialog die PDF-Speicherfunktion wählen.
