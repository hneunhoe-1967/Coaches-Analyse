import unittest
from pathlib import Path
class TestReportFix(unittest.TestCase):
    def test_css_registered(self): self.assertIn('ux-v351-fix.css',Path('docs/index.html').read_text())
    def test_report_separated(self): self.assertIn('detachReportSections();',Path('docs/ux-v35.js').read_text())
    def test_report_actions(self): self.assertIn('h35-report-actions',Path('docs/ux-v35.js').read_text())
    def test_report_tops(self): self.assertIn("q('h34-detail')",Path('docs/ux-v35.js').read_text())
    def test_report_button(self): self.assertIn("original.click()",Path('docs/ux-v35.js').read_text())
if __name__=='__main__': unittest.main()
