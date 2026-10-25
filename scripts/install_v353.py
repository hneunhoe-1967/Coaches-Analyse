#!/usr/bin/env python3
"""Targeted, idempotent source patch for verified opponent roster identity."""
from pathlib import Path
p=Path('docs/coach-v352.js')
s=p.read_text(encoding='utf-8')
needle=" const names=rosterNames(rows);"
insertion=""" // 3.5.3: Known, historically observed roster conflicts. These are anomaly
 // indicators only; a verified fresh CSV remains the authoritative source.
 const known={
  'langen':['savion brown','nico wenzl','erik neunhoeffer','benjamin koppke'],
  'reutlingen':['noah kamdem','cooper creek','carlos hidalgo guijo','henk droste']
 };
 const teamName=String(data?.teams?.[teamId]?.n||'').toLowerCase();
 const normalized=new Set(rows.map(row=>Array.isArray(row)?String(row[1]||'').replace('|',' ').trim().toLowerCase():'').filter(Boolean));
 const matchKey=Object.keys(known).find(k=>teamName.includes(k));
 if(matchKey){
  const otherKeys=Object.keys(known).filter(k=>k!==matchKey);
  for(const otherKey of otherKeys){
   const foreign=known[otherKey].filter(n=>normalized.has(n));
   if(foreign.length>=2){return {valid:false,message:`Kaderidentität unplausibel: ${foreign.join(', ')} gehören nach dem bekannten Vergleichsbestand zu ${otherKey}, nicht zu ${teamName}. Offizielle Team-CSV erneut prüfen.`};}
  }
 }
"""
if '3.5.3: Known, historically observed roster conflicts' not in s:
    assert needle in s, 'Unbekannte Version von coach-v352.js'
    s=s.replace(needle,insertion+needle,1)
p.write_text(s,encoding='utf-8')

p=Path('docs/scouting-v33.js');s=p.read_text(encoding='utf-8')
needle=" const g=Math.max(1,op[0]), og=Math.max(1,my[0]),r=roles(data.spieler?.[opp],op[0]);"
replacement=""" const checked=root.Coach352?root.Coach352.validate(data,Number(opp)):{valid:true};
 const g=Math.max(1,op[0]), og=Math.max(1,my[0]),r=roles(checked.valid?data.spieler?.[opp]:[],op[0]);"""
if 'const checked=root.Coach352?root.Coach352.validate' not in s:
    assert needle in s, 'Unbekannte Version von scouting-v33.js'
    s=s.replace(needle,replacement,1)
# The quality summary should plainly flag roster inconsistency.
needle=" const out=document.createElement('div');out.id='c33-extra';out.className='c33box';"
replacement=""" const rosterCheck=root.Coach352?root.Coach352.validate(DATA,Number(state.opp)):{valid:true};
 if(!rosterCheck.valid){report.warnings.unshift('ACHTUNG: '+rosterCheck.message);}
"""+needle
if 'const rosterCheck=root.Coach352?' not in s:
    assert needle in s, 'Scouting renderer pattern missing'
    s=s.replace(needle,replacement,1)
needle=" const players=report.roles.slice(0,7).map"
if 'const players=report.roles.slice(0,7).map' in s and 'rosterCheck.valid?report.roles' not in s:
    s=s.replace(needle," const players=(rosterCheck.valid?report.roles:[]).slice(0,7).map",1)
# Existing note in renderer below can be supplemented by a distinct warning element.
needle=" out.innerHTML=`<h3>Datenqualität · Version 3.3</h3>"
if 'rosterCheck.valid?\'\':' not in s:
    assert needle in s, 'Scouting header pattern missing'
    s=s.replace(needle," out.innerHTML=`${rosterCheck.valid?'':`<p class=\"c33-warning\"><strong>Kaderzuordnung prüfen:</strong> ${escape(rosterCheck.message)} Spielerbezogene Gameplan-Texte und Rollen ausgeblendet.</p>`}<h3>Datenqualität · Version 3.3</h3>",1)
p.write_text(s,encoding='utf-8')

p=Path('docs/index.html');s=p.read_text(encoding='utf-8')
# Make current team roster date and source transparent next to top 5.
needle="  $('lead-sub').textContent = `${t.n}, Durchschnitt pro Spiel`;"
replacement="""  const date=t.kaderStand||KADER_STAND[id]||'nicht dokumentiert';
  const source=t.importQuelle?' · lokal importierte CSV':' · veröffentlichter Datenstand';
  $('lead-sub').textContent = `${t.n}, Durchschnitt pro Spiel · Kaderstand: ${date}${source}`;"""
if 'const date=t.kaderStand||KADER_STAND[id]' not in s:
    assert needle in s, 'Expected renderLeaders marker missing'
    s=s.replace(needle,replacement,1)
p.write_text(s,encoding='utf-8')

p=Path('docs/scouting-ui.js');s=p.read_text(encoding='utf-8')
needle="<p class=\"scout-small\">Datenstand: ${esc(r.stand)}</p>"
replacement="<p class=\"scout-small\">Teamdaten: ${esc(r.stand)} · Gegnerkader: ${esc(DATA.teams?.[state.opp]?.kaderStand||'nicht dokumentiert')} · ${DATA.teams?.[state.opp]?.importQuelle?'lokal importiert':'veröffentlichter Stand'}</p>"
if 'Gegnerkader:' not in s:
    assert needle in s, 'Scouting report marker missing'
    s=s.replace(needle,replacement,1)
p.write_text(s,encoding='utf-8')
print('Version 3.5.3 installiert: Kaderidentität, Sperre falscher Rollen, Datenstand der Gegner-Spieler.')
