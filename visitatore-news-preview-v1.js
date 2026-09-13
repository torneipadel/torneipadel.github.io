/* NEXT POINT PADEL — NEWS PREVIEW
   La pagina visitatore mostra solo una vetrina delle News.
   La gestione editoriale completa resta in news.html.
*/
(function(){
'use strict';
function applyNewsPreview(){
  const box=document.getElementById('npNews');
  if(!box)return;
  const cards=Array.from(box.querySelectorAll('.np-news-card'));
  if(!cards.length)return;
  cards.forEach((card,index)=>{card.style.display=index<3?'':'none'});
  let more=box.querySelector('.np-news-all');
  if(!more){
    more=document.createElement('div');
    more.className='np-news-all';
    more.innerHTML='<a class="np-btn np-primary" href="news.html">VEDI TUTTE LE NEWS →</a>';
    more.style.cssText='display:flex;justify-content:center;margin-top:18px';
    box.appendChild(more);
  }
}
function watch(){
  const box=document.getElementById('npNews');
  if(!box)return;
  applyNewsPreview();
  const observer=new MutationObserver(applyNewsPreview);
  observer.observe(box,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),5000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});
else watch();
})();
