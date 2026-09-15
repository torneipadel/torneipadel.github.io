(()=>{
'use strict';
function hideArchivedFromSelector(){
  const selector=document.getElementById('torneoSelector');
  if(!selector)return;
  selector.querySelectorAll('option[value]').forEach(option=>{
    const id=String(option.value);
    const tournaments=window.adminState?.tornei||[];
    const torneo=tournaments.find(t=>String(t.id)===id);
    if(torneo&&String(torneo.stato||'').trim().toLowerCase()==='archiviato')option.remove();
  });
}
function selected(){
  const s=window.adminState||{};
  return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null;
}
function isArchived(t){
  return !!t&&String(t.stato||'').trim().toLowerCase()==='archiviato';
}
function clearArchivedSelection(){
  const t=selected();
  if(!isArchived(t))return;
  const s=window.adminState||{};
  s.torneoSelezionato=null;
  window.adminState=s;
  try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){}
  const selector=document.getElementById('torneoSelector');
  if(selector){
    selector.value='';
    selector.dispatchEvent(new Event('change',{bubbles:true}));
  }
}
function installGuard(name){
  const original=window[name];
  if(typeof original!=='function'||original.__archiveGuard)return;
  const wrapped=function(){
    const t=selected();
    if(isArchived(t)){
      alert('Un torneo archiviato non può essere modificato o ripubblicato.');
      return false;
    }
    return original.apply(this,arguments);
  };
  wrapped.__archiveGuard=true;
  window[name]=wrapped;
}
function installSupabaseArchiveGuard(){
  const clients=[window.sb,window.supabaseClient];
  clients.forEach(client=>{
    if(!client||typeof client.from!=='function'||client.__archiveUpdateGuard)return;
    const originalFrom=client.from.bind(client);
    const wrappedFrom=function(table){
      const builder=originalFrom(table);
      if(String(table)!=='tornei'||!builder||typeof builder.update!=='function')return builder;
      const originalUpdate=builder.update.bind(builder);
      builder.update=function(values){
        const t=selected();
        if(isArchived(t)&&String(values?.stato||'').trim().toLowerCase()!=='archiviato'){
          let blocked=true;
          const originalThen=builder.then?.bind(builder);
          builder.then=function(resolve,reject){
            if(blocked){
              blocked=false;
              const result={data:null,error:{message:'Il torneo è archiviato e non può essere riattivato o modificato.'}};
              return Promise.resolve(result).then(resolve,reject);
            }
            return originalThen?originalThen(resolve,reject):Promise.resolve({data:null,error:null}).then(resolve,reject);
          };
        }
        return originalUpdate(values);
      };
      return builder;
    };
    wrappedFrom.__archiveUpdateGuard=true;
    client.from=wrappedFrom;
    client.__archiveUpdateGuard=true;
  });
}
function install(){
  clearArchivedSelection();
  hideArchivedFromSelector();
  installGuard('pubblicaTorneo');
  installGuard('chiudiIscrizioniTorneo');
  installSupabaseArchiveGuard();
  const root=document.getElementById('appContent');
  if(root&&!root.__archivedSelectorObserver){
    const observer=new MutationObserver(()=>{
      clearArchivedSelection();
      hideArchivedFromSelector();
      installGuard('pubblicaTorneo');
      installGuard('chiudiIscrizioniTorneo');
      installSupabaseArchiveGuard();
    });
    observer.observe(root,{childList:true,subtree:true});
    root.__archivedSelectorObserver=observer;
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
setTimeout(install,100);
setTimeout(install,500);
})();
