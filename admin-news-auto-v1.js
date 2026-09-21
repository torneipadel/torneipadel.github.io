/* ADMIN NEWS AUTO V1 — generazione automatica News + locandina deterministica per torneo.
   Nessuna modifica al flusso torneo: osserva solo tornei pubblicati/attivi e crea una News una sola volta.
*/
(()=>{'use strict';
const REPO_VERSION='1.0.0';
const get=id=>document.getElementById(id);
const clean=v=>String(v??'').replace(/\\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const cfg=t=>t?.configurazione&&typeof t.configurazione==='object'?{...t.configurazione}:{};
const client=()=>window.supabaseClient||window.sb;
const currentTournaments=()=>Array.isArray(window.adminState?.tornei)?window.adminState.tornei:[];
const eligible=t=>t&&t.id&&clean(t.nome||t.nomeTorneo)&&(
  t.pubblicato===true||String(t.stato||'').toLowerCase()==='attivo'||String(t.stato||'').toLowerCase()==='pubblicato'
);
const dateText=t=>{const v=t.data_torneo||t.data||t.dataTorneo||'';if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('it-IT',{day:'2-digit',month:'long',year:'numeric'});};
const getField=(t,...keys)=>{const c=cfg(t);for(const k of keys){if(c[k]!=null&&clean(c[k]))return clean(c[k]);}return '';};
function posterSvg(t){
  const name=clean(t.nome||t.nomeTorneo||'Torneo di Padel');
  const date=dateText(t);
  const time=getField(t,'ora','orario','time');
  const place=getField(t,'luogo','location','sede','club');
  const pairs=getField(t,'coppie','numeroCoppie','squadre','numeroSquadre','posti');
  const fee=getField(t,'quota','quotaIscrizione','fee','prezzo');
  const deadline=getField(t,'scadenza','deadline','termineIscrizioni');
  const lines=[date,time,place,pairs?(pairs+' coppie'):'',fee?('Quota '+fee):'',deadline?('Iscrizioni entro '+deadline):''].filter(Boolean).slice(0,6);
  const safeName=esc(name).slice(0,90);
  const safeLines=lines.map(esc);
  const lineSvg=safeLines.map((x,i)=>'<text x="540" y="'+(760+i*70)+'" text-anchor="middle" class="info">'+x+'</text>').join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06294b"/><stop offset="1" stop-color="#0b6b68"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#g)"/><rect x="55" y="55" width="970" height="1240" rx="42" fill="#071827" fill-opacity=".28" stroke="#ffffff" stroke-opacity=".22" stroke-width="2"/><text x="540" y="180" text-anchor="middle" class="eyebrow">NEXT POINT PADEL</text><text x="540" y="330" text-anchor="middle" class="title">'+safeName+'</text><line x1="220" y1="420" x2="860" y2="420" stroke="#ffe76b" stroke-width="6" stroke-linecap="round"/>'+lineSvg+'<text x="540" y="1210" text-anchor="middle" class="cta">INFO E ISCRIZIONI NEL SITO</text><style>.eyebrow{font:800 34px Arial;letter-spacing:6px;fill:#ffe76b}.title{font:900 72px Arial;fill:#fff}.info{font:700 34px Arial;fill:#fff}.cta{font:800 30px Arial;fill:#ffe76b;letter-spacing:2px}</style></svg>';
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
}
async function aiText(t){
  const sb=client();
  const base=sb?.supabaseUrl||window.SUPABASE_URL||'https://iybjvtmfaupgthqqsngd.supabase.co';
  let token='';
  try{token=(await sb?.auth?.getSession?.())?.data?.session?.access_token||'';}catch(_){}
  const d={date:dateText(t),time:getField(t,'ora','orario','time'),location:getField(t,'luogo','location','sede','club'),pairs:getField(t,'coppie','numeroCoppie','squadre','numeroSquadre','posti'),level:getField(t,'livello','level'),fee:getField(t,'quota','quotaIscrizione','fee','prezzo'),deadline:getField(t,'scadenza','deadline','termineIscrizioni')};
  const input={type:'Torneo',title:clean(t.nome||t.nomeTorneo),data:d};
  if(token){try{const r=await fetch(base+'/functions/v1/news-ai',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(input)});if(r.ok){const out=await r.json();if(out?.title&&out?.text)return out;}}catch(e){console.warn('News AI automatica non disponibile:',e)}}
  const info=[d.date&&('📅 '+d.date),d.time&&('⏰ '+d.time),d.location&&('📍 '+d.location),d.pairs&&('👥 '+d.pairs+' coppie'),d.level&&('🎾 Livello '+d.level),d.fee&&('💶 Quota '+d.fee),d.deadline&&('⏳ Iscrizioni entro '+d.deadline)].filter(Boolean);
  return {title:input.title,text:[input.title+'.',...info,'Una giornata di padel, sfide e divertimento.'].join('\n\n'),mode:'template'};
}
async function save(t){
  const sb=client();if(!sb)return false;
  const fresh=await sb.from('tornei').select('id,nome,data,data_torneo,descrizione,configurazione,pubblicato,stato').eq('id',t.id).maybeSingle();
  if(fresh.error||!fresh.data)return false;
  t=fresh.data;
  if(!eligible(t))return false;
  const c=cfg(t),items=Array.isArray(c.news)?c.news:[];
  const id='auto-news-torneo-'+String(t.id);
  if(items.some(n=>String(n.id)===id||String(n.autoKey||'')===id))return true;
  const out=await aiText(t);
  const item={id,tipo:'Torneo',titolo:out.title,testo:out.text,link:'Bove.html?idTorneo='+encodeURIComponent(t.id),immagine:posterSvg(t),inEvidenza:items.length===0,data:new Date().toISOString(),ordine:0,aiMode:out.mode||'template',autoGenerated:true,autoKey:id,template:'torneo-fixed-v1'};
  const next=items.length?[...items.map(n=>({...n,inEvidenza:false})),item]:[item];
  const saved=await sb.from('tornei').update({configurazione:{...c,news:next}}).eq('id',t.id).select('id,configurazione').maybeSingle();
  if(saved.error||!saved.data)return false;
  t.configurazione=saved.data.configurazione||{...c,news:next};
  return true;
}
let busy=false,lastRun=0;
async function run(){
  if(busy||Date.now()-lastRun<5000)return;
  busy=true;lastRun=Date.now();
  try{for(const t of currentTournaments()){if(eligible(t))await save(t)}}catch(e){console.warn('NEWS AUTO:',e)}finally{busy=false}
}
function hook(){if(window.__NP_NEWS_AUTO_V1__)return;window.__NP_NEWS_AUTO_V1__=true;setTimeout(run,2500);setInterval(run,15000);window.addEventListener('admin:render',()=>setTimeout(run,500));window.__NP_NEWS_AUTO_RUN__=run;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();