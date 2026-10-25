from pathlib import Path
p = Path('docs/index.html')
s = p.read_text(encoding='utf-8')
start_marker = '<div class="admin-actions">\n    <button id="admin-toggle"'
if 'id="admin-league-filter"' not in s:
    assert start_marker in s, 'Die erwartete Datenverwaltung wurde nicht gefunden'
    s = s.replace(start_marker, '<div class="admin-actions">\n    <label for="admin-league-filter">Liga der Mannschaftsübersicht <select id="admin-league-filter" aria-label="Liga für die Mannschaftsübersicht"><option value="">Alle Ligen</option></select></label>\n    <span id="admin-league-count" role="status" aria-live="polite"></span>\n    <button id="admin-toggle"', 1)
# Admin rendering uses all ids for counters, but only selected league for table
old = " const rows=ids.sort((a,b)=>DATA.teams[a].n.localeCompare(DATA.teams[b].n,'de'));"
new = ''' const filter=$('admin-league-filter');
 if(filter){
  const previous=filter.value;
  const leagues=Object.entries(DATA.ligen||{}).map(([key,val])=>[key,val.name||key]).sort((a,b)=>a[1].localeCompare(b[1],'de'));
  filter.innerHTML='<option value="">Alle Ligen</option>'+leagues.map(([key,name])=>'<option value="'+escapeHtml(key)+'">'+escapeHtml(name)+'</option>').join('');
  filter.value=leagues.some(([key])=>key===previous)?previous:'';
 }
 const selected=filter?.value||'';
 const rows=ids.filter(id=>!selected||String(DATA.teams[id].l)===selected).sort((a,b)=>DATA.teams[a].n.localeCompare(DATA.teams[b].n,'de'));
 if($('admin-league-count')) $('admin-league-count').textContent=rows.length+' Mannschaften in dieser Ansicht';'''
if old in s: s=s.replace(old,new,1)
elif "const selected=filter?.value||''" not in s: raise Exception('Tabellenrendering geändert: Prüfung erforderlich')
listener = "$('admin-toggle').addEventListener('click',()=>{"
if "$('admin-league-filter').addEventListener('change',renderAdmin)" not in s:
    assert listener in s
    s=s.replace(listener, "$('admin-league-filter').addEventListener('change',renderAdmin);\n"+listener,1)
# Preserve local roster after refreshing the published base dataset. NEVER silently overwrite manual data when published player data already differs.
old2="  await localPut('dataset',d);uebernehmen(d);renderAdmin();"
new2='''  // Keep any locally imported roster and its provenance. Refuse outdated or incompatible rosters only by explicit manual review, never silent deletion.
  let retained=0;
  if(current){
   for(const [id,oldTeam] of Object.entries(current.teams||{})){
    const oldRows=current.spieler?.[id];
    if(!d.teams[id] || !Array.isArray(oldRows) || !oldRows.length)continue;
    if(!oldTeam.kaderStand && !oldTeam.importQuelle)continue;
    d.spieler[id]=structuredClone(oldRows);
    for(const key of ['kaderStand','kaderGeladen','importQuelle','synthetic']){
     if(Object.prototype.hasOwnProperty.call(oldTeam,key))d.teams[id][key]=oldTeam[key];
    }
    retained++;
   }
  }
  validateDataset(d);
  await localPut('dataset',d);uebernehmen(d);renderAdmin();'''
assert old2 in s or 'let retained=0;' in s, 'Speicherstelle unerwartet verändert'
if old2 in s: s=s.replace(old2,new2,1)
old3="  $('local-info').textContent=current&&current.stand===d.stand?'Keine neuere Version vorhanden.':'Veröffentlichte Daten wurden geprüft und lokal gespeichert.';"
new3="  $('local-info').textContent=(current&&current.stand===d.stand?'Kein neuerer veröffentlichter Datenstand.':'Veröffentlichte Teamdaten wurden lokal gespeichert.')+' '+retained+' lokal importierte Mannschaftskader beibehalten. Hinweis: Bei unterschiedlichen Datenständen Spieler- und Teamstatistik prüfen.';"
assert old3 in s or 'lokal importierte Mannschaftskader beibehalten' in s
if old3 in s:s=s.replace(old3,new3,1)
p.write_text(s,encoding='utf-8')
print('Version 3.3.1 eingebunden: Ligafilter und Schutz lokaler CSV-Spielerwerte.')
