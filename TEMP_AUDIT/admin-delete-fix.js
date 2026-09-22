/* ADMIN DELETE FIX - standalone archive delete compatibility */
(function(){
  'use strict';

  function getClient(){
    return window.supabaseClient || window.sb || null;
  }

  function notify(message,type){
    if(typeof window.showNotice==='function'){
      try{window.showNotice(message,type);return;}catch(_){ }
    }
    if(type==='error') alert(message);
  }

  window.eliminaTorneo = async function(id){
    const client=getClient();
    if(!client){
      notify('Supabase non disponibile.','error');
      return false;
    }

    const tournaments=Array.isArray(window.adminState?.tornei)?window.adminState.tornei:[];
    const torneo=tournaments.find(t=>String(t?.id)===String(id));
    if(!torneo){
      notify('Torneo non trovato.','error');
      return false;
    }

    const confirmed=window.confirm('Eliminare definitivamente il torneo "'+(torneo.nome||'')+'"?');
    if(!confirmed)return false;

    try{
      const registrationsDelete=await client.from('iscrizioni').delete().eq('torneo_id',id);
      if(registrationsDelete.error){
        console.warn('[ADMIN DELETE] iscrizioni:',registrationsDelete.error);
      }

      const result=await client.from('tornei').delete().eq('id',id);
      if(result.error)throw result.error;

      if(window.adminState){
        window.adminState.tornei=(window.adminState.tornei||[]).filter(t=>String(t?.id)!==String(id));
        if(String(window.adminState.torneoSelezionato)===String(id)){
          window.adminState.torneoSelezionato=null;
        }
        try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState));}catch(_){ }
      }

      notify('Torneo eliminato.','success');
      return true;
    }catch(err){
      console.error('[ADMIN DELETE] eliminazione torneo:',err);
      notify('Errore durante l\'eliminazione del torneo: '+(err?.message||err),'error');
      return false;
    }
  };

  window.eliminaTorneoAdmin=window.eliminaTorneo;
})();
