import pathlib, unittest, sys
ROOT=pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'scripts'))
from install_v359 import patch_html, patch_goals
class UpdateTests(unittest.TestCase):
 def test_html_patch(self):
  src='<body><button id="logout">Abmelden</button></body>'
  self.assertIn('logout-v359.js',patch_html(src))
 def test_html_idempotent(self):
  src='<body></body>';self.assertEqual(patch_html(patch_html(src)),patch_html(src))
 def test_goals_reset_insertion(self):
  src='<button type="button" id="cz357-save">Diese drei Ziele speichern</button></div>\n el(\'cz357-save\').addEventListener(\'click\',()=>{'
  s=patch_goals(src)
  self.assertIn('localStorage.removeItem(c.key)',s)
  self.assertIn("root.CoachSzenario358.render()",s)
  self.assertIn("target:''",s)
 def test_goals_idempotent(self):
  src='<button type="button" id="cz357-save">Diese drei Ziele speichern</button></div>\n el(\'cz357-save\').addEventListener(\'click\',()=>{'
  self.assertEqual(patch_goals(patch_goals(src)),patch_goals(src))
 def test_no_database_deletion(self):
  js=(ROOT/'docs/logout-v359.js').read_text()
  self.assertNotIn('indexedDB.deleteDatabase',js)
  self.assertNotIn('localStorage.clear',js)
if __name__=='__main__': unittest.main()
