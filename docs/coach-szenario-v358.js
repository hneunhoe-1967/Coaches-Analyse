/* Coaches-Analyse 3.5.8: explicitly hypothetical Coach-goal scenario. No dataset writes. */
(function(root){'use strict';
const $=id=>document.getElementById(id);
const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}):'–';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const units={opp_oreb:'Rebounds',opp_3m:'Dreier',opp_2m:'Zweier',own_reb:'Rebounds',own_3pct:'%',own_to:'Ballverluste',own_2pct:'%',own_ast:'Assists'};
function goalBase(id,a,b){if(!a||!b||!a[0]||!b[0])return NaN;
 switch(id){case 'opp_oreb':return b[9]/b[0];case 'opp_3m':return b[3]/b[0];case 'opp_2m':return b[1]/b[0];case 'own_reb':return a[11]/a[0];case 'own_3pct':return a[4]?100*a[3]/a[4]:NaN;case 'own_to':return a[15]/a[0];case 'own_2pct':return a[2]?100*a[1]/a[2]:NaN;case 'own_ast':return a[8]/a[0];default:return NaN;}}
function model(base,goals,a,b){
 if(!base||!Array.isArray(goals)||goals.length!==3||new Set(goals.map(x=>x.id)).size!==3)throw Error('Drei unterschiedliche Ziele erforderlich.');
 const list=goals.map(g=>{
  const original=goalBase(g.id,a,b),target=Number(g.target);
  if(!Number.isFinite(original)||!Number.isFinite(target)||target<0||target>1000||(g.id.endsWith('pct')&&target>100))throw Error('Zielwert oder Statistik ungültig.');
  let points=0,side=g.id.startsWith('opp_')?'defense':'offense',diff=0;
  if(g.id==='opp_oreb'){diff=Math.max(0,original-target);points=diff*.65;}
  if(g.id==='opp_3m'){diff=Math.max(0,original-target);points=diff*3*.65;}
  if(g.id==='opp_2m'){diff=Math.max(0,original-target);points=diff*2*.65;}
  if(g.id==='own_reb'){diff=Math.max(0,target-original);points=diff*.35;}
  if(g.id==='own_to'){diff=Math.max(0,original-target);points=diff*.8;}
  if(g.id==='own_3pct'){diff=Math.max(0,target-original);points=(a[4]/a[0])*(diff/100)*3*.65;}
  if(g.id==='own_2pct'){diff=Math.max(0,target-original);points=(a[2]/a[0])*(diff/100)*2*.65;}
  if(g.id==='own_ast'){diff=Math.max(0,target-original);points=diff*.3;}
  return {id:g.id,original,target,diff,points:Math.min(points,10),side,unit:units[g.id]};
 });
 // Only the strongest offense and strongest defense lever count: reduces double counting.
 const offense=Math.max(0,...list.filter(x=>x.side==='offense').map(x=>x.points));
 const defense=Math.max(0,...list.filter(x=>x.side==='defense').map(x=>x.points));
 const expA=base.expA+offense,expB=Math.max(0,base.expB-defense),margin=expA-expB;
 const cdf=root.CoachPrognose357?.cdf;
 if(typeof cdf!=='function')throw Error('Basismodell nicht verfügbar.');
 const win=1-cdf((-margin)/base.sigma),narrow=cdf((10-margin)/base.sigma)-cdf((-margin)/base.sigma),big=1-cdf((10-margin)/base.sigma);
 return {list,offense,defense,expA,expB,margin,pWin:win,pNarrow:narrow,pBig:big,pLose:1-win,deltaWin:win-base.pWin};
}
function context(){try{const d=typeof DATA!=='undefined'?DATA:null,s=typeof state!=='undefined'?state:null;if(!d||!s?.own||!s?.opp)return null;const a=d.teamstat?.[s.own],b=d.teamstat?.[s.opp],base=root.CoachPrognose357?.calculate(d,s.own,s.opp);if(!a||!b||!base)return null;return {a,b,base,d,s,key:String(s.own)+':'+String(s.opp)};}catch{return null;}}
let prevKey='';
function render(){const node=$('coach-szenario-v358'),ctx=context();if(!node)return;if(!ctx){node.hidden=true;return;}node.hidden=false;
 if(prevKey!==ctx.key){prevKey=ctx.key;node.dataset.calculated='';}
 const b=ctx.base;
 node.innerHTML=`<h2>Coach-Szenario · Version 3.5.8</h2><p class="cs358-intro"><b>1. Mannschaften wählen → 2. Statistiken lesen → 3. Ziele setzen → 4. mögliche Ergebniswirkung berechnen.</b></p><p>Ausgangsprognose: <strong>${esc(b.own)} ${fmt(b.expA)} : ${fmt(b.expB)} ${esc(b.opp)}</strong> · Rechenchance ${fmt(b.pWin*100,0)} %.</p><p>Speichere oben deine drei Coach-Ziele und berechne anschließend das Szenario.</p><button type="button" id="cs358-go">Aus meinen drei Zielen Szenario berechnen</button><div id="cs358-result" role="status" aria-live="polite"></div><p class="cs358-note">Was-wäre-wenn-Modell, <strong>keine belastbare Vorhersage</strong>: angenommene Punktwirkung statt aus echten Spielen geschätzter Effekte. Pro Angriffs-/Verteidigungsseite wird nur der stärkste Zielhebel berücksichtigt, um Doppelzählungen zu begrenzen. Heimvorteil, Gegneranpassungen und Verletzungen fehlen. Ziele müssen tatsächlich erreicht werden; sie verändern nicht automatisch die Ausgangsprognose.</p>${b.mismatches.length?`<p class="cs358-caution">Unterschiedliche Datenstände: ${b.mismatches.map(x=>esc(x.name)+': '+x.teamGames+' Teamspiele / '+x.playerGames+' Spielereinsätze').join('; ')}.</p>`:''}`;
 $('cs358-go').addEventListener('click',()=>{
  const result=$('cs358-result');try{
   const saved=root.CoachGoals357?.validate;const key='coaches-v357-goals:'+String(ctx.d.saison||'2026/27')+':'+ctx.s.own+':'+ctx.s.opp;
   const goals=JSON.parse(localStorage.getItem(key)||'null');
   if(!saved?.(goals))throw Error('Bitte zuerst drei gültige Coach-Ziele speichern.');
   const m=model(b,goals,ctx.a,ctx.b);
   const sum=(label,pts)=>`<div><span>${label}</span><strong>${fmt(pts)} Punkte</strong></div>`;
   result.innerHTML=`<div class="cs358-scores"><div><small>Ohne Zielerreichung</small><strong>${fmt(b.expA)} : ${fmt(b.expB)}</strong><span>${fmt(b.pWin*100,0)} % Siegchance</span></div><div><small>Falls Ziele erreicht werden</small><strong>${fmt(m.expA)} : ${fmt(m.expB)}</strong><span>${fmt(m.pWin*100,0)} % Modell-Siegchance</span></div></div><h3>Hypothetische Punktwirkung</h3><div class="cs358-lines">${sum('Eigene Offensive',m.offense)}${sum('Gegnerische Punkte vermindern',m.defense)}</div><h3>Drei Ergebnisszenarien nach Zielerreichung</h3><div class="cs358-lines"><div><span>${esc(b.own)} gewinnt mit mindestens 10 Punkten</span><strong>${fmt(m.pBig*100,0)} %</strong></div><div><span>${esc(b.own)} gewinnt mit 1–9 Punkten</span><strong>${fmt(m.pNarrow*100,0)} %</strong></div><div><span>${esc(b.opp)} gewinnt</span><strong>${fmt(m.pLose*100,0)} %</strong></div></div><p><b>Modelländerung der Siegchance: ${m.deltaWin>=0?'+':''}${fmt(m.deltaWin*100,0)} Prozentpunkte.</b> Dies ist eine Sensitivitätsrechnung und keine empirisch belegte Erfolgswirkung.</p><details><summary>Einzelziele und Modellannahmen prüfen</summary><ul>${m.list.map(x=>`<li>${esc(root.CoachGoals357.GOALS.find(g=>g.id===x.id)?.name||x.id)}: Durchschnitt ${fmt(x.original)} → Ziel ${fmt(x.target)} ${x.unit}; isolierter Effekt bis ${fmt(x.points)} Punkte (nur stärkster Hebel je Seite zählt).</li>`).join('')}</ul><p>Rechenannahmen u. a.: vermiedener gegnerischer Dreier 1,95 Punkte, verhinderter Offensivrebound 0,65 Punkte, vermiedener eigener Ballverlust 0,8 Punkte; alle Effekte sind heuristisch und nicht kalibriert.</p></details>`;
  }catch(e){result.textContent=e.message;}
 });
}
function init(){const goals=$('coachziele-v357');if(!goals)return;const section=document.createElement('section');section.id='coach-szenario-v358';section.className='coach-szenario-v358';goals.insertAdjacentElement('afterend',section);
 ['league','own','opp'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(render,20)));
 render();}
root.CoachSzenario358={model,goalBase,render};if(typeof module==='object'&&module.exports)module.exports={model,goalBase};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
