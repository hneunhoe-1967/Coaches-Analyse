import unittest
from pathlib import Path
import tempfile,subprocess,shutil
ROOT=Path(__file__).resolve().parents[1]
class TestInstall(unittest.TestCase):
 def test_js_exists(self):
  self.assertTrue((ROOT/'docs/data-audit-v36.js').exists())
 def test_source_protects(self):
  s=(ROOT/'scripts/install_v36.py').read_text()
  self.assertIn('async function syncDataset()',s)
  self.assertIn('KEINE lokalen Daten ersetzt',s)
  self.assertIn('data-audit-v36.js',s)
 def test_no_automatic_data_mutation_in_audit(self):
  s=(ROOT/'docs/data-audit-v36.js').read_text()
  self.assertIn("localGet('dataset')",s)
  self.assertNotIn("localPut(",s)
 def test_install_idempotent_on_fixture(self):
  with tempfile.TemporaryDirectory() as tmp:
   x=Path(tmp);(x/'docs').mkdir();(x/'scripts').mkdir()
   for f in ('data-audit-v36.js','data-audit-v36.css'):
    shutil.copy2(ROOT/'docs'/f,x/'docs'/f)
   shutil.copy2(ROOT/'scripts/install_v36.py',x/'scripts/install_v36.py')
   (x/'docs'/'index.html').write_text('''<p id="datenstand">test</p><button id="refresh" class="refresh" type="button" disabled>Aktualisieren</button><button>Veröffentlichte Daten prüfen &amp; lokal aktualisieren</button><script>
async function syncDataset(){
 await localPut('dataset',d);
}
window.coachesLocalSync=syncDataset;
</script>
<script src="team-detail-v3524.js"></script></body>''')
   for _ in range(2):
    r=subprocess.run(['python',str(x/'scripts/install_v36.py')],capture_output=True,text=True)
    self.assertEqual(r.returncode,0,r.stderr)
   result=(x/'docs/index.html').read_text()
   self.assertEqual(result.count('data-audit-v36.js'),1)
   self.assertNotIn("await localPut('dataset',d)",result)
   self.assertIn('KEINE lokalen Daten ersetzt',result)
 def test_static_import_guards(self):
  script=(ROOT/'scripts/install_v36.py').read_text()
  self.assertIn("team-detail-v3524.js",script)
  self.assertNotIn("unlink(",script)
if __name__=='__main__':unittest.main()
