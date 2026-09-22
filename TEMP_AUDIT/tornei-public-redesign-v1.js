/* NEXT POINT PADEL — Public Tournaments Editorial Redesign V1 */
(function(){
'use strict';

const SUPABASE_URL='https://iybjvtmfaupgthqqsngd.supabase.co';
const SUPABASE_KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
let client=null;
let tournaments=[];
let counts={};

function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));}
function id(v){return Number(v)||0;}
function openTournament(t){return (t.pubblicato===true||String(t.stato||'').toLowerCase()==='attivo') && t.iscrizioni_chiuse!==true && !['chiuso','concluso','archiviato'].includes(String(t.stato||'').toLowerCase());}
function closedTournament(t){return t.iscrizioni_chiuse===true || ['chiuso','concluso','archiviato'].includes(String(t.stato||'').toLowerCase());}
function formula(t){return t.formula||t.configurazione?.rules?.tipoTorneo||'Padel';}
function poster(t){
 const items=Array.isArray(t.configurazione?.news)?t.configurazione.news:[];
 const p=items.find(n=>n?.immagine && (n.inEvidenza===true || n.tipo==='Locandina')) || items.find(n=>n?.immagine);
 return p?.immagine||'';
}
function capacity(t){
 const current=counts[t.id]||0;
 const max=Number(t.posti)||Number(t.configurazione?.rules?.numeroSquadre||0)*2||16;
 return {current,max,remaining:Math.max(0,max-current)};
}
function dateLabel(v){
 if(!v)return '-';
 const d=new Date(v);
 if(Number.isNaN(d.getTime()))return String(v);
 return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'long',year:'numeric'}).format(d);
}
function goSignup(idv){if(!idv)return;window.location.href='iscrizione.html?torneo='+encodeURIComponent(idv);}
function goTournament(idv){if(!idv)return;window.location.href='Bove.html?idTorneo='+encodeURIComponent(idv);}
window.vaiIscrizione=goSignup;
window.apriTorneoPubblico=goTournament;

function injectStyle(){
 if(document.getElementById('np-tornei-editorial-style'))return;
 const s=document.createElement('style');s.id='np-tornei-editorial-style';
 s.textContent=`
 #tornei.np-tornei-page{background:transparent;border:0;box-shadow:none;padding:0;margin-top:8px}
 #tornei.np-tornei-page>.sezione-titolo{display:none}
 .np-tour-wrap{max-width:1180px;margin:0 auto;color:#fff}
 .np-tour-head{padding:8px 4px 24px;text-align:left}
 .np-tour-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.10);border-radius:999px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;backdrop-filter:blur(10px)}
 .np-tour-head h2{margin:14px 0 8px;text-align:left;font-size:clamp(30px,5vw,48px);line-height:1.02;letter-spacing:-1.5px}
 .np-tour-head p{margin:0;max-width:720px;font-size:15px;line-height:1.65;color:rgba(255,255,255,.78)}
 .np-feature{position:relative;overflow:hidden;min-height:390px;border-radius:28px;border:1px solid rgba(255,255,255,.20);background:rgba(8,15,28,.58);box-shadow:0 22px 60px rgba(0,0,0,.38);margin-bottom:28px;display:grid;grid-template-columns:1.05fr .95fr;isolation:isolate}
 .np-feature-media{position:relative;min-height:390px;background:linear-gradient(135deg,rgba(0,74,153,.7),rgba(6,18,34,.92));overflow:hidden}
 .np-feature-media img{width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0}
 .np-feature-media:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,12,24,.05),rgba(5,12,24,.78));}
 .np-no-poster{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:92px;opacity:.17}
 .np-feature-body{padding:34px 34px 32px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}
 .np-kicker{font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#ffeb3b;margin-bottom:12px}
 .np-feature-body h3{font-size:clamp(27px,4vw,42px);line-height:1.05;text-align:left;margin:0 0 16px;letter-spacing:-1px}
 .np-feature-desc{font-size:14px;line-height:1.6;color:rgba(255,255,255,.72);margin:0 0 20px}
 .np-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
 .np-chip{padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);font-size:12px;font-weight:700}
 .np-actions{display:flex;gap:10px;flex-wrap:wrap}
 .np-btn{appearance:none;border:0;border-radius:13px;padding:12px 17px;font-weight:900;font-size:12px;letter-spacing:.4px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,opacity .18s ease}
 .np-btn:hover{transform:translateY(-2px)}
 .np-btn-primary{background:#fff;color:#004a99;box-shadow:0 10px 24px rgba(0,0,0,.24)}
 .np-btn-secondary{background:rgba(255,255,255,.10);color:#fff;border:1px solid rgba(255,255,255,.22)}
 .np-section-title{display:flex;align-items:end;justify-content:space-between;gap:15px;margin:30px 2px 14px}
 .np-section-title h3{margin:0;text-align:left;font-size:22px}
 .np-section-title span{font-size:12px;color:rgba(255,255,255,.62)}
 .np-tour-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
 .np-tour-card{overflow:hidden;border-radius:22px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);box-shadow:0 12px 34px rgba(0,0,0,.22);backdrop-filter:blur(12px);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
 .np-tour-card:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.34);box-shadow:0 18px 42px rgba(0,0,0,.3)}
 .np-card-media{height:170px;position:relative;overflow:hidden;background:linear-gradient(135deg,#0b2340,#06111f)}
 .np-card-media img{width:100%;height:100%;object-fit:cover;display:block}
 .np-card-media:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.48))}
 .np-card-badge{position:absolute;left:12px;top:12px;z-index:2;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.92);color:#073b72;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.6px}
 .np-card-body{padding:17px}
 .np-card-body h4{margin:0 0 9px;font-size:19px;line-height:1.15}
 .np-card-meta{display:grid;gap:6px;color:rgba(255,255,255,.75);font-size:12px;margin-bottom:14px}
 .np-capacity{font-size:11px;font-weight:800;color:#fff;margin:0 0 13px}
 .np-capacity.hot{color:#ffeb3b}.np-capacity.full{color:#ff9b9b}
 .np-card-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 .np-card-actions .np-btn{width:100%;padding:11px 8px}
 .np-empty{padding:26px;border:1px dashed rgba(255,255,255,.24);border-radius:20px;text-align:center;color:rgba(255,255,255,.68);background:rgba(0,0,0,.14)}
 .np-archive{margin-top:30px;border-radius:20px;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.16);overflow:hidden}
 .np-archive summary{cursor:pointer;list-style:none;padding:17px 18px;font-weight:800;font-size:13px}
 .np-archive summary::-webkit-details-marker{display:none}
 .np-archive summary:after{content:'＋';float:right;font-size:18px;opacity:.7}.np-archive[open] summary:after{content:'−'}
 .np-archive-list{padding:0 14px 14px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .np-archive-card{padding:14px;border-radius:15px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:space-between;gap:12px}
 .np-archive-card strong{display:block;font-size:13px}.np-archive-card span{display:block;margin-top:4px;font-size:11px;color:rgba(255,255,255,.58)}
 .np-archive-card .np-btn{padding:9px 12px;white-space:nowrap}
 @media(max-width:850px){.np-feature{grid-template-columns:1fr}.np-feature-media{min-height:260px}.np-feature-body{padding:25px}.np-tour-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:560px){.np-tour-wrap{width:100%}.np-tour-head{padding:8px 2px 18px}.np-feature{border-radius:22px}.np-feature-media{min-height:220px}.np-feature-body{padding:21px}.np-feature-body h3{font-size:29px}.np-tour-grid{grid-template-columns:1fr}.np-card-media{height:190px}.np-archive-list{grid-template-columns:1fr}.np-card-actions{grid-template-columns:1fr 1fr}}
 `;
 document.head.appendChild(s);
}

async function loadData(){
 if(typeof supabase==='undefined')return;
 client=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data,error}=await client.from('tornei').select('id,nome,data,stato,pubblicato,iscrizioni_chiuse,formula,posti,configurazione').order('data',{ascending:true});
 if(error){console.error('[TORNEI REDESIGN]',error);return;}
 tournaments=data||[];
 const ids=tournaments.map(t=>t.id).filter(Boolean);
 if(ids.length){
  const r=await client.from('iscrizioni').select('torneo_id,stato').in('torneo_id',ids);
  counts={};(r.data||[]).forEach(x=>{if(String(x.stato||'').toLowerCase()==='rifiutato')return;counts[x.torneo_id]=(counts[x.torneo_id]||0)+1;});
 }
}

function card(t){
 const c=capacity(t),img=poster(t),full=c.remaining<=0;
 return `<article class="np-tour-card"><div class="np-card-media">${img?`<img src="${esc(img)}" alt="${esc(t.nome||'Torneo')}" loading="lazy">`:'<div class="np-no-poster">🎾</div>'}<span class="np-card-badge">${full?'Completo':'Iscrizioni aperte'}</span></div><div class="np-card-body"><h4>${esc(t.nome||'Torneo')}</h4><div class="np-card-meta"><span>📅 ${esc(dateLabel(t.data))}</span><span>🎾 ${esc(formula(t))}</span></div><div class="np-capacity ${full?'full':c.remaining<=3?'hot':''}">${full?'🔴 Torneo completo':`👥 ${c.current}/${c.max} iscritti · ${c.remaining} posti disponibili`}</div><div class="np-card-actions"><button class="np-btn np-btn-primary" ${full?'disabled':''} onclick="vaiIscrizione(${id(t.id)})">${full?'COMPLETO':'ISCRIVITI'}</button><button class="np-btn np-btn-secondary" onclick="apriTorneoPubblico(${id(t.id)})">VEDI TORNEO</button></div></div></article>`;
}
function featured(t){
 const c=capacity(t),img=poster(t),full=c.remaining<=0;
 return `<article class="np-feature"><div class="np-feature-media">${img?`<img src="${esc(img)}" alt="${esc(t.nome||'Torneo')}" loading="eager">`:'<div class="np-no-poster">🎾</div>'}</div><div class="np-feature-body"><div class="np-kicker">Prossimo appuntamento</div><h3>${esc(t.nome||'Torneo')}</h3><p class="np-feature-desc">Preparati a scendere in campo. Tutte le informazioni del torneo, la disponibilità e l'accesso diretto alla competizione sono qui.</p><div class="np-meta"><span class="np-chip">📅 ${esc(dateLabel(t.data))}</span><span class="np-chip">🎾 ${esc(formula(t))}</span><span class="np-chip">${full?'🔴 Completo':`👥 ${c.remaining} posti disponibili`}</span></div><div class="np-actions"><button class="np-btn np-btn-primary" ${full?'disabled':''} onclick="vaiIscrizione(${id(t.id)})">${full?'TORNEO COMPLETO':'ISCRIVITI AL TORNEO'}</button><button class="np-btn np-btn-secondary" onclick="apriTorneoPubblico(${id(t.id)})">VEDI TORNEO</button></div></div></article>`;
}
function render(){
 const section=document.getElementById('tornei');if(!section)return;
 injectStyle();section.classList.add('np-tornei-page');
 const open=tournaments.filter(openTournament),closed=tournaments.filter(closedTournament);
 const featuredTour=open[0];
 const others=featuredTour?open.slice(1):open;
 section.innerHTML=`<div class="np-tour-wrap"><div class="np-tour-head"><span class="np-tour-eyebrow">NEXT POINT PADEL · TORNEI</span><h2>Scendi in campo.</h2><p>Scopri i prossimi tornei, guarda la locandina, verifica i posti disponibili e iscriviti in pochi secondi.</p></div>${featuredTour?featured(featuredTour):'<div class="np-empty">Nessun torneo aperto al momento.</div>'}${others.length?`<div class="np-section-title"><h3>Altri tornei in programma</h3><span>${others.length} appuntamenti</span></div><div class="np-tour-grid">${others.map(card).join('')}</div>`:''}<details class="np-archive" ${closed.length?'':'style="display:none"'}><summary>Archivio tornei · ${closed.length}</summary><div class="np-archive-list">${closed.map(t=>`<div class="np-archive-card"><div><strong>${esc(t.nome||'Torneo')}</strong><span>${esc(dateLabel(t.data))} · ${esc(formula(t))}</span></div><button class="np-btn np-btn-secondary" onclick="apriTorneoPubblico(${id(t.id)})">VEDI</button></div>`).join('')}</div></details></div>`;
}
async function refresh(){await loadData();render();}
window.addEventListener('load',()=>setTimeout(refresh,1100));
setInterval(()=>{if(document.visibilityState==='visible')refresh();},15000);
})();
