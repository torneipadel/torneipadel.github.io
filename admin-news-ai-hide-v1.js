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
#naiPosterModes{display:block;margin:12px 0 14px;max-width:520px}
#naiPosterModes::before{content:'Crea locandina';display:block;margin:0 0 6px 2px;font-size:13px;font-weight:800;opacity:.82}
#naiPosterModes .nai-poster-mode{display:flex;align-items:center;justify-content:space-between;width:100%;box-sizing:border-box;margin:5px 0;padding:9px 12px;border:1px solid rgba(141,232,216,.22);border-radius:10px;background:rgba(2,16,24,.42);color:inherit;font:inherit;font-size:13px;font-weight:700;text-align:left;cursor:pointer}
#naiPosterModes .nai-poster-mode:hover{background:rgba(255,255,255,.05);border-color:rgba(141,232,216,.38)}
#naiPosterModes .nai-poster-mode.active{border-color:rgba(141,232,216,.52);background:rgba(141,232,216,.08)}
#naiPosterModes .nai-poster-arrow{font-size:12px;opacity:.7;transition:transform .15s ease}
#naiPosterModes .nai-poster-mode.active .nai-poster-arrow{transform:rotate(90deg)}
@media(max-width:700px){#naiPosterModes{max-width:none}}
`;
    document.head.appendChild(style);
    box=document.createElement('div');
    box.id='naiPosterModes';
    box.innerHTML=`<button type="button" class="nai-poster-mode" data-poster-mode="automatic"><span>✨ Locandina automatica</span><span class="nai-poster-arrow">▸</span></button><button type="button" class="nai-poster-mode" data-poster-mode="manual"><span>✏️ Locandina manuale</span><span class="nai-poster-arrow">▸</span></button>`;
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