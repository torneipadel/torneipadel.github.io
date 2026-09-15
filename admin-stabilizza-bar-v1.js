(()=>{'use strict';
function stabilizzaBar(bar){if(!bar||bar.dataset.stabilizzata==='1')return;bar.dataset.stabilizzata='1';const append=bar.appendChild.bind(bar);bar.appendChild=function(node){const role=node?.dataset?.role;if(role&&bar.querySelector('[data-role="'+role+'"]'))return bar.querySelector('[data-role="'+role+'"]');return append(node)}}
function scan(){const bar=document.getElementById('adminTournamentControls');if(bar)stabilizzaBar(bar)}
const observer=new MutationObserver(scan);observer.observe(document.body,{childList:true,subtree:true});scan();
let tentativi=0;const wrap=setInterval(()=>{if(typeof window.renderCleanAdmin==='function'){clearInterval(wrap);const originale=window.renderCleanAdmin;if(!originale.__stabilizzato){const wrapper=function(){const r=originale.apply(this,arguments);requestAnimationFrame(()=>{window.dispatchEvent(new Event('admin:render'));scan()});return r};wrapper.__stabilizzato=true;window.renderCleanAdmin=wrapper}}tentativi++;if(tentativi>100)clearInterval(wrap)},50);

function removeDuplicateSponsorBanner(){
  const nodes=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,section,article')];
  for(const node of nodes){
    const text=String(node.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(text!=='I NOSTRI SPONSOR') continue;
    let target=node;
    for(let i=0;i<6&&target.parentElement;i++){
      const parent=target.parentElement;
      const parentText=String(parent.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      if(parentText.includes('I NOSTRI SPONSOR')&&parentText.includes('NESSUNO SPONSOR CONFIGURATO')){
        target=parent;
        if(parent.matches('section,article,.card,[id*="sponsor" i],[class*="sponsor" i]'))break;
      }else break;
    }
    if(target!==document.body&&target!==document.documentElement)target.remove();
  }
}
const sponsorBannerObserver=new MutationObserver(removeDuplicateSponsorBanner);
sponsorBannerObserver.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeDuplicateSponsorBanner,{once:true});else removeDuplicateSponsorBanner();
setTimeout(removeDuplicateSponsorBanner,300);
setTimeout(removeDuplicateSponsorBanner,1000);

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

/* Carica il modulo Broadcast WhatsApp dopo che Admin e le sue pagine sono disponibili. */
(function(){
  if(window.__WA_BROADCAST_LOADER__)return;
  window.__WA_BROADCAST_LOADER__=true;
  const load=()=>{
    if(document.querySelector('script[data-wa-broadcast-loader]'))return;
    const s=document.createElement('script');
    s.src='admin-whatsapp-broadcast-v1.js?v=1';
    s.async=false;
    s.dataset.waBroadcastLoader='1';
    document.body.appendChild(s);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
