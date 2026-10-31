#!/usr/bin/env python3
"""Version 3.5.13: fix print-only comparison CSS, no changes to stored data."""
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
js_path = BASE / 'docs' / 'pdf-export-v3512.js'
css_path = BASE / 'docs' / 'pdf-compare-v3513.css'
assert js_path.is_file(), 'Bitte zuerst die funktionierende Version 3.5.12 installieren.'
assert css_path.is_file(), 'Fehlend: docs/pdf-compare-v3513.css'
source = js_path.read_text(encoding='utf-8')
css = css_path.read_text(encoding='utf-8')
marker = '      @media print { body {padding:0;}'
block = '      /* COACH_PDF_V3513_COMPARE_LAYOUT */\n' + '\n'.join('      '+x for x in css.splitlines()) + '\n'
if 'COACH_PDF_V3513_COMPARE_LAYOUT' not in source:
    assert source.count(marker) == 1, 'PDF-Exporter von 3.5.12 wurde verändert. Einbau sicherheitshalber abgebrochen.'
    source = source.replace(marker, block + marker, 1)
    source = source.replace('PDF-Vorschau · Version 3.5.12', 'PDF-Vorschau · Version 3.5.13')
    source = source.replace('Henriks Analyse-App für Coaches · Version 3.5.12', 'Henriks Analyse-App für Coaches · Version 3.5.13')
    js_path.write_text(source, encoding='utf-8')
    print('OK: Vergleichsdruck nutzt dreispaltige App-Darstellung, Balken und Siegerfarben.')
else:
    print('OK: PDF-Vergleichslayout 3.5.13 bereits installiert.')
print('OK: Statistikdaten, Report-Inhalte, Coach-Ziele und Berechnungen unverändert.')
