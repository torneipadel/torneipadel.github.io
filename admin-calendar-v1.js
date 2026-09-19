(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const state=()=>window.adminState||{};
const parseDate=v=>{if(!v)return null;const s=String(v).slice(0,10);const d=new Date(s+'T00:00:00');return Number.isNaN(d.getTime())?null:d};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const tournamentDate=t=>t?.data||t?.data_torneo||null;
const allTournaments=()=>Array.isArray(state().tornei)?state().tornei:[];
const style=document.createElement('style');
style.textContent=`
.agenda-shell{background:rgba(17,24,39,.15)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important;border:1px solid rgba(255,255,255,.4)!important;border-radius:18px;padding:18px;box-shadow:none!important}
.agenda-toolbar{display:grid;grid-template-columns:48px 1fr 48px;align-items:center;gap:12px;margin-bottom:18px}.agenda-toolbar .btn{height:42px;padding:0;font-size:25px}.agenda-month{text-align:center;font-size:25px;font-weight:800;letter-spacing:-.02em;color:#e5e7eb}
.agenda-week,.agenda-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px}.agenda-week{margin-bottom:7px}.agenda-week span{text-align:center;font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;padding:7px 0}
.agenda-day{position:relative;min-height:88px;border:1px solid #243041;border-radius:12px;background:rgba(17,24,39,.55)!important;color:#e5e7eb;text-align:left;padding:9px;cursor:pointer;transition:transform .12s,box-shadow .12s,border-color .12s}.agenda-day:hover{transform:translateY(-1px);box-shadow:0 5px 15px rgba(0,0,0,.35);border-color:rgba(255,255,255,.4)}.agenda-day.other-month{opacity:.38;background:rgba(17,24,39,.3)!important}.agenda-day.has-tournament{background:rgba(17,24,39,.65)!important;border-color:#22c55e;box-shadow:inset 0 0 0 1px rgba(34,197,94,.15)}.agenda-day.selected{outline:3px solid rgba(37,99,235,.22);border-color:#2563eb}.day-number{font-size:16px;font-weight:800;color:#e5e7eb}.day-events{display:flex;gap:4px;margin-top:10px;align-items:center}.day-event{width:8px;height:8px;border-radius:50%;background:#22c55e;display:block}.more-events{font-size:11px;font-weight:800;color:#86efac}.day-count{display:block;margin-top:7px;font-size:10px;font-weight:700;color:#86efac}
.agenda-legend{display:flex;justify-content:space-between;gap:12px;margin-top:14px;color:#94a3b8;font-size:12px}.agenda-legend span{display:flex;align-items:center;gap:7px}.agenda-dot{width:9px;height:9px;border-radius:50%;background:#22c55e;display:inline-block}
.agenda-selected,.agenda-list{margin-top:18px}.agenda-card{display:flex;align-items:center;gap:14px;padding:13px;border:1px solid #243041;border-radius:12px;margin-bottom:10px;background:rgba(17,24,39,.45)!important;color:#e5e7eb}.agenda-card.current{border-color:#60a5fa;background:rgba(30,41,59,.65)!important}.agenda-card-date{min-width:60px;text-align:center;font-size:18px}.agenda-meta{margin-top:4px;color:#94a3b8;font-size:12px}.agenda-row{width:100%;display:grid;grid-template-columns:68px 1fr auto;gap:14px;align-items:center;text-align:left;padding:12px;border:1px solid #243041;border-radius:12px;background:rgba(17,24,39,.45)!important;color:#e5e7eb;margin-bottom:8px;cursor:pointer}.agenda-row:hover{border-color:rgba(255,255,255,.4);box-shadow:0 4px 14px rgba(0,0,0,.35)}.agenda-row.current{border-color:#60a5fa;background:rgba(30,41,59,.65)!important}.agenda-row.today{box-shadow:inset 4px 0 0 #2563eb}.agenda-row-date{display:flex;align-items:center;justify-content:center;gap:5px}.agenda-row-date b{font-size:22px;color:#e5e7eb}.agenda-row-date small,.agenda-row-main small{display:block;color:#94a3b8}.agenda-row-main strong{display:block;color:#e5e7eb}.agenda-row-id{font-size:11px;color:#94a3b8}@media(max-width:700px){.agenda-shell{padding:10px}.agenda-day{min-height:64px;padding:7px}.day-count{display:none}.agenda-month{font-size:20px}.agenda-row{grid-template-columns:52px 1fr}.agenda-row-id{display:none}.agenda-week span{font-size:10px}.agenda-legend{font-size:11px}}
`;
(document.head||document.documentElement).appendChild(style);
let cursor=new Date();
let selectedDay=null;
function monthName(d){return d.toLocaleDateString('it-IT',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase())}
function tournamentsByDay(){const m=new Map();for(const t of allTournaments()){const d=parseDate(tournamentDate(t));if(!d)continue;const k=iso(d);if(!m.has(k))m.set(k,[]);m.get(k).push(t)}return m}
function openTournament(id){const s=state();s.torneoSelezionato=id;try{localStorage.setItem('padel_admin_state',JSON.stringify(s))}catch(e){};window.openAdminPage?.('torneo')}
function renderCalendar(){
 const root=$('appContent');if(!root)return;
 const map=tournamentsByDay();
 const y=cursor.getFullYear(),m=cursor.getMonth();
 const first=new Date(y,m,1),start=(first.getDay()+6)%7;
 const days=new Date(y,m+1,0).getDate();
 const prevDays=new Date(y,m,0).getDate();
 let cells='';
 for(let i=0;i<42;i++){
   const n=i-start+1;let d,other=false;
   if(n<1){d=new Date(y,m-1,prevDays+n);other=true}else if(n>days){d=new Date(y,m+1,n-days);other=true}else d=new Date(y,m,n);
   const key=iso(d),list=map.get(key)||[],has=list.length>0,sel=selectedDay===key?' selected':'';
   cells+=`<button type="button" class="agenda-day${other?' other-month':''}${has?' has-tournament':''}${sel}" data-calendar-day="${key}"><span class="day-number">${d.getDate()}</span>${has?`<span class="day-events">${list.slice(0,3).map(t=>`<span class="day-event" title="${esc(t.nome||'Torneo')}"></span>`).join('')}${list.length>3?'<span class="more-events">+</span>':''}</span><span class="day-count">${list.length} ${list.length===1?'torneo':'tornei'}</span>`:''}</button>`;
 }
 const today=iso(new Date());
 const selectedList=selectedDay?(map.get(selectedDay)||[]):[];
 const monthList=[];for(const t of allTournaments()){const d=parseDate(tournamentDate(t));if(d&&d.getFullYear()===y&&d.getMonth()===m)monthList.push({t,d})}
 monthList.sort((a,b)=>a.d-b.d);
 root.innerHTML=`<div class="page-head"><div><h1>Calendario</h1><p>Agenda tornei · i giorni con torneo sono evidenziati</p></div><button class="btn" id="calendarToday">Oggi</button></div><div class="agenda-shell"><div class="agenda-toolbar"><button class="btn" id="calendarPrev">‹</button><div class="agenda-month">${monthName(cursor)}</div><button class="btn" id="calendarNext">›</button></div><div class="agenda-week"><span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span></div><div class="agenda-grid">${cells}</div><div class="agenda-legend"><span><i class="agenda-dot"></i> Giorno con torneo</span><span>${monthList.length} tornei nel mese</span></div></div>${selectedDay?`<div class="card agenda-selected"><div class="card-head"><h2>Agenda del ${new Date(selectedDay+'T00:00:00').toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h2></div><div class="card-body">${selectedList.length?selectedList.map(tournamentCard).join(''):'<div class="empty">Nessun torneo in questa giornata.</div>'}</div></div>`:''}<div class="card agenda-list"><div class="card-head"><h2>Agenda del mese</h2><span class="notice">${monthList.length} ${monthList.length===1?'torneo':'tornei'}</span></div><div class="card-body">${monthList.length?monthList.map(x=>tournamentRow(x.t,x.d,today)).join(''):'<div class="empty">Nessun torneo programmato in questo mese.</div>'}</div></div>`;
 bind();
}
function tournamentCard(t){const d=parseDate(tournamentDate(t));const selected=String(t.id)===String(state().torneoSelezionato);return `<div class="agenda-card${selected?' current':''}"><div class="agenda-card-date"><strong>${d?d.toLocaleDateString('it-IT',{day:'2-digit',month:'short'}):'-'}</strong></div><div><strong>${esc(t.nome||'Torneo')}</strong><div class="agenda-meta">${esc(t.ora_inizio||'')} ${t.posti?`· ${esc(t.posti)} squadre`:''} · ID ${esc(t.id)}</div></div></div>`}
function tournamentRow(t,d,today){const selected=String(t.id)===String(state().torneoSelezionato);const key=iso(d);return `<button type="button" class="agenda-row${selected?' current':''}${key===today?' today':''}" data-calendar-open="${esc(t.id)}"><span class="agenda-row-date"><b>${d.getDate()}</b><small>${d.toLocaleDateString('it-IT',{weekday:'short'}).replace('.','')}</small></span><span class="agenda-row-main"><strong>${esc(t.nome||'Torneo')}</strong><small>${esc(t.ora_inizio||'')} ${t.posti?`· ${esc(t.posti)} squadre`:''}</small></span><span class="agenda-row-id">ID ${esc(t.id)}</span></button>`}
function bind(){
 $('calendarPrev')?.addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);selectedDay=null;renderCalendar()});
 $('calendarNext')?.addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);selectedDay=null;renderCalendar()});
 $('calendarToday')?.addEventListener('click',()=>{const d=new Date();cursor=new Date(d.getFullYear(),d.getMonth(),1);selectedDay=iso(d);renderCalendar()});
 document.querySelectorAll('[data-calendar-day]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.calendarDay;const list=tournamentsByDay().get(key)||[];if(list.length){openTournament(list[0].id);return}selectedDay=key;renderCalendar()}));
 document.querySelectorAll('[data-calendar-open]').forEach(b=>b.addEventListener('click',()=>openTournament(b.dataset.calendarOpen)));
}
window.openAdminCalendar=()=>{const t=allTournaments().find(x=>String(x.id)===String(state().torneoSelezionato));const d=t?parseDate(tournamentDate(t)):new Date();cursor=new Date((d||new Date()).getFullYear(),(d||new Date()).getMonth(),1);selectedDay=t&&d?iso(d):null;renderCalendar()};
document.addEventListener('click',e=>{const b=e.target.closest('#calendar');if(b){e.preventDefault();window.openAdminCalendar?.()}});
})();
