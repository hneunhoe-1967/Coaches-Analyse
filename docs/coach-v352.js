/* Coach 3.5.2 – integrity guard for team-specific player rankings. No external requests. */
(function(root){'use strict';
function nameOf(row){return Array.isArray(row)&&typeof row[1]==='string'?row[1].trim().toLowerCase():'';}
function rosterNames(rows){return new Set((Array.isArray(rows)?rows:[]).map(nameOf).filter(Boolean));}
function validate(data,teamId){
 const src=data&&data.spieler||{};
 const rows=src[teamId];
 if(!Array.isArray(rows)||rows.length===0)return {valid:true,message:'Keine Spielerwerte vorhanden.'};
 // 3.5.4: Teamnamen niemals durch fest codierte Spielerlisten bestimmen.
 // Der bisherige Langen-/Reutlingen-Vergleich beruhte auf vertauschten
 // Annahmen. Vertraue der Team-ID des Imports; pruefe unten weiter auf
 // doppelte Zeilen, unvollstaendige Datensaetze und erhebliche Kader-
 // Ueberschneidungen zwischen verschiedenen Team-IDs.
 const names=rosterNames(rows);
 if(names.size<rows.length)return {valid:false,message:'Doppelte oder ungültige Spielernamen im ausgewählten Kader.'};
 if(rows.some(row=>!Array.isArray(row)||row.length<22))return {valid:false,message:'Unvollständige Spielerzeilen.'};
 for(const [otherId,otherRows] of Object.entries(src)){
  if(String(otherId)===String(teamId)||!Array.isArray(otherRows)||otherRows.length===0)continue;
  const other=rosterNames(otherRows);
  let shared=0;
  for(const n of names)if(other.has(n))shared++;
  // high-overlap roster is a strong signal that CSV was assigned to wrong team.
  if(shared>=5 && shared/Math.min(names.size,other.size)>=0.6){
   const otherName=data?.teams?.[otherId]?.n||'Mannschaft '+otherId;
   return {valid:false,message:`${shared} Spieler stimmen mit ${otherName} überein. CSV-Zuordnung möglicherweise falsch.`};
  }
 }
 return {valid:true,message:'Spielerstatistiken dem gewählten Team zugeordnet.'};
}
function sync(){
 const teamSelect=document.getElementById('opp');
 const notice=document.getElementById('h352-status');
 if(!teamSelect||!notice)return;
 const id=Number(teamSelect.value);
 try{
  if(typeof DATA==='undefined'||!DATA||!id){notice.textContent='';return;}
  const c=validate(DATA,id);
  notice.textContent=c.valid?'Spielerwerte: '+(DATA.spieler?.[id]?.length||0)+' Einträge für ausgewählten Gegner.':c.message;
  notice.classList.toggle('h352-error',!c.valid);
 }catch(e){notice.textContent='Datenprüfung derzeit nicht verfügbar.';}
}
function init(){
 const sel=document.getElementById('opp');
 if(!sel)return;
 const wrap=document.createElement('p');wrap.id='h352-status';wrap.className='h352-status';wrap.setAttribute('role','status');
 sel.closest('label')?.appendChild(wrap);
 ['own','opp','league'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(sync,20)));
 window.addEventListener('coach-data-updated',()=>setTimeout(sync,20));
 // On return to Report, force a fresh render from selected opponent, not the prior view.
 document.querySelector('.h35-tabs')?.addEventListener('click', e=>{
  if(!e.target.closest('[data-tab="report"]'))return;
  try{if(typeof renderLeaders==='function'&&typeof state!=='undefined'&&state.opp)renderLeaders();}catch(err){console.warn('3.5.2 refresh:',err);}
  sync();
 });
 setTimeout(sync,60);
}
root.Coach352={validate,rosterNames};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(typeof window!=='undefined'?window:globalThis);
