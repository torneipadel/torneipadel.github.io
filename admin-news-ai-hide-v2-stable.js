/* NEWS STANDARD MODE — gestione chiara delle due modalità locandina + editor universale. */
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

let universalEditingId=null;
const universalEsc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const universalSelected=()=>window.getTorneoAdminCorrente?.()||((window.adminState?.tornei||[]).find(t=>String(t.id)===String(window.adminState?.torneoSelezionato))||null);
const universalCfg=t=>t?.configurazione&&typeof t.configurazione==='object'?{...t.configurazione}:{};
const universalDataUrl=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(new Error('Impossibile leggere l’immagine.'));r.readAsDataURL(file)});
function addUniversalTypes(){
  const select=document.getElementById('naiType');
  if(!select)return;
  [['Vendita','🛒 Vendita'],['Offerta','🎁 Offerta'],['Altro','✍️ Contenuto libero']].forEach(([value,label])=>{
    if(![...select.options].some(o=>o.value===value)){const o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o)}
  });
}
function installUniversalFields(){
  const panel=document.querySelector('.nai-wrap > .nai-panel');
  if(!panel||document.getElementById('naiUniversalContent'))return;
  const title=document.getElementById('naiTitle');
  if(!title)return;
  const holder=document.createElement('div');
  holder.id='naiUniversalContent';
  holder.innerHTML=`<label style="display:block;font-size:12px;font-weight:700;margin:10px 0 5px">Contenuto / descrizione</label><textarea id="naiUniversalText" class="input" rows="8" placeholder="Scrivi liberamente tutto ciò che vuoi pubblicare: una comunicazione, un evento, una vendita, una promozione, un articolo, un ricordo o qualsiasi altro contenuto."></textarea><div class="notice" style="margin-top:6px">Questo campo è libero: non ci sono campi obbligatori oltre al titolo.</div>`;
  const grid=title.closest('.nai-grid');
  if(grid)grid.appendChild(holder);else title.parentElement?.insertAdjacentElement('afterend',holder);
  const type=document.getElementById('naiType');
  type?.addEventListener('change',()=>{
    const v=type.value;
    const text=document.getElementById('naiUniversalText');
    if(text&&v==='Altro')text.placeholder='Scrivi qualsiasi contenuto tu voglia pubblicare, senza uno schema predefinito.';
    else if(text)text.placeholder='Scrivi liberamente il contenuto. I campi specifici sopra possono essere usati solo quando servono.';
  });
}
function findPosterImage(){
  const imgs=[...document.querySelectorAll('#naiAutoPosterPanel img,#naiManualPosterPanel img')];
  const data=imgs.map(x=>x.currentSrc||x.src||'').find(x=>x.startsWith('data:image/'));
  if(data)return data;
  for(const c of document.querySelectorAll('#naiAutoPosterPanel canvas,#naiManualPosterPanel canvas')){try{return c.toDataURL('image/png')}catch(e){}}
  return '';
}
function buildUniversalText(type,free){
  if(free.trim())return free.trim();
  const v=id=>document.getElementById(id)?.value.trim()||'';
  const lines=[];
  if(type==='Torneo'){if(v('naiDate'))lines.push('📅 '+v('naiDate'));if(v('naiTime'))lines.push('⏰ '+v('naiTime'));if(v('naiLocation'))lines.push('📍 '+v('naiLocation'));if(v('naiPairs'))lines.push('👥 '+v('naiPairs')+' coppie');if(v('naiLevel'))lines.push('🎾 Livello '+v('naiLevel'));if(v('naiFee'))lines.push('💶 Quota '+v('naiFee'));if(v('naiDeadline'))lines.push('⏳ Iscrizioni entro '+v('naiDeadline'));return lines.join('\n');}
  if(v('naiOffer'))lines.push(v('naiOffer'));if(v('naiProduct'))lines.push(v('naiProduct'));if(v('naiPrice'))lines.push('💶 '+v('naiPrice'));if(v('naiDate'))lines.push('📅 '+v('naiDate'));if(v('naiTime'))lines.push('⏰ '+v('naiTime'));if(v('naiLocation'))lines.push('📍 '+v('naiLocation'));if(v('naiDeadline'))lines.push('⏳ '+v('naiDeadline'));return lines.join('\n');
}
async function publishUniversal(){
  const t=universalSelected();
  const sb=window.supabaseClient||window.sb;
  if(!sb){alert('Connessione Supabase non disponibile.');return}
  const title=document.getElementById('naiTitle')?.value.trim()||'Senza titolo';
  const type=document.getElementById('naiType')?.value||'Comunicazione';
  const free=document.getElementById('naiUniversalText')?.value||'';
  const text=buildUniversalText(type,free);
  if(!text.trim()){alert('Inserisci il contenuto della pubblicazione.');return}
  const file=document.getElementById('naiImage')?.files?.[0];
  let image=findPosterImage();
  if(file){if(file.size>6*1024*1024){alert('Immagine troppo grande: massimo 6 MB.');return}image=await universalDataUrl(file)}
  if(!t){
    const payload={titolo:title,testo:text,immagine:image||null,pubblicata:true,tipo:type,link:null,in_evidenza:false,ordine:0,torneo_id:null};
    const {error}=await sb.from('news').insert(payload);
    if(error){console.error(error);alert('Errore salvataggio News: '+error.message);return}
    universalEditingId=null;
    alert('News pubblicata correttamente.');
    document.querySelector('[data-com-page="news"]')?.click();
    return
  }
  const c=universalCfg(t),items=Array.isArray(c.news)?c.news:[];
  const old=universalEditingId?items.find(n=>String(n.id)===String(universalEditingId)):null;
  const item={...(old||{}),id:old?.id||'news-'+Date.now(),tipo:type,titolo:title,testo:text,immagine:image||old?.immagine||'',link:'',inEvidenza:old?.inEvidenza??(items.length===0),data:old?.data||new Date().toISOString(),ordine:old?.ordine??items.length,pubblicata:true,stato:'pubblicata'};
  const next=old?items.map(n=>String(n.id)===String(old.id)?item:n):[...items,item];
  const {data,error}=await sb.from('tornei').update({configurazione:{...c,news:next}}).eq('id',t.id).select('id,configurazione').maybeSingle();
  if(error||!data){console.error(error);alert('Errore salvataggio News: '+(error?.message||'configurazione non aggiornata'));return}
  t.configurazione=data.configurazione||{...c,news:next};
  try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}
  universalEditingId=null;
  alert('News pubblicata correttamente.');
  document.querySelector('[data-com-page="news"]')?.click();
}
function bindUniversalCapture(){
  if(document.documentElement.dataset.universalNewsBound==='1')return;
  document.documentElement.dataset.universalNewsBound='1';
  document.addEventListener('click',e=>{
    const edit=e.target.closest?.('[data-nai-edit]');
    if(edit){universalEditingId=edit.dataset.naiEdit||null;return}
    const publish=e.target.closest?.('#naiPublish');
    if(publish){e.preventDefault();e.stopImmediatePropagation();publishUniversal()}
  },true);
}
function runUniversal(){
  cleanAI();
  addUniversalTypes();
  installUniversalFields();
  installMenus();
  bindUniversalCapture();
}
function run(){runUniversal()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('admin:render',run);
})();