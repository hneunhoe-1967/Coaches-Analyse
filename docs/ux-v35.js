/* UX layer 3.5 - tabs, arena dark mode, compact selection, stronger coach summary */
(function(){'use strict';
const q=id=>document.getElementById(id);
const qs=(sel,root=document)=>root.querySelector(sel);
const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const nf1=new Intl.NumberFormat('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1});
const clampNum=v=>Number.isFinite(Number(v))?Number(v):NaN;
const fmt=v=>Number.isFinite(v)?nf1.format(v):'–';
const pct=v=>Number.isFinite(v)?nf1.format(v*100)+' %':'–';
const st=()=> typeof state!=='undefined'?state:null;
const teams=()=> typeof TEAMS!=='undefined'?TEAMS:{};
const data=()=> typeof D!=='undefined'?D:{};
const addClass=(el,c)=>el&&el.classList.add(c);
const remClass=(el,c)=>el&&el.classList.remove(c);

function ensureHero(){
  const shell=q('app-shell'); if(!shell) return;
  const h34=q('h34-hero');
  if(h34){
    h34.classList.add('h35-hero');
    const ver=qs('.h34-version',h34); if(ver) ver.textContent='Version 3.5 · Arena Dark Mode · Neue Navigation · kompaktere Coach-Ansicht';
    return h34;
  }
  if(q('h35-hero')) return q('h35-hero');
  const wrap=document.createElement('section');
  wrap.id='h35-hero'; wrap.className='h35-hero'; wrap.setAttribute('aria-label','Henrik’s Analyse-App für Coaches');
  wrap.innerHTML=`<div class="h35-copy"><div class="h35-kicker">Basketball · Daten · Scouting</div><h1>Henrik’s <span>Analyse-App</span> für Coaches</h1><p>Aktuell: Gegner-Scouting für die BARMER 2. Basketball Bundesliga</p><p class="h35-version">Version 3.5 · Arena Dark Mode · Neue Navigation · kompaktere Coach-Ansicht</p></div><div class="h35-art" role="img" aria-label="Basketball, Taktik und Statistiken"></div>`;
  shell.insertBefore(wrap,shell.firstChild);
  return wrap;
}

function compactHeader(){
  document.body.classList.add('h35-active');
  const brand=qs('.brand h1'); if(brand) brand.textContent='Spiel auswählen';
  const sub=qs('.brand > p:not(.proto):not(.sync)'); if(sub) sub.textContent='Saison, Liga, eigenes Team und Gegner auswählen';
}

function splitAnalysisGrid(){
  const analysis=q('analysis'); const grid=q('analysis-grid');
  if(!analysis||!grid) return;
  if(grid.parentElement!==analysis) return;
  let wrap=q('h35-detail-wrap');
  if(wrap) return;
  wrap=document.createElement('section');
  wrap.id='h35-detail-wrap';
  wrap.setAttribute('aria-label','Weitere Statistiken');
  analysis.parentNode.insertBefore(wrap,analysis.nextSibling);
  wrap.appendChild(grid);
}

function detachReportSections(){
  const analysis=q('analysis');
  if(!analysis || !analysis.parentNode) return;
  // In v3.4 these sections were wrapped inside #analysis. Move the wrappers
  // outside it so switching away from the Coach tab cannot hide the Report.
  const details=q('h34-detail') || q('h35-detail-wrap');
  const report=q('h34-report') || q('scouting-report');
  let anchor=analysis;
  [details,report].forEach(el=>{
    if(el && analysis.contains(el)){
      analysis.parentNode.insertBefore(el,anchor.nextSibling);
      anchor=el;
    }
  });
  if(!q('h35-report-actions')){
    const actions=document.createElement('section');
    actions.id='h35-report-actions'; actions.className='h35-report-actions';
    actions.innerHTML='<div><strong>Scouting & Spielerstatistiken</strong><p>Top 5 des Gegners in den Statistik-Kategorien und individueller Scouting-Report.</p></div><button type="button" id="h35-generate-report">Scouting-Report erstellen</button>';
    analysis.parentNode.insertBefore(actions,analysis.nextSibling);
    actions.querySelector('button').addEventListener('click',()=>{
      const original=q('scout-create');
      if(original) original.click();
      const pane=q('h34-report');if(pane) pane.open=true;
    });
  }
}
function prepareLegacyCompat(){
  compactHeader();
  splitAnalysisGrid();
  detachReportSections();
  const summary=q('h34-coach-summary'); if(summary) summary.remove();
}

function manageGroupNodes(){
  const arr=[];
  const legacy=q('h34-manage');
  if(legacy){ arr.push(legacy); return arr; }
  const strip=qs('#app-shell > .wrap');
  const admin=q('data-admin');
  if(strip) arr.push(strip);
  if(admin) arr.push(admin);
  return arr;
}
function detailGroupNodes(){
  return [q('h35-report-actions'), q('h34-detail')||q('h35-detail-wrap'), q('h34-report')||q('scouting-report'), q('prog-v357')].filter(Boolean);
}
function coachGroupNodes(){
  return [q('analysis')].filter(Boolean);
}
function overviewGroupNodes(){
  return [q('h34-overview')||q('overview')].filter(Boolean);
}
function pickGroupNodes(){
  return [qs('header.top'), q('start')].filter(Boolean);
}

function hideNode(el,hide){ if(!el) return; el.classList.toggle('h35-tab-hide',!!hide); }

function ensureTabs(){
  const shell=q('app-shell'); if(!shell) return;
  if(q('h35-tabs')) return;
  const nav=document.createElement('nav'); nav.id='h35-tabs'; nav.className='h35-tabs'; nav.setAttribute('aria-label','Hauptnavigation');
  const tabs=[
    ['spiel','Spiel','Auswahl'],
    ['uebersicht','Übersicht','Spiele & Tabelle'],
    ['coach','Coach','Summary & Matchup'],
    ['report','Report','Scouting & Stats'],
    ['daten','Daten','Import & Verwaltung']
  ];
  nav.innerHTML=tabs.map(([id,label,sub])=>`<button type="button" class="h35-tab" data-tab="${id}">${label}<span>${sub}</span></button>`).join('');
  const hero=q('h34-hero')||q('h35-hero');
  if(hero&&hero.parentNode) hero.parentNode.insertBefore(nav,hero.nextSibling); else shell.insertBefore(nav,shell.firstChild);
  nav.addEventListener('click',e=>{const b=e.target.closest('.h35-tab'); if(!b) return; showTab(b.dataset.tab,true);});
}

function showTab(tab,save){
  const map={
    spiel:pickGroupNodes(),
    uebersicht:overviewGroupNodes(),
    coach:coachGroupNodes(),
    report:detailGroupNodes(),
    daten:manageGroupNodes()
  };
  const all=[...new Set(Object.values(map).flat())];
  all.forEach(el=>hideNode(el,true));
  (map[tab]||[]).forEach(el=>{hideNode(el,false); if(el.matches('details')) el.open=true;});
  qa('.h35-tab').forEach(b=>b.classList.toggle('is-active',b.dataset.tab===tab));
  document.body.dataset.h35Tab=tab;
  if(save) try{localStorage.setItem('coachApp35Tab',tab);}catch(_e){}
}

function chooseDefaultTab(){
  try{const saved=localStorage.getItem('coachApp35Tab'); if(saved) return saved;}catch(_e){}
  const s=st();
  if(s?.opp) return 'coach';
  if(s?.own) return 'uebersicht';
  return 'spiel';
}

function summaryTarget(){
  let el=q('h35-summary');
  const analysis=q('analysis');
  if(!analysis) return null;
  if(!el){
    el=document.createElement('section'); el.id='h35-summary'; el.className='h35-summary'; el.hidden=true;
    const matchup=q('matchup');
    analysis.insertBefore(el,matchup||analysis.firstChild);
  }
  return el;
}

function keyRisk(own,opp){
  const risks=[];
  if(clampNum(opp.or) > clampNum(own.or)+1) risks.push(`Offensivrebounds des Gegners: ${fmt(opp.or)} pro Spiel.`);
  if(clampNum(opp.p3a) > clampNum(own.p3a)+1) risks.push(`Viele Dreier des Gegners: ${fmt(opp.p3a)} Versuche pro Spiel.`);
  if(clampNum(opp.a) > clampNum(own.a)+1) risks.push(`Ballbewegung des Gegners: ${fmt(opp.a)} Assists pro Spiel.`);
  if(clampNum(opp.p) > clampNum(own.pa)+1) risks.push(`Scoring-Potenzial: ${fmt(opp.p)} Punkte pro Spiel.`);
  return risks[0] || 'Keine einzelne Extremgefahr – Matchup im Detail prüfen.';
}
function ownEdge(own,opp){
  const edges=[];
  if(clampNum(own.to) < clampNum(opp.to)-.5) edges.push(`Weniger Ballverluste: ${fmt(own.to)} statt ${fmt(opp.to)} pro Spiel.`);
  if(clampNum(own.p2p) > clampNum(opp.p2p)+.015) edges.push(`Bessere Zweierquote: ${pct(own.p2p)} zu ${pct(opp.p2p)}.`);
  if(clampNum(own.fgp) > clampNum(opp.fgp)+.015) edges.push(`Bessere Feldwurfquote: ${pct(own.fgp)} zu ${pct(opp.fgp)}.`);
  if(clampNum(own.pa) < clampNum(opp.pa)-1) edges.push(`Defensiver Vorteil: ${fmt(own.pa)} zugelassene Punkte statt ${fmt(opp.pa)}.`);
  return edges[0] || 'Kein klarer statistischer Vorteil – Details im Video und in den Rollenbildern prüfen.';
}
function focusList(own,opp){
  const out=[];
  if(clampNum(opp.or) >= clampNum(own.or)) out.push('Defensivrebound absichern und zweite Chancen minimieren.');
  if(clampNum(opp.p3a) >= clampNum(own.p3a)) out.push('Closeouts früh vorbereiten und Kommunikation an der Dreierlinie schärfen.');
  if(clampNum(own.to) >= 15 || clampNum(opp.st) >= 7) out.push('Erste Pässe und Ballsicherheit priorisieren.');
  if(clampNum(opp.a) >= 14) out.push('Passwege antizipieren und Ballverteilung situativ stören.');
  if(!out.length) out.push('Matchup ausgewogen – Fokus auf Spielrhythmus und personelle Details legen.');
  return out.slice(0,3);
}

function renderSummary(){
  const out=summaryTarget(); if(!out) return;
  try{
    const s=st(); const T=teams(); const Dd=data();
    if(!s||!s.own||!s.opp||!Dd[s.own]||!Dd[s.opp]||!T[s.own]||!T[s.opp]){ out.hidden=true; return; }
    const own=Dd[s.own], opp=Dd[s.opp], ownName=T[s.own].n, oppName=T[s.opp].n;
    const focus=focusList(own,opp);
    out.innerHTML=`
      <div class="h35-summary-head">
        <div><h3>Coach Summary</h3><p>${ownName} gegen ${oppName}</p></div>
        <p>Kompakte Soforteinordnung für den nächsten Blick auf das Matchup.</p>
      </div>
      <div class="h35-metrics">
        <article><strong>Punkte-Baseline</strong><span>–</span><small>Orientierung statt Prognose</small></article>
        <article><strong>Ballbesitze</strong><span>${fmt(((own.fga||0)+(opp.fga||0))/2)}</span><small>vereinfachte Tempo-Nähe</small></article>
        <article><strong>Rebounds</strong><span>${fmt(own.tr)} : ${fmt(opp.tr)}</span><small>Team gesamt pro Spiel</small></article>
        <article><strong>Ballverluste</strong><span>${fmt(own.to)} : ${fmt(opp.to)}</span><small>eigene / gegnerische TO pro Spiel</small></article>
      </div>
      <div class="h35-summary-grid">
        <article class="own"><h4>Eigener Hebel</h4><p>${ownEdge(own,opp)}</p></article>
        <article class="risk"><h4>Größte Gefahr</h4><p>${keyRisk(own,opp)}</p></article>
        <article class="focus"><h4>Fokus fürs Coaching</h4><p>Diese drei Punkte zuerst prüfen:</p><ul class="h35-focus-list">${focus.map(item=>`<li>${item}</li>`).join('')}</ul></article>
      </div>
      <p class="h35-summary-note">Datengestützte Kurzbewertung auf Basis des verfügbaren Datenstands. Kleine Stichprobe und Aktualität der Quellen berücksichtigen.</p>`;
    // replace invalid points-baseline placeholder with a compact combined number once DOM exists
    const metricCards=qa('.h35-metrics article',out);
    if(metricCards[0]){const base=((own.p||0)+(opp.pa||0))/2; qs('span',metricCards[0]).textContent=fmt(base);}
    out.hidden=false;
  }catch(err){ console.warn('v3.5 summary failed',err); out.hidden=true; }
}

function sectionHeadings(){
  const analysis=q('analysis');
  if(analysis){ const h=qs('h2',analysis); if(h) h.textContent='Gegneranalyse'; }
}

function attachReactions(){
  ['league','own','opp'].forEach(id=>q(id)?.addEventListener('change',()=>{
    setTimeout(()=>{ renderSummary(); if(id==='opp'&&st()?.opp) showTab('coach',true); else if(id==='own'&&st()?.own) showTab('uebersicht',true); },20);
  }));
  const analysis=q('analysis'); if(analysis) new MutationObserver(()=>setTimeout(renderSummary,0)).observe(analysis,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  const report=q('scouting-report'); if(report) new MutationObserver(()=>{ if(!report.hidden && document.body.dataset.h35Tab==='coach') showTab('report',false); }).observe(report,{attributes:true,attributeFilter:['hidden']});
}

function init(){
  if(!q('app-shell')) return;
  ensureHero();
  prepareLegacyCompat();
  sectionHeadings();
  ensureTabs();
  renderSummary();
  attachReactions();
  showTab(chooseDefaultTab(),false);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
