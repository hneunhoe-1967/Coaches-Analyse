/* Coaches-Analyse 3.2 – rein lokaler, regelbasierter Scouting-Report */
(function(root){
'use strict';
function safe(n){return Number.isFinite(n)?n:null;}
function div(a,b){return b>0?safe(a/b):null;}
function metrics(t,row){
 if(!Array.isArray(t)||t.length<17||!row)return null;
 const [g,m2,a2,m3,a3,mf,af,p,ast,oreb,dreb,reb,foul,blk,stl,to,eff]=t;
 const fga=a2+a3,fgm=m2+m3,poss=fga+0.44*af-oreb+to;
 return {g,ppg:div(p,g),allowed:div(row.minus,row.g),oppScored:div(row.plus,row.g),reb:div(reb,g),oreb:div(oreb,g),drb:div(dreb,g),ast:div(ast,g),to:div(to,g),stl:div(stl,g),eff:div(eff,g),fga:div(fga,g),threeA:div(a3,g),threeMade:div(m3,g),twoPct:div(m2,a2),threePct:div(m3,a3),ftPct:div(mf,af),efg:div(fgm+0.5*m3,fga),ftr:div(af,fga),poss:div(poss,g),ortg:div(100*p,poss),shots:fga,fta:af};
}
function playerRows(rows){return (Array.isArray(rows)?rows:[]).filter(a=>Array.isArray(a)&&a.length>=22&&a[3]>0).map(a=>({nr:a[0],name:String(a[1]).replace('|',' '),position:a[2],g:a[3],minutes:a[4],points:a[11]/a[3],reb:a[15]/a[3],ast:a[12]/a[3],to:a[19]/a[3],threeA:a[8]/a[3],threePct:div(a[7],a[8]),eff:a[20]/a[3]}));}
function build(data,own,opp){
 const a=data.teams?.[own],b=data.teams?.[opp];if(!a||!b)throw Error('Beide Teams auswählen.');
 const rows={};Object.values(data.ligen||{}).forEach(l=>(l.table||[]).forEach(r=>rows[r[0]]={g:r[1],plus:r[5],minus:r[6]}));
 const x=metrics(data.teamstat?.[own],rows[own]),y=metrics(data.teamstat?.[opp],rows[opp]);
 if(!x||!y)throw Error('Für mindestens eine Mannschaft fehlen die Teamstatistiken.');
 const fmt=(v,d=1)=>v==null?'–':v.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
 const scoring=div(x.ppg+y.allowed,2),conceded=div(y.ppg+x.allowed,2);
 const players=playerRows(data.spieler?.[opp]).sort((u,v)=>v.points-u.points);
 const qualifying=players.filter(p=>p.g>=Math.max(2,Math.ceil(y.g*0.4)));
 const top=(qualifying.length?qualifying:players).slice(0,5);
 const priorities=[];
 function add(title,why,action,severity){priorities.push({title,why,action,severity});}
 if(y.oreb>=10)add('Defensivrebound absichern',`${fmt(y.oreb)} offensive Rebounds je Spiel`,`Konsequentes Ausboxen; nach dem ersten Wurf keine zweite Chance zulassen.`,y.oreb>=13?4:3);
 if(y.twoPct>=.55)add('Abschlüsse am Korb erschweren',`${fmt(y.twoPct*100)} % Zweierquote`,`Help-Side und Ringbeschützung abstimmen; Fouls vermeiden.`,4);
 if(y.threeA>=25)add('Perimeter und Closeouts planen',`${fmt(y.threeA)} Dreier-Versuche je Spiel`,`Schützen früh aufnehmen und Rotationen nach Screen-Aktionen festlegen.`,3);
 if(y.to>=14)add('Ballführende situativ unter Druck setzen',`${fmt(y.to)} Ballverluste je Spiel`,`Druck nach Timeouts bzw. Seitenauslinien erwägen, ohne eigene Defensive zu öffnen.`,2);
 if(x.to>=13)add('Eigene Ballverluste reduzieren',`${fmt(x.to)} Ballverluste je Spiel`,`Einfache Passwinkel, saubere Einwürfe und sichere erste Aktion priorisieren.`,3);
 if(y.ppg>x.ppg+8)add('Spielrhythmus aktiv steuern',`${fmt(y.ppg)} zu ${fmt(x.ppg)} erzielte Punkte pro Spiel`,`Transition verteidigen und Angriffe strukturiert abschließen.`,4);
 if(!priorities.length)add('Matchup mit Spielvideo abgleichen','Keine klaren statistischen Schwellwerte ausgelöst','Aufstellung und Spielsituationen anhand aktueller Videos prüfen.',1);
 priorities.sort((u,v)=>v.severity-u.severity);
 const warnings=[];if(Math.min(x.g,y.g)<8)warnings.push(`Kleine Stichprobe: ${x.g} bzw. ${y.g} Spiele.`);
 if(!players.length)warnings.push('Keine individuellen Gegner-Spielerstatistiken verfügbar.');
 if(players.length&&Math.max(...players.map(p=>p.g))<y.g)warnings.push('Spielerdaten sind möglicherweise älter als die Mannschaftsdaten.');
 warnings.push('Geschätzte Ballbesitze und Offensivratings beruhen auf einer vereinfachten Formel; kein vollständiges Possession-Tracking.');
 warnings.push('Punkte-Baseline ist ein arithmetischer Vergleich von Offensive und gegnerischer Defensive – keine zuverlässige Ergebnisprognose.');
 return {own:a,opp:b,ownM:x,oppM:y,scoreOwn:scoring,scoreOpp:conceded,players:top,priorities:priorities.slice(0,5),warnings,stand:data.stand||'',fmt};
}
const api={build,metrics,playerRows}; if(typeof module==='object'&&module.exports)module.exports=api;root.CoachReportMath=api;
})(typeof window!=='undefined'?window:globalThis);
