import unittest
from pathlib import Path
import tempfile, shutil, subprocess
ROOT=Path(__file__).resolve().parents[1]
class TestInstall(unittest.TestCase):
 def test_assets(self):
  js=(ROOT/'docs/team-detail-v3523.js').read_text()
  for marker in ['playerPoints','teamstatGegner','avgMin','originalRenderTable','Offizielle Kader- und Statistikseite','aria-expanded','teamstatStand','kaderStand']:
   self.assertIn(marker,js)
 def test_syntax(self):
  result=subprocess.run(['node','--check',str(ROOT/'docs/team-detail-v3523.js')],capture_output=True,text=True)
  self.assertEqual(result.returncode,0,result.stderr)
 def test_idempotent_install(self):
  with tempfile.TemporaryDirectory() as tmp:
   repo=Path(tmp);(repo/'docs').mkdir();(repo/'scripts').mkdir()
   (repo/'docs/index.html').write_text('<script src="fixes-v3520.js"></script>\n<script src="probs-table-import-v3522.js"></script>\n</body>',encoding='utf8')
   for f in ['team-detail-v3523.js','team-detail-v3523.css']:shutil.copy(ROOT/'docs'/f,repo/'docs'/f)
   shutil.copy(ROOT/'scripts/install_v3523.py',repo/'scripts/install_v3523.py')
   for _ in range(2):subprocess.run(['python',str(repo/'scripts/install_v3523.py')],check=True,capture_output=True)
   s=(repo/'docs/index.html').read_text()
   self.assertEqual(s.count('team-detail-v3523.js'),1)
   self.assertLess(s.index('probs-table-import-v3522.js'),s.index('team-detail-v3523.js'))
 def test_no_data_replacement(self):
  code=(ROOT/'docs/team-detail-v3523.js').read_text()
  self.assertNotIn("localPut(",code)
  self.assertNotIn("fetch(",code)
if __name__=='__main__':unittest.main()
