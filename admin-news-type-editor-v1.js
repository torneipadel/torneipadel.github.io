/* ADMIN NEWS TYPE EDITOR V2 — adatta l'editor News AI esistente al tipo selezionato.
   Non sostituisce l'editor, non elimina funzioni: interviene solo sulla visibilita' dei campi. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const typeConfig={
  Comunicazione:{show:['naiOffer','naiCta'],labels:{naiOffer:'Argomento / comunicazione',naiCta:'Pulsante / CTA'},placeholders:{naiOffer:'Es. Avviso importante per i giocatori',naiCta:'Es. Scopri di più'}},
  Torneo:{show:['naiDate','naiTime','naiLocation','naiPairs','naiLevel','naiFee','naiDeadline'],labels:{naiDate:'Data',naiTime:'Ora',naiLocation:'Luogo',naiPairs:'Coppie',naiLevel:'Livello',naiFee:'Quota',naiDeadline:'Scadenza iscrizioni'},placeholders:{naiDate:'18 ottobre 2026',naiTime:'09:00',naiLocation:'Next Point Padel',naiPairs:'16',naiLevel:'Intermedio',naiFee:'€25 a persona',naiDeadline:'15 ottobre 2026'}},
  Promozione:{show:['naiOffer','naiDeadline','naiCta'],labels:{naiOffer:'Offerta / promozione',naiDeadline:'Valida fino al',naiCta:'Pulsante / CTA'},placeholders:{naiOffer:'Descrivi la promozione',naiDeadline:'30 settembre 2026',naiCta:'Scopri l’offerta'}},
  Evento:{show:['naiDate','naiTime','naiLocation','naiOffer','naiCta'],labels:{naiDate:'Data',naiTime:'Ora',naiLocation:'Luogo',naiOffer:'Descrizione evento',naiCta:'Pulsante / CTA'},placeholders:{naiDate:'25 settembre 2026',naiTime:'19:00',naiLocation:'Next Point Padel',naiOffer:'Descrivi l’evento',naiCta:'Partecipa'}},
  Ricordo:{show:['naiDate','naiLocation','naiOffer','naiCta'],labels:{naiDate:'Data del ricordo',naiLocation:'Luogo',naiOffer:'Momento / ricordo',naiCta:'Pulsante / CTA'},placeholders:{naiDate:'12 luglio 2026',naiLocation:'Next Point Padel',naiOffer:'Es. La finale del torneo estivo',naiCta:'Rivivi il momento'}},
  Prodotto:{show:['naiProduct','naiPrice','naiOffer','naiCta'],labels:{naiProduct:'Prodotto',naiPrice:'Prezzo',naiOffer:'Descrizione prodotto',naiCta:'Pulsante / CTA'},placeholders:{naiProduct:'Nome del prodotto',naiPrice:'€19,90',naiOffer:'Descrivi il prodotto',naiCta:'Scopri il prodotto'}},
  Articolo:{show:['naiOffer','naiProduct','naiCta'],labels:{naiOffer:'Argomento',naiProduct:'Dettaglio / contenuto',naiCta:'Pulsante / CTA'},placeholders:{naiOffer:'Descrivi l’argomento',naiProduct:'Indica il taglio o i punti principali',naiCta:'Leggi l’articolo'}}
};
function fieldBox(id){const e=$(id);return e?.closest?.('div')||null}
function setText(id,text){const e=$(id);if(!e)return;const label=e.closest('div')?.querySelector('label');if(label)label.textContent=text}
function setPlaceholder(id,text){const e=$(id);if(e&&text)e.placeholder=text}
function apply(){
 const type=$('naiType')?.value;
 if(!type)return;
 const cfg=typeConfig[type]||typeConfig.Comunicazione;
 ['naiDate','naiTime','naiLocation','naiPairs','naiLevel','naiFee','naiDeadline','naiOffer','naiProduct','naiPrice','naiCta'].forEach(id=>{const box=fieldBox(id);if(box)box.style.display=cfg.show.includes(id)?'':'none'});
 Object.entries(cfg.labels||{}).forEach(([id,text])=>setText(id,text));
 Object.entries(cfg.placeholders||{}).forEach(([id,text])=>setPlaceholder(id,text));
 const imageBox=fieldBox('naiImage');
 if(imageBox){imageBox.style.display='';const label=imageBox.querySelector('label');if(label)label.textContent=type==='Torneo'?'Immagine / locandina':'Immagine';const note=imageBox.querySelector('small');if(note)note.textContent=type==='Torneo'?'Puoi usare una locandina esistente o lasciarla vuota.':'Immagine facoltativa del contenuto.'}
 ['#naiManualPosterPanel','#naiAutoPosterPanel','#naiCanvaPanel'].forEach(sel=>{const e=document.querySelector(sel);if(e)e.style.setProperty('display',type==='Torneo'?'':'none','important')});
 document.querySelectorAll('[data-news-tournament-poster]').forEach(e=>e.style.setProperty('display',type==='Torneo'?'':'none','important'));
}
function bind(){
 const type=$('naiType');
 if(!type)return false;
 if(type.dataset.newsTypeBound!=='1'){type.dataset.newsTypeBound='1';type.addEventListener('change',()=>setTimeout(apply,0));}
 apply();
 return true;
}
function hook(){bind();}
const obs=new MutationObserver(()=>hook());
if(document.body)obs.observe(document.body,{childList:true,subtree:true});
window.addEventListener('admin:render',hook);
window.addEventListener('nai:poster-created',()=>setTimeout(apply,0));
setTimeout(hook,0);setTimeout(hook,300);setTimeout(hook,1000);
window.__NEWS_TYPE_EDITOR_V2__=true;
})();
