from pathlib import Path
root=Path(__file__).resolve().parents[1]
index=root/'docs'/'index.html'
s=index.read_text(encoding='utf-8')
marker='<!-- COACHES_TEAMSTAT_V3519 -->'
card='''<!-- COACHES_TEAMSTAT_V3519 -->
<div class="csv-import-box" id="teamstat-v3519" style="margin-top:1rem">
<h3>ProB Süd · Teamstatistik-Sammelimport (15 Mannschaften)</h3>
<p>Aktualisiert ausschließlich Teamstatistiken und speichert die gegnerischen Summen separat. Spielerstatistiken, Spielanalysen und Coach-Ziele bleiben unverändert. Zuvor vollständigen Datenbestand als JSON sichern.</p>
<div class="bulk-controls"><label>Teamstatistik-JSON <input type="file" id="teamstat-file-v3519" accept=".json,application/json"></label><button type="button" id="teamstat-check-v3519">15 Teamstatistiken prüfen</button></div>
<div id="teamstat-preview-v3519" hidden></div>
<label class="bulk-check"><input type="checkbox" id="teamstat-confirm-v3519"> Ich habe alle Ergebnisse und die 11 nicht zuordenbaren Ludwigsburger Spielerpunkte geprüft und möchte die 15 Teamstatistiken lokal aktualisieren.</label>
<div class="bulk-controls"><button id="teamstat-save-v3519" type="button" disabled>Geprüfte Teamstatistiken lokal speichern</button><span id="teamstat-result-v3519" role="status" aria-live="polite"></span></div>
<p><small>Die globale Tabelle, Spieler-, Kader- und Scouting-Analysedaten werden nicht überschrieben. Die Gegnerwerte werden zunächst nur für künftige Erweiterungen gespeichert.</small></p>
</div>
'''
anchor='<div class="csv-import-box" id="bulk-import-box">'
if marker not in s:
 assert s.count(anchor)==1,'Sammelimport-Anker nicht eindeutig'
 s=s.replace(anchor,card+anchor,1)
script='<script src="teamstat-import-v3519.js"></script>'
if script not in s:
 assert '</body>' in s
 s=s.replace('</body>',script+'\n</body>',1)
index.write_text(s,encoding='utf-8')
print('OK: Version 3.5.19, getrennter Teamstatistik-Import eingebunden. Datenbank wird durch die Installation nicht verändert.')
