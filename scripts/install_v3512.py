#!/usr/bin/env python3
"""Non-destructive UI-only update from 3.5.11 to 3.5.12."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
index = root/'docs'/'index.html'
s = index.read_text(encoding='utf-8')
required = ['ux-v3511.js','ux-v35.js','scouting-ui.js','scout-print']
for token in required:
    if token not in s:
        raise SystemExit(f'Installation abgebrochen: Ausgangsdatei ohne {token}; unverändert gelassen.')
if 'pdf-export-v3512.js' not in s:
    s = s.replace('</body>', '<link rel="stylesheet" href="pdf-export-v3512.css">\n<script src="pdf-export-v3512.js"></script>\n</body>')
    index.write_text(s,encoding='utf-8')
print('OK: Version 3.5.12 installiert: zwei getrennte PDF-Ausgaben.')
print('OK: Bestehende Browser-Daten, Berechnungen und Coach-Ziele unverändert.')
