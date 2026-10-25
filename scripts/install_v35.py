#!/usr/bin/env python3
"""Idempotent installer for UX version 3.5 (run from repository root)."""
from pathlib import Path
p=Path('docs/index.html')
s=p.read_text(encoding='utf-8')
assert '<div id="app-shell" hidden>' in s, 'Unknown index.html structure; no changes written'
assert '</head>' in s and '</body>' in s, 'Missing insertion markers'
s=s.replace('<title>Coaches-Analyse</title>','<title>Henrik’s Analyse-App für Coaches</title>')
if 'Henrik’s Analyse-App für Coaches' not in s:
    s=s.replace('<title>Henrik’s Analyse-App für Coaches</title>','<title>Henrik’s Analyse-App für Coaches</title>')
if 'ux-v35.css' not in s:
    s=s.replace('</head>','<link rel="stylesheet" href="ux-v35.css">\n</head>',1)
if 'ux-v35.js' not in s:
    s=s.replace('</body>','<script src="ux-v35.js"></script>\n</body>',1)
p.write_text(s,encoding='utf-8')
print('Version 3.5 eingebunden: fünf Reiter, Arena Dark Mode, kompaktere Spielauswahl und stärkere Coach Summary.')
