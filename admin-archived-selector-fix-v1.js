(()=>{
'use strict';
function hideArchivedFromSelector(){
  const selector=document.getElementById('torneoSelector');
  if(!selector)return;
  selector.querySelectorAll('option[value]').forEach(option=>{
    const id=String(option.value);
    const tournaments=window.adminState?.tornei||[];
    const torneo=tournaments.find(t=>String(t.id)===id);
    if(torneo&&String(torneo.stato||'').trim().toLowerCase()==='archiviato'){
      option.remove();
    }
  });
}
function install(){
  hideArchivedFromSelector();
  const root=document.getElementById('appContent');
  if(root&&!root.__archivedSelectorObserver){
    const observer=new MutationObserver(hideArchivedFromSelector);
    observer.observe(root,{childList:true,subtree:true});
    root.__archivedSelectorObserver=observer;
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
