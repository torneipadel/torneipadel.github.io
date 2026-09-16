(()=>{'use strict';
const isArchived=t=>String(t?.stato||'').trim().toLowerCase()==='archiviato';
const selected=()=>{const s=window.adminState||{};return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null};
const archiveOpen=()=>{const b=document.getElementById('archivioTorneiAdmin');return !!b&&getComputedStyle(b).display!=='none'};
const hideManagement=hide=>{const a=document.getElementById('appContent'),c=document.getElementById('adminTournamentControls');if(a)a.style.display=hide?'none':'';if(c)c.style.display=hide?'none':''};
function filterSelector(){const select=document.getElementById('torneoSelector');if(!select)return;[...select.options].forEach(o=>{if(!o.value)return;const t=(window.adminState?.tornei||[]).find(x=>String(x.id)===String(o.value));if(isArchived(t))o.remove()})}
function install(){const original=window.renderCleanAdmin;if(typeof original!=='function'||original.__archiveLock)return false;const wrapped=function(){const t=selected();if(isArchived(t)){hideManagement(true);return null}const r=original.apply(this,arguments);requestAnimationFrame(()=>{filterSelector();hideManagement(false)});return r};wrapped.__archiveLock=true;window.renderCleanAdmin=wrapped;return true}
let closing=false;
function sync(){const t=selected();if(isArchived(t)){if(archiveOpen()){hideManagement(true);return}if(!closing){closing=true;window.adminState.torneoSelezionato=null;hideManagement(false);if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();closing=false}return}hideManagement(false);filterSelector()}
if(!install()){let n=0;const timer=setInterval(()=>{if(install()||++n>100)clearInterval(timer)},50)}
sync();setInterval(sync,250);
})();
