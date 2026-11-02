import unittest, pathlib, subprocess, json
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Tests(unittest.TestCase):
 def test_example(self):
  x=json.loads((ROOT/'examples/bbc-coburg-vs-tv-langen-2026-11-01.json').read_text())
  self.assertEqual(x['teamId'],'559');self.assertEqual(len(x['teamTasks']),4);self.assertEqual(len(x['playerTasks']),8)
 def test_unique_players(self):
  x=json.loads((ROOT/'examples/bbc-coburg-vs-tv-langen-2026-11-01.json').read_text());self.assertEqual(len(set(t['player'] for t in x['playerTasks'])),8)
 def test_safe_storage(self):
  s=(ROOT/'docs/game-analysis-v3514.js').read_text();self.assertIn('coaches-game-analysis-v1',s);self.assertNotIn("localPut('dataset'",s)
 def test_pdf_inclusion(self):
  s=(ROOT/'docs/game-analysis-v3514.js').read_text();self.assertIn('target.appendChild(box)',s);self.assertIn('scout-content',s)
 def test_node(self):
  p=subprocess.run(['node','--check',str(ROOT/'docs/game-analysis-v3514.js')],capture_output=True,text=True);self.assertEqual(p.returncode,0,p.stderr)
 def test_idempotent_installer(self):
  s=(ROOT/'scripts/install_v3514.py').read_text();self.assertIn("if 'game-analysis-v3514.js' not in s",s)
 def test_docx_real_source_extract(self):
  source=pathlib.Path('/mnt/data/Analyse des BBC-Coburg-Boxscores gegen TV Langen.docx')
  if not source.exists():self.skipTest('Beispiel-DOCX nicht im Codespace, bereits in Erstellung geprüft')
  from docx import Document
  blocks=[{'heading':z.style.name.startswith('Heading'),'text':z.text} for z in Document(source).paragraphs]
  script="const m=require(process.argv[1]);const a=JSON.parse(require('fs').readFileSync(0,'utf8'));const x=m.blocksToTasks(a);console.log(x.teamTasks.length+' '+x.playerTasks.length);"
  p=subprocess.run(['node','-e',script,str(ROOT/'docs/game-analysis-v3514.js')],input=json.dumps(blocks),capture_output=True,text=True)
  self.assertEqual(p.returncode,0,p.stderr);self.assertEqual(p.stdout.strip(),'4 8')
if __name__=='__main__':unittest.main()
