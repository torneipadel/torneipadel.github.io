/* ADMIN COMUNICAZIONI V4 — News / Sponsor / WhatsApp. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const state=()=>window.adminState||{};
const selected=()=>window.getTorneoAdminCorrente?.()||((state().tornei||[]).find(t=>String(t.id)===String(state().torneoSelezionato))||null);
const esc=v=>String(v??'').replace(/[&<>"]/g,m=>({'&':'&','<':'<','>':'>','"':'"'}[m]));
const cfgOf=t=>t?.configurazione&&typeof t.configurazione==='object'?{...t.configurazione}:{};

async function saveCfg(t,cfg){
const sb=window.supabaseClient||window.sb;
if(!sb||!t){alert('Torneo o connessione Supabase non disponibile.');return false}
const cleanCfg={...(cfg||{})};
const {data,error}=await sb.from('tornei').update({configurazione:cleanCfg}).eq('id',t.id).select('id,configurazione').maybeSingle();
if(error){console.error('Errore salvataggio configurazione:',error);alert('Errore salvataggio: '+error.message);return false}
if(!data){alert('Configurazione non salvata: il torneo selezionato non è stato aggiornato.');return false}
t.configurazione=data.configurazione||cleanCfg;
window.adminState=state();
try{localStorage.setItem('padel_admin_state',JSON.stringify(state()))}catch(e){}
return true
}

async function loadGlobalSponsors(){
const sb=window.supabaseClient||window.sb;
if(!sb)return [];
const {data,error}=await sb.from('sponsor').select('id,nome,immagine,video,link').order('id',{ascending:true});
if(error){console.error('Errore caricamento sponsor:',error);alert('Errore caricamento sponsor: '+error.message);return []}
return data||[];
}

function shell(title,sub,body){
const root=$('appContent');
if(!root)return;
root.innerHTML=`<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><button class="btn" id="comBack">← Torna al torneo</button></div>${body}`;
$('comBack')?.addEventListener('click',()=>window.openAdminPage?.('torneo'))
}

function news(){
const t=selected();
if(!t){alert('Seleziona prima un torneo');return}
const c=cfgOf(t),items=Array.isArray(c.news)?c.news:[];
shell('News',`${esc(t.nome)} · ID ${esc(t.id)}`,`<div class="card feature-card"><div class="card-head"><div><h2>Gestione News</h2><span class="notice">Pubblica e gestisci le comunicazioni del torneo</span></div></div><div class="card-body"><div class="section-grid"><div class="feature-form"><label>Titolo</label><input id="newsTitle" class="input" placeholder="Titolo della news"><label>Testo</label><textarea id="newsText" class="input" rows="6" placeholder="Testo della comunicazione"></textarea><button class="btn primary" id="newsSave">＋ Pubblica news</button></div><div><h3>News del torneo</h3><div id="newsList" class="feature-list">${items.length?items.map((n,i)=>`<div class="list-item"><strong>${esc(n.titolo)}</strong><small>${esc(n.testo)}</small><button class="btn small danger" data-news-del="${i}">Elimina</button></div>`).join(''):'<div class="empty">Nessuna news pubblicata.</div>'}</div></div></div></div></div>`);

$('newsSave').onclick=async()=>{
const titolo=$('newsTitle')?.value.trim();
const testo=$('newsText')?.value.trim();

if(!titolo||!testo){
alert('Inserisci titolo e testo della news.');
return
}

const next=[...items,{id:'news-'+Date.now(),titolo,testo,data:new Date().toISOString()}];

if(await saveCfg(t,{...c,news:next}))news()
};

document.querySelectorAll('[data-news-del]').forEach(b=>b.onclick=async()=>{
const next=items.filter((_,i)=>i!==Number(b.dataset.newsDel));
if(await saveCfg(t,{...c,news:next}))news()
})
}

async function sponsor(){
const items=await loadGlobalSponsors();

const form=(editing=null)=>{
const s=editing||{};

return `<div class="feature-form" id="sponsorForm">

<h3>${editing?'Modifica sponsor':'Nuovo sponsor'}</h3>

<label>Nome sponsor</label> <input id="sponsorName" class="input" value="${esc(s.nome||'')}" placeholder="Nome sponsor">

<label>Logo sponsor</label> <input id="sponsorLogo" class="input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"> <small class="notice">${editing&&s.immagine?'Seleziona un nuovo file solo se vuoi sostituire il logo attuale.':'Seleziona il logo dello sponsor.'}</small>

<label>Video sponsor</label> <input id="sponsorVideo" class="input" value="${esc(s.video||'')}" placeholder="https://.../video"> <small class="notice">URL del video o della pagina video.</small>

<label>Link sponsor</label> <input id="sponsorUrl" class="input" value="${esc(s.link||'')}" placeholder="https://.../"> <small class="notice">Inserisci il sito dello sponsor.</small>

<div class="admin-feature-actions">
<button class="btn primary" id="sponsorSave">${editing?'💾 Salva modifiche':'＋ Aggiungi sponsor'}</button>
${editing?'<button type="button" class="btn" id="sponsorCancel">Annulla</button>':''}
</div>
</div>`;
};

const list=items.length?items.map(n=>`<div class="list-item" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">

<div style="width:90px;min-width:90px;height:60px;border-radius:10px;overflow:hidden;background:rgba(15,23,42,.12);display:flex;align-items:center;justify-content:center">

${n.immagine?
`<img src="${esc(n.immagine)}" alt="${esc(n.nome||'Sponsor')}" style="max-width:100%;max-height:100%;object-fit:contain" onerror="this.style.display='none';this.parentElement.innerHTML='🖼️'">`
:'<span style="font-size:24px">🏢</span>'}

</div>

<div style="flex:1;min-width:220px">

<strong style="display:block;font-size:15px">${esc(n.nome||'Sponsor senza nome')}</strong>

<small style="display:block;margin-top:4px">
${n.link?`Link: <a href="${esc(n.link)}" target="_blank" rel="noopener noreferrer">${esc(n.link)}</a>`:'Nessun link'}
</small>

<small style="display:block;margin-top:3px">
${n.immagine?'Logo caricato':'Nessun logo caricato'}
 ·
${n.video?`Video: <a href="${esc(n.video)}" target="_blank" rel="noopener noreferrer">Apri video</a>`:'Nessun video'}
</small>

</div>

<div style="display:flex;gap:8px;flex-wrap:wrap">

<button type="button" class="btn small" data-sponsor-edit="${esc(n.id)}">✏️ Modifica</button>

<button type="button" class="btn small danger" data-sponsor-del="${esc(n.id)}">Elimina</button>

</div>

</div>`).join(''):'<div class="empty">Nessuno sponsor configurato. Inserisci il primo sponsor usando il modulo qui accanto.</div>';

shell(
'Sponsor',
'Sponsor globali · visibili in tutti i tabelloni',
`<div class="card feature-card">

<div class="card-head">
<div>
<h2>Gestione Sponsor</h2>
<span class="notice">Gestione completa degli sponsor globali. Il logo viene caricato direttamente dal menu Sponsor.</span>
</div>
</div>

<div class="card-body">

<div class="section-grid">

<div id="sponsorEditor">${form()}</div>

<div>

<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">

<div>
<h3>Sponsor globali</h3>
<p class="notice">${items.length} sponsor configurat${items.length===1?'o':'i'}</p>
</div>

</div>

<div id="sponsorList" class="feature-list">${list}</div>

</div>

</div>

</div>

</div>`
);

const reset=()=>{
const box=$('sponsorEditor');

if(box)box.innerHTML=form();

bindForm();
};

const bindForm=()=>{

$('sponsorCancel')?.addEventListener('click',reset);

$('sponsorSave')?.addEventListener('click',async()=>{

const nome=$('sponsorName')?.value.trim();
const video=$('sponsorVideo')?.value.trim();
const link=$('sponsorUrl')?.value.trim();
const logoFile=$('sponsorLogo')?.files?.[0];

if(!nome){
alert('Inserisci il nome dello sponsor.');
return;
}

if(!link){
alert('Inserisci il link del sito dello sponsor.');
return;
}

if(logoFile){

const allowedTypes=[
'image/png',
'image/jpeg',
'image/webp',
'image/svg+xml'
];

if(!allowedTypes.includes(logoFile.type)){
alert('Il logo deve essere un file PNG, JPG, WEBP o SVG.');
return;
}

if(logoFile.size>2*1024*1024){
alert('Il logo è troppo grande. Usa un file massimo di 2 MB.');
return;
}

}

const sb=window.supabaseClient||window.sb;

if(!sb){
alert('Connessione Supabase non disponibile.');
return;
}

const saveButton=$('sponsorSave');
const editId=saveButton?.dataset.editId;

if(saveButton){
saveButton.disabled=true;
saveButton.textContent='⏳ Salvataggio...';
}

try{

let immagine=editId?
(items.find(x=>String(x.id)===String(editId))?.immagine||'')
:'';

if(logoFile){

immagine=await new Promise((resolve,reject)=>{

const reader=new FileReader();

reader.onload=()=>resolve(String(reader.result||''));

reader.onerror=()=>reject(new Error('Impossibile leggere il file del logo.'));

reader.readAsDataURL(logoFile);

});

}

let savedSponsor=null;

if(editId){

const {data,error}=await sb
.from('sponsor')
.update({
nome,
immagine,
video,
link
})
.eq('id',editId)
.select('id,nome,immagine,video,link')
.maybeSingle();

if(error){
console.error('Errore salvataggio sponsor:',error);
throw new Error('Errore salvataggio sponsor: '+error.message);
}

if(!data){
throw new Error('Lo sponsor selezionato non è stato aggiornato.');
}

savedSponsor=data;

}else{

const {data,error}=await sb
.from('sponsor')
.insert({
nome,
immagine,
video,
link
})
.select('id,nome,immagine,video,link')
.single();

if(error){
console.error('Errore salvataggio sponsor:',error);
throw new Error('Errore salvataggio sponsor: '+error.message);
}

if(!data){
throw new Error('Sponsor salvato senza ricevere il relativo ID.');
}

savedSponsor=data;
}

await sponsor();

}catch(error){

console.error('Errore gestione sponsor:',error);

alert(error?.message||'Errore durante il salvataggio dello sponsor.');

if(saveButton){
saveButton.disabled=false;
saveButton.textContent=editId?'💾 Salva modifiche':'＋ Aggiungi sponsor';
}

}

});

};

bindForm();

document.querySelectorAll('[data-sponsor-edit]').forEach(b=>b.onclick=()=>{

const item=items.find(x=>String(x.id)===String(b.dataset.sponsorEdit));

if(!item)return;

const box=$('sponsorEditor');

if(box){

box.innerHTML=form(item);

const save=$('sponsorSave');

if(save)save.dataset.editId=item.id;

bindForm();

box.scrollIntoView({
behavior:'smooth',
block:'nearest'
});

}

});

document.querySelectorAll('[data-sponsor-del]').forEach(b=>b.onclick=async()=>{

if(!confirm('Eliminare questo sponsor globale?'))return;

const sb=window.supabaseClient||window.sb;

if(!sb)return;

const {error}=await sb
.from('sponsor')
.delete()
.eq('id',b.dataset.sponsorDel);

if(error){

console.error('Errore eliminazione sponsor:',error);

alert('Errore eliminazione sponsor: '+error.message);

return;

}

await sponsor();

});

}

function whatsapp(){
const t=selected();

if(!t){
alert('Seleziona prima un torneo');
return
}

const link=location.origin+'/Bove.html?idTorneo='+encodeURIComponent(t.id);

shell(
'WhatsApp',
`${esc(t.nome)} · ID ${esc(t.id)}`,
`<div class="card feature-card">

<div class="card-head">
<div>
<h2>Comunicazioni WhatsApp</h2>
<span class="notice">Messaggio pronto con il link del torneo selezionato</span>
</div>
</div>
<div class="card-body">
<label>Messaggio</label>
<textarea id="waText" class="input" rows="6">Ciao! Ti invitiamo al torneo ${esc(t.nome)} del ${esc(t.data||t.data_torneo||'')}.\n\n${esc(link)}</textarea>
<div class="admin-feature-actions">
<button class="btn primary" id="waOpen">📱 Apri WhatsApp</button>
<button class="btn" id="waCopy">📋 Copia link torneo</button>
</div>
<div class="notice" style="margin-top:14px">Il link è sempre riferito al torneo attualmente selezionato.</div>
</div>
</div>`
);

$('waOpen').onclick=()=>window.open(
'https://wa.me/?text='+encodeURIComponent($('waText')?.value||''),
'_blank'
);

$('waCopy').onclick=()=>navigator.clipboard?.writeText(link).then(
()=>alert('Link copiato negli appunti.')
)
}

function bindComLinks(){
document.querySelectorAll('[data-com-page]').forEach(b=>{
if(b.dataset.comBound)return;

b.dataset.comBound='1';

b.addEventListener('click',()=>{
document.getElementById('mobileOverlay')?.classList.remove('open');

const p=b.dataset.comPage;

if(p==='news')news();
else if(p==='sponsor')sponsor();
else if(p==='whatsapp')whatsapp()
})
})
}

function bindSidebar(){
document.querySelectorAll('#areaAdmin .sidebar [data-page]').forEach(b=>{
if(b.dataset.sidebarBound)return;

b.dataset.sidebarBound='1';

b.addEventListener('click',async()=>{
const page=b.dataset.page;

if(!page)return;

document.querySelectorAll('#areaAdmin .sidebar [data-page]')
.forEach(x=>x.classList.remove('active'));

b.classList.add('active');

if(typeof window.openAdminPage==='function')
await window.openAdminPage(page)
})
})
}

function bindAll(){
bindSidebar();
bindComLinks()
}

if(document.readyState==='loading')
document.addEventListener('DOMContentLoaded',bindAll,{once:true});
else
bindAll();

window.openAdminComPage=p=>
p==='news'?news():
p==='sponsor'?sponsor():
whatsapp();

})();
