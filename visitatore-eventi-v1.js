/* NEXT POINT PADEL — EVENTI / CALENDARIO V2
   Calendario mensile compatto + rifinitura UI visitatore.
   Mantiene le funzioni esistenti di iscrizione e apertura torneo.
*/
(function(){
'use strict';

const SUPABASE_URL='https://iybjvtmfaupgthqqsngd.supabase.co';
const SUPABASE_KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
let sb=null;
let allTournaments=[];
let currentMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);

const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>Number(v)||0;

function isOpen(t){
  const stato=String(t.stato||'').toLowerCase();
  return (t.pubblicato===true||stato==='attivo') && t.iscrizioni_chiuse!==true && !['chiuso','concluso','archiviato'].includes(stato);
}
function isVisible(t){
  const stato=String(t.stato||'').toLowerCase();
  return t.pubblicato===true || stato==='attivo';
}
function formula(t){return t?.formula||t?.configurazione?.rules?.tipoTorneo||'Padel'}
function monthLabel(d){return new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(d).replace(/^./,c=>c.toUpperCase())}

function openPoster(src,title){
  if(!src)return;
  let o=document.getElementById('npPosterLightbox');
  if(!o){
    o=document.createElement('div');
    o.id='npPosterLightbox';
    o.innerHTML='<button type="button" class="np-poster-close" aria-label="Chiudi">×</button><img alt=""><div class="np-poster-caption"></div>';
    document.body.appendChild(o);
    o.addEventListener('click',e=>{if(e.target===o||e.target.classList.contains('np-poster-close'))o.classList.remove('open')});
  }
  o.querySelector('img').src=src;
  o.querySelector('img').alt=title||'Locandina';
  o.querySelector('.np-poster-caption').textContent=title||'';
  o.classList.add('open');
}
window.npApriLocandina=openPoster;

function compactNavigation(){
  const menu=[...document.querySelectorAll('#npMenu a')];
  const tornei=menu.find(a=>(a.textContent||'').toLowerCase().includes('tornei'));
  if(tornei){tornei.href='#eventi';tornei.onclick=()=>{chiudiMenu();setTimeout(()=>document.getElementById('eventi')?.scrollIntoView({behavior:'smooth',block:'start'}),40)}}
  const discover=document.querySelector('.np-hero-actions .np-primary');
  if(discover)discover.href='#eventi';
}

function styles(){
  if(document.getElementById('np-visitor-v3-style'))return;
  const s=document.createElement('style');s.id='np-visitor-v3-style';s.textContent=`
  .np-hero{min-height:0!important;display:block!important;margin-bottom:14px!important}
  .np-hero-copy{min-height:0!important;padding:24px 26px!important;border-radius:22px!important}
  .np-hero h1{font-size:clamp(30px,5vw,48px)!important;line-height:1!important;margin:10px 0!important}
  .np-hero-copy p{font-size:12px!important;line-height:1.55!important;max-width:760px!important}
  .np-hero-actions{margin-top:15px!important;gap:7px!important}
  .np-hero-actions .np-btn{padding:9px 12px!important;font-size:9px!important;border-radius:10px!important}
  .np-hero-poster{display:none!important}
  #mioTorneo:has(.np-empty){display:none!important}
  #tornei{display:none!important}
  .np-section{margin:20px 0!important}
  .np-section-head{margin-bottom:9px!important}
  .np-section-head h2{font-size:20px!important}
  .np-section-head span{font-size:9px!important}
  .np-panel{padding:13px!important;border-radius:18px!important}
  .np-news-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important}
  .np-news-card{border-radius:14px!important;box-shadow:none!important}
  .np-news-img{aspect-ratio:16/9!important}
  .np-news-body{padding:10px!important}
  .np-news-body h3{font-size:13px!important;margin:5px 0!important}
  .np-news-body p{font-size:10px!important;line-height:1.4!important;max-height:42px!important;overflow:hidden!important}
  .np-news-body .np-btn{padding:7px 9px!important;font-size:8px!important;margin-top:7px!important}
  .np-user{padding:12px 15px!important;margin-bottom:12px!important;border-radius:16px!important}
  .np-user h3{font-size:14px!important}.np-user p{font-size:10px!important}
  .np-calendar-v2{display:grid;gap:12px}
  .np-cal-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
  .np-cal-title{font-size:17px;font-weight:800;letter-spacing:-.02em}
  .np-cal-nav{display:flex;gap:5px}.np-cal-nav button{width:31px;height:31px;border:1px solid rgba(255,255,255,.18);border-radius:9px;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:15px}
  .np-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
  .np-cal-week{font-size:8px;text-align:center;color:rgba(255,255,255,.42);padding:3px 0;font-weight:800}
  .np-cal-day{position:relative;min-height:42px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(255,255,255,.035);padding:5px;cursor:default}
  .np-cal-day.muted{opacity:.22}.np-cal-day.today{border-color:rgba(110,231,249,.55)}
  .np-cal-day.has-event{cursor:pointer;background:rgba(255,255,255,.085);border-color:rgba(255,231,107,.32)}
  .np-cal-num{font-size:10px;font-weight:800}.np-cal-dot{position:absolute;right:5px;top:5px;width:5px;height:5px;border-radius:50%;background:var(--np-gold)}
  .np-cal-event-name{display:block;margin-top:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:7px;color:rgba(255,255,255,.62)}
  .np-month-list{display:grid;gap:6px}.np-month-row{display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09)}
  .np-month-date{text-align:center}.np-month-date strong{display:block;font-size:17px;line-height:1}.np-month-date span{display:block;margin-top:2px;font-size:7px;color:var(--np-gold);font-weight:800;text-transform:uppercase}
  .np-month-main{min-width:0}.np-month-main strong{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.np-month-main span{display:block;margin-top:3px;font-size:8px;color:rgba(255,255,255,.48)}
  .np-month-poster{width:38px;height:48px;object-fit:cover;border-radius:6px;cursor:pointer;border:1px solid rgba(255,255,255,.15)}
  .np-month-actions{display:flex;align-items:center;gap:4px}.np-month-actions .np-btn{padding:7px 8px!important;font-size:8px!important;border-radius:8px!important}
  #npPosterLightbox{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:22px;background:rgba(0,0,0,.78);backdrop-filter:blur(8px)}
  #npPosterLightbox.open{display:flex}#npPosterLightbox img{max-width:min(92vw,760px);max-height:88vh;object-fit:contain;border-radius:12px;box-shadow:0 25px 80px rgba(0,0,0,.5)}
  .np-poster-close{position:absolute;top:15px;right:15px;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:27px;cursor:pointer}.np-poster-caption{position:absolute;left:20px;right:20px;bottom:16px;text-align:center;font-size:11px;color:rgba(255,255,255,.75)}
  @media(max-width:600px){.np-hero-copy{padding:21px 18px!important}.np-hero h1{font-size:32px!important}.np-news-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.np-cal-day{min-height:38px}.np-cal-event-name{display:none}.np-month-row{grid-template-columns:42px 1fr}.np-month-actions{grid-column:2;justify-content:flex-start}.np-month-actions .np-btn{padding:6px 8px!important}.np-month-poster{width:34px;height:43px}}
  `;document.head.appendChild(s);
}

function render(){
  const box=document.getElementById('npEvents');if(!box)return;
  const visible=allTournaments.filter(t=>t&&t.data&&isVisible(t));
  const year=currentMonth.getFullYear(),month=currentMonth.getMonth();
  const first=new Date(year,month,1),days=new Date(year,month+1,0).getDate();
  const start=(first.getDay()+6)%7;
  const byDay={};
  visible.forEach(t=>{const d=new Date(t.data);if(d.getFullYear()===year&&d.getMonth()===month){(byDay[d.getDate()]??=[]).push(t)}});
  const week=['L','M','M','G','V','S','D'];
  let cells=week.map(x=>`<div class="np-cal-week">${x}</div>`).join('');
  for(let i=0;i<start;i++)cells+='<div class="np-cal-day muted"></div>';
  const today=new Date();
  for(let day=1;day<=days;day++){
    const events=byDay[day]||[];const d=new Date(year,month,day);const isToday=d.toDateString()===today.toDateString();
    cells+=`<div class="np-cal-day ${isToday?'today ':''}${events.length?'has-event':''}" ${events.length?`data-day="${day}"`:''}><span class="np-cal-num">${day}</span>${events.length?'<span class="np-cal-dot"></span>':''}${events.length?`<span class="np-cal-event-name">${esc(events[0].nome||'Torneo')}</span>`:''}</div>`;
  }
  const monthEvents=visible.filter(t=>{const d=new Date(t.data);return d.getFullYear()===year&&d.getMonth()===month}).sort((a,b)=>new Date(a.data)-new Date(b.data));
  const rows=monthEvents.length?monthEvents.map(t=>{
    const d=new Date(t.data);const poster=Array.isArray(t.configurazione?.news)?t.configurazione.news.find(n=>n?.immagine)?.immagine:'';const open=isOpen(t);
    const posterHtml=poster?`<img class="np-month-poster" src="${esc(poster)}" alt="Locandina ${esc(t.nome||'torneo')}" loading="lazy" onclick="npApriLocandina(${JSON.stringify(poster)},${JSON.stringify(t.nome||'Locandina')})">`:'';
    return `<article class="np-month-row"><div class="np-month-date"><strong>${String(d.getDate()).padStart(2,'0')}</strong><span>${new Intl.DateTimeFormat('it-IT',{month:'short'}).format(d)}</span></div><div class="np-month-main"><strong>${esc(t.nome||'Torneo')}</strong><span>${esc(new Intl.DateTimeFormat('it-IT',{weekday:'short'}).format(d))} · ${esc(formula(t))}${open?' · Iscrizioni aperte':''}</span></div>${posterHtml}<div class="np-month-actions"><button class="np-btn np-ghost" type="button" onclick="apriTorneoPubblico(${num(t.id)})">APRI</button>${open?`<button class="np-btn np-primary" type="button" onclick="vaiIscrizione(${num(t.id)})">ISCRIVITI</button>`:''}</div></article>`;
  }).join(''):'<div class="np-empty">Nessun torneo pubblicato in questo mese.</div>';
  box.innerHTML=`<div class="np-calendar-v2"><div class="np-cal-head"><div><span class="np-kicker">TORNEI</span><div class="np-cal-title">${esc(monthLabel(currentMonth))}</div></div><div class="np-cal-nav"><button type="button" id="npCalPrev" aria-label="Mese precedente">‹</button><button type="button" id="npCalNext" aria-label="Mese successivo">›</button></div></div><div class="np-cal-grid">${cells}</div><div class="np-month-list">${rows}</div></div>`;
  box.querySelector('#npCalPrev').onclick=()=>{currentMonth=new Date(year,month-1,1);render()};
  box.querySelector('#npCalNext').onclick=()=>{currentMonth=new Date(year,month+1,1);render()};
  box.querySelectorAll('.np-cal-day.has-event').forEach(el=>el.onclick=()=>{const day=Number(el.dataset.day);const index=monthEvents.findIndex(t=>new Date(t.data).getDate()===day);const row=box.querySelectorAll('.np-month-row')[index];if(row)row.scrollIntoView({behavior:'smooth',block:'center'})});
}

async function load(){
  const box=document.getElementById('npEvents');if(!box)return;
  if(!window.supabase){box.innerHTML='<div class="np-empty">Calendario temporaneamente non disponibile.</div>';return}
  try{
    sb=sb||supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    const {data,error}=await sb.from('tornei').select('id,nome,data,stato,pubblicato,iscrizioni_chiuse,formula,configurazione').order('data',{ascending:true});
    if(error)throw error;allTournaments=data||[];render();
  }catch(err){console.error('[VISITATORE CALENDARIO]',err);box.innerHTML='<div class="np-empty">Calendario temporaneamente non disponibile.</div>'}
}

function init(){styles();compactNavigation();load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
