(function(){
'use strict';
/*
 * Il dashboard principale ora gestisce direttamente il flusso del torneo.
 * Questo modulo resta caricato per compatibilità con eventuali richiami
 * esistenti, ma non inserisce più la vecchia scheda duplicata
 * "Comunicazioni e creazione".
 */
function addAdminHomeActions(){
  return;
}
function start(){
  addAdminHomeActions();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
