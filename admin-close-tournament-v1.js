(()=>{
'use strict';

function getClient(){return window.supabaseClient||window.sb||null}
function getSelectedTournament(){const s=window.adminState||{};return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null}
function escapeHtml(v){return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]))}

async function chiudiTorneoStato(){
  const t=getSelectedTournament();
  if(!t){alert('Seleziona prima un torneo.');return false}
  if(String(t.stato||'').toLowerCase()==='concluso'){
    alert('Il torneo è già concluso.');
    return true;
  }
  if(!confirm('Confermi la chiusura del torneo \"'+(t.nome||'Torneo')+'\"?\n\nLo stato verrà impostato su CONCLUSO e le iscrizioni verranno chiuse.'))return false;
  const client=getClient();
  if(!client){alert('Connessione Supabase non disponibile.');return false}
  try{
    const {data,error}=await client.from('tornei').update({stato:'concluso',iscrizioni_chiuse:true}).eq('id',t.id).select('*').single();
    if(error)throw error;
    if(Array.isArray(window.adminState?.tornei)){
      const i=window.adminState.tornei.findIndex(x=>String(x.id)===String(t.id));
      if(i>=0)window.adminState.tornei[i]=data||{...t,stato:'concluso',iscrizioni_chiuse:true};
    }
    try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}
    alert('Torneo chiuso correttamente. Stato: CONCLUSO.');
    if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();
    return true;
  }catch(e){
    console.error('Errore chiusura torneo:',e);
    alert('Chiusura torneo non riuscita: '+(e?.message||e));
    return false;
  }
}
window.chiudiTorneoStato=chiudiTorneoStato;

async function riapriIscrizioniTorneo(){
  const t=getSelectedTournament();
  if(!t){alert('Seleziona prima un torneo.');return false}
  const stato=String(t.stato||'').toLowerCase();
  if(stato==='concluso'||stato==='archiviato'){
    alert('Un torneo concluso o archiviato non può essere riaperto.');
    return false;
  }
  if(!t.iscrizioni_chiuse){
    alert('Le iscrizioni sono già aperte.');
    return true;
  }
  if(!confirm('Vuoi riaprire le iscrizioni del torneo \"'+(t.nome||'Torneo')+'\"?'))return false;
  const client=getClient();
  if(!client){alert('Connessione Supabase non disponibile.');return false}
  try{
    const {data,error}=await client.from('tornei').update({iscrizioni_chiuse:false,stato:'attivo',pubblicato:true}).eq('id',t.id).select('*').single();
    if(error)throw error;
    if(Array.isArray(window.adminState?.tornei)){
      const i=window.adminState.tornei.findIndex(x=>String(x.id)===String(t.id));
      if(i>=0)window.adminState.tornei[i]=data||{...t,iscrizioni_chiuse:false,stato:'attivo',pubblicato:true};
    }
    try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}
    alert('Iscrizioni riaperte. Il torneo è nuovamente ATTIVO.');
    if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();
    return true;
  }catch(e){
    console.error('Errore riapertura iscrizioni:',e);
    alert('Riapertura iscrizioni non riuscita: '+(e?.message||e));
    return false;
  }
}
window.riapriIscrizioniTorneo=riapriIscrizioniTorneo;

function install(){
  const render=window.renderCleanAdmin;
  if(typeof render!=='function')return false;
  if(render.__closeTournamentWrapped)return true;
  const wrapped=function(){
    const result=render.apply(this,arguments);
    setTimeout(injectButton,0);
    return result;
  };
  wrapped.__closeTournamentWrapped=true;
  window.renderCleanAdmin=wrapped;
  return true;
}

function injectButton(){
  const root=document.getElementById('appContent');
  if(!root)return;
  const operations=[...root.querySelectorAll('.action-grid')].find(x=>x.querySelector('#publish')&&x.querySelector('#closeReg'));
  if(!operations)return;
  const t=getSelectedTournament();
  if(!t)return;
  const closed=String(t.stato||'').toLowerCase()==='concluso';
  let b=document.getElementById('closeTournament');
  if(!b){
    b=document.createElement('button');
    b.type='button';
    b.className='btn action-tile';
    b.id='closeTournament';
    operations.appendChild(b);
  }
  b.innerHTML=closed?'🏁 <strong>Torneo concluso</strong><span>Stato: concluso</span>':'🏁 <strong>Chiudi torneo</strong><span>Imposta lo stato su concluso</span>';
  b.disabled=closed;
  if(!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',chiudiTorneoStato)}

  let r=document.getElementById('reopenReg');
  const iscrizioniChiuse=t.iscrizioni_chiuse===true||String(t.stato||'').toLowerCase()==='chiuso';
  if(iscrizioniChiuse&&!closed&&String(t.stato||'').toLowerCase()!=='archiviato'){
    if(!r){
      r=document.createElement('button');
      r.type='button';
      r.className='btn action-tile';
      r.id='reopenReg';
      operations.appendChild(r);
    }
    r.innerHTML='🟢 <strong>Riapri iscrizioni</strong><span>Rendi il torneo nuovamente attivo</span>';
    r.disabled=false;
    if(!r.dataset.bound){r.dataset.bound='1';r.addEventListener('click',riapriIscrizioniTorneo)}
  }else if(r){r.remove()}
}

/* L'Archivio Tornei è una funzione di consultazione già presente in admin-functions.js.
   Non deve essere rimosso da questo modulo: qui non facciamo più alcuna cancellazione del
   pulsante #adminArchiveOpen, né del relativo pannello di consultazione. */
function removeExtraArchiveButton(){}

/* FIX ARCHIVIO: intercetta esclusivamente il pulsante "Archivia Torneo" già creato
   da admin-functions.js. L'update viene eseguito senza .select().single(), così
   l'archiviazione non dipende da una policy SELECT di Supabase. Nessun altro pulsante
   o flusso Admin viene modificato. */
async function archiviaTorneoFix(e){
  if(e){e.preventDefault();e.stopImmediatePropagation();}
  const t=getSelectedTournament();
  if(!t){alert('Seleziona prima un torneo.');return false}
  if(String(t.stato||'').toLowerCase()==='archiviato'){
    alert('Il torneo è già archiviato.');
    return true;
  }
  if(!confirm('Confermi la chiusura definitiva e l\'archiviazione del torneo "'+(t.nome||'Torneo')+'"?'))return false;
  const client=getClient();
  if(!client){alert('Connessione Supabase non disponibile.');return false}
  try{
    const {error}=await client.from('tornei').update({stato:'archiviato',iscrizioni_chiuse:true,pubblicato:false}).eq('id',t.id);
    if(error)throw error;
    if(Array.isArray(window.adminState?.tornei)){
      const i=window.adminState.tornei.findIndex(x=>String(x.id)===String(t.id));
      if(i>=0)window.adminState.tornei[i]={...window.adminState.tornei[i],stato:'archiviato',iscrizioni_chiuse:true,pubblicato:false};
    }
    try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}
    if(typeof window.caricaTorneiSupabase==='function')await window.caricaTorneiSupabase();
    else if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();
    alert('Torneo archiviato correttamente.');
    return true;
  }catch(err){
    console.error('Errore archiviazione torneo:',err);
    alert('Archiviazione non riuscita: '+(err?.message||err));
    return false;
  }
}
function installArchiveFix(){
  const b=document.getElementById('adminArchiveTournament');
  if(!b||b.dataset.archiveFixBound==='1')return;
  b.dataset.archiveFixBound='1';
  b.addEventListener('click',archiviaTorneoFix,true);
}

function boot(){
  removeExtraArchiveButton();
  if(install())injectButton();
  installArchiveFix();
  setTimeout(()=>{removeExtraArchiveButton();install();injectButton();installArchiveFix()},100);
  setTimeout(()=>{removeExtraArchiveButton();install();injectButton();installArchiveFix()},500);
  const root=document.getElementById('appContent');
  if(root&&!window.__BOVE_ARCHIVE_BUTTON_FIX__){
    window.__BOVE_ARCHIVE_BUTTON_FIX__=true;
    new MutationObserver(()=>{removeExtraArchiveButton();installArchiveFix()}).observe(root,{childList:true,subtree:true});
  }
  if(!window.__ARCHIVE_BUTTON_FIX_OBSERVER__){
    window.__ARCHIVE_BUTTON_FIX_OBSERVER__=true;
    new MutationObserver(()=>requestAnimationFrame(installArchiveFix)).observe(document.body,{childList:true,subtree:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('admin:rendered',()=>{removeExtraArchiveButton();install();injectButton();installArchiveFix()});

/* STABILIZZAZIONE BANNER CONTROLLI TORNEO: il banner vive fuori da #appContent,
   così renderCleanAdmin() non lo distrugge e non può farlo apparire/scomparire. */
(function(){
  const KEY='__TOURNAMENT_CONTROLS_STABLE__';
  function patchBar(bar){
    if(!bar||bar.dataset[KEY]==='1')return;
    bar.dataset[KEY]='1';
    const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
    if(desc?.get&&desc?.set){
      Object.defineProperty(bar,'innerHTML',{configurable:true,get(){return desc.get.call(this)},set(v){if(v==='')return;desc.set.call(this,v)}});
    }
    const append=bar.appendChild.bind(bar);
    bar.appendChild=function(node){
      const role=node?.dataset?.role;
      if(role){const old=bar.querySelector('[data-role="'+role+'"]');if(old)return old}
      return append(node);
    };
  }
  function stabilize(){
    const bar=document.getElementById('adminTournamentControls');
    const host=document.querySelector('.content');
    const app=document.getElementById('appContent');
    if(!bar||!host)return;
    if(bar.parentElement!==host)host.insertBefore(bar,app||host.firstChild);
    patchBar(bar);
    bar.style.display=document.getElementById('torneoSelector')?'flex':'none';
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(stabilize));
  observer.observe(document.body,{childList:true,subtree:true});
  stabilize();
  setTimeout(stabilize,100);
  setTimeout(stabilize,500);
})();
})();
