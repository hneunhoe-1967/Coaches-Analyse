import copy,json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from create_test_data import generate
from validate_data import validate
ROOT=Path(__file__).resolve().parents[1]
class ImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.source=json.loads((ROOT/'docs/daten/daten.json').read_text())
    def test_original(self):
        errors,_=validate(self.source);self.assertEqual(errors,[])
    def test_complete_test_rosters(self):
        data,report=generate(self.source)
        self.assertEqual(len(data['spieler']),len(data['teams']))
        self.assertEqual(validate(data,allow_synthetic=True)[0],[])
        self.assertEqual(report['kader_ergaenzt'],len(data['teams'])-len(self.source['spieler']))
    def test_original_not_mutated(self):
        saved=copy.deepcopy(self.source);generate(self.source);self.assertEqual(saved,self.source)
    def test_synthetic_rejected_for_production(self):
        data,_=generate(self.source);self.assertTrue(validate(data)[0])
    def test_unknown_team_rejected(self):
        x=copy.deepcopy(self.source);x['spiele'][0][2]=999999;self.assertTrue(validate(x)[0])
    def test_duplicate_player_rejected(self):
        x=copy.deepcopy(self.source);tid=next(iter(x['spieler']));x['spieler'][tid].append(x['spieler'][tid][0]);self.assertTrue(any('doppelte' in e for e in validate(x)[0]))
    def test_invalid_scores_rejected(self):
        x=copy.deepcopy(self.source);x['spiele'][0][4]=-1;self.assertTrue(validate(x)[0])
if __name__=='__main__':unittest.main()
