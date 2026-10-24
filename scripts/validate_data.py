import json,sys
from pathlib import Path
j=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
assert all(k in j for k in ['teams','ligen','teamstat','spieler','spiele','stand'])
assert len(j['teams'])>0
assert all(str(row[0]) in j['teams'] for li in j['ligen'].values() for row in li['table'])
assert all(str(tid) in j['teamstat'] for tid in j['teams'])
print('Validiert:',len(j['teams']),'Teams',len(j['spiele']),'Spiele')
