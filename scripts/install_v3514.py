#!/usr/bin/env python3
from pathlib import Path
p=Path('docs/index.html')
if not p.exists():raise SystemExit('Bitte im Repository-Root ausführen.')
s=p.read_text(encoding='utf8')
if 'game-analysis-v3514.js' not in s:
    if '</body>' not in s:raise SystemExit('HTML-Ende fehlt')
    s=s.replace('</body>','<link rel="stylesheet" href="game-analysis-v3514.css">\n<script src="game-analysis-v3514.js"></script>\n</body>')
    p.write_text(s,encoding='utf8')
    print('OK: Importfunktion für DOCX und JSON im Reiter Daten eingebunden.')
else:print('OK: Version 3.5.14 bereits eingebunden.')
for x in ['docs/game-analysis-v3514.js','docs/game-analysis-v3514.css']:
    if not Path(x).exists():raise SystemExit('Datei fehlt: '+x)
print('OK: Datenbank, CSV und Coach-Ziele unverändert.')

# Der vorhandene PDF-Export wird um die Coaching-Aufgaben erweitert.
q=Path('docs/pdf-export-v3512.js')
if q.exists():
    pdf=q.read_text(encoding='utf8')
    if 'COACH_GAME_ANALYSIS_3514_PDF' not in pdf:
        needle="const forecast=$('prog-v357'), report=$('scouting-report');"
        if needle not in pdf:raise SystemExit('PDF-Export-Integration nicht gefunden; bitte melden, keine Daten geändert.')
        pdf=pdf.replace(needle,"/* COACH_GAME_ANALYSIS_3514_PDF */\n      window.CoachGameAnalysis3514?.appendToReport();\n      "+needle)
        css_needle='/* COACH_PDF_V3513_COMPARE_LAYOUT */'
        if css_needle in pdf:
            pdf=pdf.replace(css_needle,".ga14-report{border-top:2px solid #1c65b0;padding-top:12px;margin-top:18px}.ga14-review{border:1px solid #cbd8e5;border-radius:7px;padding:12px;margin:12px 0}.ga14-review h4{font-size:14px;color:#123c65}.ga14-review ol{padding-left:21px}.ga14-review li{break-inside:avoid-page;border-bottom:1px solid #e1e6ed;padding:7px 0}.ga14-review li p{margin:3px 0}.ga14-review li small,.ga14-meta,.ga14-note{display:block;font-size:10px;color:#596b7d}\n      "+css_needle)
        q.write_text(pdf,encoding='utf8')
        print('OK: Spieler- und Teamaufgaben auch im Report-PDF enthalten.')
    else:print('OK: PDF-Aufgaben sind bereits eingebunden.')
else:print('Hinweis: PDF-Export-Modul fehlt; Report in App enthält weiterhin Aufgaben.')
