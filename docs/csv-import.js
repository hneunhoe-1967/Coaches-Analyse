/* Coaches-Analyse 3.1 – offline CSV converter. No network access. */
(function(){
'use strict';
const MONTHS={jan:1,feb:2,mrz:3,'mär':3,apr:4,mai:5,jun:6,jul:7,aug:8,sep:9,okt:10,nov:11,dez:12};
function num(x){const v=Number(String(x).trim().replace(',','.'));if(!Number.isFinite(v))throw Error('Ungültige Zahl: '+x);return v;}
function integer(x){const v=num(x);if(!Number.isInteger(v))throw Error('Keine ganze Zahl: '+x);return v;}
function pair(x){
 const s=String(x).trim().toLowerCase(); let m;
 if((m=s.match(/^(\d+)\s*-\s*(\d+)$/)))return [Number(m[1]),Number(m[2])];
 if((m=s.match(/^(\d{1,2})\.\s*([a-zäöü]{3})$/)) && MONTHS[m[2]])return [Number(m[1]),MONTHS[m[2]]];
 if((m=s.match(/^([a-zäöü]{3})\s*(\d{1,2})$/)) && MONTHS[m[1]])return [MONTHS[m[1]],Number(m[2])];
 if((m=s.match(/^(\d{2})\.(\d{2})\.(20\d{2})$/)))return [Number(m[1]),Number(m[2])];
 throw Error('Unbekanntes Wurfformat: '+x);
}
function triple(x){const s=String(x).trim();let m;
 if((m=s.match(/^(\d+)\s*-\s*(\d+)\s*-\s*(\d+)$/)))return [Number(m[1]),Number(m[2]),Number(m[3])];
 if((m=s.match(/^(\d{2})\.(\d{2})\.(20\d{2})$/)))return [Number(m[1]),Number(m[2]),Number(m[3])-2000];
 throw Error('Unbekanntes Reboundformat: '+x);
}
function cells(line){return line.split(';').map(s=>s.trim().replace(/^"(.*)"$/,'$1'));}
function parse(text,teamId,quelle,stand){
 const data=String(text).replace(/^\ufeff/,'').replace(/\r/g,'').split('\n').map(cells).filter(r=>r.some(x=>x));
 if(!data.length||!data[0][0].toLowerCase().startsWith('spieler')||data[0].length!==16)throw Error('CSV benötigt 16 Spalten mit „Spieler“ als erster Spalte.');
 const players=[],details=[],seen=new Set();let altered=0;
 for(let i=1;i<data.length;i++){
  const r=data[i];if(!r[0].startsWith('#'))continue;
  if(r.length!==16)throw Error('Zeile '+(i+1)+': erwartet 16 CSV-Spalten, gefunden '+r.length);
  const idm=r[0].match(/^#(\d+)\s+(.+)$/);if(!idm)throw Error('Zeile '+(i+1)+': Trikotnummer oder Name fehlt.');
  const jersey=integer(idm[1]),full=idm[2].trim();if(seen.has(jersey+'|'+full))throw Error('Doppelter Spieler: '+full);seen.add(jersey+'|'+full);
  const games=integer(r[1]);if(games<1||games>100)throw Error(full+': Spielanzahl unplausibel.');
  const min=r[2].match(/^(\d+):(\d{2})(?::\d{2})?$/);if(!min)throw Error(full+': Minutenformat ungültig: '+r[2]);
  const p2=pair(r[3]),p3=pair(r[4]),fg=pair(r[5]),ft=pair(r[6]),reb=triple(r[9]);
  const pts=integer(r[7]),ass=integer(r[8]),foul=integer(r[10]),blk=integer(r[11]),steal=integer(r[12]),turnover=integer(r[13]),eff=integer(r[14]),pm=integer(r[15]);
  if(p2[0]>p2[1]||p3[0]>p3[1]||ft[0]>ft[1]||fg[0]>fg[1])throw Error(full+': Trefferzahl größer als Versuche.');
  if(p2[0]+p3[0]!==fg[0]||p2[1]+p3[1]!==fg[1])throw Error(full+': Feldwürfe stimmen nicht mit 2P+3P überein.');
  if(2*p2[0]+3*p3[0]+ft[0]!==pts)throw Error(full+': Punkte stimmen nicht mit Treffern überein.');
  if(reb[0]+reb[1]!==reb[2])throw Error(full+': Rebound-Summe stimmt nicht.');
  if([pts,ass,reb[0],reb[1],reb[2],foul,blk,steal,turnover].some(n=>n<0))throw Error(full+': negative Zählstatistik.');
  const parts=full.split(/\s+/);const name=parts.length>1?parts[0]+'|'+parts.slice(1).join(' '):full+'|–';
  const row=[jersey,name,'–',games,Number(min[1])+':'+min[2],p2[0],p2[1],p3[0],p3[1],ft[0],ft[1],pts,ass,reb[0],reb[1],reb[2],foul,blk,steal,turnover,eff,pm];
  players.push(row);
  let conversions=[];for(const col of [3,4,5,6,9])if(/\.|[a-zäöü]/i.test(r[col])&&!r[col].includes(' - '))conversions.push(r[col]);
  altered+=conversions.length;
  details.push({name:full,spiele:games,punkte:pts,assists:ass,rebounds:reb[2],umgewandelt:conversions.join(' · ')});
 }
 if(!players.length||players.length>40)throw Error('Keine oder zu viele Spieler im CSV gefunden.');
 const id=Number(teamId);if(!Number.isInteger(id)||id<=0)throw Error('Bitte eine gültige Team-ID auswählen.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(stand)||Number.isNaN(Date.parse(stand)))throw Error('Bitte den Datenstand als YYYY-MM-DD eingeben.');
 if(!quelle||quelle.length<8)throw Error('Quellenangabe erforderlich.');
 return {patch:{format:'coaches-team-players-v1',teamId:id,quelle,stand,spieler:players},details,conversions:altered, totals:{punkte:players.reduce((a,r)=>a+r[11],0),assists:players.reduce((a,r)=>a+r[12],0)},notice:'Ursprüngliche CSV-Datumswerte wurden anhand ihrer Schreibweise und der mathematischen Statistikregeln rekonstruiert. Quelle und Saison bitte vor dem Import verifizieren.'};
}
window.CoachesCSV={parse};
})();
