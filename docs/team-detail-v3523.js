/* Coaches-Analyse 3.5.23: Teamdaten-Detailansicht aus dem lokal geladenen Datensatz. */
(function(){
'use strict';
const rootTable=document.getElementById('table');
const tableFoot=document.getElementById('table-foot');
if(!rootTable||!tableFoot||typeof renderTable!=='function')return;
const panel=document.createElement('section');
panel.id='team-detail-v3523';panel.className='team-detail-v3523';panel.hidden=true;
tableFoot.insertAdjacentElement('afterend',panel);
let selectedId=null;
let mode='total';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dec=(v,n=1)=>Number.isFinite(v)?v.toLocaleString('de-DE',{minimumFractionDigits:n,maximumFractionDigits:n}):'–';
const num=v=>Number(v)||0;
const statColumns=[
 ['Sp.','g'],['Min.','mins'],['2P','p2'],['3P','p3'],['FG','fg'],['FT','ft'],
 ['Pkt.','P'],['Ast.','A'],['Off. Reb.','OR'],['Def. Reb.','DR'],['Reb.','TR'],
 ['Fouls','F'],['Blk.','BL'],['Stl.','ST'],['TO','TO'],['EFF','EF'],['+/-','PM']
];
function getPlayers(id){return Array.isArray(PLAYERS?.[id])?PLAYERS[id].map(a=>parsePlayer(a)):[];}
function avgMin(p,team){
 const csv=typeof team?.importQuelle==='string' && team.importQuelle.startsWith('Manueller CSV-Export:');
 return csv?p.mins:(p.g?p.mins/p.g:0);
}
function percentage(m,a){return a?dec(100*m/a,1)+' %':'–';}
function shot(m,a,g){
 if(mode==='avg')return dec(m/g)+' / '+dec(a/g)+' ('+percentage(m,a)+')';
 return m+' / '+a+' ('+percentage(m,a)+')';
}
function statsText(p,key,team){
 const g=Math.max(1,num(p.g));
 if(key==='g')return p.g;
 if(key==='mins')return fmtMin(avgMin(p,team));
 if(key==='p2')return shot(p.p2m,p.p2a,g);
 if(key==='p3')return shot(p.p3m,p.p3a,g);
 if(key==='fg')return shot(p.p2m+p.p3m,p.p2a+p.p3a,g);
 if(key==='ft')return shot(p.ftm,p.fta,g);
 const v=num(p[key]);return mode==='avg'?dec(v/g):v;
}
function teamStatsRows(a){
 if(!a||a.length!==17)return '<p>Keine Teamstatistiken im lokalen Datenbestand.</p>';
 const [g,p2m,p2a,p3m,p3a,ftm,fta,P,A,OR,DR,TR,F,BL,ST,TO,EF]=a;
 const denom=Math.max(1,g),fmt=v=>dec(v/denom);
 const items=[['Spiele',g,'–'],['Punkte',P,fmt(P)],['Zweier',`${p2m}/${p2a} (${percentage(p2m,p2a)})`,`${fmt(p2m)}/${fmt(p2a)}`],['Dreier',`${p3m}/${p3a} (${percentage(p3m,p3a)})`,`${fmt(p3m)}/${fmt(p3a)}`],['Feldwürfe',`${p2m+p3m}/${p2a+p3a} (${percentage(p2m+p3m,p2a+p3a)})`,`${fmt(p2m+p3m)}/${fmt(p2a+p3a)}`],['Freiwürfe',`${ftm}/${fta} (${percentage(ftm,fta)})`,`${fmt(ftm)}/${fmt(fta)}`],['Assists',A,fmt(A)],['Rebounds offensiv',OR,fmt(OR)],['Rebounds defensiv',DR,fmt(DR)],['Rebounds gesamt',TR,fmt(TR)],['Fouls',F,fmt(F)],['Blocks',BL,fmt(BL)],['Steals',ST,fmt(ST)],['Ballverluste',TO,fmt(TO)],['Effizienz',EF,fmt(EF)]];
 return '<div class="tdv-scroll"><table class="tdv-data"><thead><tr><th>Statistik</th><th>Gesamt</th><th>Pro Spiel</th></tr></thead><tbody>'+items.map(r=>'<tr><th>'+r[0]+'</th><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('')+'</tbody></table></div>';
}
function renderDetails(){
 if(state.league!=='probs'||!selectedId||!TEAMS?.[selectedId]){panel.hidden=true;return;}
 const id=selectedId,t=TEAMS[id],ts=TS?.[id],r=ROW?.[id],players=getPlayers(id),against=DATA?.teamstatGegner?.[id];
 const playerPoints=players.reduce((x,p)=>x+num(p.P),0),maxGames=Math.max(0,...players.map(p=>num(p.g)));
 let flags=[];
 if(!ts)flags.push('Keine Teamstatistik vorhanden.');
 else{
  if(r&&num(ts[0])!==num(r.g))flags.push(`Tabelle: ${r.g} Spiele – Teamstatistik: ${ts[0]} Spiele.`);
  if(r&&num(ts[7])!==num(r.plus))flags.push(`Tabelle: ${r.plus} Punkte – Teamstatistik: ${ts[7]} Punkte.`);
  if(players.length&&num(ts[7])!==playerPoints)flags.push(`Spielerpunkte: ${playerPoints} – Teamstatistik: ${ts[7]} Punkte.`);
  if(maxGames>num(ts[0]))flags.push(`Ein Spieler hat ${maxGames} Einsätze, die Teamstatistik nur ${ts[0]} Spiele.`);
 }
 const teamDate=t.teamstatStand||DATA?.teamstatUpdate?.stand||'nicht separat ausgewiesen';
 const rosterDate=t.kaderStand||'nicht separat ausgewiesen';
 const tableDate=LEAGUES?.probs?.tableImportStand||LEAGUES?.probs?.tableStand||'nicht separat ausgewiesen';
 const source=`https://www.2basketballbundesliga.de/teams/kader/${encodeURIComponent(id)}/#tab-stats`;
 const header='<div class="tdv-top"><div><h3>'+esc(t.n)+' – Teamübersicht</h3><p class="tdv-muted">Saison 2026/27 · Tabelle: '+esc(tableDate)+' · Team: '+esc(teamDate)+' · Spieler: '+esc(rosterDate)+'</p></div><button type="button" class="tdv-close">Schließen</button></div>';
 const summary=`<div class="tdv-summary"><span><b>Platz</b>${r?esc(r.rank):'–'}</span><span><b>Bilanz</b>${r?esc(r.s+'–'+r.n):'–'}</span><span><b>Spiele (Team)</b>${ts?ts[0]:'–'}</span><span><b>Spieler</b>${players.length}</span></div>`;
 const warn=flags.length?'<div class="tdv-warning"><strong>Datenstand prüfen:</strong> '+flags.map(esc).join(' ')+'</div>':'<div class="tdv-good">Punktzahlen von Tabelle, Teamstatistik und Spielern stimmen überein; auch die Spielanzahl von Tabelle und Teamstatistik ist gleich. Das bestätigt keine tagesaktuelle Übereinstimmung mit der offiziellen Website.</div>';
 const playerHeader='<div class="tdv-header"><h4>Spielerstatistik – vollständiger Kader</h4><div class="tdv-toggle"><button type="button" data-mode="total" aria-pressed="'+(mode==='total')+'">Gesamt</button><button type="button" data-mode="avg" aria-pressed="'+(mode==='avg')+'">Pro Einsatz</button></div></div>';
 const columns='<tr><th>#</th><th>Spieler</th>'+statColumns.map(([label])=>'<th>'+esc(label)+'</th>').join('')+'</tr>';
 const rows=players.sort((a,b)=>num(b.P)-num(a.P)).map(p=>'<tr><td>'+esc(p.nr)+'</td><th>'+esc((p.fn+' '+p.ln).trim())+'</th>'+statColumns.map(([,key])=>'<td>'+esc(statsText(p,key,t))+'</td>').join('')+'</tr>').join('');
 const pTable=players.length?'<div class="tdv-scroll" tabindex="0" aria-label="Spielerstatistiken horizontal scrollen"><table class="tdv-data tdv-players"><thead>'+columns+'</thead><tbody>'+rows+'</tbody></table></div>':'<p>Für dieses Team wurden noch keine Spieler importiert.</p>';
 panel.innerHTML=header+summary+warn+'<div class="tdv-two"><div><h4>Mannschaft – eigene Werte</h4>'+teamStatsRows(ts)+'</div><div><h4>Gegner – zugelassene Werte</h4>'+teamStatsRows(against)+'</div></div>'+playerHeader+pTable+'<p class="tdv-muted">Minuten sind Durchschnitt pro Einsatz; Wurfquoten beziehen sich auf die kumulierten Treffer und Versuche. In der Ansicht „Pro Einsatz“ werden Zählwerte durch die individuellen Einsätze geteilt. Die Daten stammen aus der lokalen App und werden nicht live von der Liga abgerufen.</p><p><a class="tdv-official" href="'+source+'" target="_blank" rel="noopener noreferrer">Offizielle Kader- und Statistikseite dieses Teams öffnen ↗</a></p>';
 panel.hidden=false;
 panel.querySelector('.tdv-close').addEventListener('click',()=>{selectedId=null;panel.hidden=true;});
 panel.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;renderDetails();}));
}
const originalRenderTable=renderTable;
renderTable=function(){
 originalRenderTable();
 if(state.league!=='probs'){panel.hidden=true;return;}
 const ids=idsOf(state.league);
 Array.from(rootTable.querySelectorAll('tr')).forEach((tr,i)=>{
  const id=ids[i],team=TEAMS?.[id];if(!team)return;
  const cell=tr.children[1];if(!cell)return;
  const old=cell.querySelector('button.team-btn');
  const btn=document.createElement('button');btn.type='button';btn.className='tdv-team-link';
  btn.textContent=old?old.textContent:cell.textContent;
  btn.setAttribute('aria-label','Vollständige Teamstatistik öffnen: '+team.n);
  btn.setAttribute('aria-expanded',String(selectedId===id));
  cell.replaceChildren(btn);
  btn.addEventListener('click',()=>{selectedId=selectedId===id?null:id;renderDetails();rootTable.querySelectorAll('.tdv-team-link').forEach(b=>b.setAttribute('aria-expanded',String(b===btn&&selectedId===id)));if(selectedId)panel.scrollIntoView({behavior:'smooth',block:'nearest'});});
 });
 renderDetails();
};
})();
