#!/usr/bin/env python3
"""Installs standalone team detail v3.5.24 without touching data storage."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
index=root/'docs'/'index.html'
assert index.exists(), 'docs/index.html fehlt'
for name in ['team-detail-v3524.js','team-detail-v3524.css']:
    assert (root/'docs'/name).exists(), f'{name} fehlt'
s=index.read_text(encoding='utf-8')
old='<link rel="stylesheet" href="team-detail-v3523.css">\n<script src="team-detail-v3523.js"></script>'
new='<link rel="stylesheet" href="team-detail-v3524.css">\n<script src="team-detail-v3524.js"></script>'
if new in s:
    print('v3.5.24 bereits installiert; keine Änderung.')
elif old in s:
    index.write_text(s.replace(old,new,1),encoding='utf-8')
    print('v3.5.24 installiert; Teamansicht wird auch nach bereits geladenen Tabellen eingebunden.')
else:
    raise RuntimeError('v3.5.23 nicht gefunden. Bitte zuerst Version 3.5.23 installieren.')
