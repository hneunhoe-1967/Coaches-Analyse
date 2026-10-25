#!/usr/bin/env python3
"""Install 3.5.1 hotfix after 3.5; does not touch user statistics or imports."""
from pathlib import Path
p=Path('docs/index.html')
s=p.read_text(encoding='utf-8')
assert 'ux-v35.js' in s and 'ux-v35.css' in s, 'Version 3.5 missing: abort'
assert 'ux-v351-fix.css' in s or '</head>' in s
if 'ux-v351-fix.css' not in s:
    s=s.replace('</head>','<link rel="stylesheet" href="ux-v351-fix.css">\n</head>',1)
p.write_text(s,encoding='utf-8')
print('Version 3.5.1: Report-Reiter repariert, Top-5-Statistiken und Report-Button unabhängig vom Coach-Reiter.')
