#!/usr/bin/env python3
"""Safe, repeatable Coaches-Analyse 3.5.2 patch; preserves imported browser data."""
from pathlib import Path
import re
p=Path('docs/index.html')
s=p.read_text('utf8')
assert 'function renderLeaders(){' in s and 'const id = state.opp, t = TEAMS[id];' in s, 'Unbekannter App-Code: keine Änderungen durchgeführt.'
assert 'function render(){' in s and 'PLAYERS[id].map(parsePlayer)' in s
if 'COACH352_CHECK' not in s:
    old='  const id = state.opp, t = TEAMS[id];\n'
    new='''  const id = Number(state.opp), t = TEAMS[id];
  // COACH352_CHECK: Reject roster collisions across different team IDs.
  const selectedRows = (DATA && DATA.spieler && DATA.spieler[id]) || PLAYERS[id];
  const checked = window.Coach352 ? window.Coach352.validate(DATA || {spieler:PLAYERS}, id) : {valid:true};
  if (!checked.valid) {
    $('lead-src').href = kaderUrl(id);
    $('lead-sub').textContent = `${t.n} · Kaderdaten prüfen`;
    $('leaders').innerHTML = '<div class="empty h352-alert"><strong>Datenprüfung: Top 5 vorübergehend gesperrt.</strong><p id="h352-reason"></p><p>Bitte die offizielle CSV-Datei für diesen Gegner erneut importieren und die Zuordnung prüfen.</p></div>';
    $('h352-reason').textContent = checked.message;
    $('lead-note').textContent = 'Keine Spieler eines anderen Teams als aktuelle Top 5 anzeigen.';
    return;
  }
'''
    assert old in s
    s=s.replace(old,new,1)
    s=s.replace('  if (!PLAYERS[id]){\n','  if (!selectedRows || !selectedRows.length){\n',1)
    s=s.replace('  const all = PLAYERS[id].map(parsePlayer);','  const all = selectedRows.map(parsePlayer);',1)
# Add app script before inline core. Because code invokes Coach352 at runtime, early load OK.
if 'href="coach-v352.css"' not in s:
    s=s.replace('</head>','<link rel="stylesheet" href="coach-v352.css">\n</head>',1)
if 'src="coach-v352.js"' not in s:
    # locate stable earlier script tag or inject at end of head
    assert '</head>' in s
    s=s.replace('</head>','<script src="coach-v352.js" defer></script>\n</head>',1)
# report version via existing script text patched separately
p.write_text(s,'utf8')
p=Path('docs/scouting-ui.js')
s=p.read_text('utf8')
assert 'function draw(){' in s and 'CoachReportMath.build(DATA,state.own,state.opp)' in s
if 'COACH352_REPORT' not in s:
    s=s.replace(' let r;try{r=CoachReportMath.build(DATA,state.own,state.opp);}catch(e){section.hidden=false;by(\'scout-content\').textContent=e.message;return;}',''' // COACH352_REPORT: validate roster ownership before rendering player rankings.
 const checked=window.Coach352?window.Coach352.validate(DATA,Number(state.opp)):{valid:true};
 let r;try{r=CoachReportMath.build(DATA,state.own,state.opp);}catch(e){section.hidden=false;by('scout-content').textContent=e.message;return;}
 if(!checked.valid){r.players=[];r.warnings.unshift('Spielerkader nicht eindeutig zugeordnet: '+checked.message+' Bis zur Klärung keine gegnerischen Spielernamen im Report.');}''')
    s=s.replace('Scouting-Report · Version 3.2','Scouting-Report · Version 3.5.2')
    s=s.replace(" if(!window.CoachReportMath)return;", " if(!window.CoachReportMath)return;")
    # report is still hidden if no selection
p.write_text(s,'utf8')
print('Version 3.5.2 installiert: gegnerbezogene Top 5, Datenprüfung und Report 3.5.2.')
