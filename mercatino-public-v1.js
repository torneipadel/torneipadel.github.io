(function(){
'use strict';
const URL_SUPABASE='https://iybjvtmfaupgthqqsngd.supabase.co';
const KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
const list=document.getElementById('list');
const detail=document.getElementById('detail');
const detailContent=document.getElementById('detailContent');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const label=c=>({racchette:'Racchette',abbigliamento:'Abbigliamento',accessori:'Accessori',altro:'Altro'})[c]||'Altro';
let items=[];
function render(filter){
 const data=filter==='all'?items:items.filter(x=>x.categoria===filter);
 if(!data.length){list.innerHTML='<div class="empty">Nessun articolo disponibile in questa categoria.</div>';return}
 list.innerHTML=data.map(x=>{const index=items.indexOf(x);return '<article class="item"><div class="thumb">'+(x.immagine?'<img src="'+esc(x.immagine)+'" alt="'+esc(x.titolo)+'">':'🎾')+'</div><div><div class="type">'+esc(label(x.categoria))+'</div><h2>'+esc(x.titolo)+'</h2><p>'+esc(x.anteprima)+'</p><div class="price">'+esc(x.prezzo||'')+'</div><div class="condition">'+esc(x.condizioni||'')+'</div></div><div class="open-wrap"><button class="open" onclick="openDetail('+index+')">VEDI</button></div></article>'}).join('');
}
window.openDetail=function(index){const x=items[index];if(!x)return;detailContent.innerHTML='<div class="detail-photo">'+(x.immagine?'<img src="'+esc(x.immagine)+'" alt="'+esc(x.titolo)+'">':'🎾')+'</div><div class="type">'+esc(label(x.categoria))+'</div><h2>'+esc(x.titolo)+'</h2><div class="detail-meta"><span class="pill">'+esc(x.prezzo||'Prezzo da definire')+'</span><span class="pill">'+esc(x.condizioni||'Condizioni non indicate')+'</span></div><div class="detail-text">'+esc(x.descrizione||x.anteprima||'')+'</div>'+(x.contatto?'<a class="contact" href="mailto:'+encodeURIComponent(x.contatto)+'">CONTATTA IL VENDITORE</a>':'');detail.classList.add('opened');};
window.closeDetail=function(){detail.classList.remove('opened')};
detail.addEventListener('click',e=>{if(e.target===detail)window.closeDetail()});
async function load(){
 try{
  const client=window.supabase.createClient(URL_SUPABASE,KEY);
  const {data,error}=await client.from('mercatino').select('id,titolo,categoria,categoria_label,anteprima,descrizione,prezzo,condizioni,immagine,contatto').eq('pubblicato',true).eq('stato','disponibile').order('created_at',{ascending:false});
  if(error)throw error;
  items=data||[];
  const active=document.querySelector('.filter.active')?.dataset.filter||'all';
  render(active);
 }catch(e){console.error('MERCATINO:',e);list.innerHTML='<div class="empty">Impossibile caricare il Mercatino in questo momento.</div>';}
}
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render(btn.dataset.filter)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')window.closeDetail()});
load();
})();