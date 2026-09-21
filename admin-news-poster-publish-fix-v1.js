(()=>{
'use strict';
const q=s=>document.querySelector(s);
const selected=()=>window.getTorneoAdminCorrente?.()||((window.adminState?.tornei||[]).find(t=>String(t.id)===String(window.adminState?.torneoSelezionato))||null);
function cfgOf(v){if(v&&typeof v==='object')return v;if(typeof v==='string'){try{return JSON.parse(v)||{}}catch(e){}}return {}}
async function publishPoster(){
 const b=q('#naiManualPublish');
 const canvas=q('#naiManualCanvas');
 if(!canvas)return;
 const t=selected();
 const sb=window.supabaseClient||window.sb;
 if(!sb){alert('Connessione Supabase non disponibile.');return}
 if(b){b.disabled=true;b.textContent='⏳ Pubblicazione...'}
 try{if(!t){const out=document.createElement('canvas');out.width=720;out.height=900;out.getContext('2d').drawImage(canvas,0,0,out.width,out.height);let url=out.toDataURL('image/jpeg',0.55);if(url.length>650000)url=out.toDataURL('image/jpeg',0.4);const ins=await sb.from('news').insert({titolo:'Locandina',testo:'',immagine:url,pubblicata:true,tipo:'Comunicazione',link:null,in_evidenza:true,ordine:0,torneo_id:null}).select('*').single();if(ins.error||!ins.data)throw new Error(ins.error?.message||'Salvataggio News generale non riuscito');const status=q('#naiManualStatus');if(status)status.textContent='Locandina pubblicata nelle News generali.';return}
  const out=document.createElement('canvas');out.width=720;out.height=900;
  out.getContext('2d').drawImage(canvas,0,0,out.width,out.height);
  let url=out.toDataURL('image/jpeg',0.55);
  if(url.length>650000)url=out.toDataURL('image/jpeg',0.4);
  const fresh=await sb.from('tornei').select('id,configurazione').eq('id',t.id).maybeSingle();
  if(fresh.error||!fresh.data)throw new Error(fresh.error?.message||'Torneo non trovato');
  const cfg=cfgOf(fresh.data.configurazione);
  const items=Array.isArray(cfg.news)?cfg.news:[];
  const item={id:'poster-'+Date.now(),tipo:'Locandina',titolo:'Locandina',testo:'',link:'',immagine:url,inEvidenza:true,pubblicataVisitatore:true,data:new Date().toISOString(),ordine:items.length,aiMode:'manual-poster'};
  const next=[...items.map(n=>({...n,inEvidenza:false})),item];
  const write=await sb.from('tornei').update({configurazione:{...cfg,news:next}}).eq('id',t.id);
  if(write.error)throw new Error(write.error.message);
  const verify=await sb.from('tornei').select('id,configurazione').eq('id',t.id).maybeSingle();
  if(verify.error||!verify.data)throw new Error(verify.error?.message||'Verifica salvataggio fallita');
  const saved=cfgOf(verify.data.configurazione);
  const ok=Array.isArray(saved.news)&&saved.news.some(n=>String(n.id)===String(item.id)&&typeof n.immagine==='string'&&n.immagine.startsWith('data:image/'));
  if(!ok)throw new Error('La locandina non risulta presente nel torneo dopo il salvataggio.');
  t.configurazione=saved;
  try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}
  const status=q('#naiManualStatus');if(status)status.textContent='Locandina pubblicata nelle News dei visitatori.';
 }catch(e){console.error('Pubblicazione locandina:',e);alert('Pubblicazione locandina non riuscita: '+(e?.message||e));}
 finally{if(b){b.disabled=false;b.textContent='Pubblica ai visitatori'}}
}
function bind(){const b=q('#naiManualPublish');if(!b)return;if(b.dataset.posterPublishFix!=='1')b.dataset.posterPublishFix='1';b.onclick=publishPoster}
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
setTimeout(bind,500);
setInterval(bind,1000);
window.addEventListener('admin:render',bind);
document.addEventListener('click',e=>{
 const b=e.target?.closest?.('#naiManualPublish');
 if(!b)return;
 e.preventDefault();
 e.stopImmediatePropagation();
 publishPoster();
},true);

/* SALVA BOZZA: deve restare locale e non creare record pubblici nel database. */
function bindDraft(){
 const b=q('#naiSaveDraft');
 if(!b||b.dataset.localDraftFix==='1')return;
 b.dataset.localDraftFix='1';
 b.onclick=()=>{
  const t=selected();
  const key='news-ai-draft-'+String(t?.id||'');
  const ids=['naiType','naiTitle','naiDate','naiTime','naiLocation','naiPairs','naiLevel','naiFee','naiDeadline','naiOffer','naiProduct','naiPrice','naiCta'];
  const draft={};
  ids.forEach(id=>{const e=q('#'+id);if(e)draft[id]=e.value});
  try{
   localStorage.setItem(key,JSON.stringify(draft));
   const status=q('#naiStatus');
   if(status)status.textContent='Bozza salvata localmente. Non è ancora pubblicata.';
  }catch(e){console.error('Salvataggio bozza locale:',e);alert('Impossibile salvare la bozza localmente.');}
 };
}
const obs=new MutationObserver(bindDraft);
obs.observe(document.body,{childList:true,subtree:true});
setTimeout(bindDraft,500);
window.addEventListener('admin:render',bindDraft);
bindDraft();

/* MODIFICA NEWS: il codice editor rinomina il pulsante Pubblica in "Aggiorna News".
   Manteniamo esplicita la pubblicazione dell'aggiornamento, senza cambiare il comportamento. */
function bindEditPublish(){
 const b=q('#naiPublish');
 if(!b)return;
 if((b.textContent||'').trim()==='💾 Aggiorna News'){
  b.textContent='🚀 Pubblica aggiornamento';
  b.title='Pubblica le modifiche della News esistente';
 }
}
const editObs=new MutationObserver(bindEditPublish);
editObs.observe(document.body,{childList:true,subtree:true,characterData:true});
setTimeout(bindEditPublish,300);
setInterval(bindEditPublish,1000);
window.addEventListener('admin:render',bindEditPublish);
bindEditPublish();
window.__NAI_POSTER_PUBLISH_FIX__=true;
})();