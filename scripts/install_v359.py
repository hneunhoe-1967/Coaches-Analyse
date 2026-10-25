#!/usr/bin/env python3
"""Minimal, idempotent patch for Coaches-Analyse 3.5.9."""
from pathlib import Path

root=Path(__file__).resolve().parent.parent
html=root/'docs/index.html'
goals=root/'docs/coachziele-v357.js'

def patch_goals(source):
    if 'COACHES_V359_RESET' in source:
        return source
    before='<button type="button" id="cz357-save">Diese drei Ziele speichern</button></div>'
    after='<button type="button" id="cz357-save">Diese drei Ziele speichern</button><button type="button" id="cz359-reset">Ziele und Szenario zurücksetzen</button></div>'
    if source.count(before)!=1: raise RuntimeError('Unbekannter Coach-Ziele-Code: Reset-Schaltfläche nicht sicher einfügbar.')
    source=source.replace(before,after)
    anchor=" el('cz357-save').addEventListener('click',()=>{"
    if source.count(anchor)!=1: raise RuntimeError('Speicherfunktion der Coach-Ziele nicht gefunden.')
    # Preserve current pair selection, cached imported data, and baseline forecast.
    addition=''' // COACHES_V359_RESET: Clear only the current matchup's goal storage and its derived scenario.
 el('cz359-reset').addEventListener('click',()=>{
  const wasSaved=!!persisted(c.key);
  if(wasSaved && !window.confirm('Die gespeicherten Coach-Ziele und das berechnete Szenario für diese Paarung zurücksetzen?'))return;
  try{localStorage.removeItem(c.key);}catch{el('cz357-status').textContent='Zurücksetzen nicht möglich: Browser-Speicher nicht verfügbar.';return;}
  draft=recommend(c.a,c.b).map(item=>({id:item.id,target:''}));
  render();
  el('cz357-status').textContent='Coach-Ziele und Szenario zurückgesetzt. Bitte drei neue Zielwerte festlegen und speichern.';
  if(root.CoachSzenario358 && typeof root.CoachSzenario358.render==='function')root.CoachSzenario358.render();
 });
'''
    return source.replace(anchor,addition+anchor)

def patch_html(source):
    if 'logout-v359.js' in source: return source
    tag='</body>'
    if source.count(tag)!=1:raise RuntimeError('HTML-Ende nicht eindeutig.')
    return source.replace(tag,'<link rel="stylesheet" href="logout-v359.css">\n<script src="logout-v359.js"></script>\n</body>')

def main():
    if not html.is_file() or not goals.is_file():
        raise SystemExit('Bitte zuerst im entpackten Repository-Root installieren.')
    oldh=html.read_text(encoding='utf-8');oldg=goals.read_text(encoding='utf-8')
    newh=patch_html(oldh);newg=patch_goals(oldg)
    # validate both before either write
    assert 'cz359-reset' in newg and 'logout-v359.js' in newh
    html.write_text(newh,encoding='utf-8');goals.write_text(newg,encoding='utf-8')
    print('Version 3.5.9 installiert: Coach-Ziele/Szenario zurücksetzen + Abmelden im Kopfbereich.')
    print('IndexedDB-Statistiken und CSV-Import sind unverändert.')
if __name__=='__main__':main()
