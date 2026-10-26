/* Non-destructive presentation layer 3.4. Existing IDs, imported data and computations stay untouched. */
(function(){'use strict';
 const q=id=>document.getElementById(id);
 const txt=v=>String(v??'');
 function fold(node,key,title,open=false){
   if(!node||node.parentElement?.closest('details[data-h34]')) return null;
   const d=document.createElement('details');d.className='h34-fold';d.dataset.h34=key;d.open=open;
   const s=document.createElement('summary');s.textContent=title;
   const c=document.createElement('div');c.className='h34-fold-content';
   node.parentNode.insertBefore(d,node);d.append(s,c);c.appendChild(node);return d;
 }
 function addHero(){
   const shell=q('app-shell');if(!shell||q('h34-hero'))return;
   const el=document.createElement('div');el.innerHTML=`<section id="h34-hero" class="h34-hero" aria-label="Henriks Analyse-App für Coaches"><div class="h34-copy"><div class="h34-kicker">Basketball · Daten · Scouting</div><h1>Henriks <span>Analyse-App</span> für Coaches</h1><p>Aktuell: Gegner-Scouting für die BARMER 2. Basketball Bundesliga</p><p class="h34-version">Version 3.4 · Alle Berechnungen basieren auf dem verfügbaren Datenstand</p></div><div class="h34-art" role="img" aria-label="Basketball und stilisierte Statistikgrafik"></div></section>`;
   shell.insertBefore(el.firstElementChild,shell.firstChild);
   const nav=document.createElement('nav');nav.className='h34-nav';nav.setAttribute('aria-label','Schnellnavigation');nav.innerHTML='<a href="#h34-hero">Start</a><a href="#h34-pick">Spiel auswählen</a><a href="#analysis">Matchup</a><a href="#h34-coach-summary">Coach Summary</a><a href="#h34-report">Scouting-Report</a><a href="#h34-detail">Statistiken</a><a href="#h34-manage">Datenverwaltung</a>';
   shell.insertBefore(nav,el.nextSibling);
   const h=q('admin-title');if(h)h.textContent='Datenverwaltung';
   const brand=document.querySelector('.brand h1');if(brand)brand.textContent='Spiel auswählen';
   const sub=document.querySelector('.brand >p:not(.proto):not(.sync)');if(sub)sub.textContent='Saison, Liga, eigenes Team und Gegner auswählen';
 }
 function setupFolds(){
   const shell=q('app-shell');
   const strip=document.querySelector('#app-shell > .wrap'); const admin=q('data-admin');
   if(strip&&admin&&!q('h34-manage')){
     const d=document.createElement('details');d.id='h34-manage';d.dataset.h34='manage';d.className='h34-fold';
     const sum=document.createElement('summary');sum.textContent='Datenverwaltung · Import · Mannschaftsübersicht';
     const body=document.createElement('div');body.className='h34-fold-content';
     strip.parentNode.insertBefore(d,strip);d.append(sum,body);body.append(strip,admin);
   }
   const hdr=document.querySelector('header.top');if(hdr)hdr.id='h34-pick';
   const overview=q('overview');if(overview&&!q('h34-overview')){
     const f=fold(overview,'overview','Nächste Spiele und Tabelle',false);if(f){f.id='h34-overview';const sync=()=>{f.hidden=overview.hidden};new MutationObserver(sync).observe(overview,{attributes:true,attributeFilter:['hidden']});sync()}
   }
   const grid=q('analysis-grid');if(grid&&!q('h34-detail')){const d=fold(grid,'details','Durchschnittswerte und Top 5 des Gegners',false);if(d)d.id='h34-detail'}
   const report=q('scouting-report');if(report&&!q('h34-report')){const d=fold(report,'report','Scouting-Report · Datenqualität · Spielerrollen · Gameplan',true);if(d){d.id='h34-report';let last=false;const sync=()=>{const active=!report.hidden;d.hidden=!active;if(active&&!last)d.open=true;last=active};new MutationObserver(sync).observe(report,{attributes:true,attributeFilter:['hidden']});sync()}}
   const analysis=q('analysis');if(analysis&&!q('h34-coach-summary')){const el=document.createElement('section');el.id='h34-coach-summary';el.className='h34-summary';el.hidden=true;analysis.insertBefore(el,q('matchup'));}
 }
 const n=v=>Number.isFinite(Number(v))?Number(v):NaN;
 const fmt=v=>Number.isFinite(v)?new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(v):'–';
 function coachSummary(){
  const out=q('h34-coach-summary');if(!out)return;
  try{
   if(typeof state==='undefined'||typeof D==='undefined'||!state.own||!state.opp||!D[state.own]||!D[state.opp]){out.hidden=true;return}
   let own=D[state.own],opp=D[state.opp],on=TEAMS[state.own]?.n||'Eigenes Team',pn=TEAMS[state.opp]?.n||'Gegner';
   const items=[];
   if(n(own.fgp)>n(opp.fgp)) items.push('Feldwurfquote: '+fmt(own.fgp*100)+' % gegenüber '+fmt(opp.fgp*100)+' %.');
   if(n(own.to)<n(opp.to))items.push('Weniger Ballverluste: '+fmt(own.to)+' statt '+fmt(opp.to)+' pro Spiel.');
   if(!items.length)items.push('Keine klare statistische Überlegenheit in diesen ausgewählten Kennzahlen.');
   const risk=Number.isFinite(n(opp.or))?'Offensivrebounds des Gegners: '+fmt(opp.or)+' pro Spiel.':'Mannschaftskennzahlen und Form prüfen.';
   const plan=(n(opp.or)>n(own.or)?'Defensivrebounds absichern. ':'')+(n(opp.p3a)>n(own.p3a)?'Dreierlinie und Closeouts koordinieren. ':'')+'Spieltempo und Ballverluste im Video überprüfen.';
   const make=(label,value)=>{const a=document.createElement('article'),strong=document.createElement('strong'),p=document.createElement('p');strong.textContent=label;p.textContent=value;a.append(strong,p);return a};
   out.replaceChildren();let h=document.createElement('h3');h.textContent='Coach Summary · '+on+' gegen '+pn;let g=document.createElement('div');g.className='h34-sumgrid';g.append(make('Eigener Vorteil',items.join(' ')),make('Größte statistische Gefahr',risk),make('Fokus für das Spiel',plan));let small=document.createElement('p');small.className='h34-note';small.textContent='Datengestützte Prüfaufträge, keine Ergebnisprognose. Kleine Stichprobe und Aktualität der Quellen berücksichtigen.';out.append(h,g,small);out.hidden=false;
  }catch(e){out.hidden=true;console.warn('Coach Summary konnte nicht berechnet werden:',e)}
 }
 function roleLabels(){const cont=q('scout-content');if(!cont)return;cont.querySelectorAll('td').forEach(td=>{if(td.dataset.h34role)return;const value=td.textContent.trim();if(!/^(Scorer|Rebounder|Spielmacher|Dreierschütze|Defensiv-Aktivität|Rollenspieler)(,\s*(Scorer|Rebounder|Spielmacher|Dreierschütze|Defensiv-Aktivität|Rollenspieler))*$/.test(value))return;td.dataset.h34role='1';td.textContent='';value.split(',').forEach(role=>{let tag=document.createElement('span');tag.className='h34-role';tag.textContent=role.trim();td.append(tag)})})}
 function init(){if(!q('app-shell'))return;addHero();setupFolds();coachSummary();roleLabels();
  const m=q('matchup');if(m)new MutationObserver(coachSummary).observe(m,{childList:true,subtree:true});
  const content=q('scout-content');if(content)new MutationObserver(roleLabels).observe(content,{childList:true,subtree:false});
  ['league','own','opp'].forEach(id=>q(id)?.addEventListener('change',()=>setTimeout(coachSummary,0)));
  const nav=document.querySelector('.h34-nav');nav?.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const target=q(a.getAttribute('href').slice(1));if(!target)return;const d=target.closest('details[data-h34]');if(d)d.open=true;});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
