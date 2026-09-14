/* NEWS STANDARD MODE — gestione compatta della sezione News.
   Non elimina editor o funzioni esistenti: li rende accessibili con due menu a tendina.
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

  const style=document.createElement('style');
  style.id='naiPosterChoiceStyle';
  style.textContent=`
#naiPosterChoice{margin:14px 0 16px;padding:0;border:0;background:transparent}
#naiPosterChoice .nai-drop{margin:0 0 10px;border:1px solid rgba(141,232,216,.25);border-radius:14px;background:rgba(2,16,24,.58);overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.14)}
#naiPosterChoice .nai-drop-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;background:transparent;color:inherit;padding:14px 16px;font-size:15px;font-weight:900;text-align:left;cursor:pointer}
#naiPosterChoice .nai-drop-head:hover{background:rgba(255,255,255,.035)}
#naiPosterChoice .nai-arrow{font-size:15px;transition:transform .18s ease}
#naiPosterChoice .nai-drop.open .nai-arrow{transform:rotate(180deg)}
#naiPosterChoice .nai-drop-body{display:none;padding:0 16px 12px;font-size:12px;opacity:.78}
#naiPosterChoice .nai-drop.open .nai-drop-body{display:block}
#naiManualPosterPanel.nai-collapsed,#naiAutoPosterPanel.nai-collapsed{display:none!important}
`;
  document.head.appendChild(style);

  const choice=document.createElement('div');
  choice.id='naiPosterChoice';
  choice.innerHTML=`
    <div class="nai-drop" data-mode="manual">
      <button type="button" class="nai-drop-head" data-open-poster="manual"><span>✏️ Crea locandina manuale</span><span class="nai-arrow">▼</span></button>
      <div class="nai-drop-body">Apri qui l'editor per costruire la locandina manualmente.</div>
    </div>
    <div class="nai-drop" data-mode="automatic">
      <button type="button" class="nai-drop-head" data-open-poster="automatic"><span>✨ Crea locandina automatica</span><span class="nai-arrow">▼</span></button>
      <div class="nai-drop-body">Apri qui la locandina automatica compilata dai dati del contenuto.</div>
    </div>`;

  const first=manual||automatic;
  first.parentNode.insertBefore(choice,first);

  function getPanel(mode){
    return mode==='manual' ? document.getElementById('naiManualPosterPanel') : document.getElementById('naiAutoPosterPanel');
  }
  function closePanels(){
    const m=getPanel('manual'),a=getPanel('automatic');
    if(m)m.classList.add('nai-collapsed');
    if(a)a.classList.add('nai-collapsed');
  }
  function closeMenus(){
    choice.querySelectorAll('.nai-drop').forEach(el=>el.classList.remove('open'));
  }
  choice.addEventListener('click',e=>{
    const btn=e.target.closest('[data-open-poster]');
    if(!btn)return;
    const mode=btn.dataset.openPoster;
    const panel=getPanel(mode);
    if(!panel)return;
    const menu=btn.closest('.nai-drop');
    const wasOpen=menu.classList.contains('open');
    closePanels();
    closeMenus();
    if(!wasOpen){
      menu.classList.add('open');
      panel.classList.remove('nai-collapsed');
      panel.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  });
  closePanels();
}
function run(){cleanAI();installCompactMenu()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('admin:render',run);
const obs=new MutationObserver(()=>run());obs.observe(document.body,{childList:true,subtree:true});
})();
