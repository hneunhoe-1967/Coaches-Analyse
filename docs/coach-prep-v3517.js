/* Coaches-Analyse 3.5.17: Matchup + latest own-game retrospective. Read-only. */
(function(root){'use strict';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const one=n=>Number.isFinite(n)?n.toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1}):'–';
const topics=[
 {name:'Ballkontrolle',re:/ballverlust|turnover|assist|pass|ballkontrolle|entscheidung|pick.and.roll|spielorganisation|guard|ballbewegung/i},
 {name:'Rebounding',re:/rebound|boxout|zweite chance|offensivrebounds|ausboxen/i},
 {name:'Wurf und Spacing',re:/dreier|wurfauswahl|shoot|abschluss|shot|perimeter|spacing|closeout|schütz/i},
 {name:'Defensive und Fouls',re:/foul|defen|ring|help|rotation|verteidig/i},
 {name:'Spielrhythmus',re:/rhythmus|tempo|transition|spielkontrolle/i}
];
function tags(v){return topics.filter(t=>t.re.test(v)).map(t=>t.name);}
function matchTasks(priority,tasks){const p=tags(`${priority.title} ${priority.why} ${priority.action}`);return tasks.filter(t=>tags(`${t.title} ${t.action}`).some(x=>p.includes(x))).slice(0,2);}
function plan(priorities,game){const tasks=game?.teamTasks||[];return (priorities||[]).slice(0,5).map(p=>({title:p.title,why:p.why,action:p.action,severity:p.severity,links:matchTasks(p,tasks)}));}
function context(){try{if(typeof state==='undefined'||typeof DATA==='undefined'||!state?.own||!state?.opp)return null;
 const last=(root.CoachGameAnalysis3516?.items?.(String(state.own))||[])[0]||null;
 const report=root.CoachReportMath?.build?.(DATA,state.own,state.opp);
 return {last,report,team:DATA.teams?.[state.own]?.n||'Eigene Mannschaft',opponent:DATA.teams?.[state.opp]?.n||'Gegner',data:DATA};
 }catch(e){return {error:e.message};}}
function reportItem(p,i){const links=p.links||[];return `<article class="cp17-item"><div class="cp17-count">${i+1}</div><div class="cp17-main"><h3>${esc(p.title)}</h3><p><b>Gegneranalyse:</b> ${esc(p.why)}</p><p><b>Vorbereitung:</b> ${esc(p.action)}</p>${links.length?`<details class="cp17-link"><summary>Bezug zum letzten Spiel · ${links.length} ${links.length===1?'Aufgabe':'Aufgaben'}</summary>${links.map(t=>`<div class="cp17-linktask"><b>${esc(t.title)}</b><p>${esc(t.action)}</p>${t.evidence?`<small>Beobachtung: ${esc(t.evidence)}</small>`:''}</div>`).join('')}</details>`:'<p class="cp17-muted">Im letzten Spiel keine eindeutig passende Teamaufgabe dokumentiert.</p>'}</div></article>`;}
function render(){const anchor=$('ga16-coach'),host=$('analysis');if(!anchor||!host)return;
 let node=$('cp17-panel');if(!node){node=document.createElement('section');node.id='cp17-panel';node.className='cp17-panel';anchor.insertAdjacentElement('afterend',node);}
 const c=context();if(!c||c.error){node.innerHTML=`<h2>Coach-Spielvorbereitung</h2><p>${esc(c?.error||'Bitte zuerst das eigene Team und den nächsten Gegner auswählen.')}</p>`;return;}
 const {last,report}=c,prios=plan(report.priorities,last);
 const extras=(last?.teamTasks||[]).filter(t=>!prios.some(p=>p.links.includes(t))).slice(0,3);
 const mismatch=(report.warnings||[]).filter(w=>/stichprobe|älter|nicht verfügbar/i.test(w));
 node.innerHTML=`<div class="cp17-head"><div><span class="cp17-eyebrow">SPIELVORBEREITUNG · VERSION 3.5.17</span><h2>Aus dem letzten Spiel für den nächsten Gegner lernen</h2><p>${esc(c.team)} gegen ${esc(c.opponent)}</p></div></div>
 <div class="cp17-two"><div><b>Letztes eigenes Spiel</b><p>${last?`${esc(last.date||'ohne Datum')} · ${esc(last.opponent||'Gegner')} · ${esc(last.score||'Ergebnis offen')}`:'Noch keine Analyse importiert'}</p><small>${last?'Coach-Rückblick; keine offiziellen Live-Statistiken':'Unter „Daten“ eine Spielanalyse importieren'}</small></div><div><b>Statistische Gegneranalyse</b><p>${esc(c.opponent)} · ${report.oppM?.g||'–'} erfasste Spiele</p><small>Teamdatenstand: ${esc(c.data.stand||'unbekannt')}</small></div></div>
 <h3 class="cp17-heading">Prioritäten für das nächste Spiel</h3><p class="cp17-explain">Die taktischen Prioritäten stammen aus dem bestehenden Scouting-Modell. Passende Aufgaben des letzten Spiels werden zusätzlich verknüpft; Übereinstimmungen sind Themenähnlichkeiten, kein Nachweis einer Ursache.</p>
 <div class="cp17-items">${prios.map(reportItem).join('')}</div>
 ${extras.length?`<details class="cp17-extra"><summary>Weitere offene Teamaufgaben aus dem letzten Spiel (${extras.length})</summary><div>${extras.map(t=>`<article><h4>${esc(t.title)}</h4><p>${esc(t.action)}</p>${t.evidence?`<small>${esc(t.evidence)}</small>`:''}</article>`).join('')}</div></details>`:''}
 ${last?.playerTasks?.length?`<details class="cp17-extra"><summary>Individuelle Aufgaben aus dem letzten Spiel (${last.playerTasks.length})</summary><div>${last.playerTasks.map(t=>`<article><h4>${esc(t.player)} · ${esc(t.title)}</h4><p>${esc(t.action)}</p>${t.measure?`<small>Kontrolle: ${esc(t.measure)}</small>`:''}</article>`).join('')}</div></details>`:''}
 <p class="cp17-caution">Entscheidungshilfe, keine automatische taktische Empfehlung oder belastbare Prognose. ${esc(mismatch.join(' ')||'Aktualität und Rollen der Spieler vor dem nächsten Spiel prüfen.')}</p>`;
}
function init(){render();['league','own','opp'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(render,70)));}
root.CoachPrep3517={render,plan,tags,matchTasks};
if(typeof module==='object'&&module.exports)module.exports={plan,tags,matchTasks};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
