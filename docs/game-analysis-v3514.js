/* Coaches-Analyse 3.5.14 – Spielanalysen bleiben getrennt vom offiziellen Datensatz. */
(function(root){'use strict';
const el=id=>document.getElementById(id), KEY='coaches-game-analysis-v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cut=(s,n=500)=>String(s??'').trim().slice(0,n);
const norm=v=>String(v??'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
function validate(a){
 if(!a||a.schema!==KEY||!/^[0-9]{1,8}$/.test(String(a.teamId??''))||!a.title||!Array.isArray(a.teamTasks)||!Array.isArray(a.playerTasks))throw Error('Analyse-JSON: Schema, Mannschafts-ID oder Aufgaben fehlen.');
 if(a.teamTasks.length>40||a.playerTasks.length>80)throw Error('Zu viele Aufgaben.');
 const task=(x,player)=>({...(player?{player:cut(x.player,100)}:{}),title:cut(x.title,160),action:cut(x.action,1100),evidence:cut(x.evidence,700),measure:cut(x.measure,250)});
 const teamTasks=a.teamTasks.map(x=>task(x,false)),playerTasks=a.playerTasks.map(x=>task(x,true));
 if(teamTasks.some(x=>!x.title||!x.action)||playerTasks.some(x=>!x.title||!x.action||!x.player))throw Error('Aufgaben benötigen Titel, Maßnahme und Spielernamen.');
 return {schema:KEY,id:cut(a.id||`${a.teamId}-${a.date||''}-${a.opponent||''}`,160),teamId:String(a.teamId),teamName:cut(a.teamName,120),opponent:cut(a.opponent,100),date:cut(a.date,20),score:cut(a.score,20),title:cut(a.title,220),sourceFile:cut(a.sourceFile,240),status:cut(a.status||'Trainerprüfung erforderlich',180),summary:cut(a.summary,1100),teamTasks,playerTasks};
}
function read(){try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[];}catch{return [];}}
function save(x){x=validate(x);const a=read(),ix=a.findIndex(z=>z.id===x.id);if(ix>=0)a[ix]=x;else a.unshift(x);localStorage.setItem(KEY,JSON.stringify(a.slice(0,40)));return x;}
function current(){try{return {own:String(state?.own||''),opp:String(state?.opp||''),teams:DATA?.teams||{}};}catch{return {own:'',opp:'',teams:{}};}}
function taskRow(t,player){return `<li><strong>${player?esc(t.player)+' · ':''}${esc(t.title)}</strong><p>${esc(t.action)}</p>${t.evidence?`<small><b>Begründung aus dem Rückblick:</b> ${esc(t.evidence)}</small>`:''}${t.measure?`<small><b>Kontrolle:</b> ${esc(t.measure)}</small>`:''}</li>`;}
function appendToReport(){
 const target=el('scout-content');if(!target)return;
 target.querySelector('#ga14-report')?.remove();const c=current();if(!c.own||!c.opp||!target.querySelector('.scout-header'))return;
 const items=read().filter(a=>a.teamId===c.own);if(!items.length)return;
 const box=document.createElement('section');box.id='ga14-report';box.className='ga14-report';
 box.innerHTML=`<h2>Team- und Spieleraufgaben aus Spielanalysen · Version 3.5.14</h2><p class="ga14-note">Rückblick auf frühere Spiele von <b>${esc(c.teams[c.own]?.n||'eigene Mannschaft')}</b>. <b>Keine neuen offiziellen Statistikdaten und keine direkte Analyse des aktuell gewählten Gegners.</b></p>`+
 items.map(a=>`<article class="ga14-review"><h3>${esc(a.title)}</h3><p class="ga14-meta">${esc(a.date)} · gegen ${esc(a.opponent)} · ${esc(a.score)} · Quelle: ${esc(a.sourceFile)}</p><p>${esc(a.summary)}</p>${a.teamTasks.length?`<h4>Aufgaben für das Team</h4><ol>${a.teamTasks.map(x=>taskRow(x,false)).join('')}</ol>`:''}${a.playerTasks.length?`<h4>Aufgaben für einzelne Spieler</h4><ol>${a.playerTasks.map(x=>taskRow(x,true)).join('')}</ol>`:''}<p class="ga14-note">${esc(a.status)}</p></article>`).join('');
 target.appendChild(box);
}
function refreshList(){const box=el('ga14-list');if(!box)return;const a=read();box.innerHTML=a.length?a.map(x=>`<div class="ga14-entry"><div><b>${esc(x.title)}</b><small>${esc(x.teamName||x.teamId)} · ${esc(x.date)} · ${x.teamTasks.length} Team-, ${x.playerTasks.length} Spieleraufgaben</small></div><button type="button" data-delete="${esc(x.id)}">Löschen</button></div>`).join(''):'<p>Noch keine Spielanalysen importiert.</p>';box.querySelectorAll('[data-delete]').forEach(btn=>btn.addEventListener('click',()=>{if(!confirm('Diese Analyse und ihre Aufgaben löschen?'))return;localStorage.setItem(KEY,JSON.stringify(read().filter(x=>x.id!==btn.dataset.delete)));refreshList();appendToReport();}));}
function teamSelect(){const sel=el('ga14-team');if(!sel)return;const c=current(),old=sel.value||c.own,entries=Object.entries(c.teams).sort((a,b)=>a[1].n.localeCompare(b[1].n,'de'));sel.innerHTML='<option value="">Mannschaft zuordnen</option>'+entries.map(([id,x])=>`<option value="${esc(id)}">${esc(x.n)}</option>`).join('');if(entries.some(x=>x[0]===old))sel.value=old;}
function teamOf(title){const c=current();if(el('ga14-team')?.value)return el('ga14-team').value;const n=norm(title);return Object.keys(c.teams).find(id=>n.includes(norm(c.teams[id].n)))||'';}
function blocksToTasks(blocks){let section='',player='',paras=[],summary='';const teamTasks=[],playerTasks=[];
 const names=/^(Savion Brown|Tim Herzog|Erik Neunhoeffer|Musa Abra|Leo Cosic|Benjamin Koppke|Felix Egger|Pepe Levin Lahr)$/i;
 const flush=()=>{if(!player||!paras.length)return;const p=paras.filter(x=>/(sollte|muss|trainingsschwerpunkt|entwicklungs|fokus|priorität|schlüssel|weiterentwicklung|verbesserung)/i.test(x));playerTasks.push({player,title:'Entwicklungsaufgabe: '+player,action:cut(p.at(-1)||paras.at(-1),900),evidence:cut(paras[0],300),measure:'Coach legt Zielwert fest'});};
 for(const b of blocks){const t=cut(b.text,3500);if(!t)continue;if(b.heading){flush();section=t;player=names.test(t)?t:'';paras=[];continue;}if(player){paras.push(t);continue;}if(/Prioritäten für die nächsten Spiele/i.test(section)&&/^(Die erste|Die zweite|Drittens|Viertens)/i.test(t))teamTasks.push({title:cut(t.split(/[.!?]/)[0],130),action:cut(t,900),evidence:'Prioritäten für die nächsten Spiele',measure:'Coach legt Zielwert fest'});if(/Einordnung des Spiels/i.test(section)&&!summary)summary=cut(t,550);}
 flush();return {teamTasks:teamTasks.slice(0,12),playerTasks:playerTasks.slice(0,40),summary};
}
async function parseDocx(buffer){
 const a=new Uint8Array(buffer),v=new DataView(buffer);let p=0,xml;
 while(p+30<=a.length && v.getUint32(p,true)===0x04034b50){const flag=v.getUint16(p+6,true),method=v.getUint16(p+8,true),n=v.getUint16(p+26,true),e=v.getUint16(p+28,true),len=v.getUint32(p+18,true);const name=new TextDecoder().decode(a.slice(p+30,p+30+n));const begin=p+30+n+e;
 if((flag&8)||begin+len>a.length)throw Error('Dieses DOCX-ZIP-Format wird nicht unterstützt. Bitte Analyse-JSON verwenden.');
 if(name==='word/document.xml'){
   const raw=a.slice(begin,begin+len);if(method===0)xml=raw;
   else if(method===8 && typeof DecompressionStream!=='undefined'){const stream=new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));xml=new Uint8Array(await new Response(stream).arrayBuffer());}
   else throw Error('DOCX-Dekomprimierung im Browser nicht verfügbar. Bitte JSON-Beispiel verwenden.');break;
 }
 p=begin+len;
 }
 if(!xml)throw Error('Kein Word-Dokument in der Datei gefunden.');
 const d=new DOMParser().parseFromString(new TextDecoder().decode(xml),'application/xml'),ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';if(d.querySelector('parsererror'))throw Error('DOCX konnte nicht gelesen werden.');
 return Array.from(d.getElementsByTagNameNS(ns,'p')).map(p=>{const style=p.getElementsByTagNameNS(ns,'pStyle')[0]?.getAttributeNS(ns,'val')||'';return {heading:/heading[1-4]/i.test(style),text:Array.from(p.getElementsByTagNameNS(ns,'t')).map(x=>x.textContent).join('')};}).filter(x=>x.text.trim());
}
async function upload(file){
 if(file.size>2*1024*1024)throw Error('Maximal 2 MB pro Analyse.');
 if(/\.json$/i.test(file.name)){const parsed=JSON.parse(await file.text()),items=Array.isArray(parsed)?parsed:[parsed];if(items.length>40)throw Error('Zu viele Analysen.');items.forEach(save);return items.length;}
 if(!/\.docx$/i.test(file.name))throw Error('Bitte .docx oder .json verwenden.');
 const blocks=await parseDocx(await file.arrayBuffer()),title=blocks.find(x=>x.heading)?.text||file.name,id=teamOf(title);if(!id)throw Error('Bitte zuerst die Mannschaft auswählen.');
 const tasks=blocksToTasks(blocks);if(!tasks.teamTasks.length&&!tasks.playerTasks.length)throw Error('Keine Aufgaben erkannt. Bitte die strukturierte JSON-Vorlage importieren.');
 const c=current(),dateParts=blocks.map(b=>b.text).join(' ').match(/(\d{1,2})\.\s*(November|Oktober|September|Dezember)\s+(20\d{2})/i),month={november:'11',oktober:'10',september:'09',dezember:'12'},date=dateParts?`${dateParts[3]}-${month[dateParts[2].toLowerCase()]}-${dateParts[1].padStart(2,'0')}`:'';
 save({schema:KEY,id:`docx-${id}-${date}-${norm(title).slice(0,45)}`,teamId:id,teamName:c.teams[id]?.n||'',opponent:/TV Langen/i.test(title)?'TV Langen':'siehe Dokument',title,date,sourceFile:file.name,status:'Automatisch aus DOCX extrahiert. Aufgaben und Zuordnung vom Coach prüfen.',summary:tasks.summary,...tasks});return 1;
}
function backup(){const b=new Blob([JSON.stringify(read(),null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='coaches-spielanalysen-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);}
function init(){const host=el('data-admin')||el('h34-manage');if(!host||el('ga14-import'))return;
 const box=document.createElement('section');box.id='ga14-import';box.className='ga14-import';box.innerHTML=`<h2>Spielanalysen importieren · 3.5.14</h2><p>DOCX oder strukturierte Analyse-JSON. Die Analyse wird lokal der ausgewählten Mannschaft zugeordnet und als Team-/Spieleraufgaben im Scouting-Report angezeigt.</p><div class="ga14-controls"><label>Mannschaft zuordnen<select id="ga14-team"><option value="">Mannschaft auswählen</option></select></label><label>Datei importieren<input id="ga14-file" type="file" accept=".docx,.json"></label><button type="button" id="ga14-backup">Spielanalysen sichern (JSON)</button></div><p id="ga14-status" role="status">DOCX-Text wird regelbasiert ausgewertet; bitte fachlich prüfen. Für den Coburg-Rückblick ist die kuratierte Beispiel-JSON präziser.</p><div id="ga14-list"></div>`;host.append(box);teamSelect();refreshList();
 for(const id of ['league','own'])el(id)?.addEventListener('change',()=>setTimeout(teamSelect,0));
 el('ga14-file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const count=await upload(f);refreshList();appendToReport();el('ga14-status').textContent=`${count} Analyse(n) gespeichert. Aufgaben bitte vor Verwendung prüfen.`;}catch(err){el('ga14-status').textContent='Fehler: '+err.message;}e.target.value='';});
 el('ga14-backup').addEventListener('click',backup);
 const sc=el('scout-content');if(sc)new MutationObserver(()=>{if(!sc.querySelector('#ga14-report'))appendToReport();}).observe(sc,{childList:true});
 ['own','opp','league'].forEach(id=>el(id)?.addEventListener('change',()=>setTimeout(appendToReport,30)));
 appendToReport();
}
root.CoachGameAnalysis3514={appendToReport,validate,read,save,blocksToTasks};
if(typeof module==='object'&&module.exports)module.exports={validate,blocksToTasks,norm};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
