from pathlib import Path
p=Path('docs/index.html')
s=p.read_text(encoding='utf-8')
old='<script src="probs-table-import-v3521.js"></script>'
new='<script src="probs-table-import-v3522.js"></script>'
if new in s:
    print('Version 3.5.22 bereits installiert')
    raise SystemExit(0)
if old not in s:
    raise SystemExit('Fehler: Version 3.5.21 wurde nicht gefunden. Keine Änderungen vorgenommen.')
s=s.replace(old,new,1)
s=s.replace('ProB Süd · Tabelle aktualisieren (Stand 01.11.2026)','ProB Süd · Tabelle aktualisieren (neuer Datenstand)',1)
s=s.replace('Ich habe den Tabellenstand 01.11.2026 und die 15 Mannschaften kontrolliert.','Ich habe die 15 Mannschaften geprüft; der offizielle Tabellenstichtag wurde nicht verifiziert.',1)
p.write_text(s,encoding='utf-8')
print('Installiert: Tabellenimport für 8–12 Spiele; keine vorhandenen Daten verändert.')
