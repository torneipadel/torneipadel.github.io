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
  r.campoDefault=r.campoDefault??'';
  r.oraDefault=r.oraDefault??'';
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
async function players(){
  if(typeof window.caricaRichiesteIscrizione==='function')await window.caricaRichiesteIscrizione();
  return (window.iscrizioniTorneo||[]).filter(approved);
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
function generateRound(t,ps){
  if(ps.length<4)throw Error('Servono almeno 4 giocatori approvati.');
  const c=config(t),h=history(c),rank=standings(t,ps);
  const played=Object.fromEntries(rank.map(x=>[x.id,x.partite]));
  const matches=Math.floor(ps.length/4);
  const activeCount=matches*4;
  let best=null,bestScore=Infinity;
  for(let attempt=0;attempt<700;attempt++){
    const shuffled=ps.slice().sort((a,b)=>(played[key(a)]-played[key(b)])+(Math.random()-.5)*0.9);
    const active=shuffled.slice(0,activeCount);
    let score=0;
    const groups=[];
    for(let i=0;i<active.length;i+=4){
      const g=active.slice(i,i+4).map(key);
      const variants=[
        [[g[0],g[1]],[g[2],g[3]]],
        [[g[0],g[2]],[g[1],g[3]]],
        [[g[0],g[3]],[g[1],g[2]]]
      ];
      let localBest=null,localScore=Infinity;
      variants.forEach(v=>{
        const [A,B]=v;
        const partnerPenalty=A.concat(B).reduce((s,x,j,arr)=>{
          const y=arr[j%2===0?j+1:j-1];return s+(h.partner[x]?.[y]||0)*140
        },0);
        const opponentPenalty=A.reduce((s,x)=>s+B.reduce((z,y)=>z+(h.opp[x]?.[y]||0)*35,0),0);
        const groupKey=[...g].sort().join('|');
        const groupPenalty=(h.groups[groupKey]||0)*20;
        const vscore=partnerPenalty+opponentPenalty+groupPenalty;
        if(vscore<localScore){localScore=vscore;localBest=v}
      });
      score+=localScore;
      groups.push(localBest);
    }
    const vals=active.map(p=>played[key(p)]||0);
    score+=Math.max(...vals)-Math.min(...vals);
    if(score<bestScore){bestScore=score;best={active,groups}}
  }
  const activeKeys=new Set(best.active.map(key));
  const resting=ps.filter(p=>!activeKeys.has(key(p))).map(key);
  const numero=c.rotazione.giornate.length+1;
  const data=new Date().toISOString().slice(0,10);
  const partite=best.groups.map((v,i)=>({id:'g'+numero+'-m'+(i+1),coppiaA:v[0],coppiaB:v[1],risA:'',risB:'',campo:c.rotazione.campoDefault,ora:c.rotazione.oraDefault}));
  c.rotazione.giornate.push({numero,data,partite,riposo:resting});
  return c;
}
function playerMap(ps){return Object.fromEntries(ps.map(p=>[key(p),name(p)]))}
function inputScore(v){return v===''?'':String(Math.max(0,Number(v)||0))}
function render(t,ps){
  const root=$('appContent');if(!root)return;
  const c=config(t),r=c.rotazione,pm=playerMap(ps),rank=standings(t,ps),h=history(c);
  const allPlayed=rank.map(x=>x.partite),maxPlayed=allPlayed.length?Math.max(...allPlayed):0,minPlayed=allPlayed.length?Math.min(...allPlayed):0;
  root.innerHTML=
  '<div class="page-head"><div><h1>🏆 Torneo Individuale a Coppie Variabili</h1><p>'+esc(t.nome)+' · gestione autonoma · classifica individuale</p></div><button class="btn" id="rotBack">← Torna ai tornei</button></div>'+
  '<div class="card"><div class="card-head"><div><h2>Gestione torneo</h2><span class="notice">Le coppie, il calendario e i risultati appartengono esclusivamente a questo torneo.</span></div></div><div class="card-body"><div class="section-grid">'+
  '<div><label>Numero giocatori</label><input id="rotN" type="number" min="4" value="'+r.numeroGiocatori+'"></div>'+
  '<div><label>Punti vittoria</label><input id="rotPV" type="number" min="0" value="'+r.puntiVittoria+'"></div>'+
  '<div><label>Punti pareggio</label><input id="rotPP" type="number" min="0" value="'+r.puntiPareggio+'"></div>'+
  '<div><label>Punti sconfitta</label><input id="rotPS" type="number" min="0" value="'+r.puntiSconfitta+'"></div>'+
  '<div><label>Campo predefinito</label><input id="rotCampo" value="'+esc(r.campoDefault)+'"></div>'+
  '<div><label>Ora predefinita</label><input id="rotOra" type="time" value="'+esc(r.oraDefault)+'"></div>'+
  '</div><button class="btn primary" id="rotSaveRules">💾 Salva impostazioni</button></div></div>'+
  '<div class="card"><div class="card-head"><div><h2>👥 Giocatori</h2><span class="notice">'+ps.length+' iscritti approvati</span></div><button class="btn primary" id="rotNewRound">＋ Genera nuova giornata</button></div><div class="card-body">'+
  '<div class="list">'+ps.map((p,i)=>{const s=rank.find(x=>x.id===key(p));return '<div class="list-item"><div><strong>'+esc(name(p))+'</strong><small>'+((s?.partite)||0)+' partite · '+((s?.punti)||0)+' punti · differenza '+((s?.differenza)||0)+'</small></div></div>'}).join('')+'</div></div></div>'+
  '<div class="card"><div class="card-head"><h2>📅 Calendario e giornate</h2><span class="notice">'+r.giornate.length+' giornate</span></div><div class="card-body">'+
  (r.giornate.length?r.giornate.map(g=>'<div class="card" style="margin:10px 0"><div class="card-head"><h3>Giornata '+g.numero+'</h3><span class="notice">'+esc(g.data||'-')+(g.riposo?.length?' · Riposo: '+esc(g.riposo.map(id=>pm[id]||'Giocatore').join(', ')):'')+'</span></div><div class="card-body">'+
  (g.partite||[]).map((m,i)=>'<div class="list-item"><div><strong>'+esc((m.coppiaA||[]).map(id=>pm[id]||'Giocatore').join(' / '))+' <span>VS</span> '+esc((m.coppiaB||[]).map(id=>pm[id]||'Giocatore').join(' / '))+'</strong><small>Campo <input data-meta="'+g.numero+'" data-mi="'+i+'" data-k="campo" value="'+esc(m.campo||'')+'" style="width:90px"> · Ora <input data-meta="'+g.numero+'" data-mi="'+i+'" data-k="ora" type="time" value="'+esc(m.ora||'')+'" style="width:105px"></small></div><div class="list-actions"><input data-r="'+g.numero+'" data-m="'+i+'" data-s="a" type="number" min="0" value="'+esc(m.risA)+'" placeholder="0"><span>—</span><input data-r="'+g.numero+'" data-m="'+i+'" data-s="b" type="number" min="0" value="'+esc(m.risB)+'" placeholder="0"></div></div>').join('')+'</div></div>').join(''):'<div class="empty">Nessuna giornata ancora creata.</div>')+
  '</div></div>'+
  '<div class="card"><div class="card-head"><h2>📊 Classifica individuale</h2><span class="notice">Spareggi: punti classifica → differenza → punti fatti → vittorie → partite giocate</span></div><div class="card-body"><div style="overflow:auto"><table style="width:100%"><thead><tr><th>#</th><th>Giocatore</th><th>Pt</th><th>PG</th><th>V</th><th>P</th><th>S</th><th>PF</th><th>PS</th><th>Diff.</th></tr></thead><tbody>'+
  rank.map((x,i)=>'<tr><td>'+ (i+1) +'</td><td><b>'+esc(x.nome)+'</b></td><td>'+x.punti+'</td><td>'+x.partite+'</td><td>'+x.vittorie+'</td><td>'+x.pareggi+'</td><td>'+x.sconfitte+'</td><td>'+x.puntiFatti+'</td><td>'+x.puntiSubiti+'</td><td><b>'+x.differenza+'</b></td></tr>').join('')+'</tbody></table></div></div></div>'+
  '<div class="card"><div class="card-head"><h2>🔄 Controllo rotazioni</h2><span class="notice">Lo storico viene usato per evitare ripetizioni e riequilibrare le presenze.</span></div><div class="card-body"><div class="info-row"><span>Partite per giocatore</span><b>'+minPlayed+' – '+maxPlayed+'</b></div><div class="info-row"><span>Coppie già registrate</span><b>'+Object.values(h.partner).reduce((n,o)=>n+Object.values(o).reduce((a,v)=>a+v,0),0)/2+'</b></div><div class="info-row"><span>Giornate completate</span><b>'+r.giornate.filter(g=>(g.partite||[]).length&&g.partite.every(m=>m.risA!==''&&m.risB!=='')).length+' / '+r.giornate.length+'</b></div></div></div>';
  $('rotBack').onclick=()=>window.openAdminPage?.('torneo');
  $('rotSaveRules').onclick=async()=>{try{const nc=config(t);nc.rotazione.numeroGiocatori=Math.max(4,Number($('rotN').value)||ps.length);nc.rotazione.puntiVittoria=Math.max(0,Number($('rotPV').value)||0);nc.rotazione.puntiPareggio=Math.max(0,Number($('rotPP').value)||0);nc.rotazione.puntiSconfitta=Math.max(0,Number($('rotPS').value)||0);nc.rotazione.campoDefault=$('rotCampo').value.trim();nc.rotazione.oraDefault=$('rotOra').value;await save(t,nc);render(t,ps)}catch(e){alert(e.message||e)}};
  $('rotNewRound').onclick=async()=>{try{const fresh=await players();if(Number(r.numeroGiocatori)>0&&fresh.length<Number(r.numeroGiocatori))throw Error('Servono '+r.numeroGiocatori+' giocatori approvati; al momento sono '+fresh.length+'.');const nc=generateRound(t,fresh);await save(t,nc);render(t,fresh)}catch(e){alert(e.message||e)}};
  root.querySelectorAll('[data-r]').forEach(inp=>inp.addEventListener('change',async()=>{try{const nc=config(t),g=nc.rotazione.giornate.find(x=>String(x.numero)===String(inp.dataset.r));if(!g)return;const m=g.partite[Number(inp.dataset.m)];if(!m)return;m[inp.dataset.s==='a'?'risA':'risB']=inputScore(inp.value);await save(t,nc);render(t,ps)}catch(e){alert(e.message||e)}}));
  root.querySelectorAll('[data-meta]').forEach(inp=>inp.addEventListener('change',async()=>{try{const nc=config(t),g=nc.rotazione.giornate.find(x=>String(x.numero)===String(inp.dataset.meta));if(!g)return;const m=g.partite[Number(inp.dataset.mi)];if(!m)return;m[inp.dataset.k]=inp.value;await save(t,nc)}catch(e){alert(e.message||e)}}));
}
async function open(){
  const t=current();
  if(!t){alert('Seleziona prima un torneo.');return}
  if(!isRotation(t))return;
  try{render(t,await players())}catch(e){alert(e.message||e)}
}
function inject(){
  const root=$('appContent'),t=current();
  if(!root||!t||!isRotation(t))return;
  const grid=root.querySelector('.management-grid .action-grid');if(grid&&!root.querySelector('#adminRotationAction')){
    const classic=[...grid.querySelectorAll('button')];
    classic.forEach(b=>{if(!b.id||!['publish','closeReg'].includes(b.id))b.style.display='none'});
    const b=document.createElement('button');b.type='button';b.className='btn action-tile';b.id='adminRotationAction';b.innerHTML='🏆 <strong>Gestione torneo</strong><span>Giocatori · Giornate · Calendario · Risultati · Classifica</span>';b.onclick=open;grid.insertBefore(b,grid.firstChild);
  }
  const sideTab=$('sideTabellone'),sideCal=$('sideCalendario');
  if(sideTab)sideTab.style.display='none';
  if(sideCal)sideCal.style.display='none';
  root.closest('.app')?.querySelectorAll('.sidebar .nav button[data-page="iscritti"],.sidebar .nav button[data-page="partecipanti"],.sidebar .nav button[data-page="coppie"],.sidebar .nav button[data-page="dati"]').forEach(b=>b.style.display='none');
}
window.apriGestioneIndividualeCoppieVariabili=open;
window.apriGestioneRotazione=open;
window.addEventListener('admin:rendered',()=>requestAnimationFrame(inject));
window.addEventListener('admin:render',()=>requestAnimationFrame(inject));
new MutationObserver(()=>requestAnimationFrame(inject)).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,100));else setTimeout(inject,100);
})();