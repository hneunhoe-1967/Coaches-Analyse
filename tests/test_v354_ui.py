import unittest
from pathlib import Path
class TestUI354(unittest.TestCase):
    def test_css_link(self):
        self.assertIn('href="ux-v354-ui.css"',Path('docs/index.html').read_text(encoding='utf-8'))
    def test_existing_scoping(self):
        css=Path('docs/ux-v354-ui.css').read_text(encoding='utf-8')
        self.assertIn('#admin-league-filter',css)
        self.assertIn('#csv-import-box',css)
        self.assertIn('coach-hero-sketch.png',css)
    def test_asset(self):
        self.assertGreater(Path('docs/assets/coach-hero-sketch.png').stat().st_size,20000)
if __name__=='__main__': unittest.main()
