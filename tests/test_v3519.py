import json,unittest
from pathlib import Path
root=Path(__file__).resolve().parents[1]
class Validate(unittest.TestCase):
 def test_all_teams(self):
  p=json.loads((root/'docs'/'teamstat-probs-15.json').read_text());self.assertEqual(len(p['teams']),15)
 def test_math(self):
  p=json.loads((root/'docs'/'teamstat-probs-15.json').read_text())
  for v in p['teams'].values():
   for a in (v['teamstat'],v['gegenstat']):
    self.assertEqual(len(a),17);self.assertEqual(a[7],2*a[1]+3*a[3]+a[5]);self.assertEqual(a[11],a[9]+a[10]);self.assertIn(a[0],[6,7])
 def test_key_match(self):
  p=json.loads((root/'docs'/'teamstat-probs-15.json').read_text());self.assertEqual(p['teams']['559']['teamstat'][7],475);self.assertEqual(p['teams']['558']['teamstat'][7],563)
 def test_index(self):
  s=(root/'docs'/'index.html').read_text();self.assertEqual(s.count('<!-- COACHES_TEAMSTAT_V3519 -->'),1);self.assertEqual(s.count('<script src="teamstat-import-v3519.js"></script>'),1)
if __name__=='__main__':unittest.main()
