import unittest
from pathlib import Path

class TestV35(unittest.TestCase):
    def test_css_loaded(self):
        self.assertIn('ux-v35.css', Path('docs/index.html').read_text(encoding='utf-8'))
    def test_js_loaded(self):
        self.assertIn('ux-v35.js', Path('docs/index.html').read_text(encoding='utf-8'))
    def test_title(self):
        self.assertIn('Henrik’s Analyse-App für Coaches', Path('docs/index.html').read_text(encoding='utf-8'))
    def test_tabs(self):
        js=Path('docs/ux-v35.js').read_text(encoding='utf-8')
        self.assertIn('showTab', js)
        self.assertIn("['spiel','Spiel'", js)
    def test_dark_mode_style(self):
        css=Path('docs/ux-v35.css').read_text(encoding='utf-8')
        self.assertIn('Arena Dark Mode', Path('README-VERSION-3.5.txt').read_text(encoding='utf-8'))
        self.assertIn('.h35-tabs', css)
        self.assertIn('.h35-summary', css)
    def test_assets(self):
        self.assertTrue(Path('docs/assets/coach-hero.png').stat().st_size > 1000)
    def test_preserve_store(self):
        self.assertNotIn('indexedDB.deleteDatabase', Path('docs/ux-v35.js').read_text(encoding='utf-8'))

if __name__=='__main__':
    unittest.main()
