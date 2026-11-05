import unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class Test3517(unittest.TestCase):
 def test_loaded(self):
  s=(R/'docs/index.html').read_text()
  self.assertIn('<script src="coach-prep-v3517.js"></script>',s)
  self.assertIn('coach-prep-v3517.css',s)
 def test_collapse(self):
  s=(R/'docs/game-analysis-v3516.js').read_text()
  self.assertIn('ga17-collapse',s)
  self.assertIn('ga17-collapse-body',s)
  self.assertIn('CoachPrep3517?.render?.()',s)
 def test_existing_import_and_archive(self):
  s=(R/'docs/game-analysis-v3516.js').read_text()
  self.assertIn('Archiv der Spielanalysen',s)
  self.assertIn('Coaches', (R/'docs/game-analysis-v3514.js').read_text())
 def test_new_view(self):
  s=(R/'docs/coach-prep-v3517.js').read_text()
  self.assertIn('CoachReportMath?.build',s)
  self.assertIn('CoachGameAnalysis3516?.items',s)
  self.assertIn('Gegneranalyse:',s)
  self.assertIn('Bezug zum letzten Spiel',s)
 def test_no_write(self):
  s=(R/'docs/coach-prep-v3517.js').read_text()
  for token in ['localStorage.setItem','indexedDB.open','fetch(','localPut(']:self.assertNotIn(token,s)
 def test_css(self):
  s=(R/'docs/coach-prep-v3517.css').read_text()
  self.assertIn('#ga16-coach.ga16-panel',s)
  self.assertIn('.cp17-panel',s)
if __name__=='__main__':unittest.main()
