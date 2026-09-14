(()=>{
'use strict';

/*
  WhatsApp Business / Broadcast helper.
  Non usa API Meta e non invia automaticamente messaggi.
  Prepara una lista di destinatari selezionati e guida l'admin
  all'uso della Lista Broadcast dell'app WhatsApp Business.
*/
const $=id=>document.getElementById(id);

function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function phone(v){let x=String(v??'').trim().replace(/[^0-9+]/g,'');if(x.startsWith('00'))x='+'+x.slice(2);if(x.startsWith('+'))x=x.slice(1);if(x.startsWith('39')&&x.length>=11)return x;if(x.startsWith('3')&&x.length===10)return '39'+x;return x.replace(/^0+/,'');}

function getRecipients(){
  const rows=[...document.querySelectorAll('[data-wa-canonical-send]')];
  return rows.map((btn,i)=>{
    const item=btn.closest('.list-item');
    const strong=item?.querySelector('strong');
    const small=item?.querySelector('small');
    const rawName=strong?.textContent||('Partecipante '+(i+1));
    const name=rawName.replace(/^\s*\d+\.\s*/,'').trim();
    const p=phone(small?.textContent||'');
    return {name,phone:p,button:btn};
  }).filter(x=>x.phone.length>=8);
}

function copyText(text,ok='Copiato negli appunti.'){
  const done=()=>alert(ok);
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done).catch(()=>fallback());
  else fallback();
  function fallback(){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();done();}
}

function removeExisting(){document.getElementById('waBroadcastPanel')?.remove();}

function renderPanel(){
  const root=$('appContent');
  if(!root)return;
  const title=root.querySelector('h1');
  if(!title||title.textContent.trim()!=='WhatsApp')return;
  if(document.getElementById('waBroadcastPanel'))return;

  const people=getRecipients();
  if(!people.length)return;

  const panel=document.createElement('div');
  panel.id='waBroadcastPanel';
  panel.className='card feature-card';
  panel.innerHTML=`
    <div class="card-head"><div>
      <h2>📣 Lista Broadcast WhatsApp Business</h2>
      <span class="notice">Seleziona gli iscritti e usa la Lista Broadcast dell'app gratuita WhatsApp Business.</span>
    </div></div>
    <div class="card-body">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px">
        <strong id="waBroadcastCount">${people.length} selezionati su ${people.length}</strong>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button type="button" class="btn small" id="waBroadcastAll">Seleziona tutti</button>
          <button type="button" class="btn small" id="waBroadcastNone">Deseleziona tutti</button>
        </div>
      </div>
      <div id="waBroadcastRecipients" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px">
        ${people.map((p,i)=>`<label style="display:flex;align-items:center;gap:9px;padding:9px 11px;border:1px solid rgba(148,163,184,.22);border-radius:10px;cursor:pointer"><input type="checkbox" class="wa-broadcast-check" data-index="${i}" checked><span><strong>${esc(p.name)}</strong><small style="display:block">+${esc(p.phone)}</small></span></label>`).join('')}
      </div>
      <div class="admin-feature-actions" style="margin-top:14px">
        <button type="button" class="btn primary" id="waBroadcastCopyNumbers">📋 Copia numeri selezionati</button>
        <button type="button" class="btn" id="waBroadcastCopyNames">📋 Copia nomi + numeri</button>
        <button type="button" class="btn" id="waBroadcastOpen">📱 Apri WhatsApp Business</button>
      </div>
      <div class="notice" style="margin-top:14px;line-height:1.55">
        <strong>Come funziona:</strong> crea o apri una <strong>Lista Broadcast</strong> direttamente in WhatsApp Business, assicurati che i destinatari abbiano salvato il numero del club in rubrica, quindi usa questa selezione come elenco di riferimento. La pagina non usa API Meta e non invia messaggi in automatico.
      </div>
    </div>`;

  const anchor=[...root.querySelectorAll('.card.feature-card')].find(x=>x.querySelector('h2')?.textContent.includes('Destinatari approvati'));
  if(anchor)anchor.parentNode.insertBefore(panel,anchor);else root.appendChild(panel);

  const checks=()=>[...panel.querySelectorAll('.wa-broadcast-check')];
  const update=()=>{const n=checks().filter(x=>x.checked).length;const c=$('waBroadcastCount');if(c)c.textContent=`${n} selezionati su ${people.length}`};
  $('waBroadcastAll').onclick=()=>{checks().forEach(x=>x.checked=true);update()};
  $('waBroadcastNone').onclick=()=>{checks().forEach(x=>x.checked=false);update()};
  checks().forEach(x=>x.addEventListener('change',update));
  $('waBroadcastCopyNumbers').onclick=()=>{
    const selected=checks().filter(x=>x.checked).map(x=>people[Number(x.dataset.index)].phone);
    if(!selected.length){alert('Seleziona almeno un destinatario.');return}
    copyText(selected.join('\n'),'Numeri selezionati copiati negli appunti.');
  };
  $('waBroadcastCopyNames').onclick=()=>{
    const selected=checks().filter(x=>x.checked).map(x=>people[Number(x.dataset.index)]);
    if(!selected.length){alert('Seleziona almeno un destinatario.');return}
    copyText(selected.map(x=>`${x.name} +${x.phone}`).join('\n'),'Elenco destinatari copiato negli appunti.');
  };
  $('waBroadcastOpen').onclick=()=>{
    window.open('https://web.whatsapp.com/','_blank');
  };
}

function observe(){
  renderPanel();
  const root=$('appContent');
  if(!root||root.dataset.waBroadcastObserver==='1')return;
  root.dataset.waBroadcastObserver='1';
  new MutationObserver(()=>{removeExisting();renderPanel()}).observe(root,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
})();
