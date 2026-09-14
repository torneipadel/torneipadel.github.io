/* NEXT POINT PADEL — NEWS PREVIEW
   La pagina visitatore mostra una vetrina delle News pubblicate.
   La gestione editoriale completa resta nell'editor News AI.
*/
(function(){
'use strict';
const URL_SUPABASE='https://iybjvtmfaupgthqqsngd.supabase.co';
const KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
let busy=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const dateValue=n=>{const v=n?.data||n?.__torneoData||'';const d=new Date(v);return Number.isNaN(d.getTime())?0:d.getTime()};
function sortNews(a,b){
 if(Boolean(b.inEvidenza)!==Boolean(a.inEvidenza))return b.inEvidenza?1:-1;
 const ao=Number.isFinite(Number(a.ordine))?Number(a.ordine):999999;
 const bo=Number.isFinite(Number(b.ordine))?Number(b.ordine):999999;
 if(ao!==bo)return ao-bo;
 return dateValue(b)-dateValue(a);
}
async function loadPublishedNews(){
 const box=document.getElementById('npNews');
 if(!box||busy)return;
 busy=true;
 try{
  if(!window.supabase?.createClient)return;
  const sb=window.supabase.createClient(URL_SUPABASE,KEY);
  const {data,error}=await sb.from('tornei').select('id,nome,data,pubblicato,stato,configurazione').order('data',{ascending:true});
  if(error)throw error;
  const all=[];
  (data||[]).forEach(t=>{
   if(!(t.pubblicato===true||String(t.stato||'').toLowerCase()==='attivo'))return;
   const items=Array.isArray(t.configurazione?.news)?t.configurazione.news:[];
   items.forEach(n=>{
    if(n?.pubblicataVisitatore===false)return;
    all.push({...n,__torneo:t.nome||'',__torneoData:t.data||''});
   });
  });
  all.sort(sortNews);
  const cards=all.slice(0,3);
  if(!cards.length){
   box.innerHTML='<div class="np-empty">Nessuna comunicazione pubblicata al momento.</div>';
  }else{
   box.innerHTML=`<div class="np-news-grid">${cards.map(n=>`<article class="np-news-card">${n.immagine?`<div class="np-news-img"><img src="${esc(n.immagine)}" alt="${esc(n.titolo||'News')}" loading="lazy"></div>`:''}<div class="np-news-body"><span class="np-news-type">${esc(n.tipo||'Comunicazione')}</span><h3>${esc(n.titolo||'Senza titolo')}</h3>${n.testo?`<p>${esc(n.testo)}</p>`:''}${n.link?`<a class="np-btn np-ghost" href="${esc(n.link)}" target="_blank" rel="noopener">SCOPRI →</a>`:''}</div></article>`).join('')}</div>`;
  }
  let more=box.querySelector('.np-news-all');
  if(!more){
   more=document.createElement('div');
   more.className='np-news-all';
   more.innerHTML='<a class="np-btn np-primary" href="news.html">VEDI TUTTE LE NEWS →</a>';
   more.style.cssText='display:flex;justify-content:center;margin-top:18px';
   box.appendChild(more);
  }
 }catch(e){console.warn('News preview:',e)}
 finally{busy=false}
}
function watch(){
 const box=document.getElementById('npNews');
 if(!box)return;
 loadPublishedNews();
 const observer=new MutationObserver(()=>loadPublishedNews());
 observer.observe(box,{childList:true,subtree:true});
 setTimeout(()=>observer.disconnect(),5000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});
else watch();
})();