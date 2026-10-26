import unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class TestUpgrade(unittest.TestCase):
 def test_six_tabs(self):
  a=(R/'docs/ux-v35.js').read_text()
  for x in ["['vergleich','Vergleichsstatistik'","['report','Report'","['coach','Coach'","['daten','Daten'"]:
   self.assertIn(x,a)
 def test_separate_sections(self):
  a=(R/'docs/ux-v35.js').read_text()
  self.assertIn('vergleich:compareGroupNodes()',a)
  self.assertIn("return [q('h34-detail')||q('h35-detail-wrap')]",a)
 def test_reset_safe(self):
  a=(R/'docs/ux-v3511.js').read_text()
  self.assertIn("dispatchEvent(new Event('change'",a)
  self.assertNotIn('indexedDB.deleteDatabase',a)
  self.assertNotIn('localStorage.clear',a)
 def test_prior_changes(self):
  a=(R/'docs/index.html').read_text()
  self.assertIn('Vollständigen Datenbestand importieren (JSON)',a)
  self.assertIn('Spielerstatistik einer Mannschaft importieren',a)
  self.assertIn('Henriks',a)
 def test_top_four(self):
  a=(R/'docs/index.html').read_text()
  self.assertIn('.sort((a,b) => b.v - a.v).slice(0,4)',a)
 def test_scripts_present(self):
  a=(R/'docs/index.html').read_text()
  self.assertIn('ux-v3511.js',a)
  self.assertIn('ux-v3510.css',a)
if __name__=='__main__':unittest.main()
