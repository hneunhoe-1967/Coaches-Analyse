'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('docs/coach-v352.js','utf8');
assert(!src.includes("'langen':['savion brown'"),'Falsche feste Langen-Liste noch vorhanden');
assert(!src.includes("'reutlingen':['noah kamdem'"),'Falsche feste Reutlingen-Liste noch vorhanden');
let listeners={};
const ctx={window:{addEventListener:(e,f)=>{listeners[e]=f}},document:{readyState:'loading',addEventListener:(e,f)=>{listeners[e]=f}},console};
vm.createContext(ctx);vm.runInContext(src,ctx);
const validate=ctx.window.Coach352.validate;
function r(n){return [1,n.replace(' ','|'),'',4,'10:00',1,2,1,2,1,2,6,0,0,1,1,1,0,0,0,6,0]}
const teams={482:{n:'TV Langen'},559:{n:'BBC Coburg'},591:{n:'TSG Schöller SI Ravens Reutlingen'}};
const spieler={482:['Noah Kamdem','Cooper Creek','Carlos Hidalgo Guijo','Henk Droste','Kventin Kostan'].map(r),559:['Savion Brown','Nico Wenzl','Erik Neunhoeffer','Benjamin Koppke','Tim Herzog'].map(r),591:['Roy Krupnikas','Miles Mallory','Kedar Salam Wright','Kevin Simeth','David Engelhart'].map(r)};
for(const id of [482,559,591])assert.equal(validate({teams,spieler},id).valid,true,`Echter Teamkader ${id} abgelehnt`);
const mismatch={...spieler,482:spieler[591].map(x=>[...x])};assert.equal(validate({teams,spieler:mismatch},482).valid,false,'Verdoppelte Kader zweier Team-IDs nicht erkannt');
const duplicate={...spieler,482:[spieler[482][0],spieler[482][0]]};assert.equal(validate({teams,spieler:duplicate},482).valid,false,'Doppelte Spieler nicht erkannt');
console.log('OK: Langen, Coburg und Reutlingen zugeordnet; Ueberschneidung und Duplikate erkannt.');
