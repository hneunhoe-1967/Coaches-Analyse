import unittest
from pathlib import Path
class TestInstallV353(unittest.TestCase):
 def test_integrity_validation(self):
  s=Path('docs/coach-v352.js').read_text()
  self.assertIn('3.5.3: Known, historically observed roster conflicts',s)
  self.assertIn('foreign.length>=2',s)
 def test_report_guard(self):
  s=Path('docs/scouting-v33.js').read_text()
  self.assertIn('rosterCheck.valid?report.roles:[]',s)
  self.assertIn('checked.valid?data.spieler?.[opp]:[]',s)
 def test_date(self):
  self.assertIn('Kaderstand: ${date}',Path('docs/index.html').read_text())
  self.assertIn('Gegnerkader:',Path('docs/scouting-ui.js').read_text())
if __name__=='__main__':unittest.main()
