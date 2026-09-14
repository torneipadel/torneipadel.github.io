/* NEWS STANDARD MODE — pannello News pulito.
   Mantiene gli editor esistenti e ne cambia solo la modalità di apertura:
   - Locandina automatica = finestra/modal
   - Locandina manuale = menu a tendina
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

function installStyle(){
  if(document.getElementById('naiCleanPosterStyle'))return;
  const s=document.createElement('style');
  s.id='naiCleanPosterStyle';
  s.textContent=`
#naiPosterLauncher{margin:14px 0 18px;padding:0;background:transparent;border:0;box-shadow:none}
#naiPosterLauncher .nai-launch-row{display:flex;gap:10px;flex-wrap:wrap}
#naiPosterLauncher button{border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:10px 15px;font-size:13px;font-weight:800;cursor:pointer;background:rgba(255,255,255,.06);color:inherit}
#naiPosterLauncher #naiManualToggle{background:rgba(255,255,255,.08)}
#naiPosterLauncher #naiAutomaticOpen{background:rgba(15,118,110,.28);border-color:rgba(141,232,216,.28)}
#naiManualPosterPanel.nai-manual-dropdown{display:none!important;margin-top:12px!important}
#naiManualPosterPanel.nai-manual-dropdown.nai-open{display:block!important}
#naiAutoPosterPanel{display:none!important}
#naiAutoModal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.72);backdrop-filter:blur(6px)}
#naiAutoModal.nai-open{display:flex}
#naiAutoModal .nai-auto-window{width:min(1080px,96vw);max-height:92vh;overflow:auto;border:1px solid rgba(141,232,216,.24);border-radius:18px;background:#07131b;box-shadow:0 25px 80px rgba(0,0,0,.5);padding:18px}
#naiAutoModal .nai-auto-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
#naiAutoModal .nai-auto-head strong{font-size:18px;font-weight:900}
#naiAutoModal .nai-auto-close{width:36px;height:36px;padding:0;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:inherit;font-size:20px;cursor:pointer}
#naiAutoModal .nai-auto-wrap{margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
#naiAutoModal .nai-auto-wrap>div:first-child{display:none}
`;
  document.head.appendChild(s);
}

function getRoot(){return document.querySelector('#page-news')||document.querySelector('[data-page="news"]')||document.querySelector('.page-content')}

function installUI(){
  const root=getRoot();
  const manual=document.getElementById('naiManualPosterPanel');
  const automatic=document.getElementById('naiAutoPosterPanel');
  if(!root||(!manual&&!automatic))return;
  installStyle();

  let launcher=document.getElementById('naiPosterLauncher');
  if(!launcher){
    launcher=document.createElement('div');
    launcher.id='naiPosterLauncher';
    launcher.innerHTML=`<div class="nai-launch-row"><button type="button" id="naiManualToggle">✏️ Crea locandina manuale</button><button type="button" id="naiAutomaticOpen">✨ Crea locandina automatica</button></div>`;
    const first=manual||automatic;
    first.parentNode.insertBefore(launcher,first);
  }

  if(manual&&!manual.dataset.cleanPosterBound){
    manual.dataset.cleanPosterBound='1';
    manual.classList.add('nai-manual-dropdown');
    launcher.querySelector('#naiManualToggle').onclick=()=>manual.classList.toggle('nai-open');
  }

  if(automatic&&!automatic.dataset.cleanPosterModalBound){
    automatic.dataset.cleanPosterModalBound='1';
    automatic.style.setProperty('display','none','important');
    const modal=document.createElement('div');
    modal.id='naiAutoModal';
    modal.innerHTML=`<div class="nai-auto-window"><div class="nai-auto-head"><strong>✨ Crea locandina automatica</strong><button type="button" class="nai-auto-close" aria-label="Chiudi">×</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('.nai-auto-window').appendChild(automatic);
    const close=()=>modal.classList.remove('nai-open');
    modal.querySelector('.nai-auto-close').onclick=close;
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    launcher.querySelector('#naiAutomaticOpen').onclick=()=>{manual?.classList.remove('nai-open');modal.classList.add('nai-open');automatic.style.setProperty('display','block','important')};
  }
}

function run(){cleanAI();installUI()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('admin:render',run);
const obs=new MutationObserver(()=>run());
obs.observe(document.body,{childList:true,subtree:true});
})();
