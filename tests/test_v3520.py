from pathlib import Path
import unittest
root=Path(__file__).resolve().parents[1]
class Check3520(unittest.TestCase):
 def test_js_exists(self): self.assertTrue((root/'docs/fixes-v3520.js').is_file())
 def test_loaded_once(self):
  h=(root/'docs/index.html').read_text()
  self.assertEqual(h.count('<script src="fixes-v3520.js"></script>'),1)
 def test_expected_guards(self):
  s=(root/'docs/fixes-v3520.js').read_text()
  self.assertIn('minutesPerGame',s)
  self.assertIn("state.league!=='probs'",s)
  self.assertIn('Manueller CSV-Export:',s)
if __name__=='__main__':unittest.main()
