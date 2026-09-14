/* NEWS STANDARD MODE — nasconde i controlli AI e la vecchia anteprima automatica dalla schermata News. Non modifica l’editor esistente. */
(()=>{
'use strict';
function cleanAI(){
  const title=document.querySelector('.page-head h1');
  if(title&&/News\s*&\s*Comunicazioni\s*AI/i.test(title.textContent)) title.textContent='News & Comunicazioni';
  const sub=document.querySelector('.page-head p');
  if(sub&&/creazione assistita/i.test(sub.textContent)) sub.textContent=sub.textContent.replace(/\s*·\s*creazione assistita e pubblicazione/i,'');
  document.querySelectorAll('#naiGenerate,#naiRegenerate').forEach(el=>{el.style.display='none';});
  document.querySelectorAll('#naiAutoPosterPanel,.nai-auto-wrap').forEach(el=>{el.style.display='none';});
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',cleanAI,{once:true});
}else{
  cleanAI();
}
window.addEventListener('admin:render',cleanAI);
})();
