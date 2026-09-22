(()=>{'use strict';
function stabilizzaBar(bar){if(!bar||bar.dataset.stabilizzata==='1')return;bar.dataset.stabilizzata='1';const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(bar,'innerHTML',{configurable:true,get(){return desc.get.call(this)},set(v){if(v==='')return desc.set.call(this,v)}});const append=bar.appendChild.bind(bar);bar.appendChild=function(node){const role=node?.dataset?.role;if(role&&bar.querySelector('[data-role="'+role+'"]'))return bar.querySelector('[data-role="'+role+'"]');return append(node)}}
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

/* AUTENTICAZIONE CENTRALIZZATA: gestita esclusivamente da admin-functions.js. */
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

/* FIX ISOLATO ARCHIVIO: un torneo gia' archiviato non puo' essere ripubblicato.
   Non modifica il flusso di creazione, partecipanti, coppie, tabellone o calendario. */
(function(){
  function protectArchivedPublish(){
    const t=(window.adminState?.tornei||[]).find(x=>String(x.id)===String(window.adminState?.torneoSelezionato));
    const b=document.getElementById('publish');
    if(!b)return;
    const archived=String(t?.stato||'').toLowerCase()==='archiviato';
    b.disabled=archived;
    if(archived){
      const html='📦 <strong>Torneo archiviato</strong><span>Non è possibile ripubblicarlo</span>';
      if(b.innerHTML!==html)b.innerHTML=html;
      b.title='Un torneo archiviato non può essere ripubblicato.';
    }
  }
  const original=window.renderCleanAdmin;
  if(typeof original==='function'&&!original.__archivePublishProtected){
    const wrapped=function(){const r=original.apply(this,arguments);requestAnimationFrame(protectArchivedPublish);return r};
    wrapped.__archivePublishProtected=true;
    window.renderCleanAdmin=wrapped;
  }
  const observer=new MutationObserver(protectArchivedPublish);
  observer.observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',protectArchivedPublish,{once:true});else protectArchivedPublish();
})();

/* FIX ISOLATO: i tornei archiviati restano nell'Archivio ma NON compaiono in Gestione torneo. */
(function(){
  const isArchived=t=>String(t?.stato||'').trim().toLowerCase()==='archiviato';
  const cleanSelection=()=>{
    const s=window.adminState||{};
    const t=(s.tornei||[]).find(x=>String(x.id)===String(s.torneoSelezionato));
    if(isArchived(t))s.torneoSelezionato=null;
  };
  const filterSelector=()=>{
    cleanSelection();
    const select=document.getElementById('torneoSelector');
    if(!select)return;
    [...select.options].forEach(o=>{
      if(!o.value)return;
      const t=(window.adminState?.tornei||[]).find(x=>String(x.id)===String(o.value));
      if(isArchived(t))o.remove();
    });
    if(!select.value)select.value='';
  };
  const original=window.renderCleanAdmin;
  if(typeof original==='function'&&!original.__archivedFiltered){
    const wrapped=function(){
      cleanSelection();
      const r=original.apply(this,arguments);
      requestAnimationFrame(filterSelector);
      return r;
    };
    wrapped.__archivedFiltered=true;
    window.renderCleanAdmin=wrapped;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',filterSelector,{once:true});
  else requestAnimationFrame(filterSelector);
})();
