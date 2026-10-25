/* Coaches Analyse 3.5.7: user-owned measurable coaching goals. Offline only. */
(function(root){'use strict';
const el=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}):'–';
const GOALS=[
 {id:'opp_oreb',name:'Offensivrebounds des Gegners begrenzen',unit:'Rebounds',lower:true,base:(a,b)=>b[9]/b[0]},
 {id:'opp_3m',name:'Erfolgreiche Dreier des Gegners begrenzen',unit:'Treffer',lower:true,base:(a,b)=>b[3]/b[0]},
 {id:'opp_2m',name:'Erfolgreiche Zweier des Gegners begrenzen',unit:'Treffer',lower:true,base:(a,b)=>b[1]/b[0]},
 {id:'own_reb',name:'Eigene Rebounds erhöhen',unit:'Rebounds',lower:false,base:(a,b)=>a[11]/a[0]},
 {id:'own_3pct',name:'Eigene Dreierquote verbessern',unit:'%',lower:false,base:(a,b)=>a[4]?100*a[3]/a[4]:NaN},
 {id:'own_to',name:'Eigene Ballverluste reduzieren',unit:'Ballverluste',lower:true,base:(a,b)=>a[15]/a[0]},
 {id:'own_2pct',name:'Eigene Zweierquote verbessern',unit:'%',lower:false,base:(a,b)=>a[2]?100*a[1]/a[2]:NaN},
 {id:'own_ast',name:'Eigene Assists erhöhen',unit:'Assists',lower:false,base:(a,b)=>a[8]/a[0]}
];
function recommend(a,b){if(!a||!b||!a[0]||!b[0])return [];let order=['opp_oreb','opp_3m','own_to'];if(b[9]/b[0]<9)order[0]='own_reb';if(b[3]/b[0]<5)order[1]='own_3pct';if(a[15]/a[0]<12)order[2]='opp_2m';return order.map(id=>{let g=GOALS.find(x=>x.id===id),v=g.base(a,b);return {id,target:Math.max(0,+(g.lower?v*.85:v*1.1).toFixed(1))};});}
function validate(items){if(!Array.isArray(items)||items.length!==3||new Set(items.map(x=>x.id)).size!==3)return false;return items.every(x=>GOALS.some(g=>g.id===x.id)&&Number.isFinite(+x.target)&&x.target!==''&& +x.target>=0 && +x.target<=1000 && (!x.id.endsWith('pct')||+x.target<=100));}
function storageKey(s,d){return 'coaches-v357-goals:'+String(d.saison||'2026/27')+':'+s.own+':'+s.opp;}
let currentKey='',draft=[];
function context(){try{const d=typeof DATA!=='undefined'?DATA:null,s=typeof state!=='undefined'?state:null,a=d?.teamstat?.[s?.own],b=d?.teamstat?.[s?.opp];if(!a||!b||!a[0]||!b[0]||!s.own||!s.opp)return null;return {d,s,a,b,key:storageKey(s,d)};}catch{return null;}}
function persisted(key){try{const val=JSON.parse(localStorage.getItem(key)||'null');return validate(val)?val:null;}catch{return null;}}
function render(){const box=el('coachziele-v357');if(!box)return;const c=context();if(!c){box.hidden=true;return;}box.hidden=false;
 if(c.key!==currentKey){currentKey=c.key;draft=persisted(c.key)||recommend(c.a,c.b);}
 const head=`<div class="cz357-head"><div><h2>Coach-Ziele · Version 3.5.7</h2><p>Drei messbare Schwerpunkte: ${safe(c.d.teams[c.s.own].n)} gegen ${safe(c.d.teams[c.s.opp].n)}</p></div><small>Die Zielwerte bestimmt der Coach.</small></div>`;
 const cards=draft.map((item,i)=>{const g=GOALS.find(x=>x.id===item.id),base=g.base(c.a,c.b);return `<div class="cz357-goal"><label>Ziel ${i+1}<select data-goal="${i}" aria-label="Ziel ${i+1} auswählen">${GOALS.map(o=>`<option value="${o.id}" ${o.id===g.id?'selected':''}>${safe(o.name)}</option>`).join('')}</select></label><div class="cz357-values"><span>Aktueller Durchschnitt: <strong>${fmt(base)} ${g.unit}</strong></span><label>Gewünschter Zielwert <input data-target="${i}" type="number" min="0" max="${g.unit==='%'?100:1000}" step="0.1" value="${item.target}" aria-label="Zielwert ${i+1}"></label></div><small>${g.lower?'Weniger als der bisherige Durchschnitt':'Mehr als der bisherige Durchschnitt'} · Bezugswert aus der gespeicherten Teamstatistik</small></div>`;}).join('');
 box.innerHTML=head+`<div class="cz357-cards">${cards}</div><div class="cz357-controls"><button type="button" id="cz357-suggest">Vorschläge neu berechnen</button><button type="button" id="cz357-save">Diese drei Ziele speichern</button><button type="button" id="cz359-reset">Ziele und Szenario zurücksetzen</button></div><p id="cz357-status" role="status">${persisted(c.key)?'Ziele für diese Paarung lokal gespeichert.':'Noch nicht gespeichert.'}</p><p class="cz357-foot">Ziele werden ausschließlich in diesem Browser und getrennt nach Paarung gespeichert. Sie verändern weder Teamstatistiken noch die Prognosewahrscheinlichkeiten. Vor dem nächsten Spiel Datenstand prüfen.</p>`;
 box.querySelectorAll('[data-goal]').forEach(node=>node.addEventListener('change',()=>{const i=+node.dataset.goal,g=GOALS.find(x=>x.id===node.value);if(draft.some((x,j)=>j!==i&&x.id===g.id)){el('cz357-status').textContent='Jedes Ziel nur einmal auswählen.';render();return;}const v=g.base(c.a,c.b);draft[i]={id:g.id,target:Math.max(0,+(g.lower?v*.85:v*1.1).toFixed(1))};render();}));
 box.querySelectorAll('[data-target]').forEach(node=>node.addEventListener('change',()=>{draft[+node.dataset.target].target=node.value;const msg=el('cz357-status');msg.textContent=validate(draft)?'Zielwerte geändert – bitte speichern.':'Ungültiger Zielwert (0–100 % bzw. maximal 1000).';}));
 el('cz357-suggest').addEventListener('click',()=>{draft=recommend(c.a,c.b);render();el('cz357-status').textContent='Vorschläge neu berechnet – bitte speichern.';});
 // COACHES_V359_RESET: Clear only the current matchup's goal storage and its derived scenario.
 el('cz359-reset').addEventListener('click',()=>{
  const wasSaved=!!persisted(c.key);
  if(wasSaved && !window.confirm('Die gespeicherten Coach-Ziele und das berechnete Szenario für diese Paarung zurücksetzen?'))return;
  try{localStorage.removeItem(c.key);}catch{el('cz357-status').textContent='Zurücksetzen nicht möglich: Browser-Speicher nicht verfügbar.';return;}
  draft=recommend(c.a,c.b).map(item=>({id:item.id,target:''}));
  render();
  el('cz357-status').textContent='Coach-Ziele und Szenario zurückgesetzt. Bitte drei neue Zielwerte festlegen und speichern.';
  if(root.CoachSzenario358 && typeof root.CoachSzenario358.render==='function')root.CoachSzenario358.render();
 });
 el('cz357-save').addEventListener('click',()=>{if(!validate(draft)){el('cz357-status').textContent='Bitte drei unterschiedliche Ziele mit gültigen Werten festlegen.';return;}try{localStorage.setItem(c.key,JSON.stringify(draft.map(x=>({id:x.id,target:+x.target}))));el('cz357-status').textContent='Drei Ziele für diese Paarung gespeichert.';}catch{el('cz357-status').textContent='Speichern im Browser nicht möglich.';}});
}
function init(){const analysis=el('analysis');if(!analysis)return;const box=document.createElement('section');box.id='coachziele-v357';box.className='coachziele-v357';analysis.prepend(box);['league','own','opp'].forEach(id=>el(id)?.addEventListener('change',()=>setTimeout(render,10)));render();}
root.CoachGoals357={GOALS,recommend,validate};if(typeof module==='object'&&module.exports)module.exports={GOALS,recommend,validate};if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
