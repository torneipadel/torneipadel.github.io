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
const observer=new MutationObserver(bindSponsorLogoPreview);
observer.observe(document.body,{childList:true,subtree:true});
bindSponsorLogoPreview();
function selectedTournament(){const s=window.adminState||{};return window.getTorneoAdminCorrente?.()||((s.tornei||[]).find(t=>String(t.id)===String(s.torneoSelezionato))||null);}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function normalPhone(v){let x=String(v??'').trim().replace(/[^0-9+]/g,'');if(x.startsWith('00'))x='+'+x.slice(2);if(x.startsWith('+'))return x.slice(1);if(x.startsWith('39')&&x.length>=11)return x;if(x.startsWith('3')&&x.length===10)return '39'+x;return x.replace(/^0+/,'');}
function findPhone(obj){const re=/(telefono|tel|cellulare|cell|mobile|phone|whatsapp|numero)/i;const seen=new Set();function walk(v,k){if(v==null)return '';if(typeof v==='string'||typeof v==='number'){if(re.test(String(k||''))){const p=normalPhone(v);if(p.length>=8)return p;}return '';}if(typeof v!=='object'||seen.has(v))return '';seen.add(v);for(const key of Object.keys(v)){const p=walk(v[key],key);if(p)return p;}return '';}return walk(obj,'');}
function participantName(p){return p?.nome_giocatore||p?.nome||p?.nominativo||[p?.nome,p?.cognome].filter(Boolean).join(' ')||p?.email||'Partecipante';}
function isApproved(p){if(!p||typeof p!=='object')return true;const stato=String(p.stato??p.status??p.esito??'').toLowerCase().trim();if(!stato)return true;return stato==='approvato'||stato==='approved'||stato==='confermato'||stato==='confermata';}
async function getParticipants(t){const cfg=t?.configurazione&&typeof t.configurazione==='object'?t.configurazione:{};let rows=[];if(Array.isArray(t?.partecipanti)&&t.partecipanti.length)rows=[...t.partecipanti];if(Array.isArray(cfg.partecipanti)&&cfg.partecipanti.length){const existingKeys=new Set(rows.map(p=>String(p?.id??p?.user_id??p?.email??p?.telefono??p?.phone??p?.cellulare??p?.nome_giocatore??p?.nome??'')));for(const p of cfg.partecipanti){const key=String(p?.id??p?.user_id??p?.email??p?.telefono??p?.phone??p?.cellulare??p?.nome_giocatore??p?.nome??'');if(!existingKeys.has(key)){rows.push(p);existingKeys.add(key);}}}if(!rows.length){const sb=window.supabaseClient||window.sb;if(sb){try{const r=await sb.from('iscrizioni').select('*');if(!r.error&&Array.isArray(r.data)){const id=String(t.id);rows=r.data.filter(x=>Object.keys(x||{}).some(k=>/torneo.?id|id.?torneo|tournament.?id/i.test(k)&&String(x[k])===id)&&isApproved(x));}}catch(err){console.error('Errore recupero iscritti WhatsApp:',err);}}}const out=[];const seen=new Set();for(const p of rows){if(!isApproved(p))continue;const pnum=findPhone(p);if(!pnum||pnum.length<8||seen.has(pnum))continue;seen.add(pnum);out.push({name:participantName(p),phone:pnum});}return out;}
function buildWhatsAppMessage(t){const link=location.origin+'/Bove.html?idTorneo='+encodeURIComponent(t.id);const note="Presentarsi 15 minuti prima dell'orario della propria partita.";return `🎾 TORNEO ${t.nome||''}\n\nCiao!\nIl tabellone del torneo è disponibile.\n\n👉 ${link}\n\n📌 NOTA DI INGRESSO\n${note}\n\nBuon torneo! 🎾`;}
function copyText(text){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){console.error(e);}ta.remove();return Promise.resolve();}
async function whatsappAuto(){const t=selectedTournament();if(!t){alert('Seleziona prima un torneo');return;}const participants=await getParticipants(t);const msg=buildWhatsAppMessage(t);const root=document.getElementById('appContent');if(!root)return;root.innerHTML=`<div class="page-head"><div><h1>WhatsApp</h1><p>${esc(t.nome)} · ${participants.length} iscritti approvati</p></div><button class="btn" id="waBack">← Torna al torneo</button></div><div class="card feature-card"><div class="card-head"><div><h2>Comunicazione WhatsApp</h2><span class="notice">Iscritti approvati, messaggio e tabellone preparati automaticamente</span></div></div><div class="card-body"><div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px"><button type="button" class="btn primary" id="waCopyNumbers">📋 Copia tutti i numeri</button><button type="button" class="btn" id="waOpen">📱 Apri WhatsApp</button></div><label>Messaggio</label><textarea id="waText" class="input" rows="10">${esc(msg)}</textarea><h3 style="margin-top:20px">Iscritti approvati</h3><div class="feature-list">${participants.length?participants.map((p,i)=>`<div class="list-item" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><div style="flex:1"><strong>${i+1}. ${esc(p.name)}</strong><small style="display:block;margin-top:3px">+${esc(p.phone)}</small></div><button type="button" class="btn small primary" data-wa-one="${esc(p.phone)}">📱 Invia</button><button type="button" class="btn small" data-wa-copy="${esc(p.phone)}">📋 Copia</button></div>`).join(''):'<div class="empty">Nessun iscritto approvato con numero di telefono disponibile.</div>'}</div><div class="notice" style="margin-top:18px"><strong>Gruppo WhatsApp:</strong> copia i numeri degli iscritti, apri WhatsApp, crea il gruppo e aggiungi i partecipanti. Poi invia il messaggio già preparato.</div></div></div>`;document.getElementById('waBack')?.addEventListener('click',()=>window.openAdminPage?.('torneo'));document.getElementById('waCopyNumbers')?.addEventListener('click',async()=>{const numbers=participants.map(p=>'+'+p.phone).join('\n');try{await copyText(numbers);alert(participants.length?'Numeri degli iscritti copiati.':'Nessun numero da copiare.');}catch(e){console.error(e);alert('Impossibile copiare i numeri.');}});document.querySelectorAll('[data-wa-copy]').forEach(b=>b.addEventListener('click',async()=>{try{await copyText('+'+b.dataset.waCopy);const oldText=b.textContent;b.textContent='✓ Copiato';setTimeout(()=>b.textContent=oldText,1200);}catch(e){console.error(e);}}));document.querySelectorAll('[data-wa-one]').forEach(b=>b.addEventListener('click',()=>{const text=document.getElementById('waText')?.value||msg;window.open('https://wa.me/'+b.dataset.waOne+'?text='+encodeURIComponent(text),'_blank');}));document.getElementById('waOpen')?.addEventListener('click',()=>{const text=document.getElementById('waText')?.value||msg;window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');});}
async function approvaIscrizioneCentralizzata(id,approva=true){
 const client=window.supabaseClient||window.sb;
 if(!client){alert('Connessione Supabase non disponibile.');return false}
 const s=window.adminState||{};
 const t=(s.tornei||[]).find(x=>String(x.id)===String(s.torneoSelezionato));
 if(!t){alert('Seleziona prima un torneo.');return false}
 let rows=Array.isArray(window.iscrizioniTorneo)?window.iscrizioniTorneo:[];
 try{
  const fresh=await client.from('iscrizioni').select('*').eq('torneo_id',t.id).order('data_iscrizione',{ascending:false});
  if(fresh.error)throw fresh.error;
  rows=Array.isArray(fresh.data)?fresh.data:[];
  window.iscrizioniTorneo=rows;
  const row=rows.find(x=>String(x.id)===String(id));
  if(!row){alert('Iscrizione non trovata.');return false}
  const stato=String(row.stato||'').toLowerCase();
  if(approva && (stato==='approvato'||row.approvato===true)){alert('Questa iscrizione è già approvata.');return true}
  if(!approva && stato==='rifiutato'){return true}
  if(approva){
   const limite=typeof window.limiteIscrizioniTorneo==='function'?window.limiteIscrizioniTorneo(t):Math.max(1,(Number(t.posti)||8)*2);
   const attive=rows.filter(x=>String(x.stato||'').toLowerCase()!=='rifiutato'&&String(x.id)!==String(row.id)).length;
   if(attive>=limite){alert('Torneo completo: non è possibile approvare altri iscritti.');return false}
  }
  const nuovoStato=approva?'approvato':'rifiutato';
  const{data,error}=await client.from('iscrizioni').update({stato:nuovoStato,approvato:approva}).eq('id',row.id).eq('torneo_id',t.id).select('*').single();
  if(error)throw error;
  window.iscrizioniTorneo=rows.map(x=>String(x.id)===String(row.id)?(data||{...row,stato:nuovoStato,approvato:approva}):x);
  return true;
 }catch(e){
  console.error('Errore aggiornamento iscrizione:',e);
  alert((approva?'Approvazione':'Rifiuto')+' iscrizione non riuscito: '+(e?.message||e));
  return false
 }
}
window.approvaIscrizioneCentralizzata=approvaIscrizioneCentralizzata;
const oldOpen=window.openAdminComPage;window.openAdminComPage=p=>p==='whatsapp'?whatsappAuto():oldOpen?.(p);
document.addEventListener('click',e=>{if(window.__waCanonicalActive)return;const b=e.target?.closest?.('[data-com-page="whatsapp"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();whatsappAuto().catch(err=>{console.error(err);alert('Errore caricamento WhatsApp: '+(err?.message||err));});},true);
})();
