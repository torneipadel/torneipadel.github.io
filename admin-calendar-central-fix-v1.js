(()=>{
'use strict';
// Correzione isolata: il pulsante Calendario centrale deve usare il calendario Admin,
// senza passare dalla funzione che apre il Tabellone/Bove.
document.addEventListener('click',e=>{
  const button=e.target?.closest?.('#calendar');
  if(!button)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  if(typeof window.openAdminCalendar==='function'){
    window.openAdminCalendar();
  }
},true);
})();