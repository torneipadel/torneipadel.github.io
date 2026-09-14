/* NEWS STANDARD MODE — gestione compatta della sezione News.
   Non elimina editor o funzioni esistenti: li rende accessibili a scomparsa.
*/
(()=>{
'use strict';
function cleanAI(){
  const title=document.querySelector('.page-head h1');
  if(title&&/News\s*&\s*Comunicazioni\s*AI/i.test(title.textContent)) title.textContent='News & Comunicazioni';
  const sub=document.querySelector('.page-head p');
  if(sub&&/creazione assistita/i.test(sub.textContent)) sub.textContent=sub.textContent.replace(/\s*·\s*creazione assistita e pubblicazione/i,'');
  document.querySelectorAll('#naiGenerate,#naiRegenerate').forEach(el=>{el.style.display='none';});
}
function installCompactMenu(){
  const root=document.querySelector('#page-news')||document.querySelector('[data-page="news"]');
  if(!root)return;
  if(document.getElementById('naiPosterChoice'))return;
  const manual=document.getElementById('naiManualPosterPanel');
  const automatic=document.getElementById('naiAutoPosterPanel');
  if(!manual&&!automatic)return;
  const style=document.createElement('style');style.id='naiPosterChoiceStyle';style.textContent=`
#naiPosterChoice{margin:14px 0 16px;padding:14px;border:1px solid rgba(141,232,216,.25);border-radius:16px;background:rgba(2,16,24,.52);box-shadow:0 10px 28px rgba(0,0,0,.16)}
#naiPosterChoice .nai-choice-title{font-size:16px;font-weight:900;margin-bottom:10px}
#naiPosterChoice .nai-choice-actions{display:flex;gap:10px;flex-wrap:wrap}
#naiPosterChoice button{min-height:42px;padding:9px 16px;border-radius:11px;font-weight:800;cursor:pointer}
#naiPosterChoice .nai-choice-help{margin-top:8px;font-size:12px;opacity:.72}
#naiManualPosterPanel.nai-collapsed,#naiAutoPosterPanel.nai-collapsed{display:none!important}
`;
  document.head.appendChild(style);
  const choice=document.createElement('div');choice.id='naiPosterChoice';choice.innerHTML=`<div class="nai-choice-title">Locandina</div><div class="nai-choice-actions"><button type="button" class="btn primary" id="naiOpenManual">✏️ Crea locandina manuale</button><button type="button" class="btn" id="naiOpenAutomatic">✨ Crea locandina automatica</button></div><div class="nai-choice-help">Scegli una sola modalità. Il pannello si apre solo quando lo richiami.</div>`;
  const first=manual||automatic;
  first.parentNode.insertBefore(choice,first);
  function closeAll(){if(manual)manual.classList.add('nai-collapsed');if(automatic)automatic.classList.add('nai-collapsed')}
  closeAll();
  choice.querySelector('#naiOpenManual').onclick=()=>{closeAll();if(manual)manual.classList.remove('nai-collapsed')};
  choice.querySelector('#naiOpenAutomatic').onclick=()=>{closeAll();if(automatic)automatic.classList.remove('nai-collapsed')};
}
function run(){cleanAI();installCompactMenu()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('admin:render',run);
const obs=new MutationObserver(()=>run());obs.observe(document.body,{childList:true,subtree:true});
})();
