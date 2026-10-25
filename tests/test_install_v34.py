import unittest
from pathlib import Path
class TestV34(unittest.TestCase):
 def test_css_loaded(self):self.assertIn('ux-v34.css',Path('docs/index.html').read_text())
 def test_js_loaded(self):self.assertIn('ux-v34.js',Path('docs/index.html').read_text())
 def test_name(self):self.assertIn('Henrik’s Analyse-App für Coaches',Path('docs/index.html').read_text())
 def test_summary(self):self.assertIn('Coach Summary',Path('docs/ux-v34.js').read_text())
 def test_nav(self):self.assertIn('h34-nav',Path('docs/ux-v34.js').read_text())
 def test_preserve_store(self):self.assertNotIn('indexedDB.deleteDatabase',Path('docs/ux-v34.js').read_text())
 def test_assets(self):self.assertTrue(Path('docs/assets/coach-hero.png').stat().st_size>1000)
if __name__=='__main__':unittest.main()
