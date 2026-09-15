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
function selected(){
  const s=window.adminState||{};
  return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null;
}
function installGuard(name){
  const original=window[name];
  if(typeof original!=='function'||original.__archiveGuard)return;
  const wrapped=function(){
    const t=selected();
    if(t&&String(t.stato||'').trim().toLowerCase()==='archiviato'){
      alert('Un torneo archiviato non può essere modificato o ripubblicato.');
      return false;
    }
    return original.apply(this,arguments);
  };
  wrapped.__archiveGuard=true;
  window[name]=wrapped;
}
function install(){
  hideArchivedFromSelector();
  installGuard('pubblicaTorneo');
  installGuard('chiudiIscrizioniTorneo');
  const root=document.getElementById('appContent');
  if(root&&!root.__archivedSelectorObserver){
    const observer=new MutationObserver(()=>{
      hideArchivedFromSelector();
      installGuard('pubblicaTorneo');
      installGuard('chiudiIscrizioniTorneo');
    });
    observer.observe(root,{childList:true,subtree:true});
    root.__archivedSelectorObserver=observer;
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
setTimeout(install,100);
setTimeout(install,500);
})();
