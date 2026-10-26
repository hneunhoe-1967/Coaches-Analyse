/* Version 3.5.11 - UI reset, leaving all source and saved goal data intact. */
(function(){'use strict';
const $=id=>document.getElementById(id);
function init(){
 const header=$('h34-pick')||document.querySelector('header.top');
 if(!header||$('v3511-reset'))return;
 const btn=document.createElement('button');btn.type='button';btn.id='v3511-reset';btn.textContent='Auswahl und Analyse leeren';
 const status=document.createElement('span');status.id='v3511-status';status.setAttribute('role','status');
 const host=header.querySelector('.pick-grid')||header.querySelector('.selectors')||header;
 host.append(btn,status);
 btn.addEventListener('click',()=>{
  const league=$('league');if(!league)return;
  // Existing app owns the selection state and render pipeline.
  league.value='';league.dispatchEvent(new Event('change',{bubbles:true}));
  if($('opp'))$('opp').value='';
  for(const id of ['scout-content','cs358-result']){const node=$(id);if(node)node.replaceChildren();}
  if($('scouting-report'))$('scouting-report').hidden=true;
  if($('h34-report'))$('h34-report').hidden=true;
  if($('prog-v357'))$('prog-v357').hidden=true;
  if($('coachziele-v357'))$('coachziele-v357').hidden=true;
  if($('coach-szenario-v358'))$('coach-szenario-v358').hidden=true;
  // The report and goal sections render again when a new matchup is selected.
  const tab=document.querySelector('.h35-tab[data-tab="spiel"]');tab?.click();
  status.textContent='Aktuelle Auswahl und Anzeigen geleert. Importierte Daten und gespeicherte Ziele bleiben erhalten.';
 });
 const report=$('h35-report-actions');if(report){const title=report.querySelector('strong');if(title)title.textContent='Report · Version 3.5.11';const sub=report.querySelector('p');if(sub)sub.textContent='Spielprognose, Scouting-Report, Spielerrollen und Gameplan.';}
 const detail=$('h34-detail');if(detail){const t=detail.querySelector('summary');if(t)t.textContent='Direkter Vergleich und Top-Listen';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
