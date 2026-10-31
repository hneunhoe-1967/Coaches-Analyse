import unittest
from pathlib import Path
r=Path(__file__).resolve().parent.parent
js=(r/'docs'/'pdf-export-v3512.js').read_text(encoding='utf-8')
html=(r/'docs'/'index.html').read_text(encoding='utf-8')
class PDFExport3512(unittest.TestCase):
    def test_script_linked(self): self.assertIn('src="pdf-export-v3512.js"',html)
    def test_style_linked(self): self.assertIn('href="pdf-export-v3512.css"',html)
    def test_comparison_separate(self): self.assertIn("kind==='vergleich'",js);self.assertIn("$('analysis-grid')",js)
    def test_report_parts(self): self.assertIn("$('prog-v357')",js);self.assertIn("$('scouting-report')",js)
    def test_existing_print_overridden(self): self.assertIn("#scout-print",js);self.assertIn('stopImmediatePropagation()',js)
    def test_no_storage_writes(self): self.assertNotIn('localStorage.setItem',js);self.assertNotIn('localPut(',js)
    def test_print_control(self): self.assertIn('window.print()',js)
    def test_unchanged_nav(self): self.assertIn('ux-v3511.js',html)
if __name__=='__main__': unittest.main()
