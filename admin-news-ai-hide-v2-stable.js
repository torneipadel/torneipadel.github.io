/* NEWS STANDARD MODE — gestione chiara delle due modalità locandina + contenuto universale. */
(()=>{
'use strict';
function cleanAI(){
  const title=document.querySelector('.page-head h1');
  if(title&&/News\s*&\s*Comunicazioni\s*AI/i.test(title.textContent)) title.textContent='News & Comunicazioni';
  const sub=document.querySelector('.page-head p');
  if(sub&&/creazione assistita/i.test(sub.textContent)) sub.textContent=sub.textContent.replace(/\s*·\s*creazione assistita e pubblicazione/i,'');
  document.querySelectorAll('#naiGenerate,#naiRegenerate').forEach(el=>{el.style.display='none';});
  const draft=document.querySelector('#naiSaveDraft');
  const publish=document.querySelector('#naiPublish');
  const actions=draft?.parentElement||publish?.parentElement;
  if(actions){actions.style.setProperty('display','flex','important');actions.style.setProperty('flex-direction','row','important');actions.style.setProperty('align-items','center','important');actions.style.setProperty('justify-content','flex-start','important');actions.style.setProperty('flex-wrap','nowrap','important');actions.style.setProperty('gap','8px','important');actions.style.setProperty('width','auto','important');}
  [draft,publish].forEach(el=>{if(!el)return;el.style.setProperty('display','inline-flex','important');el.style.setProperty('width','auto','important');el.style.setProperty('min-width','0','important');el.style.setProperty('max-width','max-content','important');el.style.setProperty('flex','0 0 auto','important');el.style.setProperty('padding','8px 13px','important');el.style.setProperty('margin','0','important');});
}
function installMenus(){
  const root=document.getElementById('appContent');
  const automatic=document.getElementById('naiAutoPosterPanel');
  const manual=document.getElementById('naiManualPosterPanel');
  if(!root||!automatic||!manual)return;
  let area=document.getElementById('naiPosterArea');
  if(!area){area=document.createElement('div');area.id='naiPosterArea';area.style.display='block';area.style.width='100%';area.style.marginTop='14px';const mainPanel=root.querySelector('.nai-wrap > .nai-panel');if(mainPanel)mainPanel.insertAdjacentElement('afterend',area);else root.appendChild(area);}
  if(automatic.parentNode!==area)area.appendChild(automatic);
  if(manual.parentNode!==area)area.appendChild(manual);
  let box=document.getElementById('naiPosterModes');
  if(!box){
    const style=document.createElement('style');style.id='naiPosterModesStyle';style.textContent=`#naiPosterArea{display:block;width:100%;margin-top:14px}#naiPosterModes{display:block;margin:0 0 14px;max-width:520px}#naiPosterModes::before{content:'Crea locandina';display:block;margin:0 0 6px 2px;font-size:13px;font-weight:800;opacity:.82}#naiPosterModes .nai-poster-mode{display:flex;align-items:center;justify-content:space-between;width:100%;box-sizing:border-box;margin:5px 0;padding:9px 12px;border:1px solid rgba(141,232,216,.22);border-radius:10px;background:rgba(2,16,24,.42);color:inherit;font:inherit;font-size:13px;font-weight:700;text-align:left;cursor:pointer}#naiPosterModes .nai-poster-mode:hover{background:rgba(255,255,255,.05);border-color:rgba(141,232,216,.38)}#naiPosterModes .nai-poster-mode.active{border-color:rgba(141,232,216,.52);background:rgba(141,232,216,.08)}#naiPosterModes .nai-poster-arrow{font-size:12px;opacity:.7;transition:transform .15s ease}#naiPosterModes .nai-poster-mode.active .nai-poster-arrow{transform:rotate(90deg)}@media(max-width:700px){#naiPosterModes{max-width:none}}`;
    document.head.appendChild(style);box=document.createElement('div');box.id='naiPosterModes';box.innerHTML=`<button type="button" class="nai-poster-mode" data-poster-mode="automatic"><span>✨ Locandina automatica</span><span class="nai-poster-arrow">▸</span></button><button type="button" class="nai-poster-mode" data-poster-mode="manual"><span>✏️ Locandina manuale</span><span class="nai-poster-arrow">▸</span></button>`;area.insertBefore(box,automatic);box.addEventListener('click',e=>{const btn=e.target.closest('[data-poster-mode]');if(!btn)return;showMode(btn.dataset.posterMode);});
  }else if(box.parentNode!==area || box.nextElementSibling!==automatic){area.insertBefore(box,automatic);}
  function showMode(mode){mode=mode==='manual'?'manual':'automatic';box.dataset.mode=mode;const auto=mode==='automatic';automatic.style.display=auto?'':'none';manual.style.display=auto?'none':'';box.querySelectorAll('[data-poster-mode]').forEach(b=>b.classList.toggle('active',b.dataset.posterMode===mode));}
  showMode(box.dataset.mode||'automatic');
}
function installUniversalContent(){
  const select=document.getElementById('naiType');
  const grid=document.querySelector('.nai-grid');
  if(!select||!grid)return;
  [['Vendita','🛒 Vendita'],['Offerta','🎁 Offerta'],['Altro','✍️ Contenuto libero']].forEach(([value,label])=>{if(![...select.options].some(o=>o.value===value)){const o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o)}});
  let box=document.getElementById('naiUniversalContent');
  if(!box){box=document.createElement('div');box.id='naiUniversalContent';box.className='full';box.innerHTML='<label>Contenuto / descrizione libera</label><textarea id="naiUniversalText" class="input" rows="7" placeholder="Scrivi qui qualsiasi contenuto: evento, vendita, promozione, comunicazione, articolo, ricordo o altro."></textarea><small class="notice">Il contenuto libero viene usato come testo della pubblicazione. Gli altri campi restano facoltativi.</small>';grid.appendChild(box);}
  const sync=()=>{const text=document.getElementById('naiUniversalText');const topic=document.getElementById('naiTopic');if(text&&topic&&text.value.trim())topic.value=text.value.trim();};
  if(select.dataset.universalBound!=='1'){select.dataset.universalBound='1';select.addEventListener('change',()=>{const text=document.getElementById('naiUniversalText');if(text){text.placeholder=select.value==='Altro'?'Scrivi liberamente qualsiasi contenuto tu voglia pubblicare.':'Scrivi la descrizione completa del contenuto. I campi sopra sono facoltativi.'}})}
  ['input','change'].forEach(ev=>{if(box.dataset.bound!==ev){box.dataset.bound=ev;box.addEventListener(ev,sync)}});
  ['click'].forEach(ev=>{if(document.documentElement.dataset.universalPublishBound!==ev){document.documentElement.dataset.universalPublishBound=ev;document.addEventListener(ev,e=>{if(e.target.closest('#naiGenerate,#naiRegenerate,#naiSaveDraft,#naiPublish'))sync()},{capture:true})}});
}
function run(){cleanAI();installMenus();installUniversalContent()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('admin:render',run);
const obs=new MutationObserver(()=>run());obs.observe(document.body,{childList:true,subtree:true});
})();