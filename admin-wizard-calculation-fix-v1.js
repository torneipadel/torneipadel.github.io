/* ADMIN WIZARD CALCULATION FIX V3
 * Apply historical automatic defaults only when a formula is selected.
 * Never overwrite values manually changed by the administrator.
 * No layout, tournament engine, participants, pairs, bracket or calendar changes.
 */
(()=>{
'use strict';
function applyHistoricalDefaults(){
  const wizard=document.getElementById('adminFlowV18');
  if(!wizard)return;
  const formula=wizard.querySelector('.af-formula.sel')?.dataset.f;
  if(!formula)return;
  const host=document.getElementById('afFormulaConfig');
  if(!host)return;
  const posti=Number(document.getElementById('afPosti')?.value)||8;
  const gruppi=Math.max(1,Math.ceil(posti/4));
  const set=(key,value)=>{
    const el=host.querySelector('[data-cfg="'+key+'"]');
    if(el)el.value=String(value);
  };
  switch(formula){
    case 'italiana':
      // Historical engine: 4 teams/group, 6 matches/group, 3 slots, 2 courts/group.
      set('turni',3);
      set('campi',gruppi*2);
      break;
    case 'gironiFinale':
      // Historical group structure: 4 teams per group.
      set('numeroGironi',gruppi);
      set('squadrePerGirone',4);
      break;
    case 'eliminazione':
      // KO rounds are determined by the number of teams.
      set('turni',Math.ceil(Math.log2(posti)));
      break;
    case 'svizzero':
      // Historical engine uses 5 Swiss rounds.
      set('turni',5);
      break;
    default:
      // Americano/Mexicano/King/Short/Manuale do not get invented fixed values here.
      // Their existing configurable defaults remain untouched until their historical
      // scheduling rule is explicitly recovered.
      break;
  }
}
function bind(){
  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('#adminFlowV18 .af-formula');
    if(!button)return;
    setTimeout(applyHistoricalDefaults,0);
  },false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();

/* PUBBLICAZIONE AUTOMATICA DEL NUOVO TORNEO
 * Il wizard crea correttamente il torneo, ma il salvataggio storico lo lasciava
 * in bozza/non pubblicato. Questo blocco interviene solo sui nuovi ID creati
 * durante la sessione Admin e li rende immediatamente visibili ai visitatori.
 */
async function pubblicaNuovoTorneo(id){
  const sb=window.supabaseClient||window.sb;
  if(!sb||!id)return;
  const r=await sb.from('tornei').update({pubblicato:true,stato:'attivo'}).eq('id',id);
  if(r.error){console.error('Pubblicazione automatica torneo non riuscita:',r.error);return}
  const lista=window.adminState?.tornei;
  if(Array.isArray(lista)){
    const t=lista.find(x=>String(x.id)===String(id));
    if(t){t.pubblicato=true;t.stato='attivo'}
  }
  if(window.adminState){try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState))}catch(e){}}
  if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();
}
function avviaPubblicazioneAutomatica(){
  let inizializzato=false;
  const giaVisti=new Set();
  const inizializza=()=>{
    const lista=window.adminState?.tornei;
    if(!Array.isArray(lista)||!lista.length)return false;
    lista.forEach(t=>giaVisti.add(String(t.id)));
    inizializzato=true;
    return true;
  };
  const controlla=()=>{
    if(!inizializzato&&!inizializza())return;
    const lista=window.adminState?.tornei;
    if(!Array.isArray(lista))return;
    lista.forEach(t=>{
      const id=String(t.id);
      if(giaVisti.has(id))return;
      giaVisti.add(id);
      if(t.stato==='bozza'||t.pubblicato!==true)pubblicaNuovoTorneo(t.id);
    });
  };
  const originale=window.caricaTorneiSupabase;
  if(typeof originale==='function'&&!originale.__autoPublishWrapped){
    const wrapper=async function(){
      const prima=new Set((window.adminState?.tornei||[]).map(t=>String(t.id)));
      const result=await originale.apply(this,arguments);
      const lista=window.adminState?.tornei||[];
      inizializzato=true;
      lista.forEach(t=>{
        const id=String(t.id);
        if(!prima.has(id)&&(!t.pubblicato||t.stato==='bozza'))pubblicaNuovoTorneo(t.id);
        giaVisti.add(id);
      });
      return result;
    };
    wrapper.__autoPublishWrapped=true;
    window.caricaTorneiSupabase=wrapper;
    setTimeout(controlla,300);
  }else{
    inizializzato=inizializza();
  }
  setInterval(controlla,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',avviaPubblicazioneAutomatica,{once:true});
else avviaPubblicazioneAutomatica();
})();
