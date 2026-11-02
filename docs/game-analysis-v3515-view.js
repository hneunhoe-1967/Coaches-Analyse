/* Coaches-Analyse 3.5.15 – konsolidierte, einklappbare Spielanalysen.
   Nur Darstellungslogik: keine Schreiboperationen auf Daten, Analysen oder Coach-Ziele. */
(function(root){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nrm=s=>String(s??'').toLocaleLowerCase('de').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const categories=[
 {id:'ball',title:'Ballkontrolle & Spielorganisation',re:/ballverlust|turnover|assist|pick.and.roll|entscheidung|decision|ballkontrolle|ballbewegung|spielorganisation|playmaking|passfenster|passqualitat|ballhandling|angriff organisieren|steuerung|creation|scoring breiter/},
 {id:'wurf',title:'Wurfauswahl & Abschlusseffizienz',re:/wurf|dreier|shoot|scoring|finishing|abschluss|treffer|effizienz|spacing|perimeter|shot|off.ball|catch.and.shoot|cut|offensive option|offensive einbindung/},
 {id:'def',title:'Verteidigung & Foulmanagement',re:/defen|foul|closeout|rotation|help|ringverteidigung|stoppen|stabilitat nach der pause|halbzeit/},
 {id:'reb',title:'Rebounding & physische Präsenz',re:/rebound|boxout|zweite chance|second chance|physical|korbarbeit/},
 {id:'team',title:'Teamplay & taktische Abläufe',re:/frontcourt|high.low|horns|short.roll|inside.out|screen|taktik|teamoffense|offense|abstimmung/}
];
function category(t){const txt=nrm(`${t.title||''} ${t.action||''}`);return categories.find(c=>c.re.test(txt))||{id:'other',title:'Weitere Entwicklungsaufgaben'};}
function dateValue(a){const n=Date.parse(String(a.date||''));return Number.isFinite(n)?n:0;}
function sortGames(items){return items.slice().sort((a,b)=>dateValue(b)-dateValue(a)||String(b.id||'').localeCompare(String(a.id||'')));}
function groups(items){const out=new Map();items.forEach(a=>{
 const inGame=new Set();(a.teamTasks||[]).forEach(t=>{const c=category(t);const key=c.id;if(!out.has(key))out.set(key,{title:c.title,games:new Set(),entries:[]});const b=out.get(key);b.entries.push({a,t});inGame.add(key);});
 inGame.forEach(key=>out.get(key).games.add(String(a.id||a.date||a.title)));
});return Array.from(out.values()).sort((a,b)=>b.games.size-a.games.size||a.title.localeCompare(b.title,'de'));}
function players(items){const out=new Map();items.forEach(a=>(a.playerTasks||[]).forEach(t=>{
 const name=String(t.player||'').trim();if(!name)return;const key=nrm(name);if(!out.has(key))out.set(key,{name,games:new Set(),entries:[]});let b=out.get(key);b.entries.push({a,t});b.games.add(String(a.id||a.date||a.title));
}));return Array.from(out.values()).sort((a,b)=>b.games.size-a.games.size||a.name.localeCompare(b.name,'de'));}
function mini(t,a){return `<li class="ga15-task"><b>${esc(t.title)}</b><span class="ga15-source">${esc(a.date||'Datum unbekannt')} · ${esc(a.opponent||'Gegner unbekannt')}</span><p>${esc(t.action||'')}</p>${t.evidence?`<p class="ga15-evidence"><b>Beobachtung:</b> ${esc(t.evidence)}</p>`:''}${t.measure?`<p class="ga15-measure"><b>Kontrolle:</b> ${esc(t.measure)}</p>`:''}</li>`;}
function summary(items){const tg=groups(items),pl=players(items);
 const team=tg.length?tg.map(g=>`<details class="ga15-sub"><summary><span>${esc(g.title)}</span><small>${g.games.size} ${g.games.size===1?'Spiel':'Spiele'} · ${g.entries.length} ${g.entries.length===1?'Aufgabe':'Aufgaben'}</small></summary><ul class="ga15-tasks">${g.entries.map(({a,t})=>mini(t,a)).join('')}</ul></details>`).join(''):'<p>Keine Teamaufgaben vorhanden.</p>';
 const pp=pl.length?pl.map(g=>{const themes=[...new Set(g.entries.map(e=>category(e.t).title))].slice(0,3).join(' · ');return `<details class="ga15-sub"><summary><span>${esc(g.name)}</span><small>${g.games.size} ${g.games.size===1?'Spiel':'Spiele'} · ${esc(themes)}</small></summary><ul class="ga15-tasks">${g.entries.map(({a,t})=>mini(t,a)).join('')}</ul></details>`;}).join(''):'<p>Keine Spieleraufgaben vorhanden.</p>';
 return `<p class="ga15-intro">${items.length} importierte ${items.length===1?'Spielanalyse':'Spielanalysen'}. Themen werden anhand der Aufgaben gruppiert; die Häufigkeit bezeichnet dokumentierte Vorkommen, keine statistisch nachgewiesenen Trends.</p><h4>Team · wiederkehrende Handlungsfelder</h4>${team}<h4>Spieler · individuelle Entwicklungsfelder</h4>${pp}`;
}
function latest(a){const teams=(a.teamTasks||[]).map(t=>`<details class="ga15-sub"><summary><span>${esc(t.title)}</span></summary><ul class="ga15-tasks">${mini(t,a)}</ul></details>`).join('');
 const ps=(a.playerTasks||[]).map(t=>`<details class="ga15-sub"><summary><span>${esc(t.player)} · ${esc(t.title)}</span></summary><ul class="ga15-tasks">${mini(t,a)}</ul></details>`).join('');
 return `<p class="ga15-intro"><b>${esc(a.date||'Datum unbekannt')} · ${esc(a.opponent||'Gegner unbekannt')}</b>${a.score?' · '+esc(a.score):''}</p>${a.summary?`<p class="ga15-intro">${esc(a.summary)}</p>`:''}<h4>Teamaufgaben</h4>${teams||'<p>Keine Teamaufgaben.</p>'}<h4>Spieleraufgaben</h4>${ps||'<p>Keine Spieleraufgaben.</p>'}<p class="ga15-note">${esc(a.status||'Coaching-Einschätzung; fachlich prüfen.')}</p>`;
}
function renderInto(target,own,teams,items){target.querySelector('#ga14-report')?.remove();if(!items.length)return;
 const sorted=sortGames(items),last=sorted[0],s=document.createElement('section');s.id='ga14-report';s.className='ga15-report';
 s.innerHTML=`<h2>Coaching-Aufgaben aus Spielanalysen</h2><p class="ga15-note">${esc(teams?.[own]?.n||'Eigene Mannschaft')} · Importierte Rückblicke, unabhängig vom ausgewählten Gegner. Keine offiziellen Statistikdaten.</p><details class="ga15-main"><summary><span>Zusammenfassung vorliegender Spielanalysen</span><small>${sorted.length} ${sorted.length===1?'Spiel':'Spiele'}</small></summary><div class="ga15-content">${summary(sorted)}</div></details><details class="ga15-main"><summary><span>Analyse letztes Spiel</span><small>${esc(last.date||'Datum unbekannt')} · ${esc(last.opponent||'Gegner unbekannt')}</small></summary><div class="ga15-content">${latest(last)}</div></details>`;
 target.appendChild(s);
}
function appendToReport(){const target=document.getElementById('scout-content');if(!target)return;
 const old=target.querySelector('#ga14-report');const currentOwn=typeof state!=='undefined'?String(state?.own||''):'';
 if(!currentOwn||!target.querySelector('.scout-header')){old?.remove();return;}
 const all=root.CoachGameAnalysis3514?.read?.()||[];const items=all.filter(a=>String(a.teamId)===currentOwn);
 // Preserve opened accordions on re-renders within the current matchup.
 const opened=new Set(Array.from(old?.querySelectorAll('details[open]')||[]).map((x,i)=>x.getAttribute('data-ga15-key')||x.querySelector('summary')?.textContent?.trim()));
 renderInto(target,currentOwn,typeof DATA!=='undefined'?DATA?.teams:{},items);
 if(opened.size){target.querySelectorAll('#ga14-report details').forEach(x=>{let k=x.getAttribute('data-ga15-key')||x.querySelector('summary')?.textContent?.trim();if(opened.has(k))x.open=true;});}
}
function init(){if(!root.CoachGameAnalysis3514)return;
 root.CoachGameAnalysis3514.appendToReport=appendToReport;
 const target=document.getElementById('scout-content');if(!target)return;
 let busy=false;const redraw=()=>{if(busy)return;busy=true;try{appendToReport();}finally{busy=false;}};
 new MutationObserver(()=>{
  const host=target.querySelector('#ga14-report');if(!target.querySelector('.scout-header'))return;
  if(!host||!host.classList.contains('ga15-report'))redraw();
 }).observe(target,{childList:true,subtree:false});
 ['own','opp','league'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(redraw,45)));
 redraw();
}
root.CoachGameAnalysis3515={appendToReport,groups,players,sortGames,category};
if(typeof module==='object'&&module.exports)module.exports={groups,players,sortGames,category};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
