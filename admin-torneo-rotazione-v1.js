/* TORNEO INDIVIDUALE A COPPIE VARIABILI
 * Gestione autonoma: giornate, coppie variabili, calendario, risultati,
 * statistiche individuali e classifica. Non usa le coppie/tabellone/calendario classici.
 */
(()=> {
'use strict';
const $=id=>document.getElementById(id);
const state=()=>window.adminState||{};
const current=()=> (state().tornei||[]).find(t=>String(t.id)===String(state().torneoSelezionato))||null;
const sb=()=>window.supabaseClient||window.sb;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const approved=g=>g?.stato==='approvato'||g?.approvato===true;
const name=g=>String(g?.nome_giocatore||[g?.nome,g?.cognome].filter(Boolean).join(' ')||g?.nome||'Giocatore').trim();
const key=g=>String(g?.id??g?.user_id??g?.email??g?.nome_giocatore??name(g));
const formula=t=>String(t?.formula||t?.configurazione?.rules?.formulaScelta||t?.configurazione?.rules?.tipoTorneo||'').trim();

function isRotation(t){return formula(t)==='individualeCoppieVariabili'}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return {}}}
function config(t){
  const c=t.configurazione&&typeof t.configurazione==='object'?clone(t.configurazione):{};
  c.rotazione=c.rotazione&&typeof c.rotazione==='object'?c.rotazione:{};
  const r=c.rotazione;
  r.version=2;
  r.giornate=Array.isArray(r.giornate)?r.giornate:[];
  r.puntiVittoria=Number.isFinite(Number(r.puntiVittoria))?Number(r.puntiVittoria):3;
  r.puntiPareggio=Number.isFinite(Number(r.puntiPareggio))?Number(r.puntiPareggio):1;
  r.puntiSconfitta=Number.isFinite(Number(r.puntiSconfitta))?Number(r.puntiSconfitta):0;
  r.numeroGiocatori=Number(r.numeroGiocatori)||Number(t.posti)||0;
  r.numeroGiornate=([6,8,10,12].includes(Number(r.numeroGiornate))?Number(r.numeroGiornate):String(r.numeroGiornate||'manuale'));
  if(![6,8,10,12,'manuale'].includes(r.numeroGiornate))r.numeroGiornate='manuale';
  r.campoDefault=r.campoDefault??'';
  r.oraDefault=r.oraDefault??'';
  r.calendario=r.calendario&&typeof r.calendario==='object'?r.calendario:{};
  r.calendario.attivo=r.calendario.attivo===true;
  r.calendario.giorni=Array.isArray(r.calendario.giorni)?r.calendario.giorni.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=7):[];
  r.calendario.giorni=[...new Set(r.calendario.giorni)].sort((a,b)=>a-b);
  r.calendario.ora=String(r.calendario.ora||r.oraDefault||'19:00');
  r.calendario.orari=r.calendario.orari&&typeof r.calendario.orari==='object'?r.calendario.orari:{};
  r.calendario.giorni.forEach(n=>{const k=String(n);r.calendario.orari[k]=String(r.calendario.orari[k]||r.calendario.ora||r.oraDefault||'19:00')});
  if(!r.campoDefault||!r.oraDefault){
    const first=(r.giornate||[]).flatMap(g=>g.partite||[]).find(m=>m&&(m.campo||m.ora));
    if(first){
      if(!r.campoDefault&&first.campo)r.campoDefault=String(first.campo);
      if(!r.oraDefault&&first.ora)r.oraDefault=String(first.ora);
    }
  }
  if(!r.campoDefault)r.campoDefault='Campo 1';
  if(!r.oraDefault)r.oraDefault='19:00';
  (r.giornate||[]).forEach(g=>(g.partite||[]).forEach((m,i)=>{
    if(!m.campo)m.campo=i%2===0?'Campo 1':'Campo 2';
    if(!m.ora)m.ora=r.oraDefault;
  }));
  return c;
}
async function save(t,c){
  const client=sb();
  if(!client)throw Error('Connessione Supabase non disponibile.');
  const r=await client.from('tornei').update({configurazione:c,formula:'individualeCoppieVariabili'}).eq('id',t.id).select('*').single();
  if(r.error)throw r.error;
  Object.assign(t,r.data||{});
  try{localStorage.setItem('padel_admin_state',JSON.stringify(state()))}catch(e){}
  return t;
}
async function players(t){
  const client=sb();
  const id=Number(t?.id||current()?.id);
  if(!client||!Number.isFinite(id)||id<=0)return [];
  const r=await client.from('iscrizioni').select('*').eq('torneo_id',id);
  if(r.error)throw r.error;
  const rows=Array.isArray(r.data)?r.data:[];
  window.iscrizioniTorneo=rows;
  return rows.filter(approved);
}
function emptyStats(p){return {id:key(p),nome:name(p),partite:0,vittorie:0,pareggi:0,sconfitte:0,punti:0,puntiFatti:0,puntiSubiti:0,differenza:0}}
function history(c){
  const partner={},opp={},groups={};
  c.rotazione.giornate.forEach(g=>(g.partite||[]).forEach(m=>{
    const a=m.coppiaA||[],b=m.coppiaB||[];
    const pairs=[...a.map((x,i)=>[x,a[1-i]]),...b.map((x,i)=>[x,b[1-i]])];
    pairs.forEach(([x,y])=>{if(x&&y){partner[x]=partner[x]||{};partner[x][y]=(partner[x][y]||0)+1}});
    a.forEach(x=>b.forEach(y=>{opp[x]=opp[x]||{};opp[y]=opp[y]||{};opp[x][y]=(opp[x][y]||0)+1;opp[y][x]=(opp[y][x]||0)+1}));
    const ids=[...a,...b].sort().join('|'); if(ids)groups[ids]=(groups[ids]||0)+1;
  }));
  return {partner,opp,groups};
}
function standings(t,ps){
  const c=config(t),map=Object.fromEntries(ps.map(p=>[key(p),emptyStats(p)]));
  c.rotazione.giornate.forEach(g=>(g.partite||[]).forEach(m=>{
    if(m.risA===''||m.risB===''||m.risA==null||m.risB==null)return;
    const a=Number(m.risA),b=Number(m.risB);
    if(!Number.isFinite(a)||!Number.isFinite(b))return;
    const A=m.coppiaA||[],B=m.coppiaB||[];
    [...A,...B].forEach(id=>{if(map[id])map[id].partite++});
    A.forEach(id=>{if(map[id]){map[id].puntiFatti+=a;map[id].puntiSubiti+=b}});
    B.forEach(id=>{if(map[id]){map[id].puntiFatti+=b;map[id].puntiSubiti+=a}});
    const winner=a>b?'A':b>a?'B':'D';
    A.forEach(id=>{if(!map[id])return;if(winner==='A'){map[id].punti+=c.rotazione.puntiVittoria;map[id].vittorie++}else if(winner==='D'){map[id].punti+=c.rotazione.puntiPareggio;map[id].pareggi++}else map[id].sconfitte++});
    B.forEach(id=>{if(!map[id])return;if(winner==='B'){map[id].punti+=c.rotazione.puntiVittoria;map[id].vittorie++}else if(winner==='D'){map[id].punti+=c.rotazione.puntiPareggio;map[id].pareggi++}else map[id].sconfitte++});
  }));
  return Object.values(map).map(x=>{x.differenza=x.puntiFatti-x.puntiSubiti;return x}).sort((a,b)=>
    b.punti-a.punti||b.differenza-a.differenza||b.puntiFatti-a.puntiFatti||b.vittorie-a.vittorie||a.partite-b.partite||a.nome.localeCompare(b.nome,'it')
  );
}
function dayName(n){return ['','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'][Number(n)]||''}
function calendarDayInputs(r){return [1,2,3,4,5,6,7].map(n=>'<div style="display:flex;align-items:center;gap:6px;margin:4px 8px 4px 0"><label style="display:flex;align-items:center;gap:5px"><input type="checkbox" class="rotDay" value="'+n+'" '+(r.calendario.giorni.includes(n)?'checked':'')+'> '+dayName(n)+'</label><input class="rotDayTime" data-day="'+n+'" type="time" value="'+esc((r.calendario.orari&&r.calendario.orari[String(n)])||r.calendario.ora||r.oraDefault||'19:00')+'" style="width:105px"></div>').join('')}
function isoDate(d){return d.toISOString().slice(0,10)}
function parseDate(s){const p=String(s||'').split('-').map(Number);return p.length===3&&p.every(Number.isFinite)?new Date(Date.UTC(p[0],p[1]-1,p[2])):null}
function nextCalendarSlot(t){const c=config(t),cal=c.rotazione.calendario||{},giorni=Array.isArray(cal.giorni)?cal.giorni:[],orari=cal.orari&&typeof cal.orari==='object'?cal.orari:{},fallback=String(cal.ora||c.rotazione.oraDefault||'19:00');const last=(c.rotazione.giornate||[]).map(g=>parseDate(g.data)).filter(Boolean).sort((a,b)=>b-a)[0];const now=new Date(),base=last?new Date(last.getTime()+86400000):now; if(!giorni.length)return {data:isoDate(base),ora:c.rotazione.oraDefault};for(let i=0;i<370;i++){const d=new Date(base.getTime()+i*86400000),js=d.getUTCDay(),giorno=js===0?7:js,ora=String(orari[String(giorno)]||fallback),parts=ora.split(':').map(Number),candidate=new Date(d.getTime());candidate.setHours(parts[0]||0,parts[1]||0,0,0);if(!giorni.includes(giorno))continue;if(candidate.getTime()<=now.getTime() && !last)continue;return {data:isoDate(d),ora}}return {data:isoDate(base),ora:fallback}}
function calendarText(cal){const giorni=Array.isArray(cal?.giorni)?cal.giorni:[],orari=cal?.orari&&typeof cal.orari==='object'?cal.orari:{};return giorni.length?giorni.map(n=>dayName(n)+' '+String(orari[String(n)]||cal.ora||'')).join(' · '):'Non programmato'}
function generateRound(t,ps,scheduledSlot){
  if(ps.length<4)throw Error('Servono almeno 4 giocatori approvati.');
  const c=config(t),h=history(c),rank=standings(t,ps);
  const played=Object.fromEntries(rank.map(x=>[x.id,x.partite]));
  const matches=Math.floor(ps.length/4),activeCount=matches*4;
  let best=null,bestScore=Infinity;
  for(let attempt=0;attempt<700;attempt++){
    const shuffled=ps.slice().sort((a,b)=>(played[key(a)]-played[key(b)])+(Math.random()-.5)*0.9);
    const active=shuffled.slice(0,activeCount);let score=0;const groups=[];
    for(let i=0;i<active.length;i+=4){
      const g=active.slice(i,i+4).map(key),variants=[[[g[0],g[1]],[g[2],g[3]]],[[g[0],g[2]],[g[1],g[3]]],[[g[0],g[3]],[g[1],g[2]]]];
      let localBest=null,localScore=Infinity;
      variants.forEach(v=>{
        const [A,B]=v;
        const partnerPenalty=A.concat(B).reduce((s,x,j,arr)=>{const y=arr[j%2===0?j+1:j-1];return s+(h.partner[x]?.[y]||0)*10000},0);
        const opponentPenalty=A.reduce((s,x)=>s+B.reduce((z,y)=>z+(h.opp[x]?.[y]||0)*35,0),0);
        const groupKey=[...g].sort().join('|'),groupPenalty=(h.groups[groupKey]||0)*20,vscore=partnerPenalty+opponentPenalty+groupPenalty;
        if(vscore<localScore){localScore=vscore;localBest=v}
      });
      score+=localScore;groups.push(localBest);
    }
    const vals=active.map(p=>played[key(p)]||0);score+=Math.max(...vals)-Math.min(...vals);
    if(score<bestScore){bestScore=score;best={active,groups}}
  }
  const activeKeys=new Set(best.active.map(key)),resting=ps.filter(p=>!activeKeys.has(key(p))).map(key);
  const numero=c.rotazione.giornate.length+1,slot=scheduledSlot||nextCalendarSlot(t),data=slot.data,ora=slot.ora||c.rotazione.oraDefault;
  const partite=best.groups.map((v,i)=>({id:'g'+numero+'-m'+(i+1),coppiaA:v[0],coppiaB:v[1],risA:'',risB:'',campo:c.rotazione.campoDefault,ora}));
  c.rotazione.giornate.push({numero,data,partite,riposo:resting});return c;
}
function playerMap(ps){return Object.fromEntries(ps.map(p=>[key(p),name(p)]))}
function inputScore(v){return v===''?'':String(Math.max(0,Number(v)||0))}
function isolateKingUi(){
  const controls=$('adminTournamentControls');
  if(controls)controls.style.setProperty('display','none','important');
  const title=$('topbarTitle');
  if(title)title.textContent='King Torneo Individuale a Coppie Variabili';
  const app=$('appContent')?.closest('.app');
  if(app){
    app.querySelectorAll('.sidebar .nav button[data-page]').forEach(b=>b.classList.remove('active'));
    $('sideKing')?.classList.add('active');
    $('mobileKing')?.classList.add('active');
  }
}
function render(t,ps){
  const root=$('appContent');if(!root)return;
  isolateKingUi();
  const c=config(t),r=c.rotazione,pm=playerMap(ps),rank=standings(t,ps),h=history(c);
  const limiteGiornate=r.numeroGiornate==='manuale'?'manuale':Number(r.numeroGiornate);
  const limiteRaggiunto=limiteGiornate!=='manuale'&&r.giornate.length>=limiteGiornate;
  const complete=g=>(g.partite||[]).length>0&&g.partite.every(m=>m.risA!==''&&m.risA!=null&&m.risB!==''&&m.risB!=null);
  const currentDay=[...r.giornate].reverse().find(g=>!complete(g))||null;
  const archived=r.giornate.filter(g=>g!==currentDay);
  const allPlayed=rank.map(x=>x.partite),maxPlayed=allPlayed.length?Math.max(...allPlayed):0,minPlayed=allPlayed.length?Math.min(...allPlayed):0;
  const pairCount=Object.values(h.partner).reduce((n,o)=>n+Object.values(o).reduce((a,v)=>a+v,0),0)/2;
  const dayCard=(g,open=false)=>'<details class="card king-day-card" style="margin:10px 0" '+(open?'open':'')+'><summary class="king-day-summary"><span>▼ Giornata '+g.numero+' — '+esc(g.data||'Data non impostata')+'</span><span class="notice">'+esc((g.partite||[]).length+' partite')+'</span></summary><div class="card-body"><div class="king-day-meta"><label>Data <input data-date="'+g.numero+'" type="date" value="'+esc(g.data||'')+'"></label><span class="notice">'+esc(g.riposo?.length?'Riposo: '+g.riposo.map(id=>pm[id]||'Giocatore').join(', '):'Nessun riposo')+'</span></div>'+(g.partite||[]).map((m,i)=>'<div class="list-item king-match"><div class="king-match-main"><strong>'+esc((m.coppiaA||[]).map(id=>pm[id]||'Giocatore').join(' / '))+' <span>VS</span> '+esc((m.coppiaB||[]).map(id=>pm[id]||'Giocatore').join(' / '))+'</strong><small>Campo <input data-meta="'+g.numero+'" data-mi="'+i+'" data-k="campo" value="'+esc(m.campo||'')+'" class="king-small-input"> · Ora <input data-meta="'+g.numero+'" data-mi="'+i+'" data-k="ora" type="time" value="'+esc(m.ora||'')+'" class="king-time-input"></small><details class="king-manual"><summary>✋ Gestione manuale coppie</summary><div class="king-manual-row">'+[0,1,2,3].map(pos=>'<select data-pair="'+g.numero+'" data-mi="'+i+'" data-pos="'+pos+'">'+ps.map(p=>'<option value="'+esc(key(p))+'" '+(key(p)===(pos<2?(m.coppiaA||[])[pos]:(m.coppiaB||[])[pos-2])?'selected':'')+'>'+esc(name(p))+'</option>').join('')+'</select>').join('')+'<button class="btn" data-save-pair="'+g.numero+'" data-mi="'+i+'">Salva coppie</button></div></details></div><div class="list-actions king-score"><input data-r="'+g.numero+'" data-m="'+i+'" data-s="a" type="number" min="0" value="'+esc(m.risA)+'" placeholder="0"><span>—</span><input data-r="'+g.numero+'" data-m="'+i+'" data-s="b" type="number" min="0" value="'+esc(m.risB)+'" placeholder="0"></div></div>').join('')+'</div></details>';

  root.innerHTML=`<style id="kingLayoutStyle">  .king-shell{display:block;position:relative;isolation:isolate;z-index:1;width:100%;max-width:1180px;margin:0 auto;box-sizing:border-box;color:#17202a}.king-shell *{box-sizing:border-box}.king-hero{position:relative;z-index:1}  .king-hero{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px 24px;margin-bottom:18px;border-radius:18px;background:rgba(17,24,39,.15);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.4);box-shadow:none;color:#e5e7eb}.king-hero *{color:inherit}.king-hero h1{color:#101828}.king-hero p{color:#475569}.king-kicker{color:#fff !important}  .king-kicker{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.6;margin-bottom:5px}  .king-hero h1{margin:0;font-size:25px;line-height:1.2}  .king-hero p{margin:7px 0 0;opacity:.7}  .king-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;position:relative;z-index:2}.king-actions .btn{position:relative;z-index:2}  .king-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,360px);column-gap:28px;row-gap:28px;align-items:start;position:relative;z-index:1;width:100%}  .king-main,.king-side{display:grid;gap:24px;min-width:0;width:100%;align-content:start}.king-main>.card,.king-side>.card{position:relative;z-index:1;min-width:0;width:100%;}  .king-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid rgba(30,41,59,.08)}  .king-card-head h2{margin:0;font-size:17px}  .king-card-head p{margin:4px 0 0;font-size:12px;opacity:.65}  .king-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}  .king-config-grid label{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700}  .king-config-grid input,.king-config-grid select{width:100%;box-sizing:border-box}  .king-actions-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}  .king-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}  .king-stat{padding:13px;border-radius:12px;background:rgba(15,23,42,.035);border:1px solid rgba(30,41,59,.06)}  .king-stat span{display:block;font-size:11px;opacity:.6}.king-stat b{display:block;font-size:20px;margin-top:3px}  .king-ranking-wrap{width:100%;overflow-x:auto}
  .king-ranking{width:100%;min-width:760px;border-collapse:collapse;table-layout:fixed;font-size:13px}
  .king-ranking th,.king-ranking td{box-sizing:border-box;padding:11px 8px;text-align:center;border-bottom:1px solid rgba(30,41,59,.07);white-space:nowrap;vertical-align:middle}
  .king-ranking th:nth-child(1),.king-ranking td:nth-child(1){width:48px}.king-ranking th:nth-child(2),.king-ranking td:nth-child(2){width:auto;text-align:left}.king-ranking th:nth-child(n+3),.king-ranking td:nth-child(n+3){width:58px}.king-ranking th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;opacity:.65;background:rgba(15,23,42,.025);height:40px}
  .king-ranking tbody tr{height:44px}.king-ranking tbody tr:first-child td{font-weight:700}.king-ranking tbody tr:hover{background:rgba(15,23,42,.025)}
  .king-rank-badge{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;border-radius:8px;background:rgba(15,23,42,.06);font-weight:800}  .king-day-summary{cursor:pointer;padding:15px 17px;font-weight:700;display:flex;justify-content:space-between;gap:12px;list-style:none}.king-day-meta{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.king-match{gap:12px}.king-match-main{flex:1;min-width:260px}.king-match-main strong{display:block;line-height:1.45}.king-match-main small{display:block;margin-top:7px;opacity:.7}.king-small-input{width:90px}.king-time-input{width:105px}.king-manual{margin-top:9px}.king-manual-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.king-score{align-items:center;min-width:132px}.king-score input{width:50px!important;text-align:center;font-size:16px;font-weight:700}.king-info-list{display:grid;gap:0}.king-info-list .info-row{padding:10px 0;border-bottom:1px solid rgba(30,41,59,.07)}  .king-program{padding:11px 13px;border-radius:10px;background:rgba(15,23,42,.035);font-size:12px;line-height:1.5}  @media(max-width:900px){.king-shell{max-width:none}.king-grid{grid-template-columns:1fr}.king-grid{grid-template-columns:1fr}.king-hero{align-items:flex-start;flex-direction:column}.king-actions{justify-content:flex-start}.king-config-grid{grid-template-columns:1fr}}  @media(max-width:620px){.king-hero{padding:18px}.king-hero h1{font-size:21px}.king-stat-grid{grid-template-columns:1fr 1fr}.king-ranking{min-width:760px}.king-match{align-items:stretch}.king-score{justify-content:flex-end}.king-config-grid{grid-template-columns:1fr}}  </style><div class="king-shell"><div class="king-hero"><div><div class="king-kicker">Torneo speciale</div><h1>🏆 King Torneo Individuale a Coppie Variabili</h1><p>${esc(t.nome)} · gestione autonoma · classifica individuale</p></div><div class="king-actions"><button class="btn" id="rotBack">← Torna ai tornei</button></div></div><div class="king-grid"><div class="king-main">  <details class="card" open><summary class="king-card-head"><div><h2>⚙️ Configurazione</h2><p>Stessi parametri del King attuale, organizzati in modo più leggibile.</p></div><span class="notice">Impostazioni</span></summary><div class="card-body"><div class="king-config-grid">  <label>Numero giocatori<input id="rotN" type="number" min="4" value="${r.numeroGiocatori}"></label><label>Punti vittoria<input id="rotPV" type="number" min="0" value="${r.puntiVittoria}"></label><label>Punti pareggio<input id="rotPP" type="number" min="0" value="${r.puntiPareggio}"></label><label>Punti sconfitta<input id="rotPS" type="number" min="0" value="${r.puntiSconfitta}"></label><label>Campo predefinito<input id="rotCampo" value="${esc(r.campoDefault)}"></label><label>Ora predefinita<input id="rotOra" type="time" value="${esc(r.oraDefault)}"></label><label>Numero giornate torneo<select id="rotNG"><option value="6" ${(r.numeroGiornate===6?'selected':'')}>6</option><option value="8" ${(r.numeroGiornate===8?'selected':'')}>8</option><option value="10" ${(r.numeroGiornate===10?'selected':'')}>10</option><option value="12" ${(r.numeroGiornate===12?'selected':'')}>12</option><option value="manuale" ${(r.numeroGiornate==='manuale'?'selected':'')}>Manuale</option></select></label></div></div></details>  <details class="card" open><summary class="king-card-head"><div><h2>👥 Giocatori</h2><p>Partecipanti approvati e strumenti operativi.</p></div><span class="notice">${ps.length} approvati</span></summary><div class="card-body"><div class="king-actions-row"><button class="btn" id="rotSimulate">🧪 Crea simulazione completa</button><button class="btn primary" id="rotNewRound">＋ Genera nuova giornata</button></div><div class="king-stat-grid"><div class="king-stat"><span>Giocatori</span><b>${ps.length}</b></div><div class="king-stat"><span>Giornate</span><b>${r.giornate.length+(limiteGiornate!=='manuale'?'/'+limiteGiornate:'')}</b></div><div class="king-stat"><span>Partite/giocatore</span><b>${minPlayed}–${maxPlayed}</b></div></div><div class="list" style="margin-top:14px">${ps.map(p=>{const s=rank.find(x=>x.id===key(p));return '<div class="list-item"><div><strong>'+esc(name(p))+'</strong><small>'+((s?.partite)||0)+' partite · '+((s?.punti)||0)+' punti · differenza '+((s?.differenza)||0)+'</small></div></div>'}).join('')}</div></div></details>  <details class="card" open><summary class="king-card-head"><div><h2>📊 Classifica</h2><p>Punti → differenza → punti fatti → vittorie → partite giocate</p></div><span class="notice">${rank.length} giocatori</span></summary><div class="card-body"><div class="king-ranking-wrap"><table class="king-ranking"><thead><tr><th>#</th><th>Giocatore</th><th>Pt</th><th>PG</th><th>V</th><th>P</th><th>S</th><th>PF</th><th>PS</th><th>Diff.</th></tr></thead><tbody>${rank.map((x,i)=>'<tr><td><span class="king-rank-badge">'+(i+1)+'</span></td><td><b>'+esc(x.nome)+'</b></td><td>'+x.punti+'</td><td>'+x.partite+'</td><td>'+x.vittorie+'</td><td>'+x.pareggi+'</td><td>'+x.sconfitte+'</td><td>'+x.puntiFatti+'</td><td>'+x.puntiSubiti+'</td><td><b>'+x.differenza+'</b></td></tr>').join('')}</tbody></table></div></div></details>  <details class="card"><summary class="king-card-head"><div><h2>📅 Archivio risultati</h2><p>Giornate già disputate e consultabili.</p></div><span class="notice">${archived.length} giornate</span></summary><div class="card-body">${(archived.length?archived.map(g=>dayCard(g,false)).join(''):'<div class="empty">Nessuna giornata archiviata.</div>')}</div></details>  <details class="card" ${(currentDay?'open':'')}><summary class="king-card-head"><div><h2>🎾 Giornata in corso</h2><p>${(currentDay?'Giornata '+currentDay.numero+' · inserimento risultati':'Nessuna giornata in corso')}</p></div><span class="notice">${(currentDay?'In corso':'Pronta')}</span></summary><div class="card-body">${(currentDay?dayCard(currentDay,true).replace(/^<details[^>]*>|<\/details>$/g,''):'<div class="empty">Nessuna giornata in corso. Genera una nuova giornata quando necessario.</div>')}</div></details></div>  <div class="king-side">  <details class="card" open><summary class="king-card-head"><div><h2>📅 Calendario</h2><p>Programmazione ricorrente delle giornate.</p></div><span class="notice">${(r.calendario.attivo?'Attivo':'Non attivo')}</span></summary><div class="card-body"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px">${calendarDayInputs(r)}</div><div style="display:grid;gap:10px;margin-top:12px"><label style="display:flex;align-items:center;gap:6px"><input id="rotCalActive" type="checkbox" ${(r.calendario.attivo?'checked':'')}> Attiva calendario fisso</label><label>Ora ricorrente <input id="rotCalOra" type="time" value="${esc(r.calendario.ora)}"></label></div><small>Più giorni alla settimana sono ammessi, con orari diversi. Data, ora e campo della singola giornata restano modificabili.</small><div class="king-program" style="margin-top:12px">Programmazione: <b>${esc(calendarText(r.calendario))}</b></div><button class="btn primary" id="rotSaveRules" style="margin-top:12px">💾 Salva impostazioni</button><div class="notice" style="margin-top:10px">Numero giornate: <b id="rotLimitText"></b></div></div></details>  <details class="card" open><summary class="king-card-head"><div><h2>🔄 Controllo rotazioni</h2><p>Equilibrio di partite e coppie già utilizzate.</p></div></summary><div class="card-body"><div class="king-info-list"><div class="info-row"><span>Partite per giocatore</span><b>${minPlayed} – ${maxPlayed}</b></div><div class="info-row"><span>Coppie già registrate</span><b>${pairCount}</b></div><div class="info-row"><span>Giornate completate</span><b>${r.giornate.filter(complete).length} / ${r.giornate.length}</b></div></div><div class="notice" style="margin-top:10px">La generazione automatica usa lo storico per costruire la nuova giornata e non modifica le giornate concluse.</div></div></details>  </div></div></div>`;
  $('rotBack').onclick=()=>window.openAdminPage?.('torneo');
  $('rotLimitText').textContent=r.numeroGiornate==='manuale'?'Manuale — nessun limite automatico':String(r.numeroGiornate)+' giornate'+(limiteRaggiunto?' — LIMITE RAGGIUNTO':' — ancora '+(limiteGiornate-r.giornate.length)+' disponibili');
  if(limiteRaggiunto){$('rotNewRound').disabled=true;$('rotNewRound').textContent='✓ Torneo completo';}
  $('rotSaveRules').onclick=async()=>{try{const nc=config(t);nc.rotazione.numeroGiocatori=Math.max(4,Number($('rotN').value)||ps.length);nc.rotazione.puntiVittoria=Math.max(0,Number($('rotPV').value)||0);nc.rotazione.puntiPareggio=Math.max(0,Number($('rotPP').value)||0);nc.rotazione.puntiSconfitta=Math.max(0,Number($('rotPS').value)||0);nc.rotazione.campoDefault=$('rotCampo').value.trim();nc.rotazione.oraDefault=$('rotOra').value;nc.rotazione.calendario.attivo=$('rotCalActive').checked;nc.rotazione.calendario.giorni=[...root.querySelectorAll('.rotDay:checked')].map(x=>Number(x.value)).sort((a,b)=>a-b);nc.rotazione.calendario.ora=$('rotCalOra').value||nc.rotazione.oraDefault;nc.rotazione.calendario.orari={};root.querySelectorAll('.rotDayTime').forEach(x=>{nc.rotazione.calendario.orari[String(x.dataset.day)]=x.value||nc.rotazione.calendario.ora});const ng=$('rotNG').value;nc.rotazione.numeroGiornate=ng==='manuale'?'manuale':Number(ng);if(nc.rotazione.numeroGiornate!=='manuale'&&nc.rotazione.giornate.length>nc.rotazione.numeroGiornate)throw Error('Il torneo contiene già '+nc.rotazione.giornate.length+' giornate. Non puoi impostare un limite inferiore a quelle già create.');await save(t,nc);render(t,ps)}catch(e){alert(e.message||e)}};
  $('rotSimulate').onclick=async()=>{try{await simulate()}catch(e){alert(e.message||e)}};
  $('rotNewRound').onclick=async()=>{try{const fresh=await players(t);const limite=Number(r.numeroGiornate);if(Number.isFinite(limite)&&r.giornate.length>=limite)throw Error('Il torneo è completo: sono state raggiunte le '+limite+' giornate previste.');if(Number(r.numeroGiocatori)>0&&fresh.length<Number(r.numeroGiocatori))throw Error('Servono '+r.numeroGiocatori+' giocatori approvati; al momento sono '+fresh.length+'.');if(r.calendario.attivo&&!r.calendario.giorni.length)throw Error('Il calendario fisso è attivo ma non hai selezionato nessun giorno.');const scheduled=r.calendario.attivo?nextCalendarSlot(t):{data:new Date().toISOString().slice(0,10),ora:r.oraDefault};const nc=generateRound(t,fresh,scheduled);const saved=await save(t,nc);t=saved||t;const currentState=state();currentState.tornei=(currentState.tornei||[]).map(x=>String(x.id)===String(t.id)?t:x);currentState.torneoSelezionato=t.id;window.adminState=currentState;render(t,fresh)}catch(e){alert(e.message||e)}};
  root.querySelectorAll('[data-r]').forEach(inp=>{inp.addEventListener('change',async()=>{try{const nc=config(t),g=nc.rotazione.giornate.find(x=>String(x.numero)===String(inp.dataset.r));if(!g)return;const m=g.partite[Number(inp.dataset.m)];if(!m)return;m[inp.dataset.s==='a'?'risA':'risB']=inputScore(inp.value);await save(t,nc);render(t,ps)}catch(e){alert(e.message||e)}})});
  root.querySelectorAll('[data-date]').forEach(inp=>{inp.addEventListener('change',async()=>{try{const nc=config(t),g=nc.rotazione.giornate.find(x=>String(x.numero)===String(inp.dataset.date));if(!g||!inp.value)return;g.data=inp.value;await save(t,nc);render(t,ps)}catch(e){alert(e.message||e)}})});
  root.querySelectorAll('[data-meta]').forEach(inp=>{inp.addEventListener('change',async()=>{try{const nc=config(t),g=nc.rotazione.giornate.find(x=>String(x.numero)===String(inp.dataset.meta));if(!g)return;const m=g.partite[Number(inp.dataset.mi)];if(!m)return;m[inp.dataset.k]=inp.value;await save(t,nc)}catch(e){alert(e.message||e)}})});
  root.querySelectorAll('[data-save-pair]').forEach(btn=>{btn.addEventListener('click',async()=>{try{const nc=config(t),g=nc.rotazione.giornate.find(x=>String(x.numero)===String(btn.dataset.savePair));if(!g)return;const m=g.partite[Number(btn.dataset.mi)];if(!m)return;const vals=[...btn.parentElement.querySelectorAll('[data-pair]')].map(x=>x.value);if(vals.length!==4||new Set(vals).size!==4)throw Error('Ogni giocatore può comparire una sola volta nella giornata.');m.coppiaA=vals.slice(0,2);m.coppiaB=vals.slice(2,4);await save(t,nc);render(t,ps)}catch(e){alert(e.message||e)}})});
}
async function simulate(){
  const client=sb();if(!client)throw Error('Connessione Supabase non disponibile.');
  const nomeTorneo='TEST - Individuale Coppie Variabili - SIMULAZIONE';
  if(!confirm('Creare una simulazione completa con 8 giocatori e 6 giornate? Il test precedente con lo stesso nome verrà sostituito.'))return;
  const old=await client.from('tornei').select('id').eq('nome',nomeTorneo);if(old.error)throw old.error;
  for(const row of (old.data||[])){const d=await client.from('iscrizioni').delete().eq('torneo_id',row.id);if(d.error)throw d.error;const x=await client.from('tornei').delete().eq('id',row.id);if(x.error)throw x.error;}
  const now=new Date(),id=Date.now();
  const giocatori=[['Marco','Rossi'],['Luca','Bianchi'],['Andrea','Verdi'],['Paolo','Neri'],['Stefano','Galli'],['Matteo','Conti'],['Davide','Romano'],['Fabio','Costa']];
  const baseConfigurazione={coppie:[],partecipanti:[],rules:{locked:true,tipoTorneo:'individualeCoppieVariabili',formulaScelta:'individualeCoppieVariabili',numeroSquadre:0,numeroGiocatori:8,numeroGironi:0},rotazione:{version:2,numeroGiocatori:8,puntiVittoria:3,puntiPareggio:1,puntiSconfitta:0,campoDefault:'Campo 1',oraDefault:'19:00',numeroGiornate:6,giornate:[]}};
  const tr=await client.from('tornei').insert({id,nome:nomeTorneo,data:now.toISOString().slice(0,10),data_torneo:now.toISOString().slice(0,10),descrizione:'SIMULAZIONE AUTOMATICA: 8 giocatori, 6 giornate, risultati realistici.',posti:8,stato:'attivo',pubblicato:false,iscrizioni_chiuse:true,formula:'individualeCoppieVariabili',configurazione:baseConfigurazione}).select('*').single();
  if(tr.error)throw tr.error;
  const rows=giocatori.map(p=>({torneo_id:id,nome_giocatore:p[0]+' '+p[1],nome:p[0],cognome:p[1],stato:'approvato',approvato:true,categoria:'Individuale Coppie Variabili'}));
  const ir=await client.from('iscrizioni').insert(rows).select('*');
  if(ir.error){await client.from('tornei').delete().eq('id',id);throw ir.error;}
  const byName=Object.fromEntries((ir.data||rows).map(p=>[name(p),key(p)])),idFor=(n,c)=>byName[n+' '+c],D=(numero,offset,partite)=>({numero,data:new Date(now.getTime()+offset*86400000).toISOString().slice(0,10),partite,riposo:[]}),K=(a,b)=>[idFor(a[0],a[1]),idFor(a[2],a[3])],m=(idn,a,b,ra,rb,campo,ora)=>({id:idn,coppiaA:K(a),coppiaB:K(b),risA:String(ra),risB:String(rb),campo,ora}),G=(numero,offset,partite)=>D(numero,offset,partite);
  const giornate=[
    G(1,0,[m('g1-m1',['Marco','Rossi','Luca','Bianchi'],['Andrea','Verdi','Paolo','Neri'],6,4,'Campo 1','19:00'),m('g1-m2',['Stefano','Galli','Matteo','Conti'],['Davide','Romano','Fabio','Costa'],5,7,'Campo 2','19:00')]),
    G(2,1,[m('g2-m1',['Marco','Rossi','Andrea','Verdi'],['Stefano','Galli','Davide','Romano'],7,5,'Campo 1','19:00'),m('g2-m2',['Luca','Bianchi','Paolo','Neri'],['Matteo','Conti','Fabio','Costa'],6,6,'Campo 2','19:00')]),
    G(3,2,[m('g3-m1',['Marco','Rossi','Paolo','Neri'],['Matteo','Conti','Davide','Romano'],4,6,'Campo 1','19:00'),m('g3-m2',['Luca','Bianchi','Stefano','Galli'],['Andrea','Verdi','Fabio','Costa'],7,5,'Campo 2','19:00')]),
    G(4,3,[m('g4-m1',['Marco','Rossi','Stefano','Galli'],['Fabio','Costa','Paolo','Neri'],6,6,'Campo 1','19:00'),m('g4-m2',['Luca','Bianchi','Matteo','Conti'],['Andrea','Verdi','Davide','Romano'],6,4,'Campo 2','19:00')]),
    G(5,4,[m('g5-m1',['Marco','Rossi','Matteo','Conti'],['Luca','Bianchi','Fabio','Costa'],7,5,'Campo 1','19:00'),m('g5-m2',['Andrea','Verdi','Stefano','Galli'],['Paolo','Neri','Davide','Romano'],6,6,'Campo 2','19:00')]),
    G(6,5,[m('g6-m1',['Marco','Rossi','Davide','Romano'],['Andrea','Verdi','Matteo','Conti'],5,7,'Campo 1','19:00'),m('g6-m2',['Luca','Bianchi','Paolo','Neri'],['Stefano','Galli','Fabio','Costa'],6,4,'Campo 2','19:00')])
  ];
  const configurazione={...baseConfigurazione,rotazione:{...baseConfigurazione.rotazione,giornate}};
  const up=await client.from('tornei').update({configurazione}).eq('id',id).select('*').single();
  if(up.error){await client.from('iscrizioni').delete().eq('torneo_id',id);await client.from('tornei').delete().eq('id',id);throw up.error;}
  const s=state();s.tornei=(s.tornei||[]).filter(t=>String(t.id)!==String(id));s.tornei.push(up.data||tr.data);s.torneoSelezionato=id;window.adminState=s;
  try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){}
  window.iscrizioniTorneo=ir.data||rows;render(up.data||tr.data,window.iscrizioniTorneo);
  alert('Simulazione creata: 8 giocatori, 6 giornate, 12 partite e risultati già inseriti.');
}
async function open(){
  let t=current();if(!t){alert('Seleziona prima un torneo.');return}if(!isRotation(t))return;
  try{
    const client=sb();
    if(client){const fresh=await client.from('tornei').select('*').eq('id',t.id).single();if(fresh.error)throw fresh.error;if(fresh.data){t=fresh.data;const s=state();s.tornei=(s.tornei||[]).map(x=>String(x.id)===String(t.id)?t:x);window.adminState=s;try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){}}}
    const normalized=config(t);
    const isSimulation=String(t.nome||'').trim()==='TEST - Individuale Coppie Variabili - SIMULAZIONE';
    const simulationNeedsDayLimit=isSimulation&&normalized.rotazione.numeroGiornate==='manuale';
    if(simulationNeedsDayLimit) normalized.rotazione.numeroGiornate=6;
    const raw=t.configurazione&&typeof t.configurazione==='object'?t.configurazione:{};
    const rawRot=raw.rotazione&&typeof raw.rotazione==='object'?raw.rotazione:{};
    const rawGames=Array.isArray(rawRot.giornate)?rawRot.giornate:[];
    const rawMissingDefaults=!rawRot.campoDefault||!rawRot.oraDefault;
    const rawMissingMeta=rawGames.some(g=>(g.partite||[]).some(m=>!m.campo||!m.ora));
    if(rawMissingDefaults||rawMissingMeta||simulationNeedsDayLimit){
      t=await save(t,normalized);
    }
    render(t,await players(t));
  }catch(e){alert(e.message||e)}
}
function inject(){
  const root=$('appContent'),t=current();
  if(!root||!t||!isRotation(t))return;
  const controls=$('adminTournamentControls');
  if(controls)controls.style.setProperty('display','none','important');
  const app=root.closest('.app');
  if(!app)return;
  app.querySelectorAll('.sidebar .nav button[data-page]').forEach(b=>b.classList.remove('active'));
  const kingButton=$('sideKing');
  if(kingButton)kingButton.classList.add('active');
  const mobileKing=$('mobileKing');
  if(mobileKing)mobileKing.classList.add('active');
  const sideTab=$('sideTabellone'),sideCal=$('sideCalendario');
  if(sideTab)sideTab.style.display='none';
  if(sideCal)sideCal.style.display='none';
  app.querySelectorAll('.sidebar .nav button[data-page="coppie"],.sidebar .nav button[data-page="dati"],.mobile-nav button[data-page="coppie"],.mobile-nav button[data-page="dati"]').forEach(b=>b.style.display='none');
  const title=$('topbarTitle');
  if(title)title.textContent='King Torneo Individuale a Coppie Variabili';
}
async function openSeparated(){const list=state().tornei||[],king=list.find(t=>String(t?.formula||t?.configurazione?.rules?.formulaScelta||'')==='individualeCoppieVariabili');if(!king){alert('Non esiste ancora un King Torneo Individuale a Coppie Variabili.');return}const st=state();st.torneoSelezionato=king.id;window.adminState=st;try{localStorage.setItem('padel_admin_state',JSON.stringify(st))}catch(e){}await open()}
window.apriKingSeparato=openSeparated;
window.apriGestioneIndividualeCoppieVariabili=open;
window.apriGestioneRotazione=open;
window.addEventListener('admin:rendered',()=>requestAnimationFrame(inject));
window.addEventListener('admin:render',()=>requestAnimationFrame(inject));
new MutationObserver(()=>requestAnimationFrame(inject)).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,100));else setTimeout(inject,100);
})();