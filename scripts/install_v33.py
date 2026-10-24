#!/usr/bin/env python3
"""Fügt 3.3 ein, ohne die vorherige Web-App zu überschreiben."""
from pathlib import Path
p=Path('docs/index.html')
s=p.read_text(encoding='utf-8')
needle='<script src="scouting-ui.js"></script>'
new=needle+'\n<script src="scouting-v33.js"></script>'
if new in s:
    print('Version 3.3 ist bereits eingebunden.')
elif s.count(needle)!=1:
    raise SystemExit('Installation gestoppt: 3.2-Scripteinbindung nicht eindeutig gefunden.')
else:
    p.write_text(s.replace(needle,new),encoding='utf-8')
    print('Version 3.3 erfolgreich eingebunden.')
