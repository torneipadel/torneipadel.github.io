(()=>{
'use strict';

function removeLegacyArchiveAction(){
  const legacy=document.getElementById('adminArchiveOpen');
  if(legacy)legacy.remove();
}

function refreshArchiveState(){
  removeLegacyArchiveAction();
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
  removeLegacyArchiveAction();
  refreshArchiveState();
  window.addEventListener('admin:render',()=>{
    setTimeout(refreshArchiveState,0);
    setTimeout(refreshArchiveState,50);
    setTimeout(refreshArchiveState,150);
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
