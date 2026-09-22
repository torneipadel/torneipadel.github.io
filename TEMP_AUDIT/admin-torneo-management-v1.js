/* ADMIN TOURNAMENT MANAGEMENT V2 */
(function(){
'use strict';
function call(name){if(typeof window[name]!=='function'){alert('Funzione non disponibile: '+name);return false;}return window[name].apply(window,Array.prototype.slice.call(arguments,1));}
function selected(){try{return JSON.parse(localStorage.getItem('padel_admin_state')||'{}').torneoSelezionato||null;}catch(e){return null;}}

/*
 * COLLEGAMENTO ISCRIZIONE -> APPROVAZIONE -> PARTECIPANTI
 *
 * Le iscrizioni restano nella tabella "iscrizioni".
 * Al momento dell'approvazione, il partecipante approvato viene
 * sincronizzato anche dentro tornei.configurazione.partecipanti,
 * che e' il contenitore gia' utilizzato da Bove.html.
 * Non vengono toccati coppie, gironi, calendario o risultati.
 */
async function sincronizzaPartecipanteApprovato(iscrizione){
 const id=Number(iscrizione?.torneo_id||selected());
 if(!Number.isFinite(id)||id<=0||!iscrizione)return false;
 const sb=window.sb||window.supabaseClient;
 if(!sb)return false;
 try{
   const {data:torneo,error}=await sb.from('tornei').select('id,partecipanti,coppie,configurazione').eq('id',id).single();
   if(error||!torneo)throw error||new Error('Torneo non trovato');
   const config=(torneo.configurazione&&typeof torneo.configurazione==='object')?{...torneo.configurazione}:{};
   const esistenti=Array.isArray(config.partecipanti)?[...config.partecipanti]:Array.isArray(torneo.partecipanti)?[...torneo.partecipanti]:[];
   const key=String(iscrizione.id);
   const idx=esistenti.findIndex(p=>String(p?.id||p?.iscrizione_id)===key);
   const partecipante={
     id:iscrizione.id,
     iscrizione_id:iscrizione.id,
     user_id:iscrizione.user_id||null,
     nome_giocatore:iscrizione.nome_giocatore||'',
     nome:iscrizione.nome||'',
     cognome:iscrizione.cognome||'',
     email:iscrizione.email||'',
     telefono:iscrizione.telefono||'',
     livello:iscrizione.livello||'',
     note:iscrizione.note||'',
     categoria:iscrizione.categoria||'Open',
     stato:'approvato',
     approvato:true
   };
   if(idx>=0)esistenti[idx]={...esistenti[idx],...partecipante};
   else esistenti.push(partecipante);
   config.partecipanti=esistenti;
   const update={configurazione:config,partecipanti:esistenti};
   const result=await sb.from('tornei').update(update).eq('id',id);
   if(result.error)throw result.error;
   return true;
 }catch(e){
   console.error('[Tournament Management] sincronizzazione partecipante:',e);
   return false;
 }
}

/* Installa il ponte quando admin-functions.js ha definito approvaGiocatore. */
function installApprovalBridge(){
 if(window.__approvalBridgeInstalled)return true;
 if(typeof window.approvaGiocatore!=='function')return false;
 const originale=window.approvaGiocatore;
 window.approvaGiocatore=async function(){
   const before=window.giocatoreSelezionatoCorrente?{...window.giocatoreSelezionatoCorrente}:null;
   const result=await originale.apply(this,arguments);
   const approved=window.giocatoreSelezionatoCorrente||before;
   if(approved&&approved.approvato===true&&approved.stato==='approvato'){
     await sincronizzaPartecipanteApprovato(approved);
     if(typeof window.caricaRichiesteIscrizione==='function')await window.caricaRichiesteIscrizione();
   }
   return result;
 };
 window.__approvalBridgeInstalled=true;
 return true;
}

function install(){
 const card=document.getElementById('gestioneTorneoAdmin');
 const detail=document.getElementById('dettaglioTorneoAdmin');
 if(!card||!detail)return;
 let bar=document.getElementById('azioniGestioneTorneo');
 if(!bar){bar=document.createElement('div');bar.id='azioniGestioneTorneo';bar.className='toolbar';card.appendChild(bar);}
 const id=selected();
 bar.innerHTML='';
 if(!id)return;
 const mk=(text,cls,fn)=>{const b=document.createElement('button');b.className='btn '+(cls||'');b.textContent=text;b.onclick=fn;return b;};
 bar.appendChild(mk('📥 Carica iscritti','',()=>{call('caricaRichiesteIscrizione');if(typeof window.openAdminPage==='function')window.openAdminPage('iscritti');}));
 bar.appendChild(mk('🔒 Chiudi iscrizioni','danger',()=>call('chiudiIscrizioniAdmin')));
 bar.appendChild(mk('📢 Pubblica torneo','primary',()=>call('pubblicaTorneoAdmin')));
 bar.appendChild(mk('📋 Apri tabellone','',()=>{if(typeof window.openAdminPage==='function')window.openAdminPage('tabellone');call('renderTabellone');}));
 bar.appendChild(mk('🔗 Link pubblico','',()=>call('generaLinkAdmin',id)));
 bar.appendChild(mk('🌐 Apri torneo','',()=>call('apriBoveAdmin',id)));
 bar.appendChild(mk('🗑 Elimina','danger',()=>call('eliminaTorneoAdmin',id)));
}
function ensure(){install();installApprovalBridge();}
function start(){ensure();new MutationObserver(ensure).observe(document.body,{subtree:true,childList:true});setInterval(installApprovalBridge,500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();