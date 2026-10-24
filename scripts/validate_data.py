#!/usr/bin/env python3
"""Strukturelle und semantische Prüfung des Coaches-Analyse-Datenformats (offline)."""
from __future__ import annotations
import argparse, json, re, sys
from collections import Counter
from datetime import datetime
from pathlib import Path

REQUIRED = ('teams', 'ligen', 'teamstat', 'spieler', 'spiele', 'stand')

def validate(data, *, allow_synthetic=False):
    errors, warnings = [], []
    if not isinstance(data, dict):
        return ['Datenwurzel ist kein JSON-Objekt'], warnings
    for key in REQUIRED:
        if key not in data:
            errors.append(f'Fehlender Schlüssel: {key}')
    if errors:
        return errors, warnings
    teams, ligen, stats, players, games = (data[k] for k in ('teams','ligen','teamstat','spieler','spiele'))
    if not isinstance(teams, dict) or not teams:
        errors.append('teams muss ein nichtleeres Objekt sein')
        return errors, warnings
    if not isinstance(ligen, dict) or not isinstance(stats, dict) or not isinstance(players, dict) or not isinstance(games, list):
        errors.append('Falscher Datentyp bei ligen, teamstat, spieler oder spiele')
        return errors, warnings
    if data.get('testdaten') and not allow_synthetic:
        errors.append('Synthetische Testdaten sind für den Produktivdatensatz gesperrt')
    for tid, team in teams.items():
        if not re.fullmatch(r'\d+', str(tid)):
            errors.append(f'Team-ID ungültig: {tid}')
        if not isinstance(team, dict) or not team.get('n') or team.get('l') not in ligen:
            errors.append(f'Team {tid}: Name oder Liga fehlt/ungültig')
        row = stats.get(tid)
        if not isinstance(row, list) or len(row) != 17 or any(not isinstance(v, (int,float)) or isinstance(v,bool) or v < 0 for v in row):
            errors.append(f'Team {tid}: Teamstatistik muss 17 nichtnegative Zahlen enthalten')
    listed = []
    for lid, league in ligen.items():
        if not isinstance(league,dict) or not isinstance(league.get('table'),list):
            errors.append(f'Liga {lid}: Tabelle fehlt')
            continue
        for i, row in enumerate(league['table']):
            if not isinstance(row,list) or len(row) < 7:
                errors.append(f'Liga {lid}, Zeile {i}: ungültige Tabelle')
                continue
            tid = str(row[0]); listed.append(tid)
            if tid not in teams:
                errors.append(f'Liga {lid}: Team {tid} nicht definiert')
            elif teams[tid].get('l') != lid:
                errors.append(f'Team {tid}: falsche Liga in der Tabelle')
            if any(not isinstance(x,int) or x<0 for x in row[1:5]):
                errors.append(f'Team {tid}: ungültige Spiele/Siege/Niederlagen/Punkte')
            elif row[2]+row[3] != row[1]:
                warnings.append(f'Team {tid}: Siege+Niederlagen weichen von Spielen ab')
    duplicates = [tid for tid,n in Counter(listed).items() if n>1]
    if duplicates:
        errors.append('Mehrfach gelistete Teams: '+', '.join(duplicates))
    missing = set(teams)-set(listed)
    if missing:
        warnings.append(f'{len(missing)} Teams ohne Tabellenzuordnung')
    for i,g in enumerate(games):
        if not isinstance(g,list) or len(g)<6:
            errors.append(f'Spiel {i}: unvollständig');continue
        try: datetime.fromisoformat(g[0])
        except (ValueError,TypeError): errors.append(f'Spiel {i}: Datum ungültig')
        if str(g[2]) not in teams or str(g[3]) not in teams:
            errors.append(f'Spiel {i}: unbekannte Mannschaft')
        if g[2] == g[3]: errors.append(f'Spiel {i}: identische Mannschaften')
        if (g[4] is None) != (g[5] is None): errors.append(f'Spiel {i}: unvollständiges Ergebnis')
        for score in g[4:6]:
            if score is not None and (not isinstance(score,int) or score<0):
                errors.append(f'Spiel {i}: ungültige Punkte')
    for tid, roster in players.items():
        if tid not in teams: errors.append(f'Spieler: unbekanntes Team {tid}')
        if not isinstance(roster,list): errors.append(f'Spieler: Kader {tid} ist keine Liste');continue
        seen = set()
        for i,player in enumerate(roster):
            if not isinstance(player,list) or len(player)<22:
                errors.append(f'Spieler {tid}/{i}: ungültige Zeilenstruktur');continue
            player_id=player[0]
            if player_id in seen: errors.append(f'Spieler {tid}: doppelte Spieler-ID {player_id}')
            seen.add(player_id)
            if not isinstance(player[1],str) or not player[1].strip(): errors.append(f'Spieler {tid}/{i}: Name fehlt')
            for index,value in enumerate(player[5:22],5):
                if not isinstance(value,(int,float)) or (value<0 and index < 20):
                    errors.append(f'Spieler {tid}/{i}: Statistikwert {index} ungültig')
    if len(players)<len(teams):
        warnings.append(f'Spielerstatistiken nur für {len(players)} von {len(teams)} Teams')
    return errors,warnings

def main(argv=None):
    p=argparse.ArgumentParser()
    p.add_argument('path',nargs='?',default='docs/daten/daten.json')
    p.add_argument('--allow-synthetic',action='store_true',help='Nur für offline Testdaten')
    p.add_argument('--report',help='JSON-Prüfbericht schreiben')
    a=p.parse_args(argv)
    data=json.loads(Path(a.path).read_text(encoding='utf-8'))
    errors,warnings=validate(data,allow_synthetic=a.allow_synthetic)
    report={'status':'FEHLER' if errors else 'OK','teams':len(data.get('teams',{})),'spieler_teams':len(data.get('spieler',{})),'spiele':len(data.get('spiele',[])),'errors':errors,'warnings':warnings}
    if a.report: Path(a.report).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 1 if errors else 0
if __name__=='__main__': sys.exit(main())
