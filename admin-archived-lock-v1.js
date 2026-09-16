(()=>{
'use strict';

const isArchived=t=>String(t?.stato||'').trim().toLowerCase()==='archiviato';
const state=()=>window.adminState||{};
const selected=()=>{const s=state();return (s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null};
const escape=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const dateOf=t=>{const raw=t?.data_torneo||t?.data||t?.dataTorneo||t?.created_at||'';if(!raw)return null;const d=new Date(String(raw).slice(0,10)+'T00:00:00');return Number.isNaN(d.getTime())?null:d};
const nameOf=t=>String(t?.nome||t?.titolo||'Torneo senza nome');

function hideManagement(hide){
 const app=document.getElementById('appContent');
 const controls=document.getElementById('adminTournamentControls');
 if(app)app.style.display=hide?'none':'';
 if(controls)controls.style.display=hide?'none':'';
}

function filterSelector(){
 const select=document.getElementById('torneoSelector');
 if(!select)return;
 [...select.options].forEach(o=>{
   if(!o.value)return;
   const t=(state().tornei||[]).find(x=>String(x.id)===String(o.value));
   if(isArchived(t))o.remove();
 });
}

function installManagementLock(){
 const original=window.renderCleanAdmin;
 if(typeof original!=='function'||original.__archiveLock)return false;
 const wrapped=function(){
   const t=selected();
   if(isArchived(t)){hideManagement(true);return null}
   const r=original.apply(this,arguments);
   requestAnimationFrame(()=>{filterSelector();hideManagement(false)});
   return r;
 };
 wrapped.__archiveLock=true;
 window.renderCleanAdmin=wrapped;
 return true;
}

function getArchiveBox(){
 let b=document.getElementById('archivioTorneiAdmin');
 if(!b){
   b=document.createElement('div');
   b.id='archivioTorneiAdmin';
   b.style.cssText='position:fixed;top:70px;right:18px;z-index:9999;display:none;max-width:760px;width:min(760px,calc(100vw - 36px));max-height:82vh;overflow:auto;background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:14px;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.35)';
   document.body.appendChild(b);
 }
 return b;
}

function renderArchive(){
 const b=getArchiveBox();
 const arr=(state().tornei||[]).filter(isArchived).slice().sort((a,c)=>(dateOf(c)?.getTime()||0)-(dateOf(a)?.getTime()||0));
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
 let html='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><div><strong style="font-size:18px">📦 Archivio Tornei</strong><div style="opacity:.7;font-size:12px;margin-top:3px">Tornei archiviati</div></div><button type="button" id="chiudiArchivioAdmin" style="border:0;background:none;color:#fff;font-size:20px;cursor:pointer">✕</button></div>';
 if(!years.length){
   html+='<div style="padding:18px 4px;opacity:.72">Nessun torneo archiviato.</div>';
 }else{
   html+='<div style="display:flex;flex-direction:column;gap:8px">';
   years.forEach(year=>{
     const items=groups[year];
     html+='<details style="border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden">';
     html+='<summary style="cursor:pointer;padding:12px 14px;font-weight:700;list-style:none;display:flex;align-items:center;justify-content:space-between"><span>📅 '+escape(year)+'</span><span style="opacity:.7;font-size:12px">'+items.length+' torneo'+(items.length===1?'':'i')+'</span></summary>';
     html+='<div style="overflow:auto;padding:0 10px 10px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Mese</th>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Giorno</th>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Torneo</th>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">ID Torneo</th>';
     html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Apri</th></tr></thead><tbody>';
     items.forEach(t=>{
       const d=dateOf(t);
       const month=d?d.toLocaleDateString('it-IT',{month:'long'}):'-';
       const day=d?String(d.getDate()).padStart(2,'0'):'-';
       html+='<tr>';
       html+='<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">'+escape(month)+'</td>';
       html+='<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">'+escape(day)+'</td>';
       html+='<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">'+escape(nameOf(t))+'</td>';
       html+='<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">'+escape(t.id)+'</td>';
       html+='<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)"><button type="button" class="btn primary" data-open-archived-tournament="'+escape(t.id)+'" style="padding:6px 10px">Apri</button></td>';
       html+='</tr>';
     });
     html+='</tbody></table></div></details>';
   });
   html+='</div>';
 }
 b.innerHTML=html;
 b.style.display='block';
 b.querySelector('#chiudiArchivioAdmin')?.addEventListener('click',()=>{b.style.display='none'});
 b.querySelectorAll('[data-open-archived-tournament]').forEach(btn=>btn.addEventListener('click',()=>{
   const id=btn.getAttribute('data-open-archived-tournament');
   if(id&&typeof window.apriBoveConTorneo==='function')window.apriBoveConTorneo(id);
   else if(id)window.open('Bove.html?idTorneo='+encodeURIComponent(id),'_blank');
 }));
 return b;
}

function findArchiveButtons(){
 return [...document.querySelectorAll('button,[role="button"],a')].filter(el=>/archivio\s*tornei/i.test((el.textContent||'').trim()));
}

function bindArchiveButtons(){
 findArchiveButtons().forEach(btn=>{
   if(btn.__archiveBound)return;
   btn.__archiveBound=true;
   btn.addEventListener('click',e=>{
     e.preventDefault();
     e.stopImmediatePropagation();
     renderArchive();
   },true);
 });
}

function installArchiveOverride(){
 window.renderArchivio=renderArchive;
 bindArchiveButtons();
 const observer=new MutationObserver(()=>bindArchiveButtons());
 observer.observe(document.body,{childList:true,subtree:true});
}

let closing=false;
function sync(){
 const t=selected();
 if(isArchived(t)){
   const b=document.getElementById('archivioTorneiAdmin');
   const open=!!b&&getComputedStyle(b).display!=='none';
   if(open){hideManagement(true);return}
   if(!closing){
     closing=true;
     state().torneoSelezionato=null;
     hideManagement(false);
     if(typeof window.renderCleanAdmin==='function')window.renderCleanAdmin();
     closing=false;
   }
   return;
 }
 hideManagement(false);
 filterSelector();
}

if(!installManagementLock()){
 let n=0;
 const timer=setInterval(()=>{if(installManagementLock()||++n>100)clearInterval(timer)},50);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installArchiveOverride,{once:true});
else installArchiveOverride();

sync();
setInterval(sync,250);
})();
