from pathlib import Path
import unittest
R=Path(__file__).resolve().parents[1]
class Version3510(unittest.TestCase):
    def test_labels(self):
        t=(R/'docs/index.html').read_text()
        self.assertIn('Vollständigen Datenbestand importieren (JSON) <input id="import-json"',t)
        self.assertIn('Spielerstatistik einer Mannschaft importieren <input id="admin-import"',t)
    def test_navigation(self):
        t=(R/'docs/ux-v35.js').read_text()
        self.assertLess(t.index("['report','Report'"),t.index("['coach','Coach'"))
        self.assertIn("if(s?.opp) return 'report';",t)
        self.assertIn("if(id==='opp'&&st()?.opp) showTab('report',true);",t)
    def test_title(self):
        for f in ['index.html','ux-v34.js','ux-v35.js']:
            self.assertNotIn('Henrik’s',(R/'docs'/f).read_text())
        self.assertIn('Henriks Analyse-App',(R/'docs/index.html').read_text())
    def test_css(self):
        t=(R/'docs/index.html').read_text()
        self.assertIn('href="ux-v3510.css"',t)
        self.assertIn('linear-gradient',(R/'docs/ux-v3510.css').read_text())
    def test_data_not_modified(self):
        code=(R/'scripts/install_v3510.py').read_text()
        self.assertNotIn('localStorage.removeItem',code)
        self.assertNotIn('localPut(',code)
if __name__=='__main__':unittest.main()
