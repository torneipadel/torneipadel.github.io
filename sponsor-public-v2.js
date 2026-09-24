/* SPONSOR PUBBLICI — banner centrato e carosello affidabile */
(function(){
'use strict';
const SPEED=22,GAP=14;
const SUPABASE_URL='https://dkeqicstprvvfebiaooc.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZXFpY3N0cHJ2dmZiaWFvY29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjQ2NjksImV4cCI6MjA3Njc0MDY2OX0.MPlE8CZ2B8pEhSJzTWBJ-FfFLQpwRAxlAlno-SCylWg';
let frame=0,running=false,paused=false,last=0,positions=[];
function client(){
  if(window.supabaseClient?.from)return window.supabaseClient;
  if(window.sb?.from)return window.sb;
  if(window.supabase?.createClient){
    try{window.__sponsorSupabase=window.__sponsorSupabase||window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);return window.__sponsorSupabase}catch(e){}
  }
  return null;
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function styles(){if(document.getElementById('sponsor-public-v2-style'))return;const s=document.createElement('style');s.id='sponsor-public-v2-style';s.textContent=`
#sponsor-public-wrap{display:block;width:100%;max-width:100%;margin:18px 0 0!important;padding:0!important;box-sizing:border-box;clear:both;text-align:center;align-self:center}
#sponsor-public-title{text-align:center;margin:0 0 8px;color:rgba(255,255,255,.78);font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;text-shadow:0 2px 8px rgba(0,0,0,.25)}
#sponsor-public-window{position:relative;display:block;width:100%;height:82px;margin:0 auto;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:rgba(255,255,255,.07);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
#sponsor-public-track{position:relative;width:100%;height:100%;padding:0;box-sizing:border-box;will-change:transform}
.sponsor-public-item{position:absolute;top:7px;left:0;width:96px;height:68px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:rgba(255,255,255,.08);color:#fff;text-decoration:none;box-sizing:border-box;overflow:hidden;will-change:transform}
.sponsor-public-item:hover{background:rgba(255,255,255,.13)}
.sponsor-public-logo-box{width:76px;height:45px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:5px;overflow:hidden;flex:0 0 45px}
.sponsor-public-logo{display:block;width:76px;height:45px;object-fit:contain;object-position:center}
.sponsor-public-name{display:block;width:86px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;font-size:8px;font-weight:700;line-height:11px;color:#fff}
.sponsor-public-empty{width:100%;text-align:center;padding:13px;color:rgba(255,255,255,.68);font-size:10px}
@media(max-width:599px){#sponsor-public-wrap{margin:16px 0 0!important}#sponsor-public-title{font-size:8px;letter-spacing:1.4px}#sponsor-public-window{height:76px;border-radius:12px}.sponsor-public-item{top:5px;width:88px;height:64px}.sponsor-public-logo-box{width:70px;height:42px;flex-basis:42px}.sponsor-public-logo{width:70px;height:42px}.sponsor-public-name{width:80px;font-size:7px}}
`;
document.head.appendChild(s)}
function target(){const p=location.pathname.toLowerCase();if(p.endsWith('iscrizione.html'))return document.querySelector('.card');if(p.endsWith('bove.html'))return document.querySelector('.container')||document.querySelector('main');if(p.endsWith('2page.html'))return document.querySelector('.box')||document.querySelector('main');if(p.endsWith('visitatore.html'))return document.querySelector('.np-sponsor-slot')||document.querySelector('main')||document.body;return document.querySelector('main')||document.querySelector('.container')||document.body}
function ensure(){let w=document.getElementById('sponsor-public-wrap');if(!w){w=document.createElement('section');w.id='sponsor-public-wrap';w.setAttribute('aria-label','Sponsor');w.innerHTML='<div id="sponsor-public-title">Sponsorizzato da</div><div id="sponsor-public-window"><div id="sponsor-public-track"><div class="sponsor-public-empty">Caricamento sponsor...</div></div></div>'}const t=target();if(t&&w.parentElement!==t)t.appendChild(w);return w}
function stop(){running=false;last=0;if(frame)cancelAnimationFrame(frame);frame=0}
function width(c){return c?.getBoundingClientRect().width||96}
function layout(){const tr=document.getElementById('sponsor-public-track'),win=document.getElementById('sponsor-public-window');if(!tr||!win)return;const cards=[...tr.querySelectorAll('.sponsor-public-item')];if(!cards.length)return;const cw=width(cards[0]),ww=win.clientWidth;positions=cards.map((_,i)=>cards.length===1?(ww-cw)/2:i*(cw+GAP));cards.forEach((c,i)=>c.style.transform=`translate3d(${positions[i]}px,0,0)`)}
function step(ts){if(!running)return;const tr=document.getElementById('sponsor-public-track'),win=document.getElementById('sponsor-public-window');if(!tr||!win){stop();return}const cards=[...tr.querySelectorAll('.sponsor-public-item')];if(!cards.length){stop();return}if(!last)last=ts;const dt=Math.min(ts-last,80);last=ts;if(!paused&&cards.length>1){cards.forEach((c,i)=>{const cw=width(c);positions[i]-=SPEED*dt/1000;if(positions[i]<-cw)positions[i]=Math.max(...positions)+cw+GAP;c.style.transform=`translate3d(${positions[i]}px,0,0)`})}frame=requestAnimationFrame(step)}
function start(){stop();const tr=document.getElementById('sponsor-public-track');if(!tr)return;const cards=tr.querySelectorAll('.sponsor-public-item');if(!cards.length)return;layout();running=true;frame=requestAnimationFrame(step)}
function bind(){const w=document.getElementById('sponsor-public-window');if(!w||w.dataset.bound)return;w.dataset.bound='1';w.addEventListener('mouseenter',()=>paused=true);w.addEventListener('mouseleave',()=>{paused=false;last=0});w.addEventListener('touchstart',()=>paused=true,{passive:true});w.addEventListener('touchend',()=>{paused=false;last=0},{passive:true})}
function render(list){const wrap=document.getElementById('sponsor-public-wrap'),tr=document.getElementById('sponsor-public-track');if(!tr)return;stop();if(!list.length){if(wrap)wrap.remove();return}tr.innerHTML=list.map(s=>{const logo=s.immagine?`<span class="sponsor-public-logo-box"><img class="sponsor-public-logo" src="${esc(s.immagine)}" alt="${esc(s.nome)}" loading="lazy"></span>`:'';const name=`<span class="sponsor-public-name">${esc(s.nome)}</span>`;const html=logo+name;return s.link?`<a class="sponsor-public-item" href="${esc(s.link)}" target="_blank" rel="noopener noreferrer">${html}</a>`:`<div class="sponsor-public-item">${html}</div>`}).join('');bind();requestAnimationFrame(start)}
function localSponsors(){try{const raw=localStorage.getItem('padel_sponsor_standalone');const a=raw?JSON.parse(raw):[];return Array.isArray(a)?a.filter(s=>s&&s.nome).map(s=>({id:s.id,nome:s.nome,immagine:s.immagine||'',video:s.video||'',link:s.link||''})):[]}catch(e){return[]}}
async function load(){let list=[];const c=client();if(c?.from){try{const r=await c.from('sponsor').select('id,nome,immagine,video,link').order('id',{ascending:true});if(!r.error)list=(r.data||[]).filter(s=>s&&s.nome)}catch(e){console.error('Errore caricamento sponsor pubblici',e)}}if(!list.length)list=localSponsors();window.__PUBLIC_SPONSORS__=list;render(list)}
function startPage(){styles();ensure();load()}
window.addEventListener('resize',()=>{if(running)layout()});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startPage,{once:true});else startPage();
})();