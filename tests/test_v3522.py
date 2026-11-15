from pathlib import Path
import json,re,unittest
ROOT=Path(__file__).resolve().parents[1]
class TestTabelle(unittest.TestCase):
 def setUp(self):
  self.p=json.loads((ROOT/'docs/probs-table-2026-11-15.json').read_text())
 def test_format(self):self.assertEqual(self.p['format'],'coaches-probs-table-v1')
 def test_teams(self):self.assertEqual(len(set(r[0] for r in self.p['rows'])),15)
 def test_records(self):
  for r in self.p['rows']:
   self.assertEqual(len(r),10);self.assertEqual(r[1],r[2]+r[3]);self.assertEqual(r[4],2*r[2]);self.assertTrue(8<=r[1]<=9)
 def test_home_away(self):
  for r in self.p['rows']:
   h=list(map(int,r[7].split('–')));a=list(map(int,r[8].split('–')));self.assertEqual((h[0]+a[0],h[1]+a[1]),(r[2],r[3]))
 def test_coburg_leitershofen(self):
  d={r[0]:r for r in self.p['rows']};self.assertEqual(d[559][1:7],[8,2,6,4,553,641]);self.assertEqual(d[573][1:7],[8,5,3,10,611,575])
 def test_new_validator(self):
  s=(ROOT/'docs/probs-table-import-v3522.js').read_text();self.assertIn('g<6||g>12',s);self.assertNotIn('g<6||g>7',s);self.assertIn('d.teamstat[id][0]===g',s)
if __name__=='__main__':unittest.main()
