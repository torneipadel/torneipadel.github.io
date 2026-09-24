const sb = window.supabase.createClient(
  "https://dkeqicstprvvfebiaooc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZXFpY3N0cHJ2dmZiaWFvY29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjQ2NjksImV4cCI6MjA3Njc0MDY2OX0.MPlE8CZ2B8pEhSJzTWBJ-FfFLQpwRAxlAlno-SCylWg",
  { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } }
);
window.sb = sb;
window.supabaseClient = sb;
let adminState = {
  adminLoggato:false,adminEmail:"",torneoSelezionato:null,tornei:[],sponsor:[],news:[]
};
window.adminState=adminState;
const ADMIN_STORAGE="padel_admin_state";
window.iscrizioniTorneo=[];window.giocatoreSelezionatoCorrente=null;
function salvaAdminState(){try{localStorage.setItem(ADMIN_STORAGE,JSON.stringify(adminState));window.adminState=adminState}catch(e){console.error("Errore salvataggio stato admin:",e)}}
function caricaAdminState(){try{const raw=localStorage.getItem(ADMIN_STORAGE);if(!raw)return;adminState={...adminState,...JSON.parse(raw)};if(!Array.isArray(adminState.tornei))adminState.tornei=[];if(!Array.isArray(adminState.sponsor))adminState.sponsor=[];if(!Array.isArray(adminState.news))adminState.news=[];window.adminState=adminState}catch(e){console.error("Errore caricamento stato admin:",e)}}
function getTorneoAdminCorrente(){if(!Array.isArray(adminState.tornei))return null;return adminState.tornei.find(t=>String(t.id)===String(adminState.torneoSelezionato))||null}
function aggiornaGiocatoriAdmin(){const squadre=Number(document.getElementById("adminPosti")?.value)||8;const campo=document.getElementById("adminGiocatori");if(campo)campo.value=squadre*2}
async function caricaTorneiSupabase(){try{const{data,error}=await sb.from("tornei").select("*").order("id",{ascending:false});if(error)throw error;if(Array.isArray(data))adminState.tornei=data;window.adminState=adminState;salvaAdminState();if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();else renderAdmin()}catch(e){console.error("Errore caricamento tornei Supabase:",e)}}
window.caricaTorneiSupabase=caricaTorneiSupabase;
async function loginAdmin(){try{const email=document.getElementById("adminEmail")?.value?.trim()||"",password=document.getElementById("adminPassword")?.value||"";const{data,error}=await sb.auth.getSession();if(error)throw error;let session=data?.session;if(email||password){if(!email||!password){mostraLoginMessaggio("Inserisci email e password.","#b42332");return}const result=await sb.auth.signInWithPassword({email,password});if(result.error)throw result.error;session=result.data?.session||null}else if(!session){mostraLoginMessaggio("Inserisci email e password.","#b42332");return}const session2=session||(await sb.auth.getSession()).data.session;adminState.adminLoggato=true;adminState.adminEmail=session2?.user?.email||"Admin";window.adminState=adminState;const loginEmail=String(session2?.user?.email||"").trim().toLowerCase();if(loginEmail==="giose.rizzi@gmail.com"){window.adminRuolo="superadmin";window.isSuperadmin=true;window.isAdmin=true;document.documentElement.dataset.adminRole="superadmin"}salvaAdminState();document.getElementById("boxLoginAdmin")?.classList.add("hidden");document.getElementById("areaAdmin")?.classList.remove("hidden");await caricaTorneiSupabase();await caricaRichiesteIscrizione();if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();if(loginEmail==="giose.rizzi@gmail.com"){window.dispatchEvent(new CustomEvent("admin:role-ready",{detail:{ruolo:"superadmin",isSuperadmin:true,isAdmin:true}}));setTimeout(()=>window.dispatchEvent(new CustomEvent("admin:role-ready",{detail:{ruolo:"superadmin",isSuperadmin:true,isAdmin:true}})),50)}}catch(e){console.error("Errore login:",e);mostraLoginMessaggio(e?.message||"Accesso non riuscito.","#b42332")}}
window.loginAdmin=loginAdmin;
function mostraLoginMessaggio(testo,colore){const box=document.getElementById("loginMessaggio");if(box){box.textContent=testo;box.style.color=colore||"inherit"}}
function apriRegoleNuovoTorneo(){return creaNuovoTorneo()}
async function creaNuovoTorneo(){const nome=document.getElementById("adminNomeTorneo")?.value.trim()||"Nuovo Torneo",data=document.getElementById("adminDataTorneo")?.value||"",posti=Number(document.getElementById("adminPosti")?.value)||8,descrizione=document.getElementById("adminDescrizione")?.value.trim()||"";if(!data){alert("Inserisci la data del torneo.");return false}const nuovoId=Date.now(),numeroGironi=Math.max(1,Math.ceil(posti/4)),configurazione={coppie:[],partecipanti:[],rules:{locked:false,tipoTorneo:"",formatoTorneo:"",numeroSquadre:posti,numeroGironi,squadrePerGirone:4,formulaGironi:"",formulaFinale:""}},nuovoTorneo={id:nuovoId,nome,data,posti,descrizione,formula:"",stato:"bozza",iscritti:[],coppie:[],partecipanti:[],configurazione};adminState.tornei=Array.isArray(adminState.tornei)?adminState.tornei.filter(t=>!String(t.id).startsWith("temp_")):[];adminState.tornei.push(nuovoTorneo);adminState.torneoSelezionato=nuovoId;window.adminState=adminState;salvaAdminState();try{const{error}=await sb.from("tornei").insert({id:nuovoId,nome,data,data_torneo:data,ora_inizio:null,posti,descrizione,formula:null,stato:"bozza",pubblicato:false,iscrizioni_chiuse:false,configurazione});if(error)throw error;if(typeof window.caricaTorneiSupabase==='function')await window.caricaTorneiSupabase();if(typeof window.selezionaTorneoAdmin==='function')await window.selezionaTorneoAdmin(nuovoId);return true}catch(error){adminState.tornei=adminState.tornei.filter(t=>String(t.id)!==String(nuovoId));adminState.torneoSelezionato=null;window.adminState=adminState;salvaAdminState();console.error("Errore creazione torneo:",error);alert("Creazione torneo non riuscita: "+(error?.message||error));return false}}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function selezionaTorneoAdmin(id){const torneo=adminState.tornei.find(t=>String(t.id)===String(id));if(!torneo){alert("Torneo non trovato.");return}adminState.torneoSelezionato=torneo.id;window.adminState=adminState;salvaAdminState();await caricaRichiesteIscrizione();const formula=String(torneo.formula||torneo.configurazione?.rules?.formulaScelta||torneo.configurazione?.rules?.tipoTorneo||'').trim();if(formula==='individualeCoppieVariabili'&&typeof window.apriGestioneIndividualeCoppieVariabili==='function'){await window.apriGestioneIndividualeCoppieVariabili();return}if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin()}
async function eliminaTorneoAdmin(id){if(!confirm("ATTENZIONE: eliminare definitivamente questo torneo e le relative iscrizioni?"))return false;const r1=await sb.from("iscrizioni").delete().eq("torneo_id",id);if(r1.error){alert("Eliminazione iscrizioni non riuscita: "+r1.error.message);return false}const r2=await sb.from("tornei").delete().eq("id",id);if(r2.error){alert("Eliminazione torneo non riuscita: "+r2.error.message);return false}adminState.tornei=adminState.tornei.filter(t=>String(t.id)!==String(id));if(String(adminState.torneoSelezionato)===String(id))adminState.torneoSelezionato=null;window.adminState=adminState;salvaAdminState();if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();return true}
async function pubblicaTorneo(){const t=getTorneoAdminCorrente();if(!t){alert("Seleziona prima un torneo");return}const{error}=await sb.from("tornei").update({pubblicato:true,stato:t.iscrizioni_chiuse?"chiuso":"attivo"}).eq("id",t.id);if(error){alert("Errore pubblicazione torneo: "+error.message);return}t.pubblicato=true;if(!t.iscrizioni_chiuse)t.stato="attivo";window.adminState=adminState;salvaAdminState();if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();alert("Torneo pubblicato con successo!")}
async function chiudiIscrizioniTorneo(){const t=getTorneoAdminCorrente();if(!t){alert("Seleziona prima un torneo");return}const{error}=await sb.from("tornei").update({iscrizioni_chiuse:true,stato:"chiuso"}).eq("id",t.id);if(error){alert("Errore chiusura iscrizioni: "+error.message);return}t.iscrizioni_chiuse=true;t.stato="chiuso";window.adminState=adminState;salvaAdminState();if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();alert("Iscrizioni chiuse.")}
async function caricaRichiesteIscrizione(){const id=Number(adminState.torneoSelezionato);if(!Number.isFinite(id)||id<=0){window.iscrizioniTorneo=[];return}try{const{data,error}=await sb.from("iscrizioni").select("*").eq("torneo_id",id);if(error)throw error;window.iscrizioniTorneo=Array.isArray(data)?data:[]}catch(e){console.error("Errore caricamento iscrizioni:",e)}}
function generaLinkBove(){const t=getTorneoAdminCorrente();if(!t){alert("Seleziona prima un torneo");return}const input=document.getElementById("linkBoveGenerato");if(input)input.value=location.origin+"/tabellone.html?idTorneo="+encodeURIComponent(t.id)}
function generaLinkPerId(id){adminState.torneoSelezionato=id;window.adminState=adminState;salvaAdminState();generaLinkBove()}
function copiaLinkBove(){const input=document.getElementById("linkBoveGenerato");if(!input?.value)generaLinkBove();if(input?.value)navigator.clipboard?.writeText(input.value).then(()=>alert("Link copiato negli appunti!"))}
function apriBoveConTorneo(id){const n=Number(id);if(!Number.isFinite(n)||!n){alert("Seleziona prima un torneo");return}window.open("tabellone.html?idTorneo="+encodeURIComponent(n),"_blank")}
function apriRegoleTorneoAdmin(id){adminState.torneoSelezionato=id;window.adminState=adminState;salvaAdminState();window.open("tabellone.html?idTorneo="+encodeURIComponent(id)+"&apriRegole=true","_blank")}
function renderAdmin(){if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin()}
function syncDashboard(){}
function openWorkspace(section){if(section==='link')generaLinkBove()}
async function wireDashboard(){
  caricaAdminState();
  try{
    let session=null;
    for(let i=0;i<15;i++){
      const{data,error}=await sb.auth.getSession();
      if(error)throw error;
      session=data?.session||null;
      if(session)break;
      await new Promise(r=>setTimeout(r,200));
    }
    const email=String(session?.user?.email||"").trim().toLowerCase();
    const superadmin=email==="giose.rizzi@gmail.com";
    const admin=email==="boverob@libero.it"||email==="cfalba@libero.it";
    if(!session||(!superadmin&&!admin)){
      adminState.adminLoggato=false;
      adminState.adminEmail="";
      window.adminRuolo="";
      window.isSuperadmin=false;
      window.isAdmin=false;
      document.documentElement.dataset.adminRole="";
      salvaAdminState();
      document.getElementById("areaAdmin")?.classList.add("hidden");
      window.location.replace("index.html");
      return false
    }
    window.adminRuolo=superadmin?"superadmin":"admin";
    window.isSuperadmin=superadmin;
    window.isAdmin=true;
    document.documentElement.dataset.adminRole=window.adminRuolo;
    adminState.adminLoggato=true;
    adminState.adminEmail=session.user?.email||email;
    window.adminState=adminState;
    salvaAdminState();
    document.getElementById("boxLoginAdmin")?.classList.add("hidden");
    document.getElementById("areaAdmin")?.classList.remove("hidden");
    const mini=document.getElementById("adminEmailMini");
    if(mini)mini.textContent=session.user?.email||email;
    await caricaTorneiSupabase();
    window.dispatchEvent(new CustomEvent("admin:role-ready",{detail:{ruolo:window.adminRuolo,isSuperadmin:superadmin,isAdmin:true}}));
    return true
  }catch(e){
    console.error("Errore verifica sessione Admin:",e);
    document.getElementById("areaAdmin")?.classList.add("hidden");
    window.location.replace("index.html");
    return false
  }
}
document.addEventListener("DOMContentLoaded",wireDashboard);

/* CONTROLLI TORNEO + CONTATORE LIVE: aggiunta isolata, senza modificare il flusso Admin esistente. */
(function(){
'use strict';
const client=()=>window.supabaseClient||window.sb||sb;
const stato=()=>window.adminState||adminState;
const corrente=()=>{const s=stato();return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null};
const clone=v=>{try{return JSON.parse(JSON.stringify(v??{}))}catch(e){return {}}};
async function contatore(){const c=client(),t=corrente(),bar=document.getElementById('adminTournamentControls');if(!c||!t||!bar)return;const tipo=String(t.formula||t.configurazione?.rules?.formulaScelta||t.configurazione?.rules?.tipoTorneo||'');const max=tipo==='individualeCoppieVariabili'?(Number(t.posti)||Number(t.configurazione?.rotazione?.numeroGiocatori)||8):(Number(t.posti)||Number(t.configurazione?.rules?.numeroSquadre)||Number(t.configurazione?.numeroSquadre)||8)*2;const r=await c.from('iscrizioni').select('id,stato').eq('torneo_id',t.id);if(r.error)return;const n=(r.data||[]).filter(x=>String(x.stato||'').toLowerCase()!=='rifiutato').length;const rem=Math.max(0,max-n);let box=document.getElementById('adminLiveCapacity');if(!box){box=document.createElement('div');box.id='adminLiveCapacity';box.style.cssText='width:100%;padding:10px 12px;border-radius:10px;background:rgba(15,23,42,.55);font-weight:700;margin-top:4px';bar.appendChild(box)}box.textContent=n>=max?`🔴 TORNEO COMPLETO — ${n}/${max} iscritti`:`👥 ${n}/${max} iscritti · ${rem} posti disponibili${rem>0&&rem<=3?` · 🔥 ULTIMI ${rem} POSTI`:''}`}
async function salva(){const c=client(),t=corrente();if(!c||!t){alert('Seleziona prima un torneo.');return false}const payload={nome:t.nome||null,data:t.data||null,data_torneo:t.data_torneo||t.data||null,descrizione:t.descrizione||null,posti:t.posti==null?null:Number(t.posti),formula:t.formula||null,stato:t.stato||'bozza',pubblicato:t.pubblicato===true,iscrizioni_chiuse:t.iscrizioni_chiuse===true,configurazione:clone(t.configurazione)};const r=await c.from('tornei').update(payload).eq('id',t.id).select('*').single();if(r.error){alert('Salvataggio torneo non riuscito: '+r.error.message);return false}Object.assign(t,r.data||{});salvaAdminState();if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();alert('Torneo salvato su Supabase.');return true}
async function archivia(){const c=client(),t=corrente();if(!c||!t){alert('Seleziona prima un torneo.');return false}if(!confirm('Confermi la chiusura definitiva e l\'archiviazione del torneo "'+(t.nome||'Torneo')+'"?'))return false;const r=await c.from('tornei').update({stato:'archiviato',iscrizioni_chiuse:true,pubblicato:false}).eq('id',t.id).select('*').single();if(r.error){alert('Archiviazione non riuscita: '+r.error.message);return false}Object.assign(t,r.data||{});salvaAdminState();if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();return true}
async function elimina(){const c=client(),t=corrente();if(!c||!t){alert('Seleziona prima un torneo.');return false}if(!confirm('ATTENZIONE: eliminare definitivamente il torneo e le relative iscrizioni?'))return false;let r=await c.from('iscrizioni').delete().eq('torneo_id',t.id);if(r.error){alert('Eliminazione iscrizioni non riuscita: '+r.error.message);return false}r=await c.from('tornei').delete().eq('id',t.id);if(r.error){alert('Eliminazione torneo non riuscita: '+r.error.message);return false}stato().tornei=(stato().tornei||[]).filter(x=>String(x.id)!==String(t.id));stato().torneoSelezionato=null;salvaAdminState();if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();return true}
function archivio(){let b=document.getElementById('archivioTorneiAdmin');if(!b){b=document.createElement('div');b.id='archivioTorneiAdmin';b.style.cssText='position:fixed;top:70px;right:18px;z-index:9999;display:none;max-width:430px;width:min(430px,calc(100vw - 36px));max-height:72vh;overflow:auto;background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:14px;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.35)';document.body.appendChild(b)}return b}
function renderArchivio(){const b=archivio(),arr=(stato().tornei||[]).filter(t=>String(t.stato||'').toLowerCase()==='archiviato'),groups={};arr.forEach(t=>{const d=new Date(t.data_torneo||t.data||t.created_at||Date.now()),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),g=String(d.getDate()).padStart(2,'0');(groups[y]??=[]).push({t,m,g})});let h='<div style="display:flex;justify-content:space-between;align-items:center"><b>📦 Archivio Tornei</b><button id="chiudiArchivioAdmin" style="border:0;background:none;color:#fff;font-size:18px;cursor:pointer">✕</button></div>';Object.keys(groups).sort((a,b)=>b-a).forEach(y=>{h+=`<div style="margin-top:12px;font-weight:800">${y}</div>`;const ms={};groups[y].forEach(x=>(ms[x.m]??=[]).push(x));Object.keys(ms).sort((a,b)=>b-a).forEach(m=>{h+=`<div style="margin:6px 0 4px;opacity:.75">Mese ${m}</div>`;ms[m].sort((a,b)=>b.g-a.g).forEach(x=>{h+=`<button data-arch-id="${String(x.t.id).replace(/"/g,'&quot;')}" style="display:block;width:100%;text-align:left;margin:4px 0;padding:9px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer">${x.g}/${m}/${y} — ${String(x.t.nome||'Torneo').replace(/</g,'&lt;')}</button>`})})});b.innerHTML=h;b.querySelector('#chiudiArchivioAdmin').onclick=()=>b.style.display='none';b.querySelectorAll('[data-arch-id]').forEach(x=>x.onclick=()=>location.href='tabellone.html?idTorneo='+encodeURIComponent(x.dataset.archId))}
function inject(){
  const selector=document.getElementById('torneoSelector');
  const t=corrente();
  const root=document.querySelector('.content')||document.getElementById('appContent');
  if(!root)return;
  let bar=document.getElementById('adminTournamentControls');
  if(!selector || !t){
    if(bar)bar.remove();
    return;
  }
  if(!bar){
    bar=document.createElement('div');
    bar.id='adminTournamentControls';
    bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:stretch;margin:0 0 14px';
    root.prepend(bar);
  }else if(bar.parentElement!==root){
    root.prepend(bar);
  }
  bar.style.display='flex';
  if(bar.dataset.bound==='1'){contatore();return}
  bar.dataset.bound='1';
  const mk=(id,text,fn)=>{const b=document.createElement('button');b.id=id;b.type='button';b.className='btn action-tile';b.textContent=text;b.onclick=fn;bar.appendChild(b)};
  mk('adminSaveTournament','💾 Salva Torneo',salva);
  mk('adminArchiveTournament','📦 Archivia Torneo',archivia);
  mk('adminDeleteTournament','🗑️ Elimina Torneo',elimina);
  /* Archivio Tornei gestito esclusivamente da admin-archivio-button-v1.js. */
  contatore();
}
window.salvaTorneoAdmin=salva;window.archiviaTorneoAdmin=archivia;window.eliminaTorneoAdmin=elimina;
function boot(){inject()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('admin:render',()=>requestAnimationFrame(inject));
window.addEventListener('admin:rendered',()=>requestAnimationFrame(inject));
const controlsObserver=new MutationObserver(()=>requestAnimationFrame(inject));
function watchControls(){const app=document.getElementById('appContent');if(app)controlsObserver.observe(app,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchControls,{once:true});else watchControls();
})();
