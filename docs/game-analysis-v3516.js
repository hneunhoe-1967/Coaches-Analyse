/* Coaches-Analyse 3.5.16: Last imported game in Coach, history in Data.
   Read-only viewer. Analyses, datasets and goals are never migrated or overwritten. */
(function(root){'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byDate=(a,b)=>(Date.parse(b.date||'')||0)-(Date.parse(a.date||'')||0)||String(b.id||'').localeCompare(String(a.id||''));
const all=()=>root.CoachGameAnalysis3514?.read?.()||[];
const own=()=>{try{return String(state?.own||'');}catch(_){return '';}};
const teamName=id=>{try{return DATA?.teams?.[id]?.n||'Mannschaft '+id;}catch(_){return 'Mannschaft '+id;}};
const items=id=>all().filter(a=>String(a.teamId)===id).sort(byDate);
function task(t,player){return `<details class="ga16-task"><summary>${player?'<b>'+esc(t.player)+'</b> · ':''}${esc(t.title)}</summary><div class="ga16-task-body"><p>${esc(t.action)}</p>${t.evidence?`<p><b>Beobachtung:</b> ${esc(t.evidence)}</p>`:''}${t.measure?`<p><b>Kontrolle:</b> ${esc(t.measure)}</p>`:''}</div></details>`;}
function detail(a){return `<p class="ga16-meta">${esc(a.date||'Datum unbekannt')} · gegen ${esc(a.opponent||'Gegner unbekannt')}${a.score?' · '+esc(a.score):''}</p>${a.summary?`<p class="ga16-abstract">${esc(a.summary)}</p>`:''}<h4>Teamaufgaben</h4>${(a.teamTasks||[]).map(t=>task(t,false)).join('')||'<p>Keine Teamaufgaben hinterlegt.</p>'}<h4>Spieleraufgaben</h4>${(a.playerTasks||[]).map(t=>task(t,true)).join('')||'<p>Keine Spieleraufgaben hinterlegt.</p>'}<p class="ga16-note">${esc(a.status||'Coaching-Einschätzung – vom Coach prüfen.')} · Quelle: ${esc(a.sourceFile||'Import')}</p>`;}
function renderCoach(){
 const host=$('analysis');if(!host)return;
 let pane=$('ga16-coach');if(!pane){pane=document.createElement('section');pane.id='ga16-coach';pane.className='ga16-panel';const before=$('coachziele-v357');if(before&&host.contains(before))host.insertBefore(pane,before);else host.appendChild(pane);}
 const id=own();if(!id){pane.innerHTML='<h2>Analyse des letzten Spiels</h2><p>Bitte zuerst im Reiter „Spiel“ die eigene Mannschaft auswählen.</p>';return;}
 const latest=items(id)[0];if(!latest){pane.innerHTML=`<h2>Analyse des letzten Spiels</h2><p>Für ${esc(teamName(id))} wurde noch keine Spielanalyse importiert. Import im Reiter „Daten“ möglich.</p>`;return;}
 const selectedId=pane.dataset.analysisId||'';const opened=new Set([...pane.querySelectorAll('.ga16-task[open]')].map(x=>x.querySelector('summary')?.textContent));
 pane.innerHTML=`<details class="ga17-collapse"><summary>Analyse des letzten Spiels · ${esc(latest.date||"Datum unbekannt")} · ${esc(latest.opponent||"Gegner unbekannt")}</summary><div class="ga17-collapse-body"><p class="ga16-intro">Rückblick auf das jüngste <b>importierte</b> Spiel von ${esc(teamName(id))}. Die nächsten Gegnerdaten und Coach-Ziele bleiben in ihren bisherigen Ansichten verfügbar.</p>${detail(latest)}<p class="ga16-footer">Weitere Spielanalysen: Reiter „Daten“ → Archiv der Spielanalysen.</p></div></details>`;
 pane.dataset.analysisId=latest.id||'';
 if(selectedId===pane.dataset.analysisId)pane.querySelectorAll('.ga16-task').forEach(x=>{if(opened.has(x.querySelector('summary')?.textContent))x.open=true;});
}
function archive(){
 const base=$('ga14-import')||$('data-admin');if(!base)return;
 let pane=$('ga16-archive');if(!pane){pane=document.createElement('section');pane.id='ga16-archive';pane.className='ga16-panel ga16-archive';base.appendChild(pane);}
 const a=all().slice().sort(byDate),chosen=pane.querySelector('#ga16-pick')?.value||'';
 const options=a.map((x,i)=>`<option value="${i}">${esc(x.date||'ohne Datum')} · ${esc(x.teamName||teamName(x.teamId))} gegen ${esc(x.opponent||'?')}</option>`).join('');
 pane.innerHTML=`<h2>Archiv der Spielanalysen</h2><p class="ga16-intro">${a.length} gespeicherte Analysen. Alte Spiele hier jederzeit wieder ansehen – sie werden nicht automatisch im Scouting-Report angezeigt.</p>${a.length?`<label for="ga16-pick">Spiel auswählen</label><select id="ga16-pick" class="ga16-select">${options}</select><div id="ga16-history"></div>`:'<p>Es sind noch keine Analysen importiert.</p>'}`;
 const sel=$('ga16-pick'),output=$('ga16-history');if(!sel)return;sel.value=chosen&&+chosen<a.length?chosen:'0';
 const draw=()=>{const x=a[Number(sel.value)];if(!x)return;output.innerHTML=`<h3>${esc(x.title||'Spielanalyse')}</h3>${detail(x)}`;};sel.addEventListener('change',draw);draw();
}
function refresh(){// Do not touch the legacy Scouting Report or official dataset.
 $('scout-content')?.querySelector('#ga14-report')?.remove();
 renderCoach();archive();root.CoachPrep3517?.render?.();
}
function init(){
 // Intercept the legacy hook used by the import feature and PDF export.
 if(root.CoachGameAnalysis3514)root.CoachGameAnalysis3514.appendToReport=refresh;
 const old=$('ga14-import');const intro=old?.querySelector('p');if(intro)intro.textContent='DOCX oder Analyse-JSON importieren. Die jüngste Spielanalyse erscheint im Reiter „Coach“; alle importierten Analysen bleiben im Archiv unten abrufbar.';
 refresh();
 ['league','own','opp'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(refresh,55)));
 // Existing import / delete code refreshes #ga14-list when it finishes.
 const list=$('ga14-list');if(list){let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;try{refresh();}finally{busy=false;}}).observe(list,{childList:true});}
 document.querySelectorAll('.h35-tab').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,0)));
}
root.CoachGameAnalysis3516={refresh,byDate,items};
if(typeof module==='object'&&module.exports)module.exports={byDate};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
