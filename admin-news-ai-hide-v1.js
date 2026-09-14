/* NEWS STANDARD MODE — gestione chiara delle due modalità locandina. */
(()=>{
'use strict';
function cleanAI(){
  const title=document.querySelector('.page-head h1');
  if(title&&/News\s*&\s*Comunicazioni\s*AI/i.test(title.textContent)) title.textContent='News & Comunicazioni';
  const sub=document.querySelector('.page-head p');
  if(sub&&/creazione assistita/i.test(sub.textContent)) sub.textContent=sub.textContent.replace(/\s*·\s*creazione assistita e pubblicazione/i,'');
  document.querySelectorAll('#naiGenerate,#naiRegenerate').forEach(el=>{el.style.display='none';});
}
function installMenus(){
  const root=document.querySelector('#page-news')||document.querySelector('[data-page="news"]');
  const automatic=document.getElementById('naiAutoPosterPanel');
  const manual=document.getElementById('naiManualPosterPanel');
  if(!root||!automatic||!manual)return;
  let box=document.getElementById('naiPosterModes');
  if(!box){
    const style=document.createElement('style');
    style.id='naiPosterModesStyle';
    style.textContent=`
#naiPosterModes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0 16px}
#naiPosterModes button{width:100%;box-sizing:border-box;border:1px solid rgba(141,232,216,.28);border-radius:12px;background:rgba(2,16,24,.58);color:inherit;padding:13px 15px;font:inherit;font-size:14px;font-weight:900;text-align:left;cursor:pointer}
#naiPosterModes button:hover{background:rgba(255,255,255,.06)}
#naiPosterModes button.active{border-color:rgba(141,232,216,.65);background:rgba(141,232,216,.10)}
@media(max-width:700px){#naiPosterModes{grid-template-columns:1fr}}
`;
    document.head.appendChild(style);
    box=document.createElement('div');
    box.id='naiPosterModes';
    box.innerHTML=`<button type="button" data-poster-mode="automatic">✨ Locandina automatica</button><button type="button" data-poster-mode="manual">✏️ Locandina manuale</button>`;
    automatic.parentNode.insertBefore(box,automatic);
    box.addEventListener('click',e=>{
      const btn=e.target.closest('[data-poster-mode]');
      if(!btn)return;
      showMode(btn.dataset.posterMode);
    });
  }
  function showMode(mode){
    mode=mode==='manual'?'manual':'automatic';
    box.dataset.mode=mode;
    const auto=mode==='automatic';
    automatic.style.display=auto?'':'none';
    manual.style.display=auto?'none':'';
    box.querySelectorAll('[data-poster-mode]').forEach(b=>b.classList.toggle('active',b.dataset.posterMode===mode));
  }
  showMode(box.dataset.mode||'automatic');
}
function run(){cleanAI();installMenus()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('admin:render',run);
const obs=new MutationObserver(()=>run());
obs.observe(document.body,{childList:true,subtree:true});
})();