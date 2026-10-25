import unittest
from pathlib import Path
class Tests(unittest.TestCase):
 def test_core(self):
  s=Path('docs/index.html').read_text('utf8')
  self.assertIn('COACH352_CHECK',s)
  self.assertIn('selectedRows.map(parsePlayer)',s)
  self.assertIn('coach-v352.js',s)
 def test_report(self):
  s=Path('docs/scouting-ui.js').read_text('utf8')
  self.assertIn('COACH352_REPORT',s)
  self.assertIn('Version 3.5.2',s)
 def test_no_data_changes(self):
  self.assertNotIn('indexedDB.deleteDatabase',Path('docs/coach-v352.js').read_text('utf8'))
if __name__=='__main__':unittest.main()
