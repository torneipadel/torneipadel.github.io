(()=>{
'use strict';

const ARCHIVE_KEY='admin_archived_tournament_ids_v1';

function getState(){return window.adminState||{};}
function getTournaments(){return Array.isArray(getState().tornei)?getState().tornei:[];}
function isArchived(t){return String(t?.stato||'').trim().toLowerCase()==='archiviato';}
function readKnownIds(){
  try{
    const raw=localStorage.getItem(ARCHIVE_KEY);
    const ids=JSON.parse(raw||'[]');
    return new Set(Array.isArray(ids)?ids.map(String):[]);
  }catch(e){return new Set();}
}
function writeKnownIds(ids){
  try{localStorage.setItem(ARCHIVE_KEY,JSON.stringify([...ids]));}catch(e){}
}
function rememberArchived(){
  const ids=readKnownIds();
  for(const t of getTournaments())if(isArchived(t))ids.add(String(t.id));
  writeKnownIds(ids);
  return ids;
}

async function restoreArchivedFromServer(knownIds){
  const client=window.supabaseClient||window.sb;
  if(!client||!knownIds.size)return;
  const tournaments=getTournaments();
  const changed=[];
  for(const t of tournaments){
    const id=String(t?.id??'');
    if(!id||!knownIds.has(id)||isArchived(t))continue;
    const r=await client.from('tornei').update({stato:'archiviato',iscrizioni_chiuse:true,pubblicato:false}).eq('id',t.id);
    if(r.error){
      console.error('Errore ripristino stato archivio:',r.error);
      continue;
    }
    t.stato='archiviato';
    t.iscrizioni_chiuse=true;
    t.pubblicato=false;
    changed.push(id);
  }
  if(changed.length){
    try{localStorage.setItem('padel_admin_state',JSON.stringify(getState()));}catch(e){}
  }
}

function installLoaderGuard(){
  const original=window.caricaTorneiSupabase;
  if(typeof original!=='function'||original.__archivePersistenceGuard)return false;
  const wrapped=async function(){
    const knownIds=rememberArchived();
    const result=await original.apply(this,arguments);
    await restoreArchivedFromServer(knownIds);
    rememberArchived();
    return result;
  };
  wrapped.__archivePersistenceGuard=true;
  window.caricaTorneiSupabase=wrapped;
  return true;
}

function installPublishGuard(){
  const original=window.pubblicaTorneo;
  if(typeof original!=='function'||original.__archivePersistenceGuard)return false;
  const wrapped=async function(){
    const s=getState();
    const t=getTournaments().find(x=>String(x.id)===String(s.torneoSelezionato));
    if(isArchived(t)){
      alert('Un torneo archiviato non può essere riattivato.');
      return false;
    }
    return original.apply(this,arguments);
  };
  wrapped.__archivePersistenceGuard=true;
  window.pubblicaTorneo=wrapped;
  return true;
}

function install(){
  const loader=installLoaderGuard();
  const publish=installPublishGuard();
  rememberArchived();
  return loader||publish;
}

if(!install()){
  let attempts=0;
  const timer=setInterval(()=>{
    attempts++;
    if(install()||attempts>100)clearInterval(timer);
  },50);
}
})();
