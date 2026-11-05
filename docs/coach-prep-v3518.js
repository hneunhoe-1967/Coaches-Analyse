/* Coaches-Analyse 3.5.18: Three coach training themes grounded in the
   established Gameplan and the latest own-game review. Read-only. */
(function(root){'use strict';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
/* Do not associate offensive shooting with defensive three-point closeouts,
   or offensive rebounding with defensive box-outs, merely by shared words. */
function topic(s){s=norm(s);
 if(/defensivrebound|ausbox|zweite chance|offensivrebounds des gegners/.test(s))return 'defreb';
 if(/zone und ring|abschlusse am korb erschweren|ring verteidigen|foulmanagement|defensive ohne unnotige fouls|vertikale ringverteidigung/.test(s))return 'ring';
 if(/dreierlinie|closeouts planen|schutzen fruh aufnehmen|closeouts und kommunikation/.test(s))return 'perimdef';
 if(/eigene ballverluste|ballkontrolle|spielorganisation|point.guard.entscheidungen|angriff sicher organisieren/.test(s))return 'ball';
 if(/ballverteilung storen|ballfuhrende situativ unter druck/.test(s))return 'press';
 if(/spieltempo kontrollieren|spielrhythmus aktiv steuern|transition verhindern/.test(s))return 'tempo';
 if(/catch.and.shoot|dreier.skills|wurf|shot|perimeter.skill/.test(s))return 'shooting';
 if(/frontcourt|high.low|short.roll|inside.out/.test(s))return 'frontcourt';
 return 'other';
}
function taskTopic(t){const title=String(t.title||'');let c=topic(title);if(c!=='other')return c;
 // Use very narrow secondary rules to avoid false matches.
 const a=norm(t.action);
 if(/fouls reduzieren|fouls vermeiden|vertikale ringverteidigung/.test(a))return 'ring';
 if(/ballverluste reduzieren|sichere erste passe/.test(a))return 'ball';
 return 'other';
}
function priorities(gameplan,fallback){if(gameplan?.actions?.length)return gameplan.actions.slice(0,3).map(x=>({title:x.title,why:x.evidence,action:x.plan,origin:'Gameplan'}));
 return (fallback?.priorities||[]).slice(0,3).map(x=>({title:x.title,why:x.why,action:x.action,origin:'Scouting-Modell (Ersatz)'}));}
function combine(three,last){const ownTasks=last?.teamTasks||[];return three.slice(0,3).map(p=>{
 const category=topic(p.title),related=ownTasks.filter(t=>taskTopic(t)===category);
 return {...p,category,related,linked:related.length>0};
});}
function context(){try{if(typeof state==='undefined'||typeof DATA==='undefined'||!state?.own||!state?.opp)return null;
 const last=root.CoachGameAnalysis3516?.items?.(String(state.own))?.[0]||null;
 const scout=root.CoachReportMath?.build?.(DATA,state.own,state.opp);
 const gp=root.Coaches33?.gameplan?.(DATA,state.own,state.opp);
 return {last,scout,gp,own:DATA.teams?.[state.own]?.n||'Eigene Mannschaft',opp:DATA.teams?.[state.opp]?.n||'Gegner',stand:DATA.stand||'unbekannt'};
 }catch(e){return {error:e.message};}}
function latestTask(t){return `<div class="cp18-task"><b>${esc(t.title)}</b><p>${esc(t.action||'')}</p>${t.evidence?`<small><b>Spielbeobachtung:</b> ${esc(t.evidence)}</small>`:''}${t.measure?`<small><b>Kontrolle:</b> ${esc(t.measure)}</small>`:''}</div>`;}
function theme(p,i){return `<article class="cp17-item cp18-theme"><div class="cp17-count">${i+1}</div><div class="cp17-main"><h3>${esc(p.title)}</h3><p><b>Nächster Gegner – Gameplan:</b> ${esc(p.why)}</p><p><b>Trainingsthema:</b> ${esc(p.action)}</p>
 ${p.linked?`<details class="cp17-link"><summary>Passende Erkenntnisse aus dem letzten Spiel (${p.related.length})</summary>${p.related.map(latestTask).join('')}</details>`:'<p class="cp17-muted">Im letzten Spiel keine unmittelbar passende Teamaufgabe dokumentiert. Dieses Thema ergibt sich aus den Gegnerdaten.</p>'}</div></article>`;}
function render(){const anchor=$('ga16-coach'),host=$('analysis');if(!host||!anchor)return;
 let node=$('cp17-panel');if(!node){node=document.createElement('section');node.id='cp17-panel';anchor.insertAdjacentElement('afterend',node);}
 node.className='cp17-panel cp18-panel';const c=context();if(!c||c.error){node.innerHTML=`<h2>Coach-Spielvorbereitung</h2><p>${esc(c?.error||'Bitte Mannschaft und Gegner auswählen.')}</p>`;return;}
 const {last,scout,gp}=c,three=combine(priorities(gp,scout),last);
 const linked=new Set(three.flatMap(p=>p.related));const other=(last?.teamTasks||[]).filter(t=>!linked.has(t));
 const warnings=[...(scout?.warnings||[]),...(gp?.warnings||[])].filter(x=>/stichprobe|älter|nicht verfügbar|spielerdaten/i.test(x));
 node.innerHTML=`<div class="cp17-head"><div><span class="cp17-eyebrow">COACH-SPIELVORBEREITUNG · VERSION 3.5.18</span><h2>Gameplan – Drei priorisierte Trainingsthemen</h2><p>${esc(c.own)} gegen ${esc(c.opp)}</p></div></div>
 <div class="cp17-two"><div><b>Letztes eigenes Spiel</b><p>${last?`${esc(last.date||'Datum fehlt')} · ${esc(last.opponent||'Gegner unbekannt')} · ${esc(last.score||'Ergebnis fehlt')}`:'Keine Analyse importiert'}</p><small>Traineranalyse des letzten Spiels</small></div><div><b>Scouting des nächsten Gegners</b><p>${esc(c.opp)} · ${scout?.oppM?.g||'–'} erfasste Spiele</p><small>Statistischer Datenstand: ${esc(c.stand)}</small></div></div>
 ${last?`<details class="cp18-context"><summary>Was die Teamwerte des letzten Spiels verraten · Rückblick und Trainingsprioritäten</summary><div><p>${esc(last.summary||'Keine zusammenfassende Einordnung importiert.')}</p><p>Die folgenden Aufgaben stammen aus der importierten Analyse. Sie fassen die vorliegenden Erkenntnisse zusammen, ersetzen jedoch nicht den vollständigen Originaltext der Kapitel „Was die Teamwerte über das Spiel verraten“ und „Prioritäten für die nächsten Spiele“.</p><ul>${(last.teamTasks||[]).map(t=>`<li>${esc(t.title)}</li>`).join('')}</ul></div></details>`:''}
 <h3 class="cp17-heading">Drei Trainingsthemen für das nächste Spiel</h3><p class="cp17-explain">Grundlage: die drei priorisierten Themen des bestehenden Gameplans aus den verfügbaren Gegnerdaten. Fachlich passende Teamaufgaben aus der jüngsten importierten Spielanalyse werden ergänzt; fehlende Überschneidungen werden nicht künstlich hergestellt.</p>
 <div class="cp17-items">${three.map(theme).join('')||'<p>Für dieses Matchup sind keine regelbasierten Gameplan-Themen verfügbar.</p>'}</div>
 ${other.length?`<details class="cp17-extra"><summary>Weitere Trainingsaufgaben aus dem letzten Spiel (${other.length})</summary><div>${other.map(latestTask).join('')}</div></details>`:''}
 ${last?.playerTasks?.length?`<details class="cp17-extra"><summary>Individuelle Aufgaben aus dem letzten Spiel (${last.playerTasks.length})</summary><div>${last.playerTasks.map(t=>`<div class="cp18-task"><b>${esc(t.player)} · ${esc(t.title)}</b><p>${esc(t.action)}</p>${t.measure?`<small>Kontrolle: ${esc(t.measure)}</small>`:''}</div>`).join('')}</div></details>`:''}
 <p class="cp17-caution">Trainerische Entscheidungshilfe, keine statistisch validierte Kausalitäts- oder Erfolgsprognose. Die Originalkapitel sind im derzeitigen Analyse-JSON nicht vollständig hinterlegt; genutzt werden Kurzbewertung und Teamaufgaben. ${esc(warnings.join(' ')||'Aktuelle Spielerrollen, Matchup und Video vor dem Spiel prüfen.')}</p>`;
}
function init(){render();['league','own','opp'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(render,75)));
 const list=$('ga14-list');if(list)new MutationObserver(()=>render()).observe(list,{childList:true});}
root.CoachPrep3518={render,topic,taskTopic,combine,priorities};
/* Backwards-compatible refresh invoked when imported analyses change. */
root.CoachPrep3517={render};
if(typeof module==='object'&&module.exports)module.exports={topic,taskTopic,combine,priorities};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
