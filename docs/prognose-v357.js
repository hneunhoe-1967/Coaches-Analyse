/* Coaches Analyse 3.5.7 – local, explicitly uncalibrated scenario estimates. */
(function(root){'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(x,d=1)=>Number.isFinite(x)?x.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}):'–';
function cdf(z){ // Abramowitz-Stegun approximation
 const sign=z<0?-1:1,x=Math.abs(z)/Math.SQRT2,t=1/(1+.3275911*x);
 const erf=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);
 return .5*(1+sign*erf);
}
function tableRow(data,id){for(const l of Object.values(data.ligen||{}))for(const row of l.table||[])if(String(row[0])===String(id))return row;return null;}
function calculate(data,ownId,oppId,sigma=16){
 const own=data.teams?.[ownId],opp=data.teams?.[oppId],a=data.teamstat?.[ownId],b=data.teamstat?.[oppId],ra=tableRow(data,ownId),rb=tableRow(data,oppId);
 if(!own||!opp||!a||!b||!ra||!rb||!a[0]||!b[0]||!ra[1]||!rb[1])return null;
 const scoredA=a[7]/a[0],scoredB=b[7]/b[0],allowA=ra[6]/ra[1],allowB=rb[6]/rb[1];
 const expA=(scoredA+allowB)/2,expB=(scoredB+allowA)/2,margin=expA-expB;
 const pLose=cdf((-margin)/sigma),pNarrow=cdf((10-margin)/sigma)-cdf((-margin)/sigma),pBig=1-cdf((10-margin)/sigma);
 const pWin=1-cdf((-margin)/sigma);
 const gPlayers=id=>Math.max(0,...(data.spieler?.[id]||[]).map(x=>Array.isArray(x)?Number(x[3])||0:0));
 const mismatches=[{name:own.n,teamGames:a[0],playerGames:gPlayers(ownId)},{name:opp.n,teamGames:b[0],playerGames:gPlayers(oppId)}].filter(x=>x.playerGames&&x.playerGames!==x.teamGames);
 const small=Math.min(a[0],b[0])<8;
 return {own:own.n,opp:opp.n,expA,expB,margin,pWin,pLose,pNarrow,pBig,scenarios:[{name:`${own.n} gewinnt mit mindestens 10 Punkten`,p:pBig},{name:`${own.n} gewinnt mit 1–9 Punkten`,p:pNarrow},{name:`${opp.n} gewinnt`,p:pLose}],mismatches,small,sigma,teamGames:[a[0],b[0]],stand:data.stand||'',valid:!mismatches.length&&!small};
}
function render(){
 const target=$('prog-v357');if(!target)return;
 try{
  const d=typeof DATA!=='undefined'?DATA:null,s=typeof state!=='undefined'?state:null;
  if(!d||!s?.own||!s?.opp){target.hidden=true;return;}
  const r=calculate(d,s.own,s.opp);
  if(!r){target.hidden=true;return;}
  const segments=r.scenarios.map((x,i)=>`<div class="prog-v357-line"><span>${esc(x.name)}</span><strong>${fmt(x.p*100,0)} %</strong><div class="prog-v357-track"><i class="prog-v357-fill prog-v357-${i}" style="width:${(x.p*100).toFixed(2)}%"></i></div></div>`).join('');
  target.innerHTML=`<div class="prog-v357-heading"><h2>Spielprognose · Version 3.5.7</h2><span>Basismodell · nicht kalibriert</span></div><p>Erwartete Punkte aus eigener Offensive und zugelassenen Punkten des Gegners.</p><div class="prog-v357-score"><div><small>${esc(r.own)}</small><b>${fmt(r.expA)}</b></div><span>:</span><div><small>${esc(r.opp)}</small><b>${fmt(r.expB)}</b></div></div><div class="prog-v357-summary">Rechnerische Siegchance ${esc(r.own)}: <strong>${fmt(r.pWin*100,0)} %</strong></div><div class="prog-v357-results">${segments}</div><div class="prog-v357-notice"><b>${r.mismatches.length||r.small?'Datenqualität: eingeschränkt':'Datenqualität: vorläufig'}</b><ul>${r.mismatches.map(x=>`<li>${esc(x.name)}: Teamstatistik ${x.teamGames} Spiele, Spielerstatistik bis ${x.playerGames} Einsätze – unterschiedlicher Datenstand, kein automatischer Importfehler.</li>`).join('')}${r.small?'<li>Kleine Stichprobe: weniger als acht Teamspiele.</li>':''}<li>Teampunkte und Spielerwerte können von unterschiedlichen Stichtagen stammen. Prognose ausschließlich auf Teamstatistik-Basis.</li><li>Normale Punktedifferenz mit angenommener Standardabweichung von ${fmt(r.sigma,0)} Punkten. Diese Annahme wurde noch nicht anhand historischer Ergebnisse überprüft.</li><li>Keine Quoten, keine belastbar kalibrierten Gewinnwahrscheinlichkeiten. Heimvorteil und Verletzungen nicht berücksichtigt.</li></ul></div><div class="prog-v357-eval"><h3>Prognosegüte prüfen</h3><p>Vergleiche das erwartete Ergebnis später mit dem tatsächlichen Endstand. Formel für einen künftigen Modelltest: Brier Score = (prognostizierte Siegchance − tatsächlicher Sieg als 0/1)². Je kleiner der Durchschnitt über viele Spiele, desto besser.</p></div>`;
  target.hidden=false;
 }catch(e){console.warn('Prognose 3.5.7',e);target.hidden=true;}
}
function init(){const analysis=$('analysis');if(!analysis)return;
 let box=$('prog-v357');if(!box){box=document.createElement('section');box.id='prog-v357';box.className='prog-v357';box.hidden=true;const report=$('scouting-report');analysis.insertAdjacentElement('afterend',box);}
 ['league','own','opp'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(render,0)));
 // Existing app emits no common event when its locally stored dataset changes; observe the existing report refresh.
 const scout=$('scout-content');if(scout)new MutationObserver(()=>render()).observe(scout,{childList:true,subtree:false});
 // Initial rendering also covers refresh after saved dataset is restored.
 render();
}
root.CoachPrognose357={calculate,cdf,render};
if(typeof module==='object'&&module.exports)module.exports={calculate,cdf};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
