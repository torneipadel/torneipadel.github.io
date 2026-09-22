/* NEXT POINT PADEL — Dashboard archivio tornei */
(function(){
  'use strict';
  const state={year:'all',month:'all'};
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const dateOf=t=>{
    const raw=t?.data_torneo||t?.data||t?.dataTorneo||'';
    const d=new Date(raw);
    if(!Number.isNaN(d.getTime())) return d;
    const m=String(raw).match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
    return m?new Date(Number(m[3]),Number(m[2])-1,Number(m[1])):null;
  };
  const fmt=d=>d?d.toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'}):'Data non impostata';
  const key=t=>{const d=dateOf(t);return d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'0000-00-00'};
  function injectStyle(){
    if(document.getElementById('archiveDashboardStyle'))return;
    const s=document.createElement('style');s.id='archiveDashboardStyle';s.textContent=`
      .archive-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
      .archive-toolbar select{background:rgba(5,8,12,.42);color:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 12px;min-width:150px}
      .archive-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
      .archive-kpi{padding:14px 16px;border:1px solid var(--border);border-radius:13px;background:rgba(255,255,255,.025)}
      .archive-kpi b{display:block;font-size:20px}.archive-kpi span{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
      .archive-year{margin:18px 0 0;border:1px solid var(--border);border-radius:16px;overflow:hidden;background:rgba(8,12,17,.28)}
      .archive-year-head{display:flex;align-items:center;justify-content:space-between;padding:15px 17px;background:rgba(255,255,255,.035);border-bottom:1px solid var(--border)}
      .archive-year-head strong{font-size:17px}.archive-year-head span{font-size:11px;color:var(--muted)}
      .archive-month{padding:12px 14px 4px}.archive-month-title{display:flex;align-items:center;gap:9px;color:#b9c4cf;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;margin:4px 0 9px}
      .archive-month-title:before{content:'';width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}
      .archive-day{display:grid;grid-template-columns:70px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.055)}
      .archive-day:last-child{border-bottom:0}.archive-date{font-size:12px;color:var(--muted);font-weight:800;padding:8px 0}.archive-date b{display:block;color:#fff;font-size:18px;line-height:1}
      .archive-event{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 13px;border:1px solid var(--border);border-radius:12px;background:rgba(255,255,255,.025)}
      .archive-event.selected{border-color:rgba(77,163,255,.35);background:rgba(77,163,255,.08)}
      .archive-event strong{font-size:13px}.archive-event small{display:block;color:var(--muted);margin-top:4px;font-size:10px}
      .archive-actions{display:flex;gap:7px;flex-shrink:0}.archive-actions .btn{padding:7px 9px;font-size:10px}
      .archive-empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--border);border-radius:13px}
      @media(max-width:650px){.archive-summary{grid-template-columns:1fr 1fr}.archive-day{grid-template-columns:55px 1fr}.archive-event{align-items:flex-start;flex-direction:column}.archive-actions{width:100%}.archive-actions .btn{flex:1}}
    `;document.head.appendChild(s);
  }
  function setup(){
    const box=document.getElementById('listaTorneiAdmin');if(!box)return;
    injectStyle();
    if(!document.getElementById('archiveToolbar')){
      const host=box.parentElement;
      const toolbar=document.createElement('div');toolbar.id='archiveToolbar';toolbar.className='archive-toolbar';
      toolbar.innerHTML='<select id="archiveYear"><option value="all">Tutti gli anni</option></select><select id="archiveMonth"><option value="all">Tutti i mesi</option></select><button type="button" class="btn" id="archiveReset">↺ Archivio completo</button>';
      host.insertBefore(toolbar,box);
      document.getElementById('archiveYear').addEventListener('change',e=>{state.year=e.target.value;render();});
      document.getElementById('archiveMonth').addEventListener('change',e=>{state.month=e.target.value;render();});
      document.getElementById('archiveReset').addEventListener('click',()=>{state.year='all';state.month='all';document.getElementById('archiveYear').value='all';document.getElementById('archiveMonth').value='all';render();});
    }
    render();
  }
  function source(){return Array.isArray(window.adminState?.tornei)?window.adminState.tornei:[]}
  function render(){
    const box=document.getElementById('listaTorneiAdmin');if(!box)return;
    const tournaments=source().slice().sort((a,b)=>key(a).localeCompare(key(b))*-1);
    const years=[...new Set(tournaments.map(t=>dateOf(t)?.getFullYear()).filter(Boolean))].sort((a,b)=>b-a);
    const y=document.getElementById('archiveYear'),m=document.getElementById('archiveMonth');
    if(y){const old=state.year;y.innerHTML='<option value="all">Tutti gli anni</option>'+years.map(v=>`<option value="${v}">${v}</option>`).join('');y.value=years.map(String).includes(String(old))?old:'all';state.year=y.value;}
    const months=[...new Set(tournaments.filter(t=>state.year==='all'||String(dateOf(t)?.getFullYear())===String(state.year)).map(t=>dateOf(t)?.getMonth()).filter(v=>v!==undefined))].sort((a,b)=>a-b);
    if(m){const old=state.month;m.innerHTML='<option value="all">Tutti i mesi</option>'+months.map(v=>`<option value="${v}">${new Date(2000,v,1).toLocaleDateString('it-IT',{month:'long'})}</option>`).join('');m.value=months.map(String).includes(String(old))?old:'all';state.month=m.value;}
    const filtered=tournaments.filter(t=>{const d=dateOf(t);return (state.year==='all'||String(d?.getFullYear())===String(state.year))&&(state.month==='all'||String(d?.getMonth())===String(state.month));});
    const active=tournaments.filter(t=>!String(t.stato||'').toLowerCase().includes('chius')).length;
    const html=`<div class="archive-summary"><div class="archive-kpi"><span>Tornei in archivio</span><b>${tournaments.length}</b></div><div class="archive-kpi"><span>Visualizzati</span><b>${filtered.length}</b></div><div class="archive-kpi"><span>Attivi</span><b>${active}</b></div></div>`;
    if(!filtered.length){box.innerHTML=html+'<div class="archive-empty">Nessun torneo per il periodo selezionato.</div>';return;}
    const yearsMap=new Map();filtered.forEach(t=>{const d=dateOf(t);const yy=d?d.getFullYear():'Senza data';const mm=d?d.getMonth():-1;const dd=d?d.getDate():0;if(!yearsMap.has(yy))yearsMap.set(yy,new Map());const ym=yearsMap.get(yy);if(!ym.has(mm))ym.set(mm,new Map());const dm=ym.get(mm);if(!dm.has(dd))dm.set(dd,[]);dm.get(dd).push(t);});
    let out=html;
    yearsMap.forEach((months,yy)=>{const count=[...months.values()].reduce((n,days)=>n+[...days.values()].reduce((a,v)=>a+v.length,0),0);out+=`<div class="archive-year"><div class="archive-year-head"><strong>📅 ${yy}</strong><span>${count} tornei</span></div>`;months.forEach((days,mm)=>{const monthName=mm<0?'Data da definire':new Date(2000,mm,1).toLocaleDateString('it-IT',{month:'long'});out+=`<div class="archive-month"><div class="archive-month-title">${esc(monthName)}</div>`;days.forEach((items,dd)=>{const d=dateOf(items[0]);out+=`<div class="archive-day"><div class="archive-date">${d?`<b>${String(dd).padStart(2,'0')}</b>${d.toLocaleDateString('it-IT',{weekday:'short'})}`:'—'}</div><div>${items.map(t=>{const selected=String(t.id)===String(window.adminState?.torneoSelezionato);const status=String(t.stato||'bozza');return `<div class="archive-event ${selected?'selected':''}"><div><strong>${esc(t.nome||'Torneo senza nome')}</strong><small>${fmt(d)} · ${t.posti||'-'} squadre · ${esc(status)}</small></div><div class="archive-actions"><button type="button" class="btn" onclick="selezionaTorneoAdmin(${JSON.stringify(t.id)})">Gestisci</button><button type="button" class="btn" onclick="generaLinkPerId(${JSON.stringify(t.id)})">🔗</button></div></div>`}).join('')}</div></div>`});out+='</div>'});out+='</div>';});
    box.innerHTML=out;
  }
  let timer=0;
  function boot(){setup();const box=document.getElementById('listaTorneiAdmin');if(box&&!box.dataset.archiveObserver){box.dataset.archiveObserver='1';const mo=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(render,80)});mo.observe(box,{childList:true});}}
  document.addEventListener('DOMContentLoaded',boot);window.addEventListener('load',boot);setTimeout(boot,400);setTimeout(boot,1200);setTimeout(boot,2500);
  window.renderTournamentArchive=render;
})();