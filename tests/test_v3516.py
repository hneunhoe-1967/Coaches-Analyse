import unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class Test3516(unittest.TestCase):
 def test_coach_panel(self):
  s=(R/'docs/game-analysis-v3516.js').read_text()
  self.assertIn("$('analysis')",s)
  self.assertIn('Analyse des letzten Spiels',s)
 def test_archive(self):
  s=(R/'docs/game-analysis-v3516.js').read_text()
  self.assertIn('Archiv der Spielanalysen',s)
  self.assertIn("$('ga14-import')",s)
 def test_sort_latest(self):
  s=(R/'docs/game-analysis-v3516.js').read_text()
  self.assertIn('sort(byDate)',s)
 def test_import_kept(self):
  s=(R/'docs/game-analysis-v3514.js').read_text()
  self.assertIn('function save(',s)
  self.assertIn('async function upload(',s)
 def test_no_old_view(self):
  s=(R/'docs/index.html').read_text()
  self.assertNotIn('<script src="game-analysis-v3515-view.js"></script>',s)
  self.assertIn('<script src="game-analysis-v3516.js"></script>',s)
 def test_no_old_report(self):
  s=(R/'docs/game-analysis-v3514.js').read_text()
  self.assertNotIn('Team- und Spieleraufgaben aus Spielanalysen · Version 3.5.14',s)
if __name__=='__main__':unittest.main()
