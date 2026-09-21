(()=>{'use strict';

function bindSponsorLogoPreview(){
  const input=document.getElementById('sponsorLogo');
  if(!input||input.dataset.logoPreviewBound)return;
  input.dataset.logoPreviewBound='1';
  const wrap=document.createElement('div');
  wrap.id='sponsorLogoPreview';
  wrap.style.cssText='margin-top:10px;width:180px;height:90px;border:1px solid rgba(148,163,184,.35);border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;';
  const img=document.createElement('img');
  img.alt='Anteprima logo sponsor';
  img.style.cssText='max-width:100%;max-height:100%;object-fit:contain;display:none;';
  wrap.appendChild(img);
  input.insertAdjacentElement('afterend',wrap);
  input.addEventListener('change',()=>{
    const file=input.files?.[0];
    if(!file){img.removeAttribute('src');img.style.display='none';return;}
    const allowed=['image/png','image/jpeg','image/webp','image/svg+xml'];
    if(!allowed.includes(file.type)){alert('Il logo deve essere un file PNG, JPG, WEBP o SVG.');input.value='';img.removeAttribute('src');img.style.display='none';return;}
    if(file.size>2*1024*1024){alert('Il logo è troppo grande. Usa un file massimo di 2 MB.');input.value='';img.removeAttribute('src');img.style.display='none';return;}
    const reader=new FileReader();
    reader.onload=()=>{img.src=String(reader.result||'');img.style.display='block';};
    reader.readAsDataURL(file);
  });
}
function initSponsorLogoPreview(){
  if(!document.body){document.addEventListener('DOMContentLoaded',bindSponsorLogoPreview,{once:true});return;}
  bindSponsorLogoPreview();
  const observer=new MutationObserver(()=>{bindSponsorLogoPreview();});
  observer.observe(document.body,{childList:true,subtree:true});
}
initSponsorLogoPreview();
function selectedTournament(){
  const s=window.adminState||{};
  return window.getTorneoAdminCorrente?.()||((s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null);
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function normalPhone(v){let x=String(v??'').trim().replace(/[^0-9+]/g,'');if(x.startsWith('00'))x='+'+x.slice(2);if(x.startsWith('+'))return x.slice(1);if(x.startsWith('39')&&x.length>=11)return x;if(x.startsWith('3')&&x.length===10)return '39'+x;return x.replace(/^0+/,'');}
function findPhone(obj){const re=/(telefono|tel|cellulare|cell|mobile|phone|whatsapp|numero)/i;const seen=new Set();function walk(v,k){if(v==null)return '';if(typeof v==='string'||typeof v==='number'){if(re.test(String(k||''))){const p=normalPhone(v);if(p.length>=8)return p;}return '';}if(typeof v!=='object'||seen.has(v))return '';seen.add(v);for(const key of Object.keys(v)){const p=walk(v[key],key);if(p)return p;}return '';}return walk(obj,'');}
function participantName(p){const full=[p?.nome,p?.cognome].filter(Boolean).join(' ').trim();return p?.nome_giocatore||p?.nominativo||full||p?.email||'Partecipante';}
async function getParticipants(t){
  const cfg=t?.configurazione&&typeof t.configurazione==='object'?t.configurazione:{};
  let rows=Array.isArray(cfg.partecipanti)?cfg.partecipanti:[];
  if(!rows.length&&Array.isArray(t?.partecipanti))rows=t.partecipanti;
  if(!rows.length){const sb=window.supabaseClient||window.sb;if(sb){const r=await sb.from('iscrizioni').select('*');if(!r.error&&Array.isArray(r.data)){const id=String(t.id);rows=r.data.filter(x=>Object.keys(x||{}).some(k=>/torneo.?id|id.?torneo|tournament.?id/i.test(k)&&String(x[k])===id));}}}
  const out=[];const seen=new Set();
  for(const p of rows){const phone=findPhone(p);if(!phone||seen.has(phone))continue;seen.add(phone);out.push({name:participantName(p),phone});}
  return out;
}
function buildBoveLink(t){try{return new URL('Bove.html?idTorneo='+encodeURIComponent(t.id),location.href).href;}catch(e){return location.origin+'/Bove.html?idTorneo='+encodeURIComponent(t.id);}}
function buildWhatsAppMessage(t){const link=buildBoveLink(t);const note="Presentarsi 15 minuti prima dell'orario della propria partita.";return `🎾 TORNEO ${t.nome||''}\n\nNEXT POINT PADEL\n\nCiao!\n\nIl tabellone del torneo è disponibile.\n\n👉 ${link}\n\n📌 NOTA DI INGRESSO\n${note}\n\nBuon torneo! 🎾`;}
function copyText(text){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();return Promise.resolve();}
async function creaGruppoWhatsApp(t,participants,msg){if(!participants.length){alert('Non ci sono numeri di telefono dei partecipanti approvati.');return false;}const numbers=participants.map(p=>'+'+p.phone).join('\n');await copyText(numbers);try{await copyText(msg);}catch(e){console.warn('Impossibile copiare il messaggio:',e);}window.open('https://web.whatsapp.com/','_blank','noopener');alert('Gruppo WhatsApp preparato.\n\nI numeri dei partecipanti sono stati copiati.\n\nIn WhatsApp crea il nuovo gruppo, seleziona i partecipanti e incolla il messaggio del torneo.');return true;}
async function whatsappAuto(){
  if(window.__waCanonicalActive&&window.whatsappOverride)return window.whatsappOverride();
  const t=selectedTournament();
  if(!t){alert('Seleziona prima un torneo');return;}
  const participants=await getParticipants(t);const msg=buildWhatsAppMessage(t);const root=document.getElementById('appContent');if(!root)return;
  root.innerHTML=`<div class="page-head"><div><h1>WhatsApp</h1><p>${esc(t.nome)} · ${participants.length} partecipanti approvati</p></div><button class="btn" id="waBack">← Torna al torneo</button></div><div class="card feature-card"><div class="card-head"><div><h2>Gruppo WhatsApp del torneo</h2><span class="notice">Numeri e messaggio del torneo preparati automaticamente</span></div></div><div class="card-body"><div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px"><button type="button" class="btn primary" id="waCreateGroup">➕ Crea gruppo WhatsApp</button><button type="button" class="btn" id="waCopyNumbers">📋 Copia tutti i numeri</button><button type="button" class="btn" id="waOpen">📱 Apri WhatsApp</button></div><div class="notice" style="margin-bottom:18px"><strong>Crea gruppo WhatsApp:</strong> i numeri di tutti i partecipanti approvati vengono raccolti e copiati automaticamente. WhatsApp Web viene aperto per completare la creazione del gruppo.</div><label>Messaggio del gruppo</label><textarea id="waText" class="input" rows="10">${esc(msg)}</textarea><h3 style="margin-top:20px">Partecipanti approvati</h3><div class="feature-list">${participants.length?participants.map((p,i)=>`<div class="list-item" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><div style="flex:1"><strong>${i+1}. ${esc(p.name)}</strong><small style="display:block;margin-top:3px">+${esc(p.phone)}</small></div><button type="button" class="btn small" data-wa-copy="${esc(p.phone)}">📋 Copia</button></div>`).join(''):'<div class="empty">Nessun numero di telefono trovato nei partecipanti approvati.</div>'}</div><div class="notice" style="margin-top:18px"><strong>Procedura:</strong> premi “Crea gruppo WhatsApp”. I numeri vengono copiati automaticamente e WhatsApp Web viene aperto. Completa in WhatsApp la creazione del gruppo e l'aggiunta dei partecipanti, quindi copia il messaggio mostrato sopra e invialo nel gruppo.</div></div></div>`;
  document.getElementById('waBack')?.addEventListener('click',()=>window.openAdminPage?.('torneo'));
  document.getElementById('waCreateGroup')?.addEventListener('click',async()=>{try{await creaGruppoWhatsApp(t,participants,document.getElementById('waText')?.value||msg);}catch(e){console.error(e);alert('Impossibile preparare il gruppo WhatsApp.');}});
  document.getElementById('waCopyNumbers')?.addEventListener('click',async()=>{try{await copyText(participants.map(p=>'+'+p.phone).join('\n'));alert('Numeri dei partecipanti copiati.');}catch(e){console.error(e);alert('Impossibile copiare i numeri.');}});
  document.getElementById('waOpen')?.addEventListener('click',()=>{window.open('https://web.whatsapp.com/','_blank','noopener');});
  document.querySelectorAll('[data-wa-copy]').forEach(b=>b.addEventListener('click',async()=>{try{await copyText('+'+b.dataset.waCopy);b.textContent='✓ Copiato';setTimeout(()=>{b.textContent='📋 Copia';},1200);}catch(e){console.error(e);alert('Impossibile copiare il numero.');}}));
}
const oldOpen=window.openAdminComPage;
window.openAdminComPage=p=>p==='whatsapp'?(window.__waCanonicalActive&&window.whatsappOverride?window.whatsappOverride():whatsappAuto()):oldOpen?.(p);
document.addEventListener('click',e=>{if(window.__waCanonicalActive)return;const b=e.target?.closest?.('[data-com-page="whatsapp"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();document.getElementById('mobileOverlay')?.classList.remove('open');whatsappAuto().catch(err=>{console.error(err);alert('Errore caricamento WhatsApp: '+(err?.message||err));});},true);
window.creaGruppoWhatsApp=creaGruppoWhatsApp;
})();

(()=>{'use strict';
const $=id=>document.getElementById(id);
const selected=()=>window.getTorneoAdminCorrente?.()||((window.adminState?.tornei||[]).find(t=>String(t.id)===String(window.adminState?.torneoSelezionato))||null);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cfgOf=t=>t?.configurazione&&typeof t.configurazione==='object'?{...t.configurazione}:{};
const saveCfg=async(t,cfg)=>{const sb=window.supabaseClient||window.sb;if(!sb||!t){alert('Torneo o connessione Supabase non disponibile.');return false}const {data,error}=await sb.from('tornei').update({configurazione:{...(cfg||{})}}).eq('id',t.id).select('id,configurazione').maybeSingle();if(error){console.error(error);alert('Errore salvataggio: '+error.message);return false}if(!data){alert('Configurazione non salvata.');return false}t.configurazione=data.configurazione||cfg;try{localStorage.setItem('padel_admin_state',JSON.stringify(window.adminState||{}))}catch(e){}return true};
const fileToDataUrl=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(new Error('Impossibile leggere l’immagine.'));r.readAsDataURL(file)});
const dateText=v=>{if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'})};
const typeIcon=t=>{const x=String(t||'').toLowerCase();if(x.includes('torneo'))return '🏆';if(x.includes('promo'))return '🔥';if(x.includes('evento'))return '📅';if(x.includes('ricordo'))return '📸';if(x.includes('prodott'))return '🎾';if(x.includes('articol'))return '📰';return '📢'};
async function newsEditor(){
 const t=selected();if(!t){alert('Seleziona prima un torneo');return}
 const c=cfgOf(t),items=Array.isArray(c.news)?c.news:[];
 const root=$('appContent');if(!root)return;
 const typeOptions=['Comunicazione','Torneo','Promozione','Evento','Ricordo','Prodotto','Articolo'];
 root.innerHTML=`<div class="page-head"><div><h1>News & Comunicazioni</h1><p>${esc(t.nome)} · ID ${esc(t.id)}</p></div><button class="btn" id="newsBack">← Torna al torneo</button></div>
 <div class="card feature-card"><div class="card-head"><div><h2>Nuovo contenuto</h2><span class="notice">Crea una comunicazione, una promozione, una locandina o un articolo.</span></div></div><div class="card-body"><div class="section-grid">
 <div class="feature-form"><label>Tipo contenuto</label><select id="newsType" class="input">${typeOptions.map(x=>`<option value="${x}">${x}</option>`).join('')}</select>
 <label>Immagine / Locandina</label><input id="newsImage" class="input" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small class="notice">PNG, JPG, WEBP o GIF. Facoltativa.</small><div id="newsImagePreview" style="margin-top:10px;display:none"></div>
 <label>Titolo</label><input id="newsTitle" class="input" placeholder="Titolo del contenuto">
 <label>Testo</label><textarea id="newsText" class="input" rows="7" placeholder="Testo della comunicazione o dell'articolo"></textarea>
 <label>Link facoltativo</label><input id="newsLink" class="input" placeholder="https://...">
 <label style="display:flex;align-items:center;gap:9px;margin-top:12px"><input id="newsFeatured" type="checkbox"> Metti in evidenza</label>
 <button class="btn primary" id="newsSave">＋ Pubblica contenuto</button></div>
 <div><h3>Contenuti pubblicati</h3><div id="newsList" class="feature-list">${items.length?items.slice().reverse().map((n,i)=>`<div class="list-item" style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap"><div style="width:86px;height:62px;border-radius:9px;overflow:hidden;background:rgba(15,23,42,.12);display:flex;align-items:center;justify-content:center;flex:none">${n.immagine?`<img src="${esc(n.immagine)}" style="width:100%;height:100%;object-fit:cover" alt="">`:`<span style="font-size:25px">${typeIcon(n.tipo)}</span>`}</div><div style="flex:1;min-width:200px"><strong>${esc(n.titolo||'News')}</strong><small style="display:block;margin-top:4px">${esc(n.tipo||'Comunicazione')} ${n.data?'· '+esc(dateText(n.data)):''}</small><small style="display:block;margin-top:4px">${esc(n.testo||'')}</small>${n.inEvidenza?'<small style="display:block;margin-top:4px">⭐ In evidenza</small>':''}</div><button class="btn small danger" data-news-del="${esc(n.id||i)}">Elimina</button></div>`).join(''):'<div class="empty">Nessun contenuto pubblicato.</div>'}</div></div>
 </div></div></div>`;
 $('newsBack')?.addEventListener('click',()=>window.openAdminPage?.('torneo'));
 const imageInput=$('newsImage'),preview=$('newsImagePreview');
 imageInput?.addEventListener('change',()=>{const f=imageInput.files?.[0];if(!f){preview.style.display='none';preview.innerHTML='';return}const ok=['image/png','image/jpeg','image/webp','image/gif'];if(!ok.includes(f.type)){alert('L’immagine deve essere PNG, JPG, WEBP o GIF.');imageInput.value='';return}if(f.size>4*1024*1024){alert('L’immagine è troppo grande. Usa un file massimo di 4 MB.');imageInput.value='';return}const r=new FileReader();r.onload=()=>{preview.innerHTML=`<img src="${esc(r.result)}" style="max-width:100%;max-height:180px;border-radius:10px;object-fit:contain">`;preview.style.display='block'};r.readAsDataURL(f)});
 $('newsSave')?.addEventListener('click',async()=>{const tipo=$('newsType')?.value||'Comunicazione',titolo=$('newsTitle')?.value.trim(),testo=$('newsText')?.value.trim(),link=$('newsLink')?.value.trim(),inEvidenza=!!$('newsFeatured')?.checked,file=imageInput?.files?.[0];if(!titolo||!testo){alert('Inserisci titolo e testo.');return}if(link&&!/^https?:\/\//i.test(link)){alert('Il link deve iniziare con http:// o https://');return}let immagine='';if(file){if(file.size>4*1024*1024){alert('L’immagine è troppo grande. Usa un file massimo di 4 MB.');return}try{immagine=await fileToDataUrl(file)}catch(e){alert(e.message);return}}const next=[...items,{id:'news-'+Date.now(),tipo,titolo,testo,immagine,link,data:new Date().toISOString(),inEvidenza}];if(inEvidenza){next.forEach((n,i)=>{if(i!==next.length-1)n.inEvidenza=false})}const ok=await saveCfg(t,{...c,news:next});if(ok)newsEditor()});
 document.querySelectorAll('[data-news-del]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Eliminare questo contenuto?'))return;const id=b.dataset.newsDel;const next=items.filter((n,i)=>String(n.id||i)!==String(id));if(await saveCfg(t,{...c,news:next}))newsEditor()}));
}
const oldOpenNews=window.openAdminComPage;
window.openAdminComPage=p=>p==='news'?newsEditor():(p==='whatsapp'?oldOpenNews?.(p):oldOpenNews?.(p));
document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-com-page="news"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();document.getElementById('mobileOverlay')?.classList.remove('open');newsEditor().catch(err=>{console.error(err);alert('Errore caricamento News: '+(err?.message||err));});},true);
})();