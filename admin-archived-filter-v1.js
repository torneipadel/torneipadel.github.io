(()=>{'use strict';
const isArchived=t=>String(t?.stato||'').trim().toLowerCase()==='archiviato';
function install(){
  const original=window.renderCleanAdmin;
  if(typeof original!=='function'||original.__archivedTournamentsFiltered)return false;
  const wrapped=function(){
    const s=window.adminState||{};
    const all=Array.isArray(s.tornei)?s.tornei:null;
    const selected=all?.find(t=>String(t.id)===String(s.torneoSelezionato));
    if(selected&&isArchived(selected))s.torneoSelezionato=null;
    if(all){
      s.tornei=all.filter(t=>!isArchived(t));
      try{return original.apply(this,arguments)}finally{s.tornei=all}
    }
    return original.apply(this,arguments);
  };
  wrapped.__archivedTournamentsFiltered=true;
  window.renderCleanAdmin=wrapped;
  return true;
}
if(!install()){
  let tries=0;
  const timer=setInterval(()=>{if(install()||++tries>100)clearInterval(timer)},50);
}
})();
