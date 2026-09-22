/* ADMIN CREATION REPAIR V4 - compatibility only
 * The V18 wizard is the authoritative tournament-creation flow.
 * This file is intentionally passive so it cannot replace or intercept it.
 */
(()=>{
'use strict';
const ids=['adminFlowV15','adminFlowV16','adminFlowV17'];
function cleanup(){ids.forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup);
else cleanup();
window.addEventListener('load',cleanup);
})();
