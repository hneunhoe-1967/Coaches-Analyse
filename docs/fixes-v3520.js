/* Coaches-Analyse 3.5.20: CSV-Minuten korrekt darstellen; alte Liga-Tabelle klar kennzeichnen. */
(function(){
  'use strict';
  // Die bisherigen lokalen CSV-Importe speichern in Spalte 3 die bereits
  // berechnete durchschnittliche Einsatzzeit, während die Originaldaten
  // die gesamte Einsatzzeit enthalten. Nur lokale CSV-Kader umrechnen.
  function csvAverageMinutes(){
    const team=TEAMS && TEAMS[state.opp];
    return !!(team && typeof team.importQuelle==='string' && team.importQuelle.startsWith('Manueller CSV-Export:'));
  }
  function minutesPerGame(player){
    return csvAverageMinutes()?player.mins:player.mins/player.g;
  }
  if(typeof CATS!=='undefined' && Array.isArray(CATS)){
    const minuteCategory=CATS.find(c=>c.t==='Minuten');
    if(minuteCategory)minuteCategory.v=minutesPerGame;
    for(const c of CATS){
      if(c.t==='Steals'||c.t==='Blocks'){
        c.d=p=>`${f1(minutesPerGame(p))} Minuten`;
      }
    }
  }
  // Die Teamstatistik (teamstat) wurde auf 6–7 Spiele gebracht, aber die
  // Tabelle (ligen.probs.table) und Spielresultate nicht. Keine Rangliste
  // aus kumulierten Punktzahlen ableiten; den tatsächlichen Stand zeigen.
  const oldRenderTable=renderTable;
  renderTable=function(){
    oldRenderTable();
    if(state.league!=='probs')return;
    const league=LEAGUES.probs;
    const tableGames=league.table.map(r=>Number(r[1]));
    const mismatched=league.table.filter(r=>Number(TS[r[0]]?.[0])>Number(r[1])).length;
    if(!mismatched)return;
    $('h-table').textContent='Tabelle ProB Süd · alter Stand';
    const foot=$('table-foot');
    foot.textContent=(league.note?league.note+' ':'')+'Tabelle vom '+league.tableStand+' (veraltet; '+mismatched+' von '+tableGames.length+' Mannschaften haben inzwischen neuere Teamstatistiken). Tabellenplätze, Siege/Niederlagen und Spielvorschau können vom aktuellen Spielstand abweichen. Die aktualisierten 6–7 Teamspiele werden ausschließlich in Vergleich, Report und Coach-Auswertung verwendet.';
    foot.style.fontWeight='600';
  };
})();
