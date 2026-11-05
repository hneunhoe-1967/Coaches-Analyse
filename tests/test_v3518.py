import unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class TestV3518(unittest.TestCase):
 def test_inclusion(self):
  s=(R/'docs/index.html').read_text()
  self.assertIn('coach-prep-v3518.js',s)
  self.assertNotIn('<script src="coach-prep-v3517.js"></script>',s)
 def test_gameplan_title(self):
  s=(R/'docs/scouting-v33.js').read_text()
  self.assertIn('Gameplan – Drei priorisierte Trainingsthemen',s)
 def test_top_three(self):
  s=(R/'docs/coach-prep-v3518.js').read_text()
  self.assertIn('gameplan.actions.slice(0,3)',s)
  self.assertIn('three.slice(0,3)',s)
 def test_no_storage_writes(self):
  s=(R/'docs/coach-prep-v3518.js').read_text()
  self.assertNotIn('localStorage.setItem',s)
  self.assertNotIn('indexedDB.open',s)
 def test_source_caveat(self):
  s=(R/'docs/coach-prep-v3518.js').read_text()
  self.assertIn('Originalkapitel sind im derzeitigen Analyse-JSON nicht vollständig hinterlegt',s)
 def test_wrong_side_guard(self):
  s=(R/'docs/coach-prep-v3518.js').read_text()
  self.assertIn('Do not associate offensive shooting with defensive three-point closeouts',s)
if __name__=='__main__':unittest.main()
