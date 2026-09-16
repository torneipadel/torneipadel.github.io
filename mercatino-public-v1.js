(function(){
'use strict';
const URL_SUPABASE='https://iybjvtmfaupgthqqsngd.supabase.co';
const KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
const client=window.supabase.createClient(URL_SUPABASE,KEY);
const list=document.getElementById('list');
const detail=document.getElementById('detail');
const detailContent=document.getElementById('detailContent');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const label=c=>({racchette:'Racchette',abbigliamento:'Abbigliamento',accessori:'Accessori',altro:'Altro'})[c]||'Altro';
let items=[];
let mine=[];
let session=null;
function render(filter){
 const data=filter==='all'?items:items.filter(x=>x.categoria===filter);
 if(!data.length){list.innerHTML='<div class="empty">Nessun articolo disponibile in questa categoria.</div>';return}
 list.innerHTML=data.map(x=>{const index=items.indexOf(x);return '<article class="item"><div class="thumb">'+(x.immagine?'<img src="'+esc(x.immagine)+'" alt="'+esc(x.titolo)+'">':'🎾')+'</div><div><div class="type">'+esc(label(x.categoria))+'</div><h2>'+esc(x.titolo)+'</h2><p>'+esc(x.anteprima)+'</p><div class="price">'+esc(x.prezzo||'')+'</div><div class="condition">'+esc(x.condizioni||'')+'</div></div><div class="open-wrap"><button class="open" onclick="openDetail('+index+')">VEDI</button></div></article>'}).join('');
}
function renderMine(){
 const box=document.getElementById('mineList');
 if(!session){box.innerHTML='<div class="empty">Accedi al tuo account per inserire e gestire i tuoi articoli.</div>';return}
 if(!mine.length){box.innerHTML='<div class="empty">Non hai ancora inserito articoli. Usa “＋ INSERISCI IL TUO ARTICOLO”.</div>';return}
 box.innerHTML=mine.map((x,i)=>{
  const sold=String(x.stato||'').toLowerCase()==='venduto';
  return '<div class="mine-row"><div><div class="mine-title">'+esc(x.titolo)+'</div><div class="mine-meta">'+esc(x.prezzo||'Prezzo non indicato')+' · '+esc(label(x.categoria))+' · '+(sold?'VENDUTO':'DISPONIBILE')+' · '+(x.pubblicato?'PUBBLICATO':'BOZZA')+'</div></div><div class="mine-actions"><button class="mini-action" onclick="modificaMioArticolo('+i+')">MODIFICA</button>'+(sold?'<button class="mini-action green" onclick="rimettiDisponibile('+i+')">DISPONIBILE</button>':'<button class="mini-action" onclick="segnaMioVenduto('+i+')">VENDUTO</button>')+(x.pubblicato?'<button class="mini-action" onclick="ritiraMioArticolo('+i+')">RITIRA</button>':'<button class="mini-action green" onclick="pubblicaMioArticolo('+i+')">PUBBLICA</button>')+'<button class="mini-action red" onclick="eliminaMioArticolo('+i+')">ELIMINA</button></div></div>';
 }).join('');
}
window.apriEditor=async function(){
 if(!session){alert('Per inserire un articolo devi accedere al tuo account.');location.href='index.html';return}
 document.getElementById('editor').classList.add('opened');
 document.getElementById('editorTitle').textContent='Inserisci il tuo articolo';
 document.getElementById('myItemForm').reset();
 document.getElementById('itemId').value='';
 document.getElementById('formStatus').textContent='';
 document.getElementById('editor').scrollIntoView({behavior:'smooth',block:'start'});
 setTimeout(()=>document.getElementById('itemTitolo')?.focus(),250);
};
window.chiudiEditor=function(){document.getElementById('editor').classList.remove('opened');document.getElementById('formStatus').textContent=''};
window.modificaMioArticolo=function(i){
 const x=mine[i];if(!x)return;
 document.getElementById('itemId').value=x.id;
 document.getElementById('itemTitolo').value=x.titolo||'';
 document.getElementById('itemPrezzo').value=x.prezzo||'';
 document.getElementById('itemCategoria').value=x.categoria||'altro';
 document.getElementById('itemCondizioni').value=x.condizioni||'';
 document.getElementById('itemContatto').value=x.contatto||'';
 document.getElementById('itemAnteprima').value=x.anteprima||'';
 document.getElementById('itemDescrizione').value=x.descrizione||'';
 document.getElementById('itemImmagine').value=x.immagine||'';
 document.getElementById('editorTitle').textContent='Modifica il tuo articolo';
 document.getElementById('formStatus').textContent='';
 document.getElementById('editor').classList.add('opened');
 document.getElementById('editor').scrollIntoView({behavior:'smooth',block:'start'});
};
async function saveMine(e){
 e.preventDefault();
 if(!session){alert('Sessione non disponibile. Accedi nuovamente.');return}
 const id=document.getElementById('itemId').value;
 const payload={titolo:document.getElementById('itemTitolo').value.trim(),categoria:document.getElementById('itemCategoria').value,categoria_label:label(document.getElementById('itemCategoria').value),prezzo:document.getElementById('itemPrezzo').value.trim(),condizioni:document.getElementById('itemCondizioni').value.trim(),contatto:document.getElementById('itemContatto').value.trim(),anteprima:document.getElementById('itemAnteprima').value.trim(),descrizione:document.getElementById('itemDescrizione').value.trim(),immagine:document.getElementById('itemImmagine').value.trim(),updated_at:new Date().toISOString()};
 if(!payload.titolo||!payload.descrizione){document.getElementById('formStatus').textContent='Titolo e descrizione sono obbligatori.';return}
 let result;
 if(id){result=await client.from('mercatino').update(payload).eq('id',id).eq('created_by',session.user.id)}
 else{result=await client.from('mercatino').insert({...payload,stato:'disponibile',pubblicato:false,created_by:session.user.id})}
 if(result.error){document.getElementById('formStatus').textContent='Errore salvataggio: '+result.error.message;return}
 document.getElementById('formStatus').textContent=id?'Articolo aggiornato.':'Articolo inserito come bozza.';
 await loadMine();
 await loadPublic();
 setTimeout(()=>chiudiEditor(),500);
}
async function updateMine(id,changes,message){
 if(!session)return;
 const {error}=await client.from('mercatino').update({...changes,updated_at:new Date().toISOString()}).eq('id',id).eq('created_by',session.user.id);
 if(error){alert('Errore: '+error.message);return}
 alert(message);await loadMine();await loadPublic();
}
window.segnaMioVenduto=async function(i){const x=mine[i];if(!x)return;if(!confirm('Segnare “'+x.titolo+'” come VENDUTO?'))return;await updateMine(x.id,{stato:'venduto',pubblicato:false},'Articolo segnato come venduto. Non sarà più visibile nella bacheca.')};
window.rimettiDisponibile=async function(i){const x=mine[i];if(!x)return;if(!confirm('Rimettere disponibile “'+x.titolo+'”?'))return;await updateMine(x.id,{stato:'disponibile'},'Articolo rimesso disponibile.')};
window.pubblicaMioArticolo=async function(i){const x=mine[i];if(!x)return;await updateMine(x.id,{pubblicato:true,stato:'disponibile'},'Articolo pubblicato nel Mercatino.')};
window.ritiraMioArticolo=async function(i){const x=mine[i];if(!x)return;if(!confirm('Ritirare “'+x.titolo+'” dalla pubblicazione?'))return;await updateMine(x.id,{pubblicato:false},'Articolo ritirato dalla pubblicazione.')};
window.eliminaMioArticolo=async function(i){const x=mine[i];if(!x)return;if(!confirm('ELIMINARE DEFINITIVAMENTE “'+x.titolo+'”?'))return;const {error}=await client.from('mercatino').delete().eq('id',x.id).eq('created_by',session.user.id);if(error){alert('Errore eliminazione: '+error.message);return}await loadMine();await loadPublic();};
window.openDetail=function(index){const x=items[index];if(!x)return;detailContent.innerHTML='<div class="detail-photo">'+(x.immagine?'<img src="'+esc(x.immagine)+'" alt="'+esc(x.titolo)+'">':'🎾')+'</div><div class="type">'+esc(label(x.categoria))+'</div><h2>'+esc(x.titolo)+'</h2><div class="detail-meta"><span class="pill">'+esc(x.prezzo||'Prezzo da definire')+'</span><span class="pill">'+esc(x.condizioni||'Condizioni non indicate')+'</span></div><div class="detail-text">'+esc(x.descrizione||x.anteprima||'')+'</div>'+(x.contatto?'<a class="contact" href="mailto:'+encodeURIComponent(x.contatto)+'">CONTATTA IL VENDITORE</a>':'');detail.classList.add('opened');};
window.closeDetail=function(){detail.classList.remove('opened')};
detail.addEventListener('click',e=>{if(e.target===detail)window.closeDetail()});
async function loadPublic(){
 try{
  const {data,error}=await client.from('mercatino').select('id,titolo,categoria,categoria_label,anteprima,descrizione,prezzo,condizioni,immagine,contatto').eq('pubblicato',true).eq('stato','disponibile').order('created_at',{ascending:false});
  if(error)throw error;
  items=data||[];
  const active=document.querySelector('.filter.active')?.dataset.filter||'all';
  render(active);
 }catch(e){console.error('MERCATINO:',e);list.innerHTML='<div class="empty">Impossibile caricare il Mercatino in questo momento.</div>';}
}
async function loadMine(){
 if(!session){mine=[];renderMine();return}
 const {data,error}=await client.from('mercatino').select('id,titolo,categoria,categoria_label,anteprima,descrizione,prezzo,condizioni,immagine,contatto,stato,pubblicato,created_by,created_at,updated_at').eq('created_by',session.user.id).order('created_at',{ascending:false});
 if(error){console.error('MERCATINO MIEI ARTICOLI:',error);document.getElementById('mineList').innerHTML='<div class="empty">Errore nel caricamento dei tuoi articoli.</div>';return}
 mine=data||[];renderMine();
}
document.getElementById('myItemForm')?.addEventListener('submit',saveMine);
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render(btn.dataset.filter)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){window.closeDetail();chiudiEditor()}});
async function init(){
 const {data}=await client.auth.getSession();
 session=data?.session||null;
 await loadPublic();
 await loadMine();
}
init();
})();