/* ADMIN TORNEO A ROTAZIONE V1
 * Modulo isolato per i tornei Americano / a coppie variabili.
 * Non modifica il flusso dei tornei classici, coppie, tabellone o calendario.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const state=()=>window.adminState||{};
const current=()=> (state().tornei||[]).find(t=>String(t.id)===String(state().torneoSelezionato))||null;
const sb=()=>window.supabaseClient||window.sb;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const approved=g=>g?.stato==='approvato'||g?.approvato===true;
const name=g=>String(g?.nome_giocatore||[g?.nome,g?.cognome].filter(Boolean).join(' ')||g?.nome||'Giocatore').trim();
const key=g=>String(g?.id??g?.user_id??g?.email??g?.nome_giocatore??name(g));

function cfg(t){
  const c=t.configurazione&&typeof t.configurazione==='object'?JSON.parse(JSON.stringify(t.configurazione)):{};
  c.rotazione=c.rotazione&&typeof c.rotazione==='object'?c.rotazione:{};
  const r=c.rotazione;
  r.giornate=Array.isArray(r.giornate)?r.giornate:[];
  r.classifica=r.classifica&&typeof r.classifica==='object'?r.classifica:{};
  r.puntiVittoria=Number.isFinite(Number(r.puntiVittoria))?Number(r.puntiVittoria):3;
  r.puntiPareggio=Number.isFinite(Number(r.puntiPareggio))?Number(r.puntiPareggio):1;
  r.puntiSconfitta=Number.isFinite(Number(r.puntiSconfitta))?Number(r.puntiSconfitta):0;
  return c;
}
async function save(t,c){
  const client=sb(); if(!client)throw Error('Connessione Supabase non disponibile.');
  const r=await client.from('tornei').update({configurazione:c}).eq('id',t.id).select('*').single();
  if(r.error)throw r.error;
  t.configurazione=r.data?.configurazione||c;
  try{localStorage.setItem('padel_admin_state',JSON.stringify(state()))}catch(e){}
  return t.configurazione;
}
async function players(){
  if(typeof window.caricaRichiesteIscrizione==='function')await window.caricaRichiesteIscrizione();
  return (window.iscrizioniTorneo||[]).filter(approved);
}
function standings(t,ps){
  const c=cfg(t), map={};
  ps.forEach(p=>{map[key(p)]={id:key(p),nome:name(p),punti:0,g:0,v:0,p:0,s:0}});
  c.rotazione.giornate.forEach(g=>g.partite?.forEach(m=>{
    if(m.risA==null||m.risB==null||m.risA===''||m.risB==='')return;
    const a=Number(m.risA),b=Number(m.risB);
    const aKeys=(m.coppiaA||[]),bKeys=(m.coppiaB||[]);
    const esito=a>b?'A':b>a?'B':'D';
    [...aKeys,...bKeys].forEach(id=>{if(map[id])map[id].g++});
    aKeys.forEach(id=>{if(!map[id])return; if(esito==='A'){map[id].punti+=c.rotazione.puntiVittoria;map[id].v++}else if(esito==='D'){map[id].punti+=c.rotazione.puntiPareggio;map[id].p++}else{map[id].punti+=c.rotazione.puntiSconfitta;map[id].s++}});
    bKeys.forEach(id=>{if(!map[id])return; if(esito==='B'){map[id].punti+=c.rotazione.puntiVittoria;map[id].v++}else if(esito==='D'){map[id].punti+=c.rotazione.puntiPareggio;map[id].p++}else{map[id].punti+=c.rotazione.puntiSconfitta;map[id].s++}});
  }));
  return Object.values(map).sort((a,b)=>b.punti-a.punti||b.v-a.v||a.s-b.s||a.nome.localeCompare(b.nome,'it'));
}
function shuffled(a){const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function generateRound(t,ps){
  if(ps.length<4||ps.length%4!==0)throw Error('Per una giornata servono almeno 4 giocatori e un numero di giocatori multiplo di 4.');
  const c=cfg(t), n=c.rotazione.giornate.length+1, a=shuffled(ps), partite=[];
  for(let i=0;i<a.length;i+=4){
    const g=a.slice(i,i+4).map(p=>key(p));
    partite.push({id:'r'+n+'-m'+(partite.length+1),coppiaA:[g[0],g[1]],coppiaB:[g[2],g[3]],risA:'',risB:''});
  }
  c.rotazione.giornate.push({numero:n,data:new Date().toISOString().slice(0,10),partite});
  return c;
}
function playerMap(ps){return Object.fromEntries(ps.map(p=>[key(p),name(p)]))}
function render(t,ps){
  const root=$('appContent'), c=cfg(t), r=c.rotazione, pm=playerMap(ps), rank=standings(t,ps);
  root.innerHTML='<div class="page-head"><div><h1>🔄 Torneo a rotazione</h1><p>'+esc(t.nome)+' · coppie variabili · classifica individuale</p></div><button class="btn" id="rotBack">← Torna al torneo</button></div>'+
  '<div class="card"><div class="card-head"><h2>Regole classifica</h2><span class="notice">I punti appartengono al singolo giocatore</span></div><div class="card-body"><div class="section-grid">'+
  '<div><label>Punti vittoria</label><input id="rotPV" type="number" min="0" value="'+r.puntiVittoria+'"></div>'+
  '<div><label>Punti pareggio</label><input id="rotPP" type="number" min="0" value="'+r.puntiPareggio+'"></div>'+
  '<div><label>Punti sconfitta</label><input id="rotPS" type="number" min="0" value="'+r.puntiSconfitta+'"></div>'+
  '</div><button class="btn primary" id="rotSaveRules">💾 Salva regole</button></div></div>'+
  '<div class="card"><div class="card-head"><h2>Giornate</h2><button class="btn primary" id="rotNewRound">＋ Crea nuova giornata</button></div><div class="card-body">'+
  (r.giornate.length?r.giornate.map(g=>'<div class="card" style="margin:10px 0"><div class="card-head"><h3>Giornata '+g.numero+'</h3><span class="notice">'+esc(g.data||'')+'</span></div><div class="card-body">'+g.partite.map((m,i)=>'<div class="list-item"><div><strong>'+esc((m.coppiaA||[]).map(id=>pm[id]||'Giocatore').join(' / '))+' <span>VS</span> '+esc((m.coppiaB||[]).map(id=>pm[id]||'Giocatore').join(' / '))+'</strong></div><div class="list-actions"><input data-r="'+g.numero+'" data-m="'+i+'" data-s="a" type="number" min="0" value="'+esc(m.risA)+'" placeholder="0"><span>—</span><input data-r="'+g.numero+'" data-m="'+i+'" data-s="b" type="number" min="0" value="'+esc(m.risB)+'" placeholder="0"></div></div>').join('')+'</div></div>').join(''):'<div class="empty">Nessuna giornata ancora creata.</div>')+
  '</div></div>'+
  '<div class="card"><div class="card-head"><h2>📊 Classifica individuale</h2><span class="notice">Aggiornata dai risultati inseriti</span></div><div class="card-body"><table style="width:100%"><thead><tr><th>#</th><th>Giocatore</th><th>Punti</th><th>G</th><th>V</th><th>P</th><th>S</th></tr></thead><tbody>'+
  rank.map((x,i)=>'<tr><td>'+ (i+1) +'</td><td>'+esc(x.nome)+'</td><td><b>'+x.punti+'</b></td><td>'+x.g+'</td><td>'+x.v+'</td><td>'+x.p+'</td><td>'+x.s+'</td></tr>').join('')+'</tbody></table></div></div>';
  $('rotBack').onclick=()=>window.openAdminPage?.('torneo');
  $('rotNewRound').onclick=async()=>{try{const fresh=await players();const nc=generateRound(t,fresh);await save(t,nc);render(t,fresh)}catch(e){alert(e.message||e)}};
  $('rotSaveRules').onclick=async()=>{try{const nc=cfg(t);nc.rotazione.puntiVittoria=Math.max(0,Number($('rotPV').value)||0);nc.rotazione.puntiPareggio=Math.max(0,Number($('rotPP').value)||0);nc.rotazione.puntiSconfitta=Math.max(0,Number($('rotPS').value)||0);await save(t,nc);render(t,ps)}catch(e){alert(e.message||e)}};
  root.querySelectorAll('[data-r]').forEach(inp=>inp.addEventListener('change',async()=>{try{const nc=cfg(t),g=nc.rotazione.giornate.find(x=>String(x.numero)===String(inp.dataset.r));if(!g)return;const m=g.partite[Number(inp.dataset.m)];if(!m)return;m[inp.dataset.s==='a'?'risA':'risB']=inp.value;await save(t,nc);render(t,ps)}catch(e){alert(e.message||e)}}));
}
async function open(){
  const t=current(); if(!t){alert('Seleziona prima un torneo');return}
  const formula=String(t.formula||t.configurazione?.rules?.formulaScelta||t.configurazione?.rules?.tipoTorneo||'').toLowerCase();
  if(!['rotazione','rotazione'].includes(formula)){alert('La gestione a rotazione è disponibile per i tornei con formula A rotazione.');return}
  try{render(t,await players())}catch(e){alert(e.message||e)}
}
function inject(){
  const root=$('appContent'); if(!root)return;
  const t=current(); if(!t)return;
  const formula=String(t.formula||t.configurazione?.rules?.formulaScelta||t.configurazione?.rules?.tipoTorneo||'').toLowerCase();
  if(!['rotazione','rotazione'].includes(formula))return;
  if(root.querySelector('#adminRotationAction'))return;
  const grid=root.querySelector('.management-grid .action-grid'); if(!grid)return;
  const b=document.createElement('button');b.type='button';b.className='btn action-tile';b.id='adminRotationAction';b.innerHTML='🔄 <strong>Gestione rotazione</strong><span>Giornate, coppie variabili e classifica individuale</span>';b.onclick=open;grid.insertBefore(b,grid.querySelector('#pairs')||null);
}
window.apriGestioneRotazione=open;
window.addEventListener('admin:rendered',()=>requestAnimationFrame(inject));
window.addEventListener('admin:render',()=>requestAnimationFrame(inject));
new MutationObserver(()=>requestAnimationFrame(inject)).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,100));else setTimeout(inject,100);
})();