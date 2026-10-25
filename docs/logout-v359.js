/* Coaches-Analyse 3.5.9 – move existing logout button without recreating or changing its handler. */
(function(){'use strict';
function init(){
 const old=document.getElementById('logout');
 const tabs=document.getElementById('h35-tabs');
 const shell=document.getElementById('app-shell');
 if(!old||!tabs||!shell)return;
 let account=document.getElementById('v359-account');
 if(!account){
  account=document.createElement('div');account.id='v359-account';account.className='v359-account';
  account.setAttribute('aria-label','Benutzerbereich');
  tabs.parentNode.insertBefore(account,tabs);
 }
 account.appendChild(old); // DOM move preserves click listener and session semantics
 old.title='Lokale Sitzung beenden – gespeicherte Statistikdaten bleiben erhalten';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
