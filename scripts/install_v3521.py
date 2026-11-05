from pathlib import Path
p=Path('docs/index.html')
s=p.read_text(encoding='utf-8')
if 'probs-table-import-v3521.js' in s:
    print('Bereits installiert');raise SystemExit(0)
needle='<script src="probs-table-import-v3521.js"></script>'
html='''<section id="probs-table-import-v3521" style="margin:1.5rem 0;padding:1.25rem;border:1px solid #59768f;border-radius:12px">
<h3>ProB Süd · Tabelle aktualisieren (Stand 01.11.2026)</h3>
<p>Nur Tabelle mit Siegen, Niederlagen und Rangfolge aktualisieren. Keine Spieler-, Teamstatistik- oder Spielplanänderungen. Vorher vollständigen Datenbestand exportieren.</p>
<label>Tabellen-JSON <input type="file" accept=".json,application/json"></label>
<button type="button" data-action="check">15 Tabellenzeilen prüfen</button>
<pre data-role="preview" style="white-space:pre-wrap;max-height:18rem;overflow:auto"></pre>
<label><input type="checkbox" data-role="agree"> Ich habe den Tabellenstand 01.11.2026 und die 15 Mannschaften kontrolliert.</label>
<button type="button" data-action="save" disabled>Geprüfte Tabelle lokal speichern</button>
<p role="status" aria-live="polite" data-role="status"></p>
</section>'''
# Insert near existing import UI as standalone section within data area, before admin-info.
anchor='<p id="admin-info"'
if anchor not in s:raise ValueError('Einfügestelle nicht gefunden')
s=s.replace(anchor,html+'\n'+anchor,1)
s=s.replace('</body>',needle+'\n</body>',1)
p.write_text(s,encoding='utf-8')
print('Installiert: Importfeld und JavaScript. Keine Daten überschrieben.')
