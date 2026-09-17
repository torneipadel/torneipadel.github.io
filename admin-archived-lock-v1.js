(()=>{
'use strict';

const client=()=>window.supabaseClient||window.sb||null;
const state=()=>window.adminState||{};
const isArchived=t=>String(t?.stato||'').trim().toLowerCase()==='archiviato';
const dateOf=t=>{const raw=t?.data_torneo||t?.data||t?.dataTorneo||t?.created_at||'';if(!raw)return null;const d=new Date(String(raw).slice(0,10)+'T00:00:00');return Number.isNaN(d.getTime())?null:d};
const nameOf=t=>String(t?.nome||t?.titolo||'Torneo senza nome');
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));

async function loadArchivedFromServer(){
 const c=client();
 if(!c)return [];
 const {data,error}=await c.from('tornei').select('id,nome,data,data_torneo,created_at,stato,pubblicato,iscrizioni_chiuse').eq('stato','archiviato').order('data_torneo',{ascending:false});
 if(error){console.error('Errore caricamento Archivio Tornei:',error);return []}
 return Array.isArray(data)?data:[];
}

function getBox(){
 let b=document.getElementById('archivioTorneiAdmin');
 if(!b){
   b=document.createElement('div');
   b.id='archivioTorneiAdmin';
   b.style.cssText='position:fixed;top:70px;right:18px;z-index:99999;display:none;max-width:760px;width:min(760px,calc(100vw - 36px));max-height:82vh;overflow:auto;background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:14px;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.35)';
   document.body.appendChild(b);
 }
 return b;
}

async function renderArchive(){
 const b=getBox();
 b.style.display='block';
 b.innerHTML='<div style="padding:18px;text-align:center;opacity:.8">Caricamento archivio…</div>';
 const arr=await loadArchivedFromServer();
 const groups={};
 arr.forEach(t=>{
   const d=dateOf(t);
   const year=d?String(d.getFullYear()):'Senza anno';
   (groups[year]||(groups[year]=[])).push(t);
 });
 const years=Object.keys(groups).sort((a,c)=>{
   if(a==='Senza anno')return 1;
   if(c==='Senza anno')return -1;
   return Number(c)-Number(a);
 });
 let html='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><div><strong style="font-size:18px">📦 Archivio Tornei</strong><div style="opacity:.7;font-size:12px;margin-top:3px">Tornei archiviati dal database</div></div><button type="button" id="chiudiArchivioAdmin" style="border:0;background:none;color:#fff;font-size:20px;cursor:pointer">✕</button></div>';
 if(!years.length){
   html+='<div style="padding:18px 4px;opacity:.72">Nessun torneo archiviato.</div>';
 }else{
   html+='<div style="display:flex;flex-direction:column;gap:8px">';
   years.forEach(year=>{
     const items=groups[year];
     html+='<details style="border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden">';
     html+='<summary style="cursor:pointer;padding:12px 14px;font-weight:700;list-style:none;display:flex;align-items:center;justify-content:space-between"><span>📅 '+esc(year)+'</span><span style="opacity:.7;font-size:12px">'+items.length+' torneo'+(items.length===1?'':'i')+'</span></summary>';
     html+='<div style="overflow:auto;padding:0 10px 10px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Mese</th>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Giorno</th>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Torneo</th>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Apri</th></tr></thead><tbody>';
     items.forEach(t=>{
       const d=dateOf(t);
       const month=d?d.toLocaleDateString('it-IT',{month:'long'}):'-';
       const day=d?String(d.getDate()).padStart(2,'0'):'-';
       html+='<tr><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">'+esc(month)+'</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">'+esc(day)+'</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">'+esc(nameOf(t))+'</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)"><button type="button" class="btn primary" data-open-archived-tournament="'+esc(t.id)+'" style="padding:6px 10px">Apri</button></td></tr>';
     });
     html+='</tbody></table></div></details>';
   });
   html+='</div>';
 }
 b.innerHTML=html;
 b.querySelector('#chiudiArchivioAdmin')?.addEventListener('click',()=>{b.style.display='none'});
 b.querySelectorAll('[data-open-archived-tournament]').forEach(btn=>btn.addEventListener('click',()=>{
   const id=btn.getAttribute('data-open-archived-tournament');
   if(id&&typeof window.apriBoveConTorneo==='function')window.apriBoveConTorneo(id);
   else if(id)window.open('Bove.html?idTorneo='+encodeURIComponent(id),'_blank');
 }));
}
window.renderArchivePanel=renderArchive;

function ensureArchiveButton(){
 const area=document.getElementById('areaAdmin');
 if(!area)return;
 const existing=document.getElementById('sideArchivioTornei');
 if(existing){
   if(existing.dataset.archiveBound!=='1'){
     existing.dataset.archiveBound='1';
     existing.addEventListener('click',renderArchive);
   }
 }else{
   const groups=[...area.querySelectorAll('.sidebar .nav-group')];
   const target=groups.find(g=>String(g.textContent||'').includes('Sistema'))||groups[groups.length-1];
   const nav=target?.querySelector('.nav');
   if(nav){
     const b=document.createElement('button');
     b.type='button';
     b.id='sideArchivioTornei';
     b.textContent='📦 Archivio Tornei';
     b.addEventListener('click',renderArchive);
     b.dataset.archiveBound='1';
     nav.appendChild(b);
   }
 }
 const mobile=document.querySelector('.mobile-nav');
 if(mobile){
   const existingMobile=document.getElementById('mobileArchivioTornei');
   if(existingMobile){
     if(existingMobile.dataset.archiveBound!=='1'){
       existingMobile.dataset.archiveBound='1';
       existingMobile.addEventListener('click',()=>{document.getElementById('mobileOverlay')?.classList.remove('open');renderArchive()});
     }
   }else{
     const m=document.createElement('button');
     m.type='button';
     m.id='mobileArchivioTornei';
     m.textContent='📦 Archivio Tornei';
     m.addEventListener('click',()=>{document.getElementById('mobileOverlay')?.classList.remove('open');renderArchive()});
     m.dataset.archiveBound='1';
     const logout=[...mobile.querySelectorAll('button')].find(x=>String(x.textContent||'').includes('Esci')||String(x.getAttribute('onclick')||'').includes('logoutAdmin'));
     if(logout)mobile.insertBefore(m,logout);else mobile.appendChild(m);
   }
 }
}

function keepExitLast(){
 const area=document.getElementById('areaAdmin');
 if(!area)return;
 const sidebar=area.querySelector('.sidebar');
 if(sidebar){
   const footer=sidebar.querySelector('.sidebar-footer');
   if(footer&&sidebar.lastElementChild!==footer)sidebar.appendChild(footer);
 }
 const mobile=document.querySelector('.mobile-nav');
 if(mobile){
   const logout=[...mobile.querySelectorAll('button')].find(x=>String(x.textContent||'').includes('Esci')||String(x.getAttribute('onclick')||'').includes('logoutAdmin'));
   if(logout&&mobile.lastElementChild!==logout)mobile.appendChild(logout);
 }
}

function filterMainSelector(){
 const select=document.getElementById('torneoSelector');
 if(!select)return;
 [...select.options].forEach(o=>{
   if(!o.value)return;
   const t=(state().tornei||[]).find(x=>String(x.id)===String(o.value));
   if(isArchived(t))o.remove();
 });
}

function protectArchivedSelection(){
 const s=state();
 const t=(s.tornei||[]).find(x=>String(x.id)===String(s.torneoSelezionato));
 if(!isArchived(t))return;
 s.torneoSelezionato=null;
 try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){}
 if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();
}

function installRenderGuard(){
 const original=window.renderCleanAdmin;
 if(typeof original!=='function'||original.__archiveFinalGuard)return false;
 const wrapped=function(){
   protectArchivedSelection();
   const r=original.apply(this,arguments);
   requestAnimationFrame(()=>{filterMainSelector();ensureArchiveButton();keepExitLast()});
   return r;
 };
 wrapped.__archiveFinalGuard=true;
 window.renderCleanAdmin=wrapped;
 return true;
}

function boot(){
 ensureArchiveButton();
 filterMainSelector();
 keepExitLast();
 installRenderGuard();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
let attempts=0;
const timer=setInterval(()=>{
 attempts++;
 ensureArchiveButton();
 filterMainSelector();
 keepExitLast();
 if(installRenderGuard()||attempts>100)clearInterval(timer);
},100);

const observer=new MutationObserver(()=>{ensureArchiveButton();filterMainSelector();keepExitLast()});
if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();