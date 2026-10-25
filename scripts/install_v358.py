from pathlib import Path
p=Path('docs/index.html');s=p.read_text(encoding='utf-8')
assert 'coachziele-v357.js' in s and 'prognose-v357.js' in s, 'Version 3.5.7 zuerst installieren'
css='<link rel="stylesheet" href="coach-szenario-v358.css">'
js='<script src="coach-szenario-v358.js"></script>'
if css not in s:s=s.replace('</head>',css+'\n</head>')
if js not in s:s=s.replace('</body>',js+'\n</body>')
p.write_text(s,encoding='utf-8')
print('Version 3.5.8 installiert: Ziel-Szenario im Coach-Reiter. Gespeicherte Datensätze unverändert.')
