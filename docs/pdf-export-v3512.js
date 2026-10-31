/* Coaches-Analyse 3.5.12: scoped, offline, print-to-PDF export. No dataset writes. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const clean = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function pair() {
    try {
      if (typeof state === 'undefined' || !state.own || !state.opp || typeof DATA === 'undefined') return null;
      const own=DATA.teams?.[state.own]?.n, opp=DATA.teams?.[state.opp]?.n;
      if (!own || !opp) return null;
      return {own,opp,season:DATA.saison||'2026/27',stand:DATA.stand||'unbekannt'};
    } catch (_) { return null; }
  }
  function printableHtml(kind, matchup, parts) {
    const name = kind === 'vergleich' ? 'Vergleichsstatistik' : 'Spielprognose & Scouting-Report';
    const css = `
      @page { size: A4; margin: 13mm; }
      * { box-sizing: border-box; } body { margin:0; padding:20px; font:13px/1.4 Arial,Helvetica,sans-serif; color:#172537; background:#fff; }
      .toolbar { display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;background:#e9f1f9;border-radius:9px;margin-bottom:20px; }
      button { border:0;background:#164b81;color:white;padding:11px 16px;border-radius:6px;font-weight:bold;cursor:pointer; }
      h1 { color:#112f50;font-size:24px;margin:0 0 4px; } h2 { font-size:18px; margin:18px 0 8px; color:#123c65; }
      h3 { font-size:15px;margin:15px 0 7px;color:#17436b; } p { margin:5px 0 9px; }
      .meta { color:#475b70;margin-bottom:18px; } .section { margin:15px 0 21px; }
      .section,article,.leader,.scout-kpis>div,.scout-tactics li,.prog-v357-notice { break-inside:avoid-page; }
      table { width:100%;border-collapse:collapse;margin:10px 0; } th,td { border:1px solid #cad6e2;padding:6px;text-align:left;vertical-align:top; }
      th { background:#e5edf6; } ul,ol { padding-left:23px; } li { margin:3px 0; }
      .leader-grid,.scout-kpis,.scout-cols,.scout-tactics { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px; }
      .leader,.scout-kpis>div,.prog-v357-score,.prog-v357-notice {border:1px solid #d0dce8;padding:10px;border-radius:7px;}
      .leader ol {padding-left:22px;} .leader li {padding:4px 0;border-bottom:1px solid #e4eaf0;}
      .lr {display:inline-block;min-width:18px;} .lw {display:inline-block;min-width:145px;} .ln {font-weight:bold;display:block;} .lm {font-size:10px;color:#526579;} .lv {float:right;font-weight:bold;}
      .cmp-row,.compare-row,.prog-v357-line {padding:7px;border-bottom:1px solid #dce4eb;}
      .prog-v357-heading {display:flex;align-items:center;justify-content:space-between;gap:12px;}
      .prog-v357-score {display:flex;align-items:center;justify-content:center;gap:24px;margin:14px 0;font-size:20px;}
      .prog-v357-score div {display:flex;flex-direction:column;text-align:center;} .prog-v357-score small {font-size:12px;}
      .prog-v357-fill {display:block;height:6px;background:#3876ac;} .prog-v357-track {height:6px;background:#e4eaf1;margin:5px 0;}
      .scout-header {display:flex;justify-content:space-between;} .scout-print, .scout-launch, button:not(.pdf-preview-print),a.src {display:none!important;}
      .scout-tactics {grid-template-columns:repeat(3,minmax(0,1fr));} .scout-tactics li {padding:9px;border:1px solid #dae3ed;}
      .scout-tactics li span {display:block;} .scout-small,.foot,.scout-caveats {font-size:11px;color:#526579;}
      details {display:block!important;} details>summary {font-weight:bold;margin:8px 0;} .scouting-report {display:block!important;}
      footer {margin-top:25px;border-top:1px solid #bcc9d7;padding-top:9px;color:#637383;font-size:10px;}
      @media print { body {padding:0;} .toolbar {display:none!important;} a {color:inherit;text-decoration:none;} }
      @media(max-width:600px){.leader-grid,.scout-cols {grid-template-columns:1fr;}}
    `;
    return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${clean(name)} – ${clean(matchup.own)} gegen ${clean(matchup.opp)}</title><style>${css}</style></head>
      <body><div class="toolbar"><span>PDF-Vorschau · Version 3.5.12</span><button type="button" class="pdf-preview-print" onclick="window.print()">Drucken / als PDF sichern</button></div>
      <h1>${clean(name)}</h1><div class="meta">Henriks Analyse-App für Coaches · Version 3.5.12<br>${clean(matchup.own)} gegen ${clean(matchup.opp)} · Saison ${clean(matchup.season)} · Datenstand ${clean(matchup.stand)}</div>
      ${parts.map(p=>`<div class="section">${p}</div>`).join('')}
      <footer>Lokale Datenbasis. Statistiken und Modellannahmen auf Aktualität prüfen. Prognosen sind keine kalibrierten Wahrscheinlichkeiten.</footer></body></html>`;
  }
  function cloneContent(element, keepContainer=false) {
    const clone=element.cloneNode(true);
    clone.removeAttribute('hidden');clone.classList.remove('h35-tab-hide');
    clone.querySelectorAll('[hidden],.h35-tab-hide').forEach(x=>{x.removeAttribute('hidden');x.classList.remove('h35-tab-hide');});
    clone.querySelectorAll('button,script,input,select,textarea').forEach(x=>x.remove());
    clone.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
    return keepContainer ? clone.outerHTML : clone.innerHTML;
  }
  function openPreview(kind) {
    const m=pair();if(!m){window.alert('Bitte zuerst im Reiter „Spiel“ eine Mannschaft und einen Gegner auswählen.');return;}
    const parts=[];
    if(kind==='vergleich'){
      const compare=$('analysis-grid');
      if(!compare || !compare.querySelector('#compare')?.children.length){window.alert('Für diese Paarung sind noch keine Vergleichsstatistiken verfügbar.');return;}
      parts.push(cloneContent(compare,true));
    }else{
      // Re-use the current application's report renderer to avoid exporting stale content.
      const scout=$('scouting-report');
      if(!scout?.querySelector('.scout-header')) $('scout-create')?.click();
      const forecast=$('prog-v357'), report=$('scouting-report');
      if(forecast && forecast.innerHTML.trim()) parts.push(cloneContent(forecast,true));
      if(report && report.querySelector('.scout-header')) parts.push(cloneContent(report,true));
      if(parts.length===0){window.alert('Spielprognose und Scouting-Report sind für diese Paarung noch nicht verfügbar.');return;}
    }
    const preview=window.open('','_blank');
    if(!preview){window.alert('Die PDF-Vorschau wurde vom Browser blockiert. Bitte Pop-ups für diese Web-App erlauben.');return;}
    preview.document.open();preview.document.write(printableHtml(kind,m,parts));preview.document.close();
    preview.focus();
  }
  function button(id,text,handler){let el=$(id);if(el)return el;el=document.createElement('button');el.id=id;el.type='button';el.className='pdf-export-v3512';el.textContent=text;el.addEventListener('click',handler);return el;}
  function init(){
    const comparison=$('h34-detail')||$('h35-detail-wrap')||$('analysis-grid');
    if(comparison){
      const host=comparison.querySelector('.h34-fold-content')||comparison;
      host.insertBefore(button('pdf-v3512-vergleich','Vergleichsstatistik als PDF exportieren',()=>openPreview('vergleich')),host.firstChild);
    }
    const reportActions=$('h35-report-actions');
    if(reportActions)reportActions.appendChild(button('pdf-v3512-report','Report als PDF exportieren',()=>openPreview('report')));
    // Existing button is a full-page window.print(); override with scoped export.
    document.addEventListener('click',event=>{
      if(event.target?.closest?.('#scout-print')){
        event.preventDefault();event.stopImmediatePropagation();openPreview('report');
      }
    },true);
    // Match previous export behavior: no changes to the dataset or Coach goals.
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.CoachesPDF3512={openPreview};
})();
