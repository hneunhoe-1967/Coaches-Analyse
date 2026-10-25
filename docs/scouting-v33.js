/* Coaches-Analyse 3.3: rein lokale Qualitätsprüfung, Spielerrollen, Gameplan. */
(function(root){
'use strict';
const num=x=>Number.isFinite(x)?x:0;
const ratio=(a,b)=>b>0?a/b:null;
const fmt=(n,d=1)=>n==null?'–':n.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inspect(data,id){
 const t=data.teams?.[id],stat=data.teamstat?.[id],players=data.spieler?.[id];
 if(!t)return {level:'error',issues:['Mannschaft nicht vorhanden'],name:'Unbekannt'};
 const issues=[], notes=[];let level='ok';
 if(!Array.isArray(stat)||stat.length<17){issues.push('Teamstatistik fehlt oder ist unvollständig.');level='error';}
 if(!Array.isArray(players)||!players.length){issues.push('Spielerstatistiken fehlen.');level='error';}
 if(Array.isArray(players)&&players.length){
  const pids=new Set();let sumPts=0,sumAst=0,sumReb=0, maxGames=0;
  for(const p of players){
   if(!Array.isArray(p)||p.length<22){issues.push('Mindestens eine Spielerzeile ist unvollständig.');level='error';continue;}
   const key=p[0]+'|'+p[1];if(pids.has(key)){issues.push('Doppelte Spielerzeile: '+p[1]);level='error';}pids.add(key);
   const [,, ,g,,twom,twoa,threem,threea,ftm,fta,pts,ast,oreb,dreb,reb]=p;
   if(twom>twoa||threem>threea||ftm>fta||pts!==2*twom+3*threem+ftm||oreb+dreb!==reb){issues.push('Widersprüchliche Wurf-/Reboundwerte bei '+p[1]);level='error';}
   sumPts+=num(pts);sumAst+=num(ast);sumReb+=num(reb);maxGames=Math.max(maxGames,num(g));
  }
  if(Array.isArray(stat)&&stat.length>=17){
   if(maxGames>stat[0]){issues.push('Spieler haben mehr Einsätze als die Teamstatistik Spiele ausweist.');level='error';}
   if(sumPts>stat[7]){issues.push('Spielerpunkte übersteigen die Teampunkte ('+sumPts+' > '+stat[7]+').');level='error';}
   if(sumPts<stat[7]){notes.push('Spielerpunkte decken '+fmt(ratio(sumPts,stat[7])*100,0)+' % der Teampunkte ab; fehlende Einsätze/Datenstand prüfen.');if(level==='ok')level='warn';}
   if(sumAst>stat[8]){issues.push('Spieler-Assists übersteigen den Teamwert.');level='error';}
   if(sumReb>stat[11]){notes.push('Spieler-Rebounds übersteigen den Teamwert; Definition/Teamaktionen prüfen.');if(level==='ok')level='warn';}
   if(sumReb<stat[11]){notes.push('Team-Rebounds enthalten eventuell Teamaktionen oder unvollständige Spielerdaten.');if(level==='ok')level='warn';}
  }
 }
 if(t.synthetic||data.testdaten||data.synthetic){issues.push('Test-/synthetische Daten gekennzeichnet.');level='error';}
 if(!t.kaderStand){notes.push('Kein gesonderter Datenstand für die Spielerstatistiken dokumentiert.');if(level==='ok')level='warn';}
 return {level,issues,notes,name:t.n,playerCount:Array.isArray(players)?players.length:0,teamGames:Array.isArray(stat)?stat[0]:0,rosterStand:t.kaderStand||null};
}
function roles(rows,teamGames){
 return (Array.isArray(rows)?rows:[]).filter(p=>Array.isArray(p)&&p.length>=22&&p[3]>0).map(p=>{
  const g=p[3], pts=num(p[11])/g,ast=num(p[12])/g,reb=num(p[15])/g,oreb=num(p[13])/g,stl=num(p[18])/g,blk=num(p[17])/g,threes=num(p[7])/g,to=num(p[19])/g;
  const tags=[];
  if(pts>=12 || (pts>=9&&threes>=2))tags.push('Scorer');
  if(ast>=4)tags.push('Spielmacher');
  if(reb>=7||oreb>=3)tags.push('Rebounder');
  if(stl>=2||blk>=1.2)tags.push('Defensiv-Aktivität');
  if(threes>=2)tags.push('Dreierschütze');
  if(!tags.length)tags.push('Rollenspieler');
  return {name:String(p[1]).replace('|',' '),nr:p[0],g,pts,ast,reb,threes,to,tags,lowSample:g<Math.max(2,Math.ceil(teamGames*.4))};
 }).sort((a,b)=>b.pts-a.pts);
}
function gameplan(data,own,opp){
 const qa=inspect(data,own),qb=inspect(data,opp),my=data.teamstat?.[own],op=data.teamstat?.[opp];
 if(!Array.isArray(my)||!Array.isArray(op)||my.length<17||op.length<17)return {quality:[qa,qb],roles:[],actions:[],warnings:['Teamstatistiken fehlen.']};
 const checked=root.Coach352?root.Coach352.validate(data,Number(opp)):{valid:true};
 const g=Math.max(1,op[0]), og=Math.max(1,my[0]),r=roles(checked.valid?data.spieler?.[opp]:[],op[0]);
 const actions=[];let n=0;
 function add(title,evidence,plan){actions.push({title,evidence,plan,rank:++n});}
 const topReb=r.find(x=>x.tags.includes('Rebounder'));
 const topPlay=r.find(x=>x.tags.includes('Spielmacher'));
 const topShooter=r.find(x=>x.tags.includes('Dreierschütze'));
 if(op[9]/g>=10)add('Defensivrebound sichern',fmt(op[9]/g)+' Offensivrebounds/Spiel'+(topReb?' – '+topReb.name+' '+fmt(topReb.reb)+' Reb./Spiel':''),'Ausboxen bei jedem Wurf; zweite Chancen begrenzen.');
 const pct=ratio(op[1],op[2]);if(pct!=null&&pct>=.55)add('Zone und Ring verteidigen',fmt(100*pct)+' % Zweierquote','Hilfen am Korb und Rotationen festlegen; Fouls vermeiden.');
 if(op[4]/g>=25)add('Dreierlinie organisieren',fmt(op[4]/g)+' Dreier-Versuche/Spiel'+(topShooter?' – '+topShooter.name+' '+fmt(topShooter.threes)+' Treffer/Spiel':''),'Closeouts und Kommunikation bei Screens abstimmen.');
 if(topPlay)add('Ballverteilung stören',topPlay.name+': '+fmt(topPlay.ast)+' Assists, '+fmt(topPlay.to)+' TO/Spiel','Passwege und situativen Druck im Videostudium überprüfen.');
 if(my[15]/og>=13)add('Eigene Ballverluste begrenzen',fmt(my[15]/og)+' TO/Spiel','Sichere erste Pässe und Einwurfroutinen trainieren.');
 if(op[7]/g>my[7]/og+8)add('Spieltempo kontrollieren',fmt(op[7]/g)+' vs. '+fmt(my[7]/og)+' Punkte/Spiel','Transition verhindern; strukturierte Abschlüsse suchen.');
 return {quality:[qa,qb],roles:r,actions:actions.slice(0,5),warnings:[`Stichprobe: ${my[0]} bzw. ${op[0]} Teamspiele.`,'Spielerrollen beruhen auf statistischen Schwellenwerten, nicht auf Video- oder Trackingdaten.','Beobachtungen sind taktische Prüfaufträge und keine gesicherten Verhaltenseigenschaften.']};
}
const api={inspect,roles,gameplan};if(typeof module==='object'&&module.exports)module.exports=api;root.Coaches33=api;
if(typeof document==='undefined')return;
const id=x=>document.getElementById(x);
const style=document.createElement('style');style.textContent=`.c33box{margin-top:20px;border-top:1px solid var(--line,#333);padding-top:14px}.c33cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.c33panel{padding:12px;border:1px solid var(--line,#444);border-radius:10px}.c33panel h4{margin:0 0 8px}.c33panel p{margin:6px 0}.c33muted{opacity:.75;font-size:.87em}.c33-warning{border-left:3px solid #d77c36;padding-left:10px}`;document.head.appendChild(style);
function render(){const content=id('scout-content'), sec=id('scouting-report');if(!content||!sec||sec.hidden||typeof DATA==='undefined'||typeof state==='undefined'||!state.own||!state.opp)return;
 const old=id('c33-extra');old?.remove();let report;try{report=gameplan(DATA,state.own,state.opp);}catch(e){return;}
 const rosterCheck=root.Coach352?root.Coach352.validate(DATA,Number(state.opp)):{valid:true};
 if(!rosterCheck.valid){report.warnings.unshift('ACHTUNG: '+rosterCheck.message);}
 const out=document.createElement('div');out.id='c33-extra';out.className='c33box';
 const quality=report.quality.map(q=>`<div class="c33panel"><h4>${escape(q.name)} · ${q.level==='ok'?'OK':q.level==='warn'?'Hinweis':'Prüfen'}</h4><p>${q.playerCount||0} Spieler, ${q.teamGames||0} Teamspiele</p>${[...q.issues,...(q.notes||[])].map(x=>`<p class="c33-warning">${escape(x)}</p>`).join('')||'<p>Keine Auffälligkeiten innerhalb der verfügbaren Prüfungen.</p>'}</div>`).join('');
 const players=(rosterCheck.valid?report.roles:[]).slice(0,7).map(p=>`<tr><td>${escape(p.name)}${p.lowSample?' *':''}</td><td>${escape(p.tags.join(', '))}</td><td>${fmt(p.pts)}</td><td>${fmt(p.ast)}</td><td>${fmt(p.reb)}</td></tr>`).join('');
 const actions=report.actions.slice(0,3).map(p=>`<div class="c33panel"><h4>${escape(p.title)}</h4><p>${escape(p.evidence)}</p><p>${escape(p.plan)}</p></div>`).join('');
 out.innerHTML=`${rosterCheck.valid?'':`<p class="c33-warning"><strong>Kaderzuordnung prüfen:</strong> ${escape(rosterCheck.message)} Spielerbezogene Gameplan-Texte und Rollen ausgeblendet.</p>`}<h3>Datenqualität · Version 3.3</h3><div class="c33cols">${quality}</div><h3>Spielerrollen des Gegners</h3><div style="overflow-x:auto"><table class="scout-table"><thead><tr><th>Spieler</th><th>Statistische Rolle</th><th>PTS</th><th>AST</th><th>REB</th></tr></thead><tbody>${players||'<tr><td colspan="5">Keine Spielerdaten vorhanden.</td></tr>'}</tbody></table></div><h3>Gameplan · Drei priorisierte Prüfaufträge</h3><div class="c33cols">${actions||'<p>Kein regelbasierter Prüfauftrag verfügbar.</p>'}</div><p class="c33muted">${report.warnings.map(escape).join(' ')}</p>`;
 content.appendChild(out);
}
// Nach dem bestehenden Event-Handler des Scouting-Reports nachzeichnen.
id('scout-create')?.addEventListener('click',render);
for(const k of ['own','opp','league'])id(k)?.addEventListener('change',()=>{if(!id('scouting-report')?.hidden)render();});
root.addEventListener('coach-data-updated',()=>{if(!id('scouting-report')?.hidden)render();});
})(typeof window!=='undefined'?window:globalThis);
