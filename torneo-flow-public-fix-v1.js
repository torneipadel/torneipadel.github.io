/* TORNEI PUBLICI V4 - TORNEI + SPONSOR PUBBLICI */
(function(){
'use strict';
const URL_SUPABASE='https://iybjvtmfaupgthqqsngd.supabase.co';
const KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
function esc(v){return String(v==null?'':v).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}
function idVal(v){return Number(v);}
function aperto(t){return (t.pubblicato===true||t.stato==='attivo') && t.iscrizioni_chiuse!==true && t.stato!=='chiuso';}
function chiuso(t){return t.iscrizioni_chiuse===true || t.stato==='chiuso';}
function card(t,closed){
 const id=idVal(t.id);
 return `<div class="torneo-item"><h3>🏆 ${esc(t.nome||'Torneo')}</h3><p>📅 ${esc(t.data||'-')}</p><p>🎾 Formula: ${esc(t.formula||t.configurazione?.rules?.tipoTorneo||'Padel')}</p><p>📌 ${closed?'Torneo concluso':'Iscrizioni aperte'}</p>${closed?`<button class="btn-apri" onclick="apriTorneoPubblico(${id})">👁 VEDI TORNEO</button>`:`<button class="btn-iscriviti" onclick="vaiIscrizione(${id})">ISCRIVITI</button><button class="btn-apri" onclick="apriTorneoPubblico(${id})">🚀 APRI TORNEO</button>`}</div>`;
}
function installMenu(aperti){
 const section=document.getElementById('tornei'); if(!section)return;
 document.getElementById('menuTorneiDaFare')?.remove();
 const box=document.createElement('div'); box.id='menuTorneiDaFare';
 box.style.cssText='margin-bottom:18px;background:rgba(0,0,0,.20);padding:14px;border-radius:14px;';
 box.innerHTML=`<details><summary style="cursor:pointer;font-weight:bold;font-size:16px;padding:4px">📋 Tornei ancora da fare (${aperti.length})</summary><div style="margin-top:12px"><select id="selectTorneiDaFare" style="width:100%;padding:12px;border-radius:10px;border:0;font-weight:bold"><option value="">Seleziona un torneo...</option>${aperti.map(t=>`<option value="${idVal(t.id)}">${esc(t.nome||'Torneo')} — ${esc(t.data||'-')}</option>`).join('')}</select><div id="azioniTorneoSelezionato" style="margin-top:10px"></div></div></details>`;
 const list=document.getElementById('lista-tornei'); section.insertBefore(box,list||null);
 document.getElementById('selectTorneiDaFare')?.addEventListener('change',function(){
   const id=this.value, target=document.getElementById('azioniTorneoSelezionato'); if(!target)return;
   target.innerHTML=id?`<button class="btn-iscriviti" onclick="vaiIscrizione(${Number(id)})">ISCRIVITI AL TORNEO</button><button class="btn-apri" onclick="apriTorneoPubblico(${Number(id)})">🚀 APRI TORNEO</button>`:'';
 });
}
function installArchivio(chiusi){
 const section=document.getElementById('tornei'); if(!section)return;
 document.getElementById('archivioTornei')?.remove();
 const box=document.createElement('div'); box.id='archivioTornei'; box.style.cssText='margin-top:20px;';
 box.innerHTML=`<details><summary style="cursor:pointer;font-weight:bold;font-size:16px;padding:12px;background:rgba(0,0,0,.20);border-radius:12px">🗄️ Archivio tornei chiusi (${chiusi.length})</summary><div style="margin-top:12px">${chiusi.length?chiusi.map(t=>card(t,true)).join(''):'<div class="news-item">Nessun torneo chiuso in archivio.</div>'}</div></details>`;
 section.appendChild(box);
}
function installSponsor(client){
 if(location.pathname.toLowerCase().endsWith('iscrizione.html'))return;
 if(document.getElementById('publicSponsorBanner'))return;
 const target=document.querySelector('.container')||document.body;
 if(!target)return;
 const banner=document.createElement('section');
 banner.id='publicSponsorBanner';
 banner.className='public-sponsor-banner';
 banner.innerHTML='<div class="public-sponsor-title">I NOSTRI SPONSOR</div><div class="public-sponsor-window"><div class="public-sponsor-track"><div class="public-sponsor-empty">Caricamento sponsor...</div></div></div>';
 const style=document.createElement('style');
 style.textContent='.public-sponsor-banner{width:100%;margin:18px 0 4px;padding:12px 0 14px;text-align:center}.public-sponsor-title{font-weight:800;font-size:16px;letter-spacing:1px;margin-bottom:10px;text-transform:uppercase}.public-sponsor-window{width:100%;overflow:hidden;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}.public-sponsor-track{display:flex;align-items:center;gap:12px;width:max-content;min-height:82px;padding:8px;animation:publicSponsorScroll 24s linear infinite}.public-sponsor-item{width:190px;min-height:62px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;text-decoration:none;flex:none}.public-sponsor-name{font-weight:800;font-size:14px}.public-sponsor-desc{font-size:11px;opacity:.85;margin-top:4px;line-height:1.2}.public-sponsor-empty{min-height:62px;display:flex;align-items:center;justify-content:center;width:100%;padding:0 12px;font-size:12px;opacity:.8}.public-sponsor-single{width:100%;justify-content:center;animation:none}.public-sponsor-single .public-sponsor-item{width:min(300px,80vw)}@keyframes publicSponsorScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(max-width:600px){.public-sponsor-banner{margin-top:14px}.public-sponsor-title{font-size:14px}.public-sponsor-item{width:155px;min-height:58px}.public-sponsor-track{min-height:72px;animation-duration:20s}}';
 document.head.appendChild(style);
 target.appendChild(banner);
 (async()=>{
   const {data,error}=await client.from('tornei').select('id,configurazione');
   const track=banner.querySelector('.public-sponsor-track');
   if(error||!track){track.innerHTML='<div class="public-sponsor-empty">Sponsor non disponibili</div>';return;}
   const sponsors=[]; const seen=new Set();
   (data||[]).forEach(t=>{
     const list=Array.isArray(t.configurazione?.sponsor)?t.configurazione.sponsor:[];
     list.forEach(s=>{
       const nome=String(s?.nome||'').trim(),url=String(s?.url||'').trim(),descrizione=String(s?.descrizione||'').trim();
       if(!nome)return;
       const key=String(s?.id||'')||`${nome}|${url}`;
       if(seen.has(key))return;
       seen.add(key); sponsors.push({nome,url,descrizione});
     });
   });
   if(!sponsors.length){track.innerHTML='<div class="public-sponsor-empty">Nessuno sponsor configurato</div>';return;}
   const render=s=>{const inner=`<span class="public-sponsor-name">${esc(s.nome)}</span>${s.descrizione?`<span class="public-sponsor-desc">${esc(s.descrizione)}</span>`:''}`;return s.url?`<a class="public-sponsor-item" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<div class="public-sponsor-item">${inner}</div>`};
   track.innerHTML=sponsors.map(render).join('')+sponsors.map(render).join('');
   if(sponsors.length===1)track.classList.add('public-sponsor-single');
 })();
}
async function run(){
 if(typeof supabase==='undefined')return;
 const client=supabase.createClient(URL_SUPABASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 installSponsor(client);
 const box=document.getElementById('lista-tornei'); if(!box)return;
 const {data,error}=await client.from('tornei').select('id,nome,data,stato,pubblicato,iscrizioni_chiuse,formula,configurazione').order('data',{ascending:true});
 if(error){console.error('[PUBLIC TOURNAMENTS]',error);box.innerHTML='<div class="torneo-item">❌ Errore caricamento tornei</div>';return;}
 const aperti=(data||[]).filter(aperto), chiusi=(data||[]).filter(chiuso);
 box.innerHTML=aperti.length?aperti.map(t=>card(t,false)).join(''):'<div class="torneo-item">Nessun torneo aperto al momento.</div>';
 installMenu(aperti); installArchivio(chiusi);
}
window.apriTorneoPubblico=function(id){if(!id){alert('Torneo non valido');return;}window.location.href='tabellone.html?idTorneo='+encodeURIComponent(id);};
window.addEventListener('load',function(){setTimeout(run,0);});
})();