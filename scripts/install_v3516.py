from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
index=ROOT/'docs/index.html'
legacy=ROOT/'docs/game-analysis-v3514.js'
assert index.is_file() and legacy.is_file(), 'Vorherige App-Version fehlt.'
html=index.read_text(encoding='utf-8')
# Remove old 3.5.15 aggregate view; it must not run or recreate the report section.
html=html.replace('<link rel="stylesheet" href="game-analysis-v3515-view.css">','')
html=html.replace('<script src="game-analysis-v3515-view.js"></script>','')
if 'game-analysis-v3516.js' not in html:
    needle='</body>'
    assert needle in html
    html=html.replace(needle,'<link rel="stylesheet" href="game-analysis-v3516.css">\n<script src="game-analysis-v3516.js"></script>\n'+needle,1)
index.write_text(html,encoding='utf-8')
s=legacy.read_text(encoding='utf-8')
start=s.index('function appendToReport(){')
end=s.index('function refreshList()',start)
# Keep import and storage intact but suppress the legacy rendering in the Report tab.
s=s[:start]+'''function appendToReport(){
 // v3.5.16: report no longer includes past game analyses.
 document.getElementById('scout-content')?.querySelector('#ga14-report')?.remove();
 root.CoachGameAnalysis3516?.refresh?.();
}
'''+s[end:]
# Replace original watcher with no-op: CoachGameAnalysis3516 handles import list changes.
s=s.replace("if(!sc.querySelector('#ga14-report'))appendToReport();","/* v3.5.16: handled by Coach archive and last-game view */")
legacy.write_text(s,encoding='utf-8')
readme=ROOT/'README-VERSION-3.5.16.txt'
readme.write_text('Coaches-Analyse v3.5.16\nCoach: nur juengste importierte Spielanalyse.\nDaten: alle importierten Spielanalysen im lesbaren Archiv.\nReport: ohne rueckblickende Spielanalysen.\nLokaler Datenbestand, importierte JSON-Dateien und Coach-Ziele bleiben unveraendert.\n',encoding='utf-8')
print('OK: Letzte Spielanalyse im Coach-Reiter. Alte Analysen im Daten-Archiv.')
print('OK: Historische Analysen nicht mehr im Scouting-Report.')
print('OK: Import und lokale Datenspeicherung unveraendert.')
