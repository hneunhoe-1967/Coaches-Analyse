#!/usr/bin/env python3
"""Remove incorrect hard-coded club identities inserted in 3.5.3.
Preserve structural/duplicate and multi-team overlap checks from 3.5.2.
"""
from pathlib import Path
p=Path('docs/coach-v352.js')
source=p.read_text(encoding='utf-8')
start=source.find(' // 3.5.3: Known, historically observed roster conflicts.')
end=source.find(' const names=rosterNames(rows);',start)
if start>=0:
    if end<0: raise SystemExit('ABBRUCH: erwarteter Abschluss des 3.5.3-Blocks fehlt')
    block=source[start:end]
    if 'const known={' not in block or "'langen'" not in block or "'reutlingen'" not in block:
        raise SystemExit('ABBRUCH: Kader-Pruefblock entspricht nicht der bekannten Version')
    source=source[:start]+''' // 3.5.4: Teamnamen niemals durch fest codierte Spielerlisten bestimmen.
 // Der bisherige Langen-/Reutlingen-Vergleich beruhte auf vertauschten
 // Annahmen. Vertraue der Team-ID des Imports; pruefe unten weiter auf
 // doppelte Zeilen, unvollstaendige Datensaetze und erhebliche Kader-
 // Ueberschneidungen zwischen verschiedenen Team-IDs.
'''+source[end:]
    p.write_text(source,encoding='utf-8')
    print('Version 3.5.4: falsche Vereins-Zuordnung entfernt; generische Checks bleiben.')
elif '3.5.4: Teamnamen niemals' in source:
    print('Version 3.5.4 bereits installiert.')
else:
    raise SystemExit('ABBRUCH: bekannte 3.5.3-Installation nicht gefunden. Nichts veraendert.')
