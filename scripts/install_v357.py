from pathlib import Path
p=Path('docs/index.html');s=p.read_text(encoding='utf-8')
assert 'id="analysis"' in s and '</body>' in s and '</head>' in s
for file in ('prognose-v357.css','coachziele-v357.css'):
    tag=f'<link rel="stylesheet" href="{file}">'
    if tag not in s: s=s.replace('</head>',tag+'\n</head>')
for file in ('prognose-v357.js','coachziele-v357.js'):
    tag=f'<script src="{file}"></script>'
    if tag not in s: s=s.replace('</body>',tag+'\n</body>')
p.write_text(s,encoding='utf-8')
q=Path('docs/ux-v35.js');t=q.read_text(encoding='utf-8')
needle="return [q('h35-report-actions'), q('h34-detail')||q('h35-detail-wrap'), q('h34-report')||q('scouting-report')].filter(Boolean);"
assert needle in t or "q('prog-v357')" in t, 'Report-Navigation nicht gefunden'
if "q('prog-v357')" not in t:
    t=t.replace(needle,"return [q('h35-report-actions'), q('h34-detail')||q('h35-detail-wrap'), q('h34-report')||q('scouting-report'), q('prog-v357')].filter(Boolean);")
q.write_text(t,encoding='utf-8')
print('Version 3.5.7 installiert. Keine Änderung am lokalen Datenbestand.')
