(()=>{'use strict';
function stabilizzaBar(bar){if(!bar||bar.dataset.stabilizzata==='1')return;bar.dataset.stabilizzata='1';const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(bar,'innerHTML',{configurable:true,get(){return desc.get.call(this)},set(v){if(v==='')return desc.set.call(this,v)}});const append=bar.appendChild.bind(bar);bar.appendChild=function(node){const role=node?.dataset?.role;if(role&&bar.querySelector('[data-role="'+role+'"]'))return bar.querySelector('[data-role="'+role+'"]');return append(node)}}
function scan(){const bar=document.getElementById('adminTournamentControls');if(bar)stabilizzaBar(bar)}
const observer=new MutationObserver(scan);observer.observe(document.body,{childList:true,subtree:true});scan();
let tentativi=0;const wrap=setInterval(()=>{if(typeof window.renderCleanAdmin==='function'){clearInterval(wrap);const originale=window.renderCleanAdmin;if(!originale.__stabilizzato){const wrapper=function(){const r=originale.apply(this,arguments);requestAnimationFrame(()=>{window.dispatchEvent(new Event('admin:render'));scan()});return r};wrapper.__stabilizzato=true;window.renderCleanAdmin=wrapper}}tentativi++;if(tentativi>100)clearInterval(wrap)},50);

/* ADMIN USA L'UNICA PAGINA DI LOGIN: index.html. Nessun secondo login dentro admin.html. */
const login=document.getElementById('boxLoginAdmin');
const area=document.getElementById('areaAdmin');
if(login)login.remove();
if(area)area.classList.add('hidden');

window.logoutAdmin=async function(){
  try{await window.sb?.auth?.signOut()}catch(e){}
  window.adminState=window.adminState||{};
  window.adminState.adminLoggato=false;
  window.adminState.adminEmail='';
  try{localStorage.removeItem('padel_admin_state')}catch(e){}
  window.location.href='index.html';
};

(async function(){
  try{
    const sb=window.sb;
    if(!sb){window.location.href='index.html';return}
    const {data:{session}}=await sb.auth.getSession();
    if(!session){window.location.href='index.html';return}
    const {data:profilo,error}=await sb.from('profili').select('nome,cognome,telefono,ruolo').eq('user_id',session.user.id).maybeSingle();
    if(error||!profilo||String(profilo.ruolo||'').toLowerCase()!=='admin'){
      await sb.auth.signOut().catch(()=>{});
      window.location.href='index.html';
      return;
    }
    window.adminState=window.adminState||{};
    window.adminState.adminLoggato=true;
    window.adminState.adminEmail=session.user.email||'Admin';
    if(area)area.classList.remove('hidden');
    const mini=document.getElementById('adminEmailMini');
    if(mini)mini.textContent=session.user.email||'Admin';
    try{localStorage.removeItem('padel_admin_state')}catch(e){}
    if(typeof window.caricaTorneiSupabase==='function')await window.caricaTorneiSupabase();
    if(typeof window.caricaRichiesteIscrizione==='function')await window.caricaRichiesteIscrizione();
    if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();
    scan();
  }catch(e){
    console.error('Errore accesso Admin:',e);
    window.location.href='index.html';
  }
})();
})();
