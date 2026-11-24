import pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class TeamDetailTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.js=(ROOT/'docs/team-detail-v3524.js').read_text()
        cls.css=(ROOT/'docs/team-detail-v3524.css').read_text()
        cls.index=(ROOT/'docs/index.html').read_text()
    def test_loaded_script(self):
        self.assertIn('<script src="team-detail-v3524.js"></script>',self.index)
    def test_direct_binding(self):
        self.assertIn('bindRows();\n})();',self.js)
    def test_event_delegation(self):
        self.assertIn("rootTable.addEventListener('click'",self.js)
    def test_observer(self):
        self.assertIn('new MutationObserver',self.js)
    def test_full_width(self):
        self.assertIn('grid-column:1/-1',self.css)
    def test_no_local_storage_mutation(self):
        self.assertNotIn('localPut(',self.js)
if __name__=='__main__':unittest.main()
