from pathlib import Path
import re

root=Path(__file__).resolve().parent.parent
html=root/'docs/index.html'
parser=root/'docs/csv-import.js'
if not html.exists() or not parser.exists():
    raise SystemExit('docs/index.html oder docs/csv-import.js fehlen. Installation beendet.')
s=html.read_text(encoding='utf-8')
p=parser.read_text(encoding='utf-8')
if 'COACHES_BULK_355_BEGIN' in s:
    print('Version 3.5.5 bereits installiert.')
    raise SystemExit(0)
if 'id="csv-import-box"' not in s or "$('csv-save').addEventListener" not in s:
    raise SystemExit('Bekannte CSV-Importstruktur nicht gefunden: nichts verändert.')
old="if(![482,559,591].includes(id))throw Error('Bitte ein unterstütztes Team auswählen.');"
if old not in p:
    raise SystemExit('CSV-Parser hat unbekannte Version: nichts verändert.')
# The dataset-dependent validation remains in the caller (validateTeamImport).
new="if(!Number.isInteger(id)||id<=0)throw Error('Bitte eine gültige Team-ID auswählen.');"
html_block=(root/'docs/bulk-html-v355.txt').read_text(encoding='utf-8')
inline=(root/'docs/bulk-inline-v355.txt').read_text(encoding='utf-8')
s=s.replace('  <p id="admin-info"',html_block+'\n  <p id="admin-info"',1)
anchor="// Newly sourced online collection can only start via an authenticated backend"
if anchor not in s: raise SystemExit('Inline-Skript-Ende fehlt; nichts verändert.')
s=s.replace(anchor,inline+'\n'+anchor,1)
# Existing JS library load order: parser is loaded prior to the admin inline script.
style_tag='<link rel="stylesheet" href="bulk-import-v355.css">'
js_tag='<script src="bulk-import-v355.js"></script>'
if '<link rel="stylesheet" href="ux-v354-ui.css">' in s:
    s=s.replace('<link rel="stylesheet" href="ux-v354-ui.css">','<link rel="stylesheet" href="ux-v354-ui.css">\n'+style_tag,1)
else:
    s=s.replace('</head>',style_tag+'\n</head>',1)
# helper must exist before the inline script runs.
anchor2='<script src="csv-import.js"></script>'
if anchor2 not in s: raise SystemExit('csv-import.js-Skript-Tag fehlt; nichts verändert.')
s=s.replace(anchor2,anchor2+'\n'+js_tag,1)
# ensure staged file references exist before changing anything
for fn in ('docs/bulk-import-v355.css','docs/bulk-import-v355.js'):
    if not (root/fn).exists(): raise SystemExit(f'Datei fehlt: {fn}')
parser.write_text(p.replace(old,new,1),encoding='utf-8')
html.write_text(s,encoding='utf-8')
print('Version 3.5.5 installiert: ProB-Süd-Sammelimport, explizite Teamzuordnung, atomare Datenprüfung und Import ohne Überschreiben.')
