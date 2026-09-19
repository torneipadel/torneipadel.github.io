/* ADMIN COMUNICAZIONI V4 — News / Sponsor / WhatsApp. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const state=()=>window.adminState||{};
const selected=()=>window.getTorneoAdminCorrente?.()||((state().tornei||[]).find(t=>String(t.id)===String(state().torneoSelezionato))||null);
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&','<':'<','>':'>','\"':'\"'}[m]));
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
if(!titolo||!testo){alert('Inserisci titolo e testo della news.');return}
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
return `<div class="feature-form" id="sponsorForm"><h3>${editing?'Modifica sponsor':'Nuovo sponsor'}</h3><label>Nome sponsor</label> <input id="sponsorName" class="input" value="${esc(s.nome||'')}" placeholder="Nome sponsor"><label>Logo sponsor</label> <input id="sponsorLogo" class="input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"> <small class="notice">${editing&&s.immagine?'Seleziona un nuovo file solo se vuoi sostituire il logo attuale.':'Seleziona il logo dello sponsor.'}</small><label>Video sponsor</label> <input id="sponsorVideo" class="input" value="${esc(s.video||'')}" placeholder="https://.../video"> <small class="notice">URL del video o della pagina video.</small><label>Link sponsor</label> <input id="sponsorUrl" class="input" value="${esc(s.link||'')}" placeholder="https://.../"> <small class="notice">Inserisci il sito dello sponsor.</small><div class="admin-feature-actions"><button class="btn primary" id="sponsorSave">${editing?'💾 Salva modifiche':'＋ Aggiungi sponsor'}</button>${editing?'<button type="button" class="btn" id="sponsorCancel">Annulla</button>':''}</div></div>`;
};
const list=items.length?items.map(n=>`<div class="list-item" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="width:90px;min-width:90px;height:60px;border-radius:10px;overflow:hidden;background:rgba(15,23,42,.12);display:flex;align-items:center;justify-content:center">${n.immagine?`<img src="${esc(n.immagine)}" alt="${esc(n.nome||'Sponsor')}" style="max-width:100%;max-height:100%;object-fit:contain" onerror="this.style.display='none';this.parentElement.innerHTML='🖼️'">`:'<span style="font-size:24px">🏢</span>'}</div><div style="flex:1;min-width:220px"><strong style="display:block;font-size:15px">${esc(n.nome||'Sponsor senza nome')}</strong><small style="display:block;margin-top:4px">${n.link?`Link: <a href="${esc(n.link)}" target="_blank" rel="noopener noreferrer">${esc(n.link)}</a>`:'Nessun link'}</small><small style="display:block;margin-top:3px">${n.immagine?'Logo caricato':'Nessun logo caricato'} · ${n.video?`Video: <a href="${esc(n.video)}" target="_blank" rel="noopener noreferrer">Apri video</a>`:'Nessun video'}</small></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn small" data-sponsor-edit="${esc(n.id)}">✏️ Modifica</button><button type="button" class="btn small danger" data-sponsor-del="${esc(n.id)}">Elimina</button></div></div>`).join(''):'<div class="empty">Nessuno sponsor configurato. Inserisci il primo sponsor usando il modulo qui accanto.</div>';
shell('Sponsor','Sponsor globali · visibili in tutti i tabelloni',`<div class="card feature-card"><div class="card-head"><div><h2>Gestione Sponsor</h2><span class="notice">Gestione completa degli sponsor globali. Il logo viene caricato direttamente dal menu Sponsor.</span></div></div><div class="card-body"><div class="section-grid"><div id="sponsorEditor">${form()}</div><div><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><h3>Sponsor globali</h3><p class="notice">${items.length} sponsor configurat${items.length===1?'o':'i'}</p></div></div><div id="sponsorList" class="feature-list">${list}</div></div></div></div></div>`);
const reset=()=>{const box=$('sponsorEditor');if(box)box.innerHTML=form();bindForm()};
const bindForm=()=>{
$('sponsorCancel')?.addEventListener('click',reset);
$('sponsorSave')?.addEventListener('click',async()=>{
const nome=$('sponsorName')?.value.trim(),video=$('sponsorVideo')?.value.trim(),link=$('sponsorUrl')?.value.trim(),logoFile=$('sponsorLogo')?.files?.[0];
if(!nome){alert('Inserisci il nome dello sponsor.');return}
if(!link){alert('Inserisci il link del sito dello sponsor.');return}
if(logoFile){const allowedTypes=['image/png','image/jpeg','image/webp','image/svg+xml'];if(!allowedTypes.includes(logoFile.type)){alert('Il logo deve essere un file PNG, JPG, WEBP o SVG.');return}if(logoFile.size>2*1024*1024){alert('Il logo è troppo grande. Usa un file massimo di 2 MB.');return}}
const sb=window.supabaseClient||window.sb;if(!sb){alert('Connessione Supabase non disponibile.');return}
const saveButton=$('sponsorSave'),editId=saveButton?.dataset.editId;if(saveButton){saveButton.disabled=true;saveButton.textContent='⏳ Salvataggio...'}
try{let immagine=editId?(items.find(x=>String(x.id)===String(editId))?.immagine||''):'';if(logoFile){immagine=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(new Error('Impossibile leggere il file del logo.'));reader.readAsDataURL(logoFile)})}if(editId){const {data,error}=await sb.from('sponsor').update({nome,immagine,video,link}).eq('id',editId).select('id,nome,immagine,video,link').maybeSingle();if(error)throw new Error('Errore salvataggio sponsor: '+error.message);if(!data)throw new Error('Lo sponsor selezionato non è stato aggiornato.')}else{const {data,error}=await sb.from('sponsor').insert({nome,immagine,video,link}).select('id,nome,immagine,video,link').single();if(error)throw new Error('Errore salvataggio sponsor: '+error.message);if(!data)throw new Error('Sponsor salvato senza ricevere il relativo ID.')}await sponsor()}catch(error){console.error('Errore gestione sponsor:',error);alert(error?.message||'Errore durante il salvataggio dello sponsor.');if(saveButton){saveButton.disabled=false;saveButton.textContent=editId?'💾 Salva modifiche':'＋ Aggiungi sponsor'}}
});
};
bindForm();
document.querySelectorAll('[data-sponsor-edit]').forEach(b=>b.onclick=()=>{const item=items.find(x=>String(x.id)===String(b.dataset.sponsorEdit));if(!item)return;const box=$('sponsorEditor');if(box){box.innerHTML=form(item);const save=$('sponsorSave');if(save)save.dataset.editId=item.id;bindForm();box.scrollIntoView({behavior:'smooth',block:'nearest'})}});
document.querySelectorAll('[data-sponsor-del]').forEach(b=>b.onclick=async()=>{if(!confirm('Eliminare questo sponsor globale?'))return;const sb=window.supabaseClient||window.sb;if(!sb)return;const {error}=await sb.from('sponsor').delete().eq('id',b.dataset.sponsorDel);if(error){alert('Errore eliminazione sponsor: '+error.message);return}await sponsor()});
}

function whatsapp(){
const t=selected();if(!t){alert('Seleziona prima un torneo');return}
const link=location.origin+'/Bove.html?idTorneo='+encodeURIComponent(t.id);
shell('WhatsApp',`${esc(t.nome)} · ID ${esc(t.id)}`,`<div class="card feature-card"><div class="card-head"><div><h2>Comunicazioni WhatsApp</h2><span class="notice">Messaggio pronto con il link del torneo selezionato</span></div></div><div class="card-body"><label>Messaggio</label><textarea id="waText" class="input" rows="6">Ciao! Ti invitiamo al torneo ${esc(t.nome)} del ${esc(t.data||t.data_torneo||'')}.\n\n${esc(link)}</textarea><div class="admin-feature-actions"><button class="btn primary" id="waOpen">📱 Apri WhatsApp</button><button class="btn" id="waCopy">📋 Copia link torneo</button></div><div class="notice" style="margin-top:14px">Il link è sempre riferito al torneo attualmente selezionato.</div></div></div>`);
$('waOpen').onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent($('waText')?.value||''),'_blank');
$('waCopy').onclick=()=>navigator.clipboard?.writeText(link).then(()=>alert('Link copiato negli appunti.'))
}

function bindComLinks(){
document.querySelectorAll('[data-com-page]').forEach(b=>{if(b.dataset.comBound)return;b.dataset.comBound='1';b.addEventListener('click',()=>{document.getElementById('mobileOverlay')?.classList.remove('open');const p=b.dataset.comPage;if(p==='news')news();else if(p==='sponsor')sponsor();else if(p==='whatsapp')whatsapp()})})
}
function bindSidebar(){document.querySelectorAll('#areaAdmin .sidebar [data-page]').forEach(b=>{if(b.dataset.sidebarBound)return;b.dataset.sidebarBound='1';b.addEventListener('click',async()=>{const page=b.dataset.page;if(!page)return;document.querySelectorAll('#areaAdmin .sidebar [data-page]').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(typeof window.openAdminPage==='function')await window.openAdminPage(page)})})}
function bindAll(){bindSidebar();bindComLinks()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindAll,{once:true});else bindAll();
window.openAdminComPage=p=>p==='news'?news():p==='sponsor'?sponsor():whatsapp();

})();

/* NEWS EDITOR V2 — gestione contenuti, modifica, evidenza e ordine. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'<','>':'>','\"':'\"'}[m]));
const selected=()=>window.getTorneoAdminCorrente?.()||((window.adminState?.tornei||[]).find(t=>String(t.id)===String(window.adminState?.torneoSelezionato))||null);
const cfgOf=t=>t?.configurazione&&typeof t.configurazione==='object'?{...t.configurazione}:{};
async function saveNewsCfg(t,cfg){const sb=window.supabaseClient||window.sb;if(!sb||!t){alert('Torneo o connessione Supabase non disponibile.');return false}const {data,error}=await sb.from('tornei').update({configurazione:{...(cfg||{})}}).eq('id',t.id).select('id,configurazione').maybeSingle();if(error){console.error(error);alert('Errore salvataggio News: '+error.message);return false}if(!data){alert('La configurazione News non è stata salvata.');return false}t.configurazione=data.configurazione||cfg;try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}return true}
const fileToDataUrl=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(new Error('Impossibile leggere l’immagine.'));r.readAsDataURL(file)});
const typeIcon=t=>{const x=String(t||'').toLowerCase();if(x.includes('torneo'))return '🏆';if(x.includes('promo'))return '🔥';if(x.includes('evento'))return '📅';if(x.includes('ricordo'))return '📸';if(x.includes('prodott'))return '🎾';if(x.includes('articol'))return '📰';return '📢'};
const dateText=v=>{if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'})};
function newsEditor(){
const t=selected();if(!t){alert('Seleziona prima un torneo');return}
const c=cfgOf(t),items=Array.isArray(c.news)?c.news:[];
const root=$('appContent');if(!root)return;
const types=['Comunicazione','Torneo','Promozione','Evento','Ricordo','Prodotto','Articolo'];
let editingId=null;
const render=()=>{
const current=Array.isArray((cfgOf(t)).news)?(cfgOf(t)).news:[];
root.innerHTML=`<div class="page-head"><div><h1>News & Comunicazioni</h1><p>${esc(t.nome)} · ID ${esc(t.id)}</p></div><button class="btn" id="newsBack">← Torna al torneo</button></div><div class="card feature-card"><div class="card-head"><div><h2>${editingId?'Modifica contenuto':'Nuovo contenuto'}</h2><span class="notice">Crea promozioni, locandine, tornei, ricordi, prodotti o articoli.</span></div></div><div class="card-body"><div class="section-grid"><div class="feature-form"><label>Tipo contenuto</label><select id="newsType" class="input">${types.map(x=>`<option value="${x}">${x}</option>`).join('')}</select><label>Immagine / Locandina</label><input id="newsImage" class="input" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small class="notice">Facoltativa. Puoi sostituire l’immagine anche quando modifichi un contenuto.</small><div id="newsPreview" style="margin-top:10px"></div><label>Titolo</label><input id="newsTitle" class="input" placeholder="Titolo del contenuto"><label>Testo</label><textarea id="newsText" class="input" rows="7" placeholder="Testo della comunicazione o dell'articolo"></textarea><label>Link facoltativo</label><input id="newsLink" class="input" placeholder="https://..."><label style="display:flex;align-items:center;gap:9px;margin-top:12px"><input id="newsFeatured" type="checkbox"> ⭐ Contenuto principale in evidenza</label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn primary" id="newsSave">${editingId?'💾 Salva modifiche':'＋ Pubblica contenuto'}</button>${editingId?'<button class="btn" id="newsCancel">Annulla</button>':''}</div></div><div><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h3>Contenuti pubblicati</h3><span class="notice">La stellina determina la locandina principale.</span></div></div><div id="newsList" class="feature-list"></div></div></div></div></div>`;
$('newsBack')?.addEventListener('click',()=>window.openAdminPage?.('torneo'));
const editing=current.find(n=>String(n.id)===String(editingId));
if(editing){$('newsType').value=editing.tipo||'Comunicazione';$('newsTitle').value=editing.titolo||'';$('newsText').value=editing.testo||'';$('newsLink').value=editing.link||'';$('newsFeatured').checked=!!editing.inEvidenza;$('newsPreview').innerHTML=editing.immagine?`<div style="width:100%;max-width:320px;height:150px;border-radius:10px;overflow:hidden"><img src="${esc(editing.immagine)}" style="width:100%;height:100%;object-fit:cover" alt=""></div>`:''}
$('newsImage')?.addEventListener('change',async()=>{const f=$('newsImage').files?.[0];if(!f){return}if(!['image/png','image/jpeg','image/webp','image/gif'].includes(f.type)){alert('L’immagine deve essere PNG, JPG, WEBP o GIF.');$('newsImage').value='';return}if(f.size>5*1024*1024){alert('L’immagine è troppo grande. Usa un file massimo di 5 MB.');$('newsImage').value='';return}try{const u=await fileToDataUrl(f);$('newsPreview').innerHTML=`<div style="width:100%;max-width:320px;height:150px;border-radius:10px;overflow:hidden"><img src="${esc(u)}" style="width:100%;height:100%;object-fit:cover" alt="Anteprima"></div>`}catch(e){alert(e.message)}});
$('newsCancel')?.addEventListener('click',()=>{editingId=null;render()});
$('newsSave')?.addEventListener('click',async()=>{const tipo=$('newsType').value,titolo=$('newsTitle').value.trim(),testo=$('newsText').value.trim(),link=$('newsLink').value.trim(),featured=$('newsFeatured').checked,file=$('newsImage').files?.[0];if(!titolo||!testo){alert('Inserisci titolo e testo.');return}let image=editing?.immagine||'';if(file)image=await fileToDataUrl(file);let next=current.map(n=>({...n}));const now=new Date().toISOString();if(editingId){next=next.map(n=>String(n.id)===String(editingId)?{...n,tipo,titolo,testo,link,immagine:image,inEvidenza:featured,updatedAt:now}:n)}else{next.push({id:'news-'+Date.now(),tipo,titolo,testo,link,immagine:image,inEvidenza:featured,data:now,ordine:next.length})}if(featured)next=next.map(n=>({...n,inEvidenza:String(n.id)===String(editingId||next[next.length-1]?.id)}));if(!featured&&editingId){next=next.map(n=>String(n.id)===String(editingId)?{...n,inEvidenza:false}:n)}next=next.map((n,i)=>({...n,ordine:i}));if(await saveNewsCfg(t,{...cfgOf(t),news:next})){editingId=null;render()}});
const list=$('newsList');
current.forEach((n,i)=>{const row=document.createElement('div');row.className='list-item';row.style='display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap';row.innerHTML=`<div style="width:82px;height:60px;border-radius:9px;overflow:hidden;background:rgba(15,23,42,.12);display:flex;align-items:center;justify-content:center;flex:none">${n.immagine?`<img src="${esc(n.immagine)}" style="width:100%;height:100%;object-fit:cover" alt="">`:`<span style="font-size:24px">${typeIcon(n.tipo)}</span>`}</div><div style="flex:1;min-width:190px"><strong>${esc(n.titolo||'News')}</strong><small style="display:block;margin-top:4px">${esc(n.tipo||'Comunicazione')} ${n.inEvidenza?'· ⭐ IN EVIDENZA':''}</small><small style="display:block;margin-top:4px">${esc(n.testo||'').slice(0,180)}${String(n.testo||'').length>180?'…':''}</small></div><div style="display:flex;gap:5px;flex-wrap:wrap"><button class="btn small" data-edit="${esc(n.id)}">✏️ Modifica</button><button class="btn small" data-up="${esc(n.id)}" ${i===0?'disabled':''}>↑</button><button class="btn small" data-down="${esc(n.id)}" ${i===current.length-1?'disabled':''}>↓</button><button class="btn small" data-feature="${esc(n.id)}">${n.inEvidenza?'⭐ In evidenza':'☆ Evidenza'}</button><button class="btn small danger" data-del="${esc(n.id)}">Elimina</button></div>`;list.appendChild(row)});
list.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{editingId=b.dataset.edit;render()});
list.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{if(!confirm('Eliminare questo contenuto?'))return;const next=current.filter(n=>String(n.id)!==String(b.dataset.del)).map((n,i)=>({...n,ordine:i}));if(await saveNewsCfg(t,{...cfgOf(t),news:next}))render()});
list.querySelectorAll('[data-feature]').forEach(b=>b.onclick=async()=>{const next=current.map(n=>({...n,inEvidenza:String(n.id)===String(b.dataset.feature)}));if(await saveNewsCfg(t,{...cfgOf(t),news:next}))render()});
list.querySelectorAll('[data-up]').forEach(b=>b.onclick=async()=>{const idx=current.findIndex(n=>String(n.id)===String(b.dataset.up));if(idx<=0)return;const next=[...current];[next[idx-1],next[idx]]=[next[idx],next[idx-1]];const ordered=next.map((n,i)=>({...n,ordine:i}));if(await saveNewsCfg(t,{...cfgOf(t),news:ordered}))render()});
list.querySelectorAll('[data-down]').forEach(b=>b.onclick=async()=>{const idx=current.findIndex(n=>String(n.id)===String(b.dataset.down));if(idx<0||idx>=current.length-1)return;const next=[...current];[next[idx],next[idx+1]]=[next[idx+1],next[idx]];const ordered=next.map((n,i)=>({...n,ordine:i}));if(await saveNewsCfg(t,{...cfgOf(t),news:ordered}))render()});
};
render();
}
const oldOpenAdminComPage=window.openAdminComPage;
window.openAdminComPage=p=>p==='news'?newsEditor():oldOpenAdminComPage?.(p);
document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-com-page="news"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();document.getElementById('mobileOverlay')?.classList.remove('open');newsEditor()},true);
})();
