from pathlib import Path
p=Path('docs/index.html')
s=p.read_text(encoding='utf-8')
checks={
 'Ligatabelle ohne inneren Scrollbalken':'#admin-detail .admin-table{max-height:none;overflow-y:visible' in s,
 'Backup vor Aktualisierung':'backupCoachDataset(current);' in s,
 'Prüfung gegen Kaderverlust':'COACHES_V332_CHECK' in s,
 'Beide Aktualisierungsbuttons geschützter Pfad':"$('refresh').addEventListener('click', () => window.coachesLocalSync())" in s and "$('local-sync').addEventListener('click',syncDataset)" in s,
}
for name,ok in checks.items(): print(('OK' if ok else 'FEHLER')+': '+name)
if not all(checks.values()):raise SystemExit(1)
print('4 Prüfungen erfolgreich')
