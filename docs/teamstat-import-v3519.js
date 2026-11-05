/* v3.5.19: Teamstatistiken getrennt von Spielerdaten; lokale Übernahme erst nach expliziter Prüfung. */
(function(){
 'use strict';
 const input=document.getElementById('teamstat-file-v3519');
 const check=document.getElementById('teamstat-check-v3519');
 const save=document.getElementById('teamstat-save-v3519');
 const confirm=document.getElementById('teamstat-confirm-v3519');
 const result=document.getElementById('teamstat-result-v3519');
 const report=document.getElementById('teamstat-preview-v3519');
 if(!input||!check||!save||!confirm||!result||!report)return;
 let staged=null;
 const ids=['412','416','482','529','538','547','558','559','563','564','573','575','582','588','591'];
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fail=m=>{throw Error(m)};
 function sumPoints(rows){return rows.reduce((a,r)=>a+Number(r[11]||0),0)}
 function validateStat(a,id){
  if(!Array.isArray(a)||a.length!==17||a.some(x=>!Number.isInteger(x)||x<0))fail(id+': ungültige Teamstatistik.');
  const [g,p2m,p2a,p3m,p3a,ftm,fta,pts,ass,ore,dre,tre]=a;
  if(g<6||g>12)fail(id+': Spielanzahl außerhalb des erwarteten Bereichs.');
  if(p2m>p2a||p3m>p3a||ftm>fta||2*p2m+3*p3m+ftm!==pts||ore+dre!==tre)fail(id+': Statistiksummen widersprüchlich.');
 }
 function validate(p,current){
  if(p?.format!=='coaches-probs-teamstat-v1'||p.saison!=='2026/27'||!p.teams||typeof p.teams!=='object')fail('Falsches Importformat oder Saison.');
  const found=Object.keys(p.teams).sort();if(found.join(',')!==ids.slice().sort().join(','))fail('Erwartet werden exakt 15 ProB-Süd-Mannschaften.');
  const lines=[];
  for(const id of ids){
   const rec=p.teams[id], team=current.teams[id];
   if(!team||team.l!=='probs'||rec.name!==team.n)fail(id+': Mannschaftszuordnung stimmt nicht.');
   validateStat(rec.teamstat,id);validateStat(rec.gegenstat,id);
   if(rec.teamstat[0]!==rec.gegenstat[0])fail(team.n+': eigene und gegnerische Spielanzahl unterschiedlich.');
   const currentG=current.teamstat?.[id]?.[0]||0;
   if(rec.teamstat[0]<currentG)fail(team.n+': neue Werte wären älter als der gespeicherte Bestand ('+currentG+').');
   const players=current.spieler?.[id]||[];
   const maxG=Math.max(0,...players.map(r=>Number(r[3])||0));
   const playerPoints=sumPoints(players),delta=rec.teamstat[7]-playerPoints;
   if(maxG>rec.teamstat[0])fail(team.n+': Spieler haben mehr Spiele als die neuen Teamstatistiken.');
   if(delta!==0&&!(id==='575'&&delta===11))fail(team.n+': ungeklärte Punktedifferenz Spieler/Team: '+delta+'.');
   lines.push({id,name:team.n,alt:currentG,neu:rec.teamstat[0],playerG:maxG,pts:rec.teamstat[7],delta});
  }
  return lines;
 }
 function reset(){staged=null;save.disabled=true;confirm.checked=false;report.hidden=true;report.innerHTML='';result.textContent='';}
 input.addEventListener('change',reset);
 confirm.addEventListener('change',()=>{save.disabled=!(staged&&confirm.checked)});
 check.addEventListener('click',async()=>{
  reset();
  try{
   const f=input.files?.[0];if(!f)fail('Zuerst die Datei teamstat-probs-15.json auswählen.');
   if(f.size>500000)fail('Datei zu groß.');
   const patch=JSON.parse(await f.text());
   const current=await localGet('dataset');if(!current)fail('Kein lokaler Datenbestand vorhanden.');
   const lines=validate(patch,current);
   report.innerHTML='<div style="overflow-x:auto"><table><thead><tr><th>Mannschaft</th><th>Teamspiele alt → neu</th><th>Max. Spielereinsätze</th><th>Team- und Spielerpunkte</th></tr></thead><tbody>'+lines.map(r=>'<tr><td>'+esc(r.name)+'</td><td>'+r.alt+' → <b>'+r.neu+'</b></td><td>'+r.playerG+'</td><td>'+r.pts+(r.delta?' <strong style="color:#f2c180">(Differenz '+r.delta+')</strong>':' ✓')+'</td></tr>').join('')+'</tbody></table></div>';
   report.hidden=false;staged={patch,lines};
   result.textContent='15 Teams erfolgreich geprüft. Ludwigsburg: 11 nicht zuordenbare Spielerpunkte. Jetzt sichern und anschließend ausdrücklich bestätigen.';
  }catch(e){result.textContent='Prüfung fehlgeschlagen: '+e.message}
 });
 save.addEventListener('click',async()=>{
  if(!staged||!confirm.checked)return;
  save.disabled=true;
  try{
   const current=await localGet('dataset');if(!current)fail('Lokaler Datenbestand fehlt.');
   validate(staged.patch,current);
   const updated=structuredClone(current);
   updated.teamstatGegner=updated.teamstatGegner||{};
   for(const id of ids){
    const r=staged.patch.teams[id];
    updated.teamstat[id]=r.teamstat.slice();
    updated.teamstatGegner[id]=r.gegenstat.slice();
    updated.teams[id].teamstatStand=staged.patch.stand;
    updated.teams[id].teamstatQuelle=staged.patch.quelle;
   }
   updated.teamstatUpdate={saison:'2026/27',stand:staged.patch.stand,gespeichert:new Date().toISOString(),anzahl:15,ludwigsburgNichtZugeordnetePunkte:11};
   validateDataset(updated);
   await localPut('dataset',updated);
   uebernehmen(updated);
   renderAdmin();
   if(document.getElementById('local-stat'))document.getElementById('local-stat').textContent=Object.keys(updated.teams).length+' Teams · Teamstatistiken ProB Süd: '+staged.patch.stand;
   result.textContent='Erfolgreich gespeichert: 15 Teamstatistiken und gegnerische Statistiken. Spieler, Spielanalysen und Coach-Ziele unverändert.';
   staged=null;confirm.checked=false;
  }catch(e){result.textContent='Speichern fehlgeschlagen: '+e.message;save.disabled=false;}
 });
})();
