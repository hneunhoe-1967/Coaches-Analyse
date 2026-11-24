#!/usr/bin/env python3
"""Installs v3.5.23 without modifying any data JSON files."""
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
index=root/'docs'/'index.html'
assert index.is_file(), 'docs/index.html fehlt. Bitte im Repository-Hauptverzeichnis entpacken.'
for file in ('team-detail-v3523.js','team-detail-v3523.css'):
    assert (root/'docs'/file).is_file(),f'docs/{file} fehlt.'
s=index.read_text(encoding='utf-8')
tag='<link rel="stylesheet" href="team-detail-v3523.css">\n<script src="team-detail-v3523.js"></script>'
if tag in s:
    print('Version 3.5.23 war bereits installiert.')
    sys.exit(0)
assert '</body>' in s and 'fixes-v3520.js' in s, 'Unbekannte App-Version / Skriptreihenfolge.'
assert 'probs-table-import-v3522.js' in s, 'Tabellenimport v3.5.22 fehlt.'
s=s.replace('</body>',tag+'\n</body>',1)
index.write_text(s,encoding='utf-8')
print('Version 3.5.23 installiert. Datenbank, Importe und Tabelle nicht geändert.')
