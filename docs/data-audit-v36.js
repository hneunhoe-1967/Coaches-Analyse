/* Coaches-Analyse 3.6 – read-only audit of local ProB-Sued data. */
(function(){
 'use strict';
 const host=document.getElementById('data-admin');
 if(!host)return;
 const panel=document.createElement('section');
 panel.id='v36-audit';panel.className='v36-audit';
 panel.innerHTML='<h3>Datenprüfung · Version 3.6</h3>'+
 '<p>Prüft den <strong>lokal in diesem Safari gespeicherten</strong> Datenbestand. Die veröffentlichten GitHub-Ausgangsdaten und deine manuellen Importe sind getrennte Datenstände. Diese Prüfung schreibt und importiert nichts.</p>'+
 '<div class="v36-actions"><button type="button" id="v36-check">15 ProB-Süd-Teams prüfen</button><button type="button" id="v36-show-local">Gespeicherten Datenstand anzeigen</button></div>'+
 '<p id="v36-status" role="status" aria-live="polite">Noch nicht geprüft.</p><div id="v36-result"></div>'+
 '<p class="v36-help">Ist der lokale Stand älter als erwartet? Prüfe zuerst in „Downloads“ nach <code>coaches-analyse-backup-vor-aktualisierung.json</code> oder <code>coaches-analyse-daten.json</code>. Vor einer Wiederherstellung immer die derzeitigen Daten über „Daten exportieren“ sichern.</p>';
 host.insertBefore(panel,host.querySelector('#admin-counters'));
 const $=id=>document.getElementById(id);
 const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=x=>x?escapeHTML(String(x)):'–';
 const sumPoints=a=>a.reduce((n,r)=>n+(Number(r[11])||0),0);
 async function getStored(){
   if(typeof localGet!=='function')throw Error('Lokaler Datenspeicher ist nicht verfügbar.');
   const d=await localGet('dataset');
   if(!d)throw Error('In diesem Browser ist kein lokaler Datensatz gespeichert.');
   return d;
 }
 function audit(d){
   const table=d.ligen?.probs?.table||[];
   const rows=table.map((r,i)=>{
     const id=String(r[0]),t=d.teams?.[id]||{},s=d.teamstat?.[id],p=d.spieler?.[id]||[];
     const games=s?.[0]??null,points=s?.[7]??null,playerPoints=sumPoints(p),maxG=Math.max(0,...p.map(x=>Number(x[3])||0));
     const problems=[];
     if(!s)problems.push('Teamstatistik fehlt');
     if(!p.length)problems.push('Spieler fehlen');
     if(s&&Number(r[1])!==games)problems.push('Spielanzahl');
     if(s&&Number(r[5])!==points)problems.push('Teampunkte/Tabelle');
     if(s&&p.length&&playerPoints!==points)problems.push('Spielerpunkte/Team');
     if(s&&maxG>games)problems.push('Spielereinsätze');
     return {id,name:t.n||id,rank:i+1,tableG:r[1],tableP:r[5],teamG:games,teamP:points,players:p.length,playerP:playerPoints,maxG,problems,rosterDate:t.kaderStand||'',teamDate:t.teamstatStand||''};
   });
   return rows;
 }
 function render(d){
   const rows=audit(d), cob=rows.find(x=>x.id==='559');
   const ok=rows.filter(r=>!r.problems.length).length, rosterCount=rows.filter(r=>r.players>0).length;
   const localMatches=typeof DATA!=='undefined'&&DATA===d;
   const summary=`<p><strong>ProB Süd: ${rows.length} Teams · ${rosterCount} mit Spielerwerten · ${ok} ohne Abweichung.</strong> Basisdatum der Datenbank: ${date(d.stand)}. Tabellenimport: ${date(d.ligen?.probs?.tableImportStand||d.ligen?.probs?.tableStand)}.</p>`;
   const coburg=cob?`<p><strong>BBC Coburg:</strong> Tabelle ${cob.tableG} Sp./${cob.tableP} Pkt.; Team ${cob.teamG??'–'} Sp./${cob.teamP??'–'} Pkt.; ${cob.players} Spieler, ${cob.playerP} Spielerpunkte. Kaderstand: ${date(cob.rosterDate)}, Teamstand: ${date(cob.teamDate)}.</p>`:'';
   let warning='';
   if(rosterCount<15||ok<15){warning='<p class="v36-warn"><strong>Achtung:</strong> Mindestens ein Datensatz ist unvollständig oder widersprüchlich. Bitte nicht auf „Aktualisieren“ klicken und nicht blind erneut importieren. Vorhandene Sicherung prüfen.</p>';}
   else{warning='<p class="v36-good">Alle 15 Team-/Spieler-/Tabellenwerte sind intern konsistent. Das beweist nicht die tagesaktuelle Übereinstimmung mit der offiziellen Website.</p>';}
   const body=rows.map(r=>`<tr class="${r.problems.length?'v36-bad':''}"><td>${r.rank}</td><th>${escapeHTML(r.name)}</th><td>${r.tableG}</td><td>${r.teamG??'–'}</td><td>${r.players}</td><td>${r.tableP}</td><td>${r.teamP??'–'}</td><td>${r.playerP}</td><td>${r.problems.length?escapeHTML(r.problems.join(', ')):'OK'}</td></tr>`).join('');
   $('v36-result').innerHTML=summary+coburg+warning+'<div class="v36-scroll"><table><thead><tr><th>Pl.</th><th>Team</th><th>Tab.-Sp.</th><th>Team-Sp.</th><th>Spieler</th><th>Tab.-P.</th><th>Team-P.</th><th>Spieler-P.</th><th>Prüfung</th></tr></thead><tbody>'+body+'</tbody></table></div>';
   $('v36-status').textContent='Lokale Daten geprüft. Keine Daten verändert.';
   return {rows,rosterCount,ok,localMatches};
 }
 $('v36-check').addEventListener('click',async()=>{
  try{render(await getStored());}catch(e){$('v36-status').textContent='Prüfung nicht möglich: '+e.message;}
 });
 $('v36-show-local').addEventListener('click',async()=>{
   try{
     const d=await getStored();
     if(typeof uebernehmen!=='function')throw Error('Darstellung kann nicht neu geladen werden.');
     uebernehmen(d);if(typeof renderAdmin==='function')renderAdmin();
     render(d);$('v36-status').textContent='Gespeicherter Datensatz wurde nur in die Anzeige geladen; kein Schreibzugriff.';
   }catch(e){$('v36-status').textContent='Anzeige fehlgeschlagen: '+e.message;}
 });
 // Explicit display of installed program version, not of the dated baseline dataset.
 function setVersion(){
  for(const e of document.querySelectorAll('.h35-version,.h34-version')){
    e.textContent='Version 3.6 · Teamprüfung · Scouting · Coach-Ziele';
  }
  const title=document.getElementById('admin-title');if(title)title.textContent='Datenverwaltung · Version 3.6';
 }
 setVersion();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setVersion,{once:true});
})();
