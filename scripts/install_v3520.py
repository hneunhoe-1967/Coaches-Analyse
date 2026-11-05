from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
p=root/'docs/index.html'
s=p.read_text(encoding='utf-8')
tag='<script src="fixes-v3520.js"></script>'
if tag not in s:
    assert '</body>' in s, 'Ende der HTML-Seite fehlt'
    s=s.replace('</body>',tag+'\n</body>',1)
    p.write_text(s,encoding='utf-8')
# Ältere Versions-README-Dateien in einen separaten Explorer-Ordner verschieben.
# Haupt-README sowie aktuelle README-VERSION-3.5.20 bleiben im Root.
archive=root/'archive/version-readmes'
files=[f for f in root.iterdir() if f.is_file() and (f.name.startswith('README-VERSION-') or f.name.startswith('README-3.')) and f.name!='README-VERSION-3.5.20.txt']
if files:
    archive.mkdir(parents=True,exist_ok=True)
    for f in files:
        target=archive/f.name
        if target.exists():
            if target.read_bytes()==f.read_bytes(): f.unlink();continue
            raise RuntimeError('Namenskonflikt beim Archivieren: '+f.name)
        shutil.move(str(f),str(target))
print('Version 3.5.20 installiert. Alte Versions-README-Dateien archiviert:',len(files))
