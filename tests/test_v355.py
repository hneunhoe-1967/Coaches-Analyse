import unittest
from pathlib import Path
class BulkTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.root=Path(__file__).resolve().parent.parent
  cls.html=(cls.root/'docs/index.html').read_text()
  cls.parser=(cls.root/'docs/csv-import.js').read_text()
 def test_bulk_ui(self):
  for i in ['bulk-files','bulk-date','bulk-rows','bulk-check','bulk-save','bulk-overwrite','bulk-confirm']:
   self.assertIn('id="'+i+'"',self.html)
 def test_script_order(self):
  self.assertLess(self.html.index('<script src="csv-import.js"></script>'),self.html.index('<script src="bulk-import-v355.js"></script>'))
  self.assertIn('COACHES_BULK_355_BEGIN',self.html)
 def test_all_team_ids(self):
  self.assertIn('Number.isInteger(id)||id<=0',self.parser)
  self.assertNotIn('[482,559,591].includes(id)',self.parser)
 def test_save_guards(self):
  js=(self.root/'docs/bulk-inline-v355.txt').read_text()
  for token in ['new Set(ids).size!==ids.length','validateDataset(staged)','validateDataset(update)','await localPut(\'dataset\',update)','!overwrite.checked','!agree.checked']:
   self.assertIn(token,js)
if __name__=='__main__':unittest.main()
