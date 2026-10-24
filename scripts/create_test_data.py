#!/usr/bin/env python3
"""Vollständig OFFLINE: ergänzt fehlende Spielerlisten mit klar markierten Fake-Testspielern.
Verändert weder docs/daten/daten.json noch andere Originaldaten.
"""
import argparse,copy,json,random
from datetime import datetime,timezone
from pathlib import Path
from validate_data import validate

def generate(source, seed=2026, players_per_team=8):
    data=copy.deepcopy(source)
    rng=random.Random(seed)
    synthetic_ids=[]
    for tid, team in sorted(data['teams'].items(),key=lambda kv:int(kv[0])):
        if data['spieler'].get(tid): continue
        players=[]
        for j in range(players_per_team):
            games=rng.randint(1,5);p2m=rng.randint(0,8*games);p2a=p2m+rng.randint(0,7*games)
            p3m=rng.randint(0,4*games);p3a=p3m+rng.randint(0,5*games)
            ftm=rng.randint(0,5*games);fta=ftm+rng.randint(0,4*games)
            pts=2*p2m+3*p3m+ftm
            row=[90000000+int(tid)*100+j, f'TEST|Spieler {j+1} ({tid})', ['PG','SG','SF','PF','C'][j%5], games, f'{games*12+j}:00', p2m,p2a,p3m,p3a,ftm,fta,pts,rng.randint(0,5*games),rng.randint(0,3*games),rng.randint(0,5*games),rng.randint(0,8*games),rng.randint(0,3*games),rng.randint(0,2*games),rng.randint(0,2*games),rng.randint(0,3*games),rng.randint(0,25*games),rng.randint(0,12*games)]
            players.append(row)
        data['spieler'][tid]=players
        synthetic_ids.append(tid)
    data['testdaten']=True
    data['synthetische_spieler_teams']=synthetic_ids
    data['testdaten_hinweis']='AUSSCHLIESSLICH SYNTHETISCHE TESTSPIELER. NICHT VERÖFFENTLICHEN ODER ALS ECHTE STATISTIK VERWENDEN.'
    data.setdefault('warnungen',[]).append(f'OFFLINE-TEST: {len(synthetic_ids)} Kader mit synthetischen Spielern ergänzt; vorhandene Spielerwerte unverändert.')
    errors,warnings=validate(data,allow_synthetic=True)
    if errors: raise ValueError('Generierte Daten ungültig: '+str(errors[:10]))
    return data,{'teams':len(data['teams']),'kader_ergaenzt':len(synthetic_ids),'spieler_teams':len(data['spieler']),'warnings':warnings}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--source',default='docs/daten/daten.json')
    p.add_argument('--output',default='tests/fixtures/offline-testdaten.json')
    p.add_argument('--seed',type=int,default=2026)
    a=p.parse_args()
    data,report=generate(json.loads(Path(a.source).read_text()),a.seed)
    path=Path(a.output);path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
