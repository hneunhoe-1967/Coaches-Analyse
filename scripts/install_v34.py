#!/usr/bin/env python3
"""Idempotent non-destructive version 3.4 installer (run from repository root)."""
from pathlib import Path
p=Path('docs/index.html')
s=p.read_text(encoding='utf-8')
assert '<div id="app-shell" hidden>' in s, 'Unknown index.html structure; no changes written'
assert '</head>' in s and '</body>' in s, 'Missing insertion markers'
s=s.replace('<title>Coaches-Analyse</title>','<title>Henrik’s Analyse-App für Coaches</title>')
if 'ux-v34.css' not in s:
    s=s.replace('</head>','<link rel="stylesheet" href="ux-v34.css">\n</head>',1)
if 'ux-v34.js' not in s:
    s=s.replace('</body>','<script src="ux-v34.js"></script>\n</body>',1)
p.write_text(s,encoding='utf-8')
print('Version 3.4 eingebunden: neuer Name, Basketball-Header, Coach Summary, Schnellnavigation und Klappbereiche.')
