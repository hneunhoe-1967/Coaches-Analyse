#!/usr/bin/env python3
"""Install Coaches-Analyse 3.5.15 safely without touching imported browser data."""
from pathlib import Path
import shutil

ROOT=Path(__file__).resolve().parents[1]
DOCS=ROOT/'docs'
index=DOCS/'index.html'
pdf=DOCS/'pdf-export-v3512.js'
if not index.exists() or not pdf.exists():
    raise SystemExit('Fehler: Bitte aus dem Repository-Hauptordner installieren.')
html=index.read_text(encoding='utf-8')
if '<script src="game-analysis-v3514.js"></script>' not in html:
    raise SystemExit('Fehler: Version 3.5.14 fehlt im index.html. Keine Änderungen durchgeführt.')
js=pdf.read_text(encoding='utf-8')
if 'function cloneContent(element, keepContainer=false)' not in js:
    raise SystemExit('Fehler: PDF-Exporter nicht kompatibel. Keine Änderungen durchgeführt.')
if 'GA3515_FORCE_DETAILS_OPEN' not in js:
    old="    clone.querySelectorAll('button,script,input,select,textarea').forEach(x=>x.remove());"
    new="    /* GA3515_FORCE_DETAILS_OPEN: PDF enthält auch eingeklappte Aufgaben. */\n    clone.querySelectorAll('#ga14-report details').forEach(x=>x.open=true);\n"+old
    if old not in js:raise SystemExit('PDF-Exporter: Einfügeposition nicht gefunden.')
    js=js.replace(old,new,1)
if 'GA3515_PDF_STYLE' not in js:
    old='      @page { size: A4; margin: 13mm; }'
    new='''      /* GA3515_PDF_STYLE */
      .ga15-report {border:1px solid #ccd8e4;border-radius:9px;padding:14px;margin-top:20px;}
      .ga15-report h2 {margin:0 0 10px;}
      .ga15-main,.ga15-sub {display:block;border:1px solid #dae3ec;border-radius:6px;margin:8px 0;padding:6px 10px;break-inside:auto;}
      .ga15-main>summary,.ga15-sub>summary {display:block!important;font-size:14px;font-weight:bold;background:#eaf0f6;padding:5px 6px;break-after:avoid-page;}
      .ga15-sub>summary{background:#f3f6f9;font-size:12px;}
      .ga15-content{display:block;padding:7px 6px;}
      .ga15-tasks{padding-left:20px;}.ga15-task{margin:8px 0;break-inside:avoid-page;}
      .ga15-source{display:block;font-size:10px;color:#586f82;}
      .ga15-evidence,.ga15-measure,.ga15-note{font-size:11px;color:#556a7d;}
      .ga15-report details[open]>*:not(summary){display:block;}
      '''+old
    if old not in js:raise SystemExit('PDF-Exporter: CSS-Einfügeposition nicht gefunden.')
    js=js.replace(old,new,1)
marker='<script src="game-analysis-v3514.js"></script>'
addition='''<link rel="stylesheet" href="game-analysis-v3515-view.css">
<script src="game-analysis-v3515-view.js"></script>'''
if 'game-analysis-v3515-view.js' not in html:
    html=html.replace(marker,marker+'\n'+addition,1)
index.write_text(html,encoding='utf-8')
pdf.write_text(js,encoding='utf-8')
print('OK: Version 3.5.15 – zwei aufklappbare Reportbereiche eingebunden.')
print('OK: Spielanalysen bleiben im Browser unverändert gespeichert; keine Datenmigration.')
print('OK: PDF-Export öffnet beim Druck automatisch alle Aufgaben.')
