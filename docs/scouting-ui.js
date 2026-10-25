/* Präsentation für bestehende Coaches-Analyse; keine Netzwerkanfragen. */
(function(){
'use strict';
const by=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const one=(n,d=1)=>n==null?'–':Number(n).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
const percent=n=>n==null?'–':one(n*100)+' %';
function draw(){
 if(!window.CoachReportMath)return;
 const section=by('scouting-report');if(!section)return;
 if(!DATA||!state.own||!state.opp){section.hidden=true;return;}
 // COACH352_REPORT: validate roster ownership before rendering player rankings.
 const checked=window.Coach352?window.Coach352.validate(DATA,Number(state.opp)):{valid:true};
 let r;try{r=CoachReportMath.build(DATA,state.own,state.opp);}catch(e){section.hidden=false;by('scout-content').textContent=e.message;return;}
 if(!checked.valid){r.players=[];r.warnings.unshift('Spielerkader nicht eindeutig zugeordnet: '+checked.message+' Bis zur Klärung keine gegnerischen Spielernamen im Report.');}
 section.hidden=false;
 by('scout-content').innerHTML=`<div class="scout-header"><div><h2>Scouting-Report · Version 3.5.2</h2><p>${esc(r.own.n)} gegen ${esc(r.opp.n)} · Saison 2026/27</p><p class="scout-small">Teamdaten: ${esc(r.stand)} · Gegnerkader: ${esc(DATA.teams?.[state.opp]?.kaderStand||'nicht dokumentiert')} · ${DATA.teams?.[state.opp]?.importQuelle?'lokal importiert':'veröffentlichter Stand'}</p></div><button type="button" id="scout-print" class="scout-print">Drucken / als PDF sichern</button></div>
 <div class="scout-kpis">${[['Punkte-Baseline (kein Tipp)',one(r.scoreOwn)+' : '+one(r.scoreOpp)],['Punkte je Spiel',one(r.ownM.ppg)+' : '+one(r.oppM.ppg)],['Zugelassene Punkte',one(r.ownM.allowed)+' : '+one(r.oppM.allowed)],['Offensivrating (geschätzt)',one(r.ownM.ortg)+' : '+one(r.oppM.ortg)]].map(([l,v])=>`<div><small>${esc(l)}</small><strong>${esc(v)}</strong></div>`).join('')}</div>
 <div class="scout-cols"><div><h3>Statistischer Matchup-Vergleich</h3><table class="scout-table"><thead><tr><th>Kennzahl</th><th>${esc(r.own.c||'Eigenes')}</th><th>${esc(r.opp.c||'Gegner')}</th></tr></thead><tbody>${[['Geschätzte Ballbesitze / Spiel','poss'],['Effektive Feldwurfquote (eFG%)','efg','pct'],['Zweierquote','twoPct','pct'],['Dreierquote','threePct','pct'],['Dreierversuche / Spiel','threeA'],['Offensivrebounds / Spiel','oreb'],['Ballverluste / Spiel','to'],['Assists / Spiel','ast']].map(([name,key,mode])=>`<tr><td>${name}</td><td>${mode==='pct'?percent(r.ownM[key]):one(r.ownM[key])}</td><td>${mode==='pct'?percent(r.oppM[key]):one(r.oppM[key])}</td></tr>`).join('')}</tbody></table></div><div><h3>Schlüsselspieler des Gegners</h3>${r.players.length?`<table class="scout-table"><thead><tr><th>Spieler</th><th>PTS</th><th>REB</th><th>AST</th></tr></thead><tbody>${r.players.map(p=>`<tr><td>${esc(p.name)} <small>(#${esc(p.nr)}, ${p.g} Sp.)</small></td><td>${one(p.points)}</td><td>${one(p.reb)}</td><td>${one(p.ast)}</td></tr>`).join('')}</tbody></table>`:'<p>Für den Gegner fehlen Spielerstatistiken.</p>'}</div></div>
 <h3>Taktische Prioritäten – datenbasierte Prüfaufträge</h3><ol class="scout-tactics">${r.priorities.slice(0,3).map(p=>`<li><strong>${esc(p.title)}</strong><span>${esc(p.why)}</span><p>${esc(p.action)}</p></li>`).join('')}</ol>
 <h3>Einordnung und Grenzen</h3><ul class="scout-caveats">${r.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><p class="scout-small">Quelle: lokal gespeicherte Team- und Spielerstatistiken in Coaches-Analyse. Taktikempfehlungen sind Hypothesen; gegen Video, Personal und aktuelle Spielsituation prüfen.</p>`;
 by('scout-print').onclick=()=>window.print();
}
const button=by('scout-create');button?.addEventListener('click',()=>{draw();by('scouting-report').scrollIntoView({behavior:'smooth',block:'start'});});
for(const id of ['own','opp','league'])by(id)?.addEventListener('change',()=>{if(!by('scouting-report').hidden)draw();});
window.addEventListener('coach-data-updated',draw);
})();
