(()=>{'use strict';
const archived=t=>String(t?.stato||'').trim().toLowerCase()==='archiviato';
function filterSelector(){
  const select=document.getElementById('torneoSelector');
  if(!select)return;
  Array.from(select.options).forEach(o=>{
    if(!o.value)return;
    const t=(window.adminState?.tornei||[]).find(x=>String(x.id)===String(o.value));
    if(t&&archived(t))o.remove();
  });
}
function install(){
  const original=window.renderCleanAdmin;
  if(typeof original!=='function'||original.__archivedSelectorFiltered)return false;
  const wrapped=function(){
    const result=original.apply(this,arguments);
    filterSelector();
    setTimeout(filterSelector,0);
    return result;
  };
  wrapped.__archivedSelectorFiltered=true;
  window.renderCleanAdmin=wrapped;
  filterSelector();
  return true;
}
if(!install()){
  let tries=0;
  const timer=setInterval(()=>{if(install()||++tries>100)clearInterval(timer)},50);
}
})();
