const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../docs/csv-import.js'),'utf8'),sandbox);
const csv=['Spieler;Trikot-Nr;Minuten;2P-A-R;3P-A-R;FG-A-R;FT-A-R;Punkte;Assists;Rbounds-O-D-T;Fouls;Blocks;Steals;Turnover;Effektivität;PM','#7 Test Spieler;4;65:51:00;Okt 14;0 - 0;Okt 14;02. Aug;22;5;08.02.2010;9;3;3;3;50;-5'].join('\n');
let x=sandbox.window.CoachesCSV.parse(csv,591,'manuell von der offiziellen Webseite','2026-10-24');
assert.equal(x.patch.spieler.length,1);assert.deepEqual(Array.from(x.patch.spieler[0]).slice(5,12),[10,14,0,0,2,8,22]);assert.equal(x.patch.spieler[0][15],10);
assert.equal(x.patch.spieler[0][21],-5);
assert.throws(()=>sandbox.window.CoachesCSV.parse(csv.replace(';22;5;',';23;5;'),591,'manuell von der offiziellen Webseite','2026-10-24'),/Punkte/);
assert.throws(()=>sandbox.window.CoachesCSV.parse(csv,999,'manuell von der offiziellen Webseite','2026-10-24'),/Team/);
console.log('CSV-Import: 4 Assertions erfolgreich');
