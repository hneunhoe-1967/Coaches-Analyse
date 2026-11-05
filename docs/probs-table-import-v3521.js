/* Coaches-Analyse 3.5.21: explicit, local, table-only import.
   Does NOT modify games, team stats, players, analyses or coach goals. */
(function(){
'use strict';
const panel=document.getElementById('probs-table-import-v3521');
if(!panel)return;
const input=panel.querySelector('input[type=file]');
const check=panel.querySelector('[data-action="check"]');
const save=panel.querySelector('[data-action="save"]');
const details=panel.querySelector('[data-role="preview"]');
const status=panel.querySelector('[data-role="status"]');
const agreement=panel.querySelector('[data-role="agree"]');
let staged=null;
function reset(){staged=null;save.disabled=true;agreement.checked=false;details.textContent='';status.textContent='';}
input.addEventListener('change',reset);
function validate(p,d){
 if(!p||p.format!=='coaches-probs-table-v1'||p.season!=='2026/27'||!Array.isArray(p.rows)||p.rows.length!==15)throw Error('Ungültiges Tabellenformat oder unvollständige Mannschaftsliste.');
 if(!d?.ligen?.probs?.table||!d?.teamstat||!d?.teams)throw Error('Lokaler Datenbestand nicht verfügbar.');
 const existingIds=new Set(d.ligen.probs.table.map(r=>Number(r[0])));
 const ids=new Set();
 for(const r of p.rows){
  if(!Array.isArray(r)||r.length!==10)throw Error('Tabellenzeile muss genau zehn Werte enthalten.');
  const [id,g,w,l,points,plus,minus,home,away,streak]=r;
  if(ids.has(id)||!existingIds.has(id)||d.teams[id]?.l!=='probs')throw Error('Falsche oder doppelte Team-ID: '+id);
  ids.add(id);
  if(![id,g,w,l,points,plus,minus,streak].every(Number.isInteger)||g!==w+l||points!==w*2||plus<0||minus<0||g<6||g>7)throw Error('Tabellenwerte unplausibel: '+id);
  if(!/^\d+–\d+$/.test(home)||!/^\d+–\d+$/.test(away))throw Error('Heim-/Auswärtswert fehlt: '+id);
  if(plus!==d.teamstat[id][7])throw Error(d.teams[id].n+': Tabellenpunkte und aktuelle Teamstatistik stimmen nicht überein ('+plus+' != '+d.teamstat[id][7]+').');
 }
 if([...existingIds].some(id=>!ids.has(id)))throw Error('Eine Mannschaft fehlt in der neuen Tabelle.');
 return true;
}
check.addEventListener('click',async()=>{
 reset();try{
  if(input.files.length!==1)throw Error('Bitte die Tabellen-JSON auswählen.');
  const f=input.files[0];if(f.size>100000)throw Error('Datei zu groß.');
  const p=JSON.parse(await f.text()),d=await localGet('dataset');validate(p,d);
  staged=p;
  details.textContent=p.rows.map((r,i)=>`${i+1}. ${d.teams[r[0]].n}: ${r[1]} Spiele, ${r[2]}–${r[3]}, ${r[4]} Punkte`).join('\n');
  status.textContent='15 Tabellenzeilen geprüft. Zum Speichern Bestätigung aktivieren.';
  save.disabled=false;
 }catch(e){status.textContent='Prüfung fehlgeschlagen: '+e.message;}
});
save.addEventListener('click',async()=>{
 try{
  if(!staged||!agreement.checked)throw Error('Bitte erst prüfen und ausdrücklich bestätigen.');
  const current=await localGet('dataset');validate(staged,current);
  const copy=structuredClone(current);
  copy.ligen.probs.table=staged.rows.map(r=>r.slice());
  copy.ligen.probs.tableStand='01.11.2026, 19:52 Uhr';
  copy.ligen.probs.tableUrl=staged.source;
  copy.ligen.probs.note='Tabellenstand 01.11.2026; Spielplan/Ergebnisarchiv separat, nicht aktualisiert.';
  copy.ligen.probs.tableImportStand=staged.stand;
  validateDataset(copy);
  await localPut('dataset',copy);
  uebernehmen(copy);
  if(typeof renderAdmin==='function')renderAdmin();
  status.textContent='Erfolgreich: ProB-Süd-Tabelle aktualisiert. Spielerstatistiken, Teamstatistiken, Spiele und Analysen unverändert.';
  staged=null;save.disabled=true;agreement.checked=false;
 }catch(e){status.textContent='Speichern abgelehnt: '+e.message;}
});
})();
