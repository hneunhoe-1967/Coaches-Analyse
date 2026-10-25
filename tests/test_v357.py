import unittest
from pathlib import Path
class TestV357(unittest.TestCase):
 def test_goal_types(self):
  s=Path('docs/coachziele-v357.js').read_text();self.assertEqual(s.count("id:'"),8)
 def test_only_local_storage(self):
  s=Path('docs/coachziele-v357.js').read_text();self.assertIn('localStorage.setItem',s);self.assertNotIn('fetch(',s)
 def test_forecast(self):
  s=Path('docs/prognose-v357.js').read_text();self.assertIn('cdf(',s);self.assertIn('nicht kalibriert',s)
 def test_install(self):
  s=Path('docs/index.html').read_text();self.assertIn('coachziele-v357.js',s);self.assertIn('prognose-v357.js',s)
 def test_navigation(self):
  s=Path('docs/ux-v35.js').read_text();self.assertIn("q('prog-v357')",s)
if __name__=='__main__':unittest.main()
