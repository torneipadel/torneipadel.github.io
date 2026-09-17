(()=>{
'use strict';

function removeLegacyArchiveAction(){
  document.getElementById('adminArchiveOpen')?.remove();
}

function filterArchivedFromMainSelector(){
  const state=window.adminState||{};
  const selected=(state.tornei||[]).find(t=>String(t.id)===String(state.torneoSelezionato));
  if(String(selected?.stato||'').trim().toLowerCase()==='archiviato'){
    state.torneoSelezionato=null;
    const select=document.getElementById('torneoSelector');
    if(select)select.value='';
  }

  const select=document.getElementById('torneoSelector');
  if(!select)return;

  [...select.options].forEach(option=>{
    if(!option.value)return;
    const torneo=(state.tornei||[]).find(t=>String(t.id)===String(option.value));
    if(String(torneo?.stato||'').trim().toLowerCase()==='archiviato')option.remove();
  });
}

function bindArchiveDelegation(){
  if(window.__archiveDelegationBound)return;
  window.__archiveDelegationBound=true;

  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('#sideArchivioTornei, #mobileArchivioTornei');
    if(!button)return;
    if(button.id==='mobileArchivioTornei'){
      document.getElementById('mobileOverlay')?.classList.remove('open');
    }
    if(typeof window.renderArchivePanel==='function'){
      event.preventDefault();
      window.renderArchivePanel();
    }
  });
}

function refresh(){
  removeLegacyArchiveAction();
  filterArchivedFromMainSelector();
  bindArchiveDelegation();
}

function boot(){
  refresh();
  window.addEventListener('admin:render',()=>requestAnimationFrame(refresh));
  window.addEventListener('admin:rendered',()=>requestAnimationFrame(refresh));
  setTimeout(refresh,100);
  setTimeout(refresh,500);
  setTimeout(refresh,1200);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
