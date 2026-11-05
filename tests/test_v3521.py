import json,unittest
from pathlib import Path
class TestTable(unittest.TestCase):
 def setUp(self):self.d=json.loads(Path('docs/probs-table-2026-11-01.json').read_text())
 def test_row_count(self):self.assertEqual(len(self.d['rows']),15)
 def test_unique_ids(self):self.assertEqual(len({r[0] for r in self.d['rows']}),15)
 def test_valid_records(self):
  for r in self.d['rows']:
   self.assertEqual(len(r),10)
   self.assertEqual(r[1],r[2]+r[3]);self.assertEqual(r[4],2*r[2])
 def test_coburg(self):self.assertEqual(self.d['rows'][12][:7],[559,7,1,6,2,475,566])
 def test_bayern(self):self.assertEqual(self.d['rows'][9][:7],[558,7,3,4,6,563,571])
if __name__=='__main__':unittest.main()
