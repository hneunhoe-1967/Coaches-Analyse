#!/usr/bin/env python3
"""3.5.11: combine uninstalled 3.5.10 with reset and six-tab layout; never touch data."""
from pathlib import Path
import runpy
ROOT=Path(__file__).resolve().parents[1]; DOCS=ROOT/'docs'
runpy.run_path(str(ROOT/'scripts/install_v3510.py'),run_name='__main__')
index=DOCS/'index.html'; ux=DOCS/'ux-v35.js'
def replace_once(p,old,new,desc):
 s=p.read_text(encoding='utf-8')
 if new in s:
  print('Bereits vorhanden:',desc);return
 if s.count(old)!=1: raise SystemExit(f'ABBRUCH {desc}: erwartete 1 Fundstelle, gefunden {s.count(old)}')
 p.write_text(s.replace(old,new,1),encoding='utf-8');print('OK:',desc)
replace_once(ux,"    ['report','Report','Scouting & Stats'],\n    ['coach','Coach','Summary & Matchup'],", "    ['vergleich','Vergleichsstatistik','Werte & Top-Listen'],\n    ['report','Report','Prognose & Scouting'],\n    ['coach','Coach','Ziele & Szenario'],",'Sechs Reiter und richtige Reihenfolge')
replace_once(ux,"function detailGroupNodes(){\n  return [q('h35-report-actions'), q('h34-detail')||q('h35-detail-wrap'), q('h34-report')||q('scouting-report'), q('prog-v357')].filter(Boolean);\n}","function compareGroupNodes(){\n  return [q('h34-detail')||q('h35-detail-wrap')].filter(Boolean);\n}\nfunction detailGroupNodes(){\n  return [q('h35-report-actions'),q('h34-report')||q('scouting-report'),q('prog-v357')].filter(Boolean);\n}",'Vergleich und Report getrennt')
replace_once(ux,"    coach:coachGroupNodes(),\n    report:detailGroupNodes(),", "    vergleich:compareGroupNodes(),\n    report:detailGroupNodes(),\n    coach:coachGroupNodes(),",'Reiteransichten zuordnen')
# Visible leader categories show four ranked players, matching the new Vergleichsstatistik requirement.
replace_once(index, '.sort((a,b) => b.v - a.v).slice(0,5);', '.sort((a,b) => b.v - a.v).slice(0,4);', 'Top-4-Listen statt Top-5-Listen')
# Ensure Report version visible and hero current; preserve older JS module versions.
s=ux.read_text(encoding='utf-8');s=s.replace('Version 3.5 · Arena Dark Mode · Neue Navigation · kompaktere Coach-Ansicht','Version 3.5.11 · Vergleich · Report · Coach-Ziele');ux.write_text(s,encoding='utf-8')
replace_once(index,'<script src="logout-v359.js"></script>', '<script src="logout-v359.js"></script>\n<link rel="stylesheet" href="ux-v3511.css">\n<script src="ux-v3511.js"></script>','Reset- und Layout-Modul einbinden')
print('Version 3.5.11 installiert; JSON, CSV, IndexedDB unverändert.')
