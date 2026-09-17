(()=>{
'use strict';

function removeLegacyArchiveAction(){
  const legacy=document.getElementById('adminArchiveOpen');
  if(legacy)legacy.remove();
}

function ensureArchiveButtons(){
  const desktopNav=document.querySelector('.sidebar .nav-group:last-of-type .nav');
  if(desktopNav&&!document.getElementById('sideArchivioTornei')){
    const b=document.createElement('button');
    b.id='sideArchivioTornei';
    b.type='button';
    b.textContent='📦 Archivio Tornei';
    b.addEventListener('click',()=>window.renderArchivePanel?.());
    desktopNav.appendChild(b);
  }

  const mobileNav=document.querySelector('.mobile-nav');
  if(mobileNav&&!document.getElementById('mobileArchivioTornei')){
    const b=document.createElement('button');
    b.type='button';
    b.id='mobileArchivioTornei';
    b.textContent='📦 Archivio Tornei';
    b.addEventListener('click',()=>{
      document.getElementById('mobileOverlay')?.classList.remove('open');
      window.renderArchivePanel?.();
    });
    const logout=mobileNav.querySelector('[onclick*="logoutAdmin"]');
    if(logout)mobileNav.insertBefore(b,logout);else mobileNav.appendChild(b);
  }
}

function refreshArchiveState(){
  removeLegacyArchiveAction();
  ensureArchiveButtons();
  const selector=document.getElementById('torneoSelector');
  const tornei=window.adminState?.tornei||[];
  if(!selector)return;
  [...selector.options].forEach(option=>{
    if(!option.value)return;
    const torneo=tornei.find(t=>String(t.id)===String(option.value));
    if(String(torneo?.stato||'').trim().toLowerCase()==='archiviato')option.remove();
  });
  const selected=tornei.find(t=>String(t.id)===String(selector.value));
  if(String(selected?.stato||'').trim().toLowerCase()==='archiviato'){
    selector.value='';
    if(window.adminState)window.adminState.torneoSelezionato=null;
  }
}

function boot(){
  refreshArchiveState();
  window.addEventListener('admin:render',()=>{
    setTimeout(refreshArchiveState,0);
    setTimeout(refreshArchiveState,50);
    setTimeout(refreshArchiveState,150);
  });
  const observer=new MutationObserver(()=>ensureArchiveButtons());
  observer.observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
