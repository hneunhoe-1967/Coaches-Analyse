from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
index=ROOT/'docs/index.html'
view=ROOT/'docs/game-analysis-v3516.js'
assert index.is_file() and view.is_file(), 'Version 3.5.16 fehlt.'
s=view.read_text(encoding='utf-8')
if 'ga17-collapse' not in s:
    original='pane.innerHTML=`<h2>Analyse des letzten Spiels</h2><p class="ga16-intro">'
    replacement='pane.innerHTML=`<details class="ga17-collapse"><summary>Analyse des letzten Spiels · ${esc(latest.date||"Datum unbekannt")} · ${esc(latest.opponent||"Gegner unbekannt")}</summary><div class="ga17-collapse-body"><p class="ga16-intro">'
    assert original in s,'Einfügestelle für Einklappfunktion nicht gefunden.'
    s=s.replace(original,replacement,1)
    original='${detail(latest)}<p class="ga16-footer">Weitere Spielanalysen: Reiter „Daten“ → Archiv der Spielanalysen.</p>`;'
    replacement='${detail(latest)}<p class="ga16-footer">Weitere Spielanalysen: Reiter „Daten“ → Archiv der Spielanalysen.</p></div></details>`;'
    assert original in s,'Ende der letzten Spielanalyse nicht gefunden.'
    s=s.replace(original,replacement,1)
    original=' renderCoach();archive();'
    replacement=' renderCoach();archive();root.CoachPrep3517?.render?.();'
    assert original in s,'Refresh-Hook nicht gefunden.'
    s=s.replace(original,replacement,1)
    view.write_text(s,encoding='utf-8')
html=index.read_text(encoding='utf-8')
if 'coach-prep-v3517.js' not in html:
    assert '<script src="game-analysis-v3516.js"></script>' in html,'V3.5.16 Skript fehlt.'
    html=html.replace('<script src="game-analysis-v3516.js"></script>','<script src="game-analysis-v3516.js"></script>\n<link rel="stylesheet" href="coach-prep-v3517.css">\n<script src="coach-prep-v3517.js"></script>',1)
    index.write_text(html,encoding='utf-8')
(ROOT/'README-VERSION-3.5.17.txt').write_text('V3.5.17 – Coach: letzte Spielanalyse zunächst geschlossen, dunkler hellblauer Akzent. Neue Coach-Spielvorbereitung kombiniert bestehende Scouting-Modell-Prioritäten mit passenden Teamaufgaben des letzten Spiels. Daten/Analysen/Coach-Ziele bleiben unberührt. Kein automatisches Update offizieller Basketballstatistiken.\n',encoding='utf-8')
print('OK: Letzte Spielanalyse eingeklappt und farblich angepasst.')
print('OK: Spielvorbereitung verknüpft gegnerbezogene Scouting-Prioritäten mit dem letzten Spiel.')
print('OK: Daten, Importe, Archive und Coach-Ziele bleiben unverändert.')
