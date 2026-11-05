from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
index=ROOT/'docs/index.html'
scout=ROOT/'docs/scouting-v33.js'
legacy=ROOT/'docs/coach-prep-v3517.js'
assert index.exists() and scout.exists() and legacy.exists(), 'Version 3.5.17 muss installiert sein.'
assert (ROOT/'docs/coach-prep-v3518.js').exists(), 'Neue Programmdatei fehlt.'
html=index.read_text(encoding='utf-8')
html=html.replace('<script src="coach-prep-v3517.js"></script>', '')
if '<script src="coach-prep-v3518.js"></script>' not in html:
    html=html.replace('</body>', '<link rel="stylesheet" href="coach-prep-v3518.css">\n<script src="coach-prep-v3518.js"></script>\n</body>', 1)
index.write_text(html,encoding='utf-8')
s=scout.read_text(encoding='utf-8')
s=s.replace('Gameplan · Drei priorisierte Prüfaufträge', 'Gameplan – Drei priorisierte Trainingsthemen')
scout.write_text(s,encoding='utf-8')
assert 'Gameplan – Drei priorisierte Trainingsthemen' in s
print('OK: Drei priorisierte Trainingsthemen im Scouting-Report.')
print('OK: Coach-Spielvorbereitung kombiniert drei Gameplan-Themen mit dem letzten Spiel.')
print('OK: Historische Analysen und Statistikdaten bleiben unverändert.')
