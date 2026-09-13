(()=>{
'use strict';

function removeDuplicateSponsorBanner(){
  const nodes=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,section,article')];
  for(const node of nodes){
    const text=String(node.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(text!=='I NOSTRI SPONSOR') continue;

    let target=node;
    for(let i=0;i<6 && target.parentElement;i++){
      const parent=target.parentElement;
      const parentText=String(parent.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      if(parentText.includes('I NOSTRI SPONSOR') && parentText.includes('NESSUNO SPONSOR CONFIGURATO')){
        target=parent;
        if(parent.matches('section,article,.card,[id*="sponsor" i],[class*="sponsor" i]')) break;
      }else{
        break;
      }
    }

    if(target!==document.body && target!==document.documentElement){
      target.remove();
    }
  }
}

const observer=new MutationObserver(removeDuplicateSponsorBanner);
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',removeDuplicateSponsorBanner,{once:true});
}else{
  removeDuplicateSponsorBanner();
}

setTimeout(removeDuplicateSponsorBanner,300);
setTimeout(removeDuplicateSponsorBanner,1000);
})();
