#!/usr/bin/env python3
"""Idempotent and non-destructive 3.5.4 UI refinement."""
from pathlib import Path
p=Path('docs/index.html')
s=p.read_text(encoding='utf-8')
assert '<head>' in s and '</head>' in s, 'Unbekannte HTML-Struktur: Installation abgebrochen.'
assert 'ux-v35.css' in s, 'Benötigt bestehende Version 3.5 oder höher.'
assert 'coach-v352.js' in s, 'Kaderfix-Basis fehlt: zuerst 3.5.4 Kaderfix installieren.'
assert Path('docs/assets/coach-hero-sketch.png').is_file(), 'Skizzenbild fehlt.'
assert Path('docs/ux-v354-ui.css').is_file(), 'CSS fehlt.'
marker='<link rel="stylesheet" href="ux-v354-ui.css">'
if marker not in s:
    s=s.replace('</head>',marker+'\n</head>',1)
    p.write_text(s,encoding='utf-8')
print('OK: 3.5.4 UI-Update eingebunden; Kaderdaten, CSV-Logik und Datenbank unverändert.')
