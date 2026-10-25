from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
page=ROOT/'docs/index.html'
if not page.exists():
    raise SystemExit('Fehler: docs/index.html fehlt. Im Repository-Hauptverzeichnis entpacken.')
s=page.read_text(encoding='utf-8')
if 'COACHES_V332_TABLE' not in s:
    marker='/* Version 3.2 Scouting Report */'
    if marker not in s or '.admin-table{max-height:380px;' not in s:
        raise SystemExit('Nicht kompatible Version der Tabelle. Keine Änderung vorgenommen.')
    css='''/* COACHES_V332_TABLE: Gesamte Ligatabelle statt innerem Scrollbalken. */
#admin-detail .admin-table{max-height:none;overflow-y:visible;overflow-x:auto}
#admin-detail .admin-table table{width:100%;border-collapse:collapse}
#admin-detail .admin-table th,#admin-detail .admin-table td{padding:7px 9px}
@media (max-width:650px){#admin-detail .admin-table th,#admin-detail .admin-table td{padding:6px;font-size:12px}}
'''
    s=s.replace(marker,css+'\n'+marker,1)

# Before any replacement, save original in memory and preserve confirmed locally imported rosters.
# Reuse 3.3.1 merge, but require continuity of saved imported teams and a pre-update backup.
if 'COACHES_V332_BACKUP' not in s:
    marker='async function syncDataset(){'
    if marker not in s or "await localPut('dataset',d);uebernehmen(d);renderAdmin();" not in s:
        raise SystemExit('Unbekannte Aktualisierungslogik. Keine Version 3.3.2 installiert.')
    # An immutable JSON snapshot in browser file download, started before applying update.
    # Ensure user is aware of the download (Safari may ask for permission).
    helper='''// COACHES_V332_BACKUP: automatische, herunterladbare Sicherung vor jeder Aktualisierung.
function backupCoachDataset(data){
 const json=JSON.stringify(data,null,2);
 const blob=new Blob([json],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='coaches-analyse-backup-vor-aktualisierung.json';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
}
'''
    s=s.replace(marker,helper+marker,1)
    old="""  validateDataset(d);
  await localPut('dataset',d);uebernehmen(d);renderAdmin();"""
    new="""  validateDataset(d);
  // COACHES_V332_CHECK: never silently drop already saved player rosters.
  if(current){
   const vanished=Object.keys(current.teams||{}).filter(id=>
    Array.isArray(current.spieler?.[id]) && current.spieler[id].length > 0 &&
    (!Array.isArray(d.spieler?.[id]) || d.spieler[id].length===0));
   if(vanished.length)throw new Error('Aktualisierung abgebrochen: '+vanished.length+' vorhandene Kader würden verloren gehen. Bitte Daten sichern und prüfen.');
   backupCoachDataset(current);
  }
  await localPut('dataset',d);uebernehmen(d);renderAdmin();"""
    if old not in s: raise SystemExit('Sicherungs-Einfügestelle nicht gefunden.')
    s=s.replace(old,new,1)

page.write_text(s,encoding='utf-8')
print('Version 3.3.2 eingebunden: größere Mannschaftstabelle, Sicherung und Kaderverlust-Prüfung.')
