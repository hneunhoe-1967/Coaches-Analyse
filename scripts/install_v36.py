#!/usr/bin/env python3
"""Install safe, read-only source check and local consistency audit (3.6)."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
index=root/'docs/index.html'
assert index.exists(), 'docs/index.html nicht gefunden'
for file in ('data-audit-v36.js','data-audit-v36.css'):
    assert (root/'docs'/file).is_file(), 'Fehlende Datei: '+file
s=index.read_text(encoding='utf8')
# Replace the dangerous remote-to-local synchronization path, leaving backup,
# explicitly user-chosen JSON import, team imports and all analysis data intact.
start=s.find('async function syncDataset(){')
end=s.find('window.coachesLocalSync=syncDataset;',start)
assert start>=0 and end>start, 'Daten-Synchronisierung nicht gefunden; Index nicht geändert'
new_sync='''async function syncDataset(){
  const btn=$('local-sync'),refresh=$('refresh');
  btn.disabled=true;refresh.disabled=true;
  try{
    $('local-info').textContent='Veröffentlichten Datenstand prüfen (nur lesen) …';
    const [remote,current]=await Promise.all([ladeDaten(true),localGet('dataset')]);
    validateDataset(remote);
    const localCob=current?.teamstat?.['559'];
    const remoteCob=remote.teamstat?.['559'];
    const localPlayers=Object.keys(current?.spieler||{}).filter(id=>
      current.teams?.[id]?.l==='probs'&&Array.isArray(current.spieler[id])&&current.spieler[id].length).length;
    const msg='Veröffentlichte Basis: '+fmtZeit(remote.stand)+
      ' (Coburg '+(remoteCob?.[0]??'–')+' Spiele). Lokal: '+
      (current?'Coburg '+(localCob?.[0]??'–')+' Spiele, '+localPlayers+'/15 ProB-Süd-Kader.':'kein Datensatz.')+
      ' Es wurden KEINE lokalen Daten ersetzt. Für neue Werte bitte Dateien unter „Daten“ ausdrücklich importieren.';
    $('local-info').textContent=msg;
    $('sync').textContent=msg;
  }catch(e){
    const msg='Nur-Lese-Prüfung fehlgeschlagen: '+e.message+'. Lokale Daten unverändert.';
    $('local-info').textContent=msg;$('sync').textContent=msg;
  }finally{btn.disabled=false;refresh.disabled=false;}
}
'''
s=s[:start]+new_sync+s[end:]
# Label that makes it clear the buttons do not update the local database.
s=s.replace('Veröffentlichte Daten prüfen &amp; lokal aktualisieren','Veröffentlichten Stand prüfen (ohne Import)')
s=s.replace('id="refresh" class="refresh" type="button" disabled>Aktualisieren','id="refresh" class="refresh" type="button" disabled>Quellstand prüfen')
# Do not falsely claim the baseline file date is the newest imported data date.
s=s.replace('`Datenstand: ${fmtZeit(d.stand)}`','`Basisdatei: ${fmtZeit(d.stand)} · Importstände unter „Daten“ prüfen`')
# Table import's previously hard-coded date was misleading, especially after Nov 22 import.
table_import=root/'docs/probs-table-import-v3522.js'
if table_import.exists():
    t=table_import.read_text(encoding='utf8')
    t=t.replace("copy.ligen.probs.tableStand='Nutzervorlage vom 15.11.2026 (offizieller Stand nicht verifiziert)';", "copy.ligen.probs.tableStand=String(staged.stand)+' (Importdatei)';")
    t=t.replace("copy.ligen.probs.note='Tabelle vom Nutzer bereitgestellt; Spielplan, Ergebnisse und Teamstatistiken separat, teils noch älter.';", "copy.ligen.probs.note='Tabellenimport aus Datei; Spielplan und Ergebnisse separat. Offiziellen Stand über die Quelle prüfen.';")
    table_import.write_text(t,encoding='utf8')
# Correct the *displayed* version; retain legacy source filenames, do not remove code.
ux=root/'docs/ux-v35.js'
if ux.exists():
    u=ux.read_text(encoding='utf8').replace('Version 3.5.11 · Vergleich · Report · Coach-Ziele','Version 3.6 · Vergleich · Report · Teamprüfung')
    ux.write_text(u,encoding='utf8')
ux11=root/'docs/ux-v3511.js'
if ux11.exists():
    u=ux11.read_text(encoding='utf8').replace("'Report · Version 3.5.11'","'Report · Version 3.6'")
    ux11.write_text(u,encoding='utf8')
marker='<link rel="stylesheet" href="data-audit-v36.css">\n<script src="data-audit-v36.js"></script>'
if marker not in s:
    assert '</body>' in s and 'team-detail-v3524.js' in s, 'Erwartete v3.5.24 fehlt; Index nicht gespeichert'
    s=s.replace('</body>',marker+'\n</body>',1)
index.write_text(s,encoding='utf8')
print('Version 3.6 installiert: Quellstand nur noch lesbar, lokale Daten geschützt, 15-Team-Prüfung ergänzt.')
print('Keine Datenbankdatei und keine lokalen Browserdaten wurden verändert.')
