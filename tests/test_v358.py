import unittest
from pathlib import Path
class InstallTests(unittest.TestCase):
 def test_files(self):
  self.assertTrue(Path('docs/coach-szenario-v358.js').exists())
  self.assertTrue(Path('docs/coach-szenario-v358.css').exists())
 def test_integration(self):
  s=Path('docs/index.html').read_text()
  self.assertEqual(s.count('src="coach-szenario-v358.js"'),1)
  self.assertEqual(s.count('href="coach-szenario-v358.css"'),1)
 def test_old_modules(self):
  s=Path('docs/index.html').read_text()
  self.assertIn('coachziele-v357.js',s)
  self.assertIn('prognose-v357.js',s)
 def test_no_dataset_write(self):
  s=Path('docs/coach-szenario-v358.js').read_text()
  self.assertNotIn("localPut(",s)
  self.assertNotIn('indexedDB.open',s)
 def test_install_idempotent(self):
  s=Path('scripts/install_v358.py').read_text()
  self.assertIn('if js not in s:',s)
if __name__=='__main__':unittest.main()
