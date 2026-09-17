// VERIFICA TEMPORANEA - NON MODIFICA BOVE.HTML
(function(){
  console.log('=== VERIFICA KO CAMPI/TEMPI ===');
  console.log('renderMatchCard:', typeof window.renderMatchCard);
  console.log('renderKO:', typeof window.renderKO);
  console.log('salvaKOInfo:', typeof window.salvaKOInfo);
  console.log('state.sCamp:', window.state && window.state.sCamp);
  console.log('state.sTime:', window.state && window.state.sTime);
  console.log('state.fCamp:', window.state && window.state.fCamp);
  console.log('state.fTime:', window.state && window.state.fTime);
  console.log('match cards:', document.querySelectorAll('.match-card').length);
  console.log('KO inputs campo:', document.querySelectorAll('[data-ko-campo]').length);
  console.log('KO inputs ora:', document.querySelectorAll('[data-ko-time]').length);
  console.log('=== FINE VERIFICA ===');
})();
