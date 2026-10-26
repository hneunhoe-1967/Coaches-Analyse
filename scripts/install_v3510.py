#!/usr/bin/env python3
"""Idempotentes UI-Update 3.5.10. Keine Datenbank-/Datendatei wird verändert."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
def patch(path, old, new, desc):
    s=path.read_text(encoding='utf-8')
    if new in s:
        print(f'Bereits vorhanden: {desc}')
        return
    count=s.count(old)
    if count != 1:
        raise SystemExit(f'ABBRUCH: {desc}: erwartete exakt 1 Fundstelle, gefunden {count}. Keine Änderung an {path}.')
    path.write_text(s.replace(old,new,1),encoding='utf-8')
    print(f'OK: {desc}')

index=DOCS/'index.html'
ux35=DOCS/'ux-v35.js'
ux34=DOCS/'ux-v34.js'
patch(index, 'JSON importieren <input id="import-json"', 'Vollständigen Datenbestand importieren (JSON) <input id="import-json"', 'JSON-Import eindeutig benennen')
patch(index, 'Spielerstatistik importieren <input id="admin-import"', 'Spielerstatistik einer Mannschaft importieren <input id="admin-import"', 'Einzelimport eindeutig benennen')
patch(ux35, "    ['coach','Coach','Summary & Matchup'],\n    ['report','Report','Scouting & Stats'],", "    ['report','Report','Scouting & Stats'],\n    ['coach','Coach','Summary & Matchup'],", 'Reihenfolge Report vor Coach')
patch(ux35, "if(s?.opp) return 'coach';", "if(s?.opp) return 'report';", 'Standardreiter nach Gegnerauswahl')
patch(ux35, "if(id==='opp'&&st()?.opp) showTab('coach',true);", "if(id==='opp'&&st()?.opp) showTab('report',true);", 'Automatischer Wechsel zum Report')
# Vorhandene Titelfragmente konsistent umbenennen, inklusive Fallback-Hero.
for path in [index,ux34,ux35]:
    s=path.read_text(encoding='utf-8')
    new=s.replace('Henrik’s','Henriks').replace("Henrik's",'Henriks')
    if new != s:
        path.write_text(new,encoding='utf-8'); print('OK: Titel angepasst in '+str(path.relative_to(ROOT)))
    else: print('Titel bereits aktuell: '+str(path.relative_to(ROOT)))
css_tag='<link rel="stylesheet" href="ux-v3510.css">'
s=index.read_text(encoding='utf-8')
if css_tag not in s:
    if '</head>' not in s: raise SystemExit('ABBRUCH: kein </head> gefunden')
    index.write_text(s.replace('</head>',css_tag+'\n</head>',1),encoding='utf-8')
    print('OK: Übergangs-CSS eingebunden')
print('Version 3.5.10 installiert. IndexedDB, CSV-/JSON-Daten und Coach-Ziele unverändert.')
