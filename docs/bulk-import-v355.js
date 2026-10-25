/* UI helper: explicit multi-file team selection, no guessing from filenames. */
(function(){
'use strict';
window.CoachesBulkUI = {
  escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));},
  options(teams,selected){return '<option value="">Mannschaft ausdrücklich auswählen</option>'+teams.map(t=>'<option value="'+this.escape(t.id)+'"'+(String(selected)===String(t.id)?' selected':'')+'>'+this.escape(t.name)+'</option>').join('');}
};
})();
