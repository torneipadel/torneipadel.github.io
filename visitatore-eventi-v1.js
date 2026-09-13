/* NEXT POINT PADEL — EVENTI / CALENDARIO V1
   Trasforma la sezione Eventi della pagina visitatore in un calendario reale
   alimentato direttamente dai tornei pubblicati su Supabase.
*/
(function(){
'use strict';

const SUPABASE_URL='https://iybjvtmfaupgthqqsngd.supabase.co';
const SUPABASE_KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
let sb=null;

const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>Number(v)||0;

function labelDate(v){
  if(!v)return 'Data da definire';
  const d=new Date(v);
  if(Number.isNaN(d.getTime()))return String(v);
  return new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'2-digit',month:'long',year:'numeric'}).format(d);
}

function isOpen(t){
  const stato=String(t.stato||'').toLowerCase();
  return (t.pubblicato===true||stato==='attivo') && t.iscrizioni_chiuse!==true && !['chiuso','concluso','archiviato'].includes(stato);
}

function isVisible(t){
  const stato=String(t.stato||'').toLowerCase();
  return t.pubblicato===true || stato==='attivo';
}

function formula(t){return t?.formula||t?.configurazione?.rules?.tipoTorneo||'Padel'}

function render(tornei){
  const box=document.getElementById('npEvents');
  if(!box)return;

  const sorted=(tornei||[]).filter(t=>t&&t.data&&isVisible(t)).sort((a,b)=>new Date(a.data)-new Date(b.data));
  const upcoming=sorted.filter(t=>new Date(t.data)>=new Date(new Date().setHours(0,0,0,0)));

  if(!upcoming.length){
    box.innerHTML='<div class="np-empty">Nessun appuntamento in calendario al momento.<br><span style="display:inline-block;margin-top:8px;opacity:.7">I prossimi tornei pubblicati appariranno automaticamente qui.</span></div>';
    return;
  }

  const rows=upcoming.slice(0,12).map(t=>{
    const open=isOpen(t);
    return `<article class="np-event-row">
      <div class="np-event-date"><strong>${esc(new Intl.DateTimeFormat('it-IT',{day:'2-digit'}).format(new Date(t.data)))}</strong><span>${esc(new Intl.DateTimeFormat('it-IT',{month:'short'}).format(new Date(t.data)).toUpperCase())}</span></div>
      <div class="np-event-main"><span class="np-event-status">${open?'ISCRIZIONI APERTE':'APPUNTAMENTO'}</span><strong>${esc(t.nome||'Torneo')}</strong><span>${esc(labelDate(t.data))} · ${esc(formula(t))}</span></div>
      <div class="np-event-actions"><button class="np-btn np-ghost" onclick="apriTorneoPubblico(${num(t.id)})">VEDI</button>${open?`<button class="np-btn np-primary" onclick="vaiIscrizione(${num(t.id)})">ISCRIVITI</button>`:''}</div>
    </article>`;
  }).join('');

  box.innerHTML=`<div class="np-event-calendar-head"><div><span class="np-kicker">CALENDARIO UFFICIALE</span><h3>Prossimi appuntamenti</h3><p>I tornei pubblicati dal club vengono aggiornati automaticamente.</p></div><a class="np-btn np-primary" href="#tornei">SCOPRI I TORNEI</a></div><div class="np-event-list">${rows}</div>`;
}

function styles(){
  if(document.getElementById('np-eventi-v1-style'))return;
  const s=document.createElement('style');s.id='np-eventi-v1-style';
  s.textContent=`
  .np-event-calendar-head{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px}
  .np-event-calendar-head h3{font-size:24px;margin:6px 0;text-align:left}
  .np-event-calendar-head p{margin:0;color:rgba(255,255,255,.58);font-size:11px}
  .np-event-list{display:grid;gap:9px}
  .np-event-row{display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:15px;padding:13px;border-radius:18px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.12);transition:.2s}
  .np-event-row:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.09)}
  .np-event-date{width:58px;height:58px;border-radius:16px;background:rgba(255,255,255,.11);display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.13)}
  .np-event-date strong{font-size:21px;line-height:1}.np-event-date span{font-size:9px;font-weight:900;letter-spacing:1px;margin-top:4px;color:var(--np-gold)}
  .np-event-main{min-width:0}.np-event-main strong{display:block;font-size:14px;margin:3px 0}.np-event-main>span:last-child{display:block;color:rgba(255,255,255,.56);font-size:10px}.np-event-status{font-size:8px!important;font-weight:900;letter-spacing:1.2px;color:var(--np-cyan)}
  .np-event-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.np-event-actions .np-btn{padding:9px 12px}
  @media(max-width:600px){.np-event-calendar-head{align-items:flex-start;flex-direction:column}.np-event-calendar-head .np-btn{width:100%}.np-event-row{grid-template-columns:58px 1fr}.np-event-actions{grid-column:1/-1;justify-content:stretch}.np-event-actions .np-btn{flex:1}.np-event-date{width:50px;height:50px}}
  `;
  document.head.appendChild(s);
}

async function load(){
  const box=document.getElementById('npEvents');
  if(!box)return;
  if(!window.supabase){box.innerHTML='<div class="np-empty">Calendario temporaneamente non disponibile.</div>';return;}
  try{
    sb=sb||supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    const {data,error}=await sb.from('tornei').select('id,nome,data,stato,pubblicato,iscrizioni_chiuse,formula,configurazione').order('data',{ascending:true});
    if(error)throw error;
    render(data||[]);
  }catch(err){
    console.error('[VISITATORE EVENTI]',err);
    box.innerHTML='<div class="np-empty">Calendario temporaneamente non disponibile.</div>';
  }
}

function init(){
  styles();
  load();
  setInterval(load,15000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
