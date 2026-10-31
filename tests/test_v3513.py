import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class TestPdfCompare3513(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.css=(ROOT/'docs/pdf-compare-v3513.css').read_text(encoding='utf-8')
        cls.js=(ROOT/'docs/pdf-export-v3512.js').read_text(encoding='utf-8')
    def test_export_remains_available(self):
        self.assertIn("openPreview('vergleich')",self.js)
        self.assertIn("openPreview('report')",self.js)
    def test_patch_included(self):
        self.assertIn('COACH_PDF_V3513_COMPARE_LAYOUT',self.js)
    def test_comparison_grid(self):
        self.assertIn('grid-template-columns:104px minmax(0,1fr) 104px',self.js)
    def test_bar_graphs(self):
        self.assertIn('.bars {display:grid!important',self.js)
        self.assertIn('width:var(--w)',self.js)
    def test_colors(self):
        self.assertIn('.cmp-val.o.win b',self.js)
        self.assertIn('.cmp-val.g.win b',self.js)
    def test_print_mode(self):
        self.assertIn('@media print {',self.js)
        self.assertIn('print-color-adjust:exact',self.js)
    def test_headers(self):
        self.assertIn('PDF-Vorschau · Version 3.5.13',self.js)
    def test_no_data_access_in_css(self):
        self.assertNotIn('localStorage',self.css)
        self.assertNotIn('indexedDB',self.css)
if __name__=='__main__':unittest.main()
