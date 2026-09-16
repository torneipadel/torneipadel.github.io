(()=>{
'use strict';
const q=s=>document.querySelector(s);
const byId=id=>document.getElementById(id);
let replaying=false;

function currentType(){
  const s=byId('naiType');
  return s?.value||'';
}

function universalText(){
  return (byId('naiUniversalText')?.value||'').trim();
}

function syncUniversalToEditor(){
  const text=universalText();
  const topic=byId('naiTopic');
  if(topic&&text)topic.value=text;
  return text;
}

function normalizeTypeOption(){
  const select=byId('naiType');
  if(!select)return;
  [...select.options].forEach(o=>{
    if(o.value==='Altro'){
      o.value='Contenuto libero';
      o.textContent='✍️ Contenuto libero';
    }
  });
}

function saveDraftFields(){
  const t=window.getTorneoAdminCorrente?.()||((window.adminState?.tornei||[]).find(x=>String(x.id)===String(window.adminState?.torneoSelezionato))||null);
  const key='news-ai-draft-'+String(t?.id||'');
  if(!t)return;
  const ids=['naiType','naiTitle','naiDate','naiTime','naiLocation','naiPairs','naiLevel','naiFee','naiDeadline','naiOffer','naiProduct','naiPrice','naiCta','naiUniversalText','naiTopic'];
  const draft={};
  ids.forEach(id=>{const e=byId(id);if(e)draft[id]=e.value});
  try{localStorage.setItem(key,JSON.stringify(draft));return true}catch(e){console.error('Bozza News universale:',e);return false}
}

function loadUniversalIntoEdit(){
  const select=byId('naiType');
  const text=byId('naiUniversalText');
  const topic=byId('naiTopic');
  if(!select||!text)return;
  normalizeTypeOption();
  const id=window.__NAI_EDITING_ID__;
  if(!id)return;
  const t=window.getTorneoAdminCorrente?.()||((window.adminState?.tornei||[]).find(x=>String(x.id)===String(window.adminState?.torneoSelezionato))||null);
  const items=Array.isArray(t?.configurazione?.news)?t.configurazione.news:[];
  const n=items.find(x=>String(x.id)===String(id));
  if(!n)return;
  if(String(n.tipo||'')==='Altro')select.value='Contenuto libero';
  if(String(n.tipo||'')==='Contenuto libero' || String(n.tipo||'')==='Altro'){
    text.value=n.testo||'';
    if(topic)topic.value=n.testo||'';
  }
}

function watchEditButtons(){
  document.querySelectorAll('[data-nai-edit]').forEach(btn=>{
    if(btn.dataset.universalEditBound==='1')return;
    btn.dataset.universalEditBound='1';
    btn.addEventListener('click',()=>{
      window.__NAI_EDITING_ID__=btn.dataset.naiEdit||'';
      setTimeout(loadUniversalIntoEdit,80);
      setTimeout(loadUniversalIntoEdit,250);
      setTimeout(loadUniversalIntoEdit,600);
    },true);
  });
}

function prepareUniversalUI(){
  normalizeTypeOption();
  const select=byId('naiType');
  const text=byId('naiUniversalText');
  if(select&&!select.dataset.universalFixBound){
    select.dataset.universalFixBound='1';
    select.addEventListener('change',()=>{
      const value=currentType();
      if(text)text.placeholder=value==='Contenuto libero'?'Scrivi liberamente qualsiasi contenuto da pubblicare.':'Scrivi la descrizione completa del contenuto.';
    });
  }
  watchEditButtons();
}

async function replayPublish(button){
  if(replaying)return;
  replaying=true;
  syncUniversalToEditor();
  const generate=byId('naiGenerate');
  if(generate){
    generate.click();
    const started=Date.now();
    while(generate.disabled && Date.now()-started<30000)await new Promise(r=>setTimeout(r,100));
    if(Date.now()-started>=30000){replaying=false;alert('Generazione del contenuto non completata.');return}
  }
  const text=universalText();
  if(text){
    const topic=byId('naiTopic');
    if(topic)topic.value=text;
  }
  replaying=false;
  button.click();
}

function bindActions(){
  const publish=byId('naiPublish');
  if(publish&&!publish.dataset.universalPublishFix){
    publish.dataset.universalPublishFix='1';
    publish.addEventListener('click',e=>{
      if(replaying)return;
      const text=universalText();
      if(!text)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      replayPublish(publish);
    },true);
  }
  const draft=byId('naiSaveDraft');
  if(draft&&!draft.dataset.universalDraftFix){
    draft.dataset.universalDraftFix='1';
    draft.addEventListener('click',()=>{saveDraftFields()},true);
  }
}

function run(){prepareUniversalUI();bindActions();loadUniversalIntoEdit()}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('admin:render',()=>setTimeout(run,0));
const obs=new MutationObserver(()=>run());
obs.observe(document.body,{childList:true,subtree:true});
})();
