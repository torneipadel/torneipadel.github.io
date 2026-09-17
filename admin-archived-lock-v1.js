(()=>{
'use strict';

const client=()=>window.supabaseClient||window.sb||null;
const isArchived=t=>String(t?.stato||'').trim().toLowerCase()==='archiviato';
const dateOf=t=>{const raw=t?.data_torneo||t?.data||t?.created_at||'';if(!raw)return null;const d=new Date(String(raw).slice(0,10)+'T00:00:00');return Number.isNaN(d.getTime())?null:d};
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
  if(!groups[year])groups[year]=[];
  groups[year].push(t);
 });
 const years=Object.keys(groups).sort((a,c)=>{
  if(a==='Senza anno')return 1;
  if(c==='Senza anno')return -1;
  return Number(c)-Number(a);
 });
 let html='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><div><strong style="font-size:18px">📦 Archivio Tornei</strong></div><button type="button" id="chiudiArchivioAdmin" style="border:0;background:none;color:#fff;font-size:20px;cursor:pointer">✕</button></div>';
 if(!years.length){
  html+='<div style="padding:18px 4px;opacity:.72">Nessun torneo archiviato.</div>';
 }else{
  html+='<div style="display:flex;flex-direction:column;gap:8px">';
  years.forEach(year=>{
   const items=groups[year].slice().sort((a,c)=>(dateOf(a)?.getTime()||0)-(dateOf(c)?.getTime()||0));
   html+='<details style="border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden">';
   html+='<summary style="cursor:pointer;padding:12px 14px;font-weight:700;list-style:none;display:flex;align-items:center;justify-content:space-between"><span>Anno '+esc(year)+'</span><span style="opacity:.7;font-size:12px">'+items.length+' torneo'+(items.length===1?'':'i')+'</span></summary>';
   html+='<div style="overflow:auto;padding:0 10px 10px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>';
   html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Mese</th>';
   html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Giorno</th>';
   html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Torneo</th>';
   html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">ID Torneo</th>';
   html+='<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Apri</th></tr></thead><tbody>';
   items.forEach(t=>{
    const d=dateOf(t);
    const month=d?String(d.getMonth()+1).padStart(2,'0'):'-';
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
 b.querySelector('#chiudiArchivioAdmin')?.addEventListener('click',()=>{b.style.display='none'});
 b.querySelectorAll('[data-open-archived-tournament]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.getAttribute('data-open-archived-tournament');
  if(id&&typeof window.apriBoveConTorneo==='function')window.apriBoveConTorneo(id);
  else if(id)window.open('Bove.html?idTorneo='+encodeURIComponent(id),'_blank');
 }));
}

window.renderArchivePanel=renderArchive;

function filterMainSelector(){
 const select=document.getElementById('torneoSelector');
 if(!select)return;
 [...select.options].forEach(o=>{if(!o.value)return;const t=(window.adminState?.tornei||[]).find(x=>String(x.id)===String(o.value));if(isArchived(t))o.remove()});
 const selected=window.adminState?.tornei?.find(x=>String(x.id)===String(select.value));
 if(isArchived(selected)){select.value='';window.adminState.torneoSelezionato=null}
}

function bindButtons(){
 const desktop=document.getElementById('sideArchivioTornei');
 if(desktop&&desktop.dataset.archiveBound!=='1'){desktop.dataset.archiveBound='1';desktop.addEventListener('click',renderArchive)}
 const mobile=document.getElementById('mobileArchivioTornei');
 if(mobile&&mobile.dataset.archiveBound!=='1'){mobile.dataset.archiveBound='1';mobile.addEventListener('click',()=>{document.getElementById('mobileOverlay')?.classList.remove('open');renderArchive()})}
 filterMainSelector();
}

function boot(){bindButtons();window.addEventListener('admin:render',bindButtons);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
