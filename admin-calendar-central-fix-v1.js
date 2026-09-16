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

// Completa il menu mobile con le due funzioni Campo già disponibili su desktop.
function aggiungiFunzioniCampoMobile(){
  const nav=document.querySelector('.mobile-nav');
  if(!nav)return;
  if(nav.querySelector('[data-mobile-field="tabellone"]'))return;

  const logout=nav.querySelector('button[onclick="logoutAdmin()"]');
  const tabellone=document.createElement('button');
  tabellone.type='button';
  tabellone.dataset.mobileField='tabellone';
  tabellone.textContent='🏟️ Tabellone';
  tabellone.addEventListener('click',()=>{
    document.getElementById('mobileOverlay')?.classList.remove('open');
    const s=window.adminState||{};
    const t=(s.tornei||[]).find(x=>String(x.id)===String(s.torneoSelezionato));
    if(t&&typeof window.apriBoveConTorneo==='function'){
      window.apriBoveConTorneo(t.id);
    }else{
      alert('Seleziona prima un torneo');
    }
  });

  const calendario=document.createElement('button');
  calendario.type='button';
  calendario.dataset.mobileField='calendario';
  calendario.textContent='📅 Calendario';
  calendario.addEventListener('click',()=>{
    document.getElementById('mobileOverlay')?.classList.remove('open');
    if(typeof window.openAdminCalendar==='function'){
      window.openAdminCalendar();
    }
  });

  if(logout){
    nav.insertBefore(tabellone,logout);
    nav.insertBefore(calendario,logout);
  }else{
    nav.appendChild(tabellone);
    nav.appendChild(calendario);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',aggiungiFunzioniCampoMobile,{once:true});
}else{
  aggiungiFunzioniCampoMobile();
}
})();
