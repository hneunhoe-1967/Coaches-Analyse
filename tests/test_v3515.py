import pathlib,unittest,subprocess,json
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Test3515(unittest.TestCase):
 def test_js_syntax(self):
  subprocess.run(['node','--check',str(ROOT/'docs/game-analysis-v3515-view.js')],check=True)
 def test_pdf_js_syntax(self):
  subprocess.run(['node','--check',str(ROOT/'docs/pdf-export-v3512.js')],check=True)
 def test_report_hooks(self):
  s=(ROOT/'docs/game-analysis-v3515-view.js').read_text()
  for token in ['Zusammenfassung vorliegender Spielanalysen','Analyse letztes Spiel','sortGames','groups','players','<details class=']:
   self.assertIn(token,s)
 def test_index(self):
  s=(ROOT/'docs/index.html').read_text()
  self.assertIn('game-analysis-v3515-view.js',s)
  self.assertIn('game-analysis-v3515-view.css',s)
 def test_pdf_details(self):
  self.assertIn("clone.querySelectorAll('#ga14-report details').forEach(x=>x.open=true)",(ROOT/'docs/pdf-export-v3512.js').read_text())
 def test_grouping_and_latest(self):
  js=f'''const x=require({json.dumps(str(ROOT/'docs/game-analysis-v3515-view.js'))});
const games=[{{id:'old',date:'2026-10-26',teamTasks:[{{title:'Ballverluste reduzieren',action:'Turnover verbessern'}}],playerTasks:[{{player:'Musa Abra',title:'PnR',action:'Entscheidungen trainieren'}}]}},{{id:'new',date:'2026-11-01',teamTasks:[{{title:'Ballkontrolle verbessern',action:'Ballverluste reduzieren'}}],playerTasks:[{{player:'Musa Abra',title:'Effizienz',action:'Wurfauswahl trainieren'}}]}}];
if(x.sortGames(games)[0].id!=='new')throw Error('latest sorting');
if(x.groups(games)[0].games.size!==2)throw Error('team occurrences');
if(x.players(games)[0].games.size!==2)throw Error('player occurrences');
'''
  subprocess.run(['node','-e',js],check=True)
if __name__=='__main__':unittest.main()
