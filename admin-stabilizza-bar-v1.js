(()=>{'use strict';function stabilizzaBar(bar){if(!bar||bar.dataset.stabilizzata==='1')return;bar.dataset.stabilizzata='1';const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(bar,'innerHTML',{configurable:true,get(){return desc.get.call(this)},set(v){if(v==='')return desc.set.call(this,v)}});const append=bar.appendChild.bind(bar);bar.appendChild=function(node){const role=node?.dataset?.role;if(role&&bar.querySelector('[data-role="'+role+'"]'))return bar.querySelector('[data-role="'+role+'"]');return append(node)}}function scan(){const bar=document.getElementById('adminTournamentControls');if(bar)stabilizzaBar(bar)}const observer=new MutationObserver(scan);observer.observe(document.body,{childList:true,subtree:true});scan();let tentativi=0;const wrap=setInterval(()=>{if(typeof window.renderCleanAdmin==='function'){clearInterval(wrap);const originale=window.renderCleanAdmin;if(!originale.__stabilizzato){const wrapper=function(){const r=originale.apply(this,arguments);requestAnimationFrame(()=>{window.dispatchEvent(new Event('admin:render'));scan()});return r};wrapper.__stabilizzato=true;window.renderCleanAdmin=wrapper}}tentativi++;if(tentativi>100)clearInterval(wrap)},50);

/* USCITA ADMIN: torna alla schermata di login ADMIN, senza cambiare pagina */
window.logoutAdmin=async function(){
  try{await window.sb?.auth?.signOut()}catch(e){}
  window.adminState=window.adminState||{};
  window.adminState.adminLoggato=false;
  window.adminState.adminEmail='';
  try{localStorage.removeItem('padel_admin_state')}catch(e){}
  const area=document.getElementById('areaAdmin');
  const login=document.getElementById('boxLoginAdmin');
  if(area)area.classList.add('hidden');
  if(login)login.classList.remove('hidden');
};
})();
