/* admin-superadmin-v1.js */
(function(){
  'use strict';

  const $=id=>document.getElementById(id);
  const client=()=>window.sb||window.supabaseClient;
  const isSuper=()=>window.isSuperadmin===true||String(document.documentElement.dataset.adminRole||'')==='superadmin';

  function addRoleBadge(){
    const footer=document.querySelector('.sidebar-footer');
    if(!footer||$('adminRoleBadge'))return;
    const badge=document.createElement('div');
    badge.id='adminRoleBadge';
    badge.style.cssText='margin:8px 0 10px;padding:7px 10px;border-radius:9px;background:rgba(255,255,255,.10);font-size:12px;font-weight:800;text-align:center';
    badge.textContent=isSuper()?'👑 SUPERADMIN':'👤 ADMIN';
    footer.prepend(badge);
  }

  function addSuperadminNav(){
    const groups=[...document.querySelectorAll('#areaAdmin .sidebar .nav-group')];
    const system=groups.find(g=>g.querySelector('.nav-label')?.textContent?.trim()==='Sistema');
    if(!system||$('sideSuperadmin'))return;
    const nav=system.querySelector('.nav');
    if(!nav)return;
    const b=document.createElement('button');
    b.type='button';
    b.id='sideSuperadmin';
    b.textContent='👑 Superadmin';
    b.style.display=isSuper()?'block':'none';
    b.onclick=()=>openPanel();
    nav.insertBefore(b,nav.firstChild);
  }

  function roleReady(){
    addRoleBadge();
    addSuperadminNav();
    guardCriticalButtons();
  }

  function guardCriticalButtons(){
    const destructive=['adminDeleteTournament','adminArchiveTournament'];
    destructive.forEach(id=>{
      const b=$(id);
      if(!b)return;
      if(isSuper()){
        b.disabled=false;
        b.title='';
        b.style.display='';
      }else{
        b.disabled=true;
        b.title='Operazione riservata al Superadmin';
        b.style.opacity='.45';
        b.style.cursor='not-allowed';
      }
    });
  }

  function shell(){
    let root=$('superadminPanel');
    if(root)return root;
    root=document.createElement('div');
    root.id='superadminPanel';
    root.style.cssText='padding:0 0 30px';
    root.innerHTML=
      '<div class="page-head"><div><h1>👑 Area Superadmin</h1><p>Controllo accessi, registro modifiche, backup e ripristino.</p></div><button type="button" class="btn" id="closeSuperadmin">← Torna al pannello</button></div>'+
      '<div class="card"><div class="card-head"><div><h2>Ruolo e protezioni</h2><span class="notice">Questa area è disponibile esclusivamente al Superadmin.</span></div></div><div class="card-body" id="superadminSummary"></div></div>'+
      '<div class="card" style="margin-top:18px"><div class="card-head"><div><h2>🛡️ Cosa può fare il Superadmin</h2><span class="notice">Mappa precisa delle operazioni consentite e dei ripristini realmente disponibili.</span></div></div><div class="card-body" id="superadminCapabilities"></div></div>'+
      '<div class="card" style="margin-top:18px"><div class="card-head"><div><h2>📋 Registro modifiche</h2><span class="notice">Le modifiche ai tornei vengono registrate automaticamente.</span></div><button type="button" class="btn" id="refreshAudit">↻ Aggiorna</button></div><div class="card-body"><div id="auditList"></div></div></div>'+
      '<div class="card" style="margin-top:18px"><div class="card-head"><div><h2>💾 Backup tornei</h2><span class="notice">Prima di una modifica o eliminazione viene salvata una copia completa del torneo.</span></div><button type="button" class="btn" id="refreshBackups">↻ Aggiorna</button></div><div class="card-body"><div id="backupList"></div></div></div>';
    $('appContent')?.replaceChildren(root);
    $('closeSuperadmin').onclick=()=>window.renderCleanAdmin?.();
    $('refreshAudit').onclick=loadAudit;
    $('refreshBackups').onclick=loadBackups;
    return root;
  }

  function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function dt(v){try{return new Date(v).toLocaleString('it-IT')}catch(e){return '-'}}

  async function openPanel(){
    if(!isSuper())return false;
    shell();
    const email=(await client()?.auth?.getUser())?.data?.user?.email||window.adminState?.adminEmail||'-';
    $('superadminSummary').innerHTML='<div class="info-row"><span>Ruolo</span><b>👑 SUPERADMIN</b></div><div class="info-row"><span>Account</span><b>'+esc(email)+'</b></div><div class="info-row"><span>Eliminazione tornei</span><b>Consentita solo al Superadmin</b></div><div class="info-row"><span>Ripristino backup</span><b>Consentito solo al Superadmin</b></div>';
    $('superadminCapabilities').innerHTML=
      '<div style="display:grid;gap:14px">'+
      '<div><h3 style="margin:0 0 6px">✅ Può fare</h3><ul style="margin:0;padding-left:20px">'+
      '<li>Gestire tutte le funzioni disponibili all’Admin.</li>'+
      '<li>Eliminare definitivamente un torneo.</li>'+
      '<li>Eliminare iscrizioni.</li>'+
      '<li>Archiviare un torneo e riaprire un torneo già archiviato.</li>'+
      '<li>Consultare il registro audit delle modifiche amministrative.</li>'+
      '<li>Consultare i backup automatici dei tornei.</li>'+
      '<li>Ripristinare un torneo da uno dei backup disponibili.</li>'+
      '</ul></div>'+
      '<div><h3 style="margin:0 0 6px">↩️ Può ripristinare</h3><table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;padding:7px;border-bottom:1px solid #ddd">Elemento</th><th style="text-align:left;padding:7px;border-bottom:1px solid #ddd">Ripristino</th><th style="text-align:left;padding:7px;border-bottom:1px solid #ddd">Come</th></tr>'+
      '<tr><td style="padding:7px">Torneo</td><td style="padding:7px"><b>SI</b></td><td style="padding:7px">Da un backup automatico presente in <code>tornei_admin_backup</code>; sostituisce i dati correnti del medesimo ID con lo snapshot salvato.</td></tr>'+
      '<tr><td style="padding:7px">Configurazione/regole del torneo</td><td style="padding:7px"><b>SI, se presenti nello snapshot</b></td><td style="padding:7px">Sono ripristinate insieme alla riga completa del torneo.</td></tr>'+
      '<tr><td style="padding:7px">Iscrizioni</td><td style="padding:7px"><b>NO</b></td><td style="padding:7px">Non esiste attualmente un archivio/backup automatico delle righe <code>iscrizioni</code>.</td></tr>'+
      '<tr><td style="padding:7px">Profili/ruoli utenti</td><td style="padding:7px"><b>NO</b></td><td style="padding:7px">Non sono inclusi nei backup dei tornei.</td></tr>'+
      '<tr><td style="padding:7px">News</td><td style="padding:7px"><b>NO</b></td><td style="padding:7px">Non sono incluse nello snapshot del torneo.</td></tr>'+
      '<tr><td style="padding:7px">Sponsor/Mercatino</td><td style="padding:7px"><b>NO</b></td><td style="padding:7px">Non sono inclusi nel sistema di backup Superadmin attuale.</td></tr>'+
      '</table></div>'+
      '<div><h3 style="margin:0 0 6px">🚫 Non può ripristinare automaticamente</h3><p style="margin:0">Un dato cancellato senza un backup specifico non può essere ricostruito dal pulsante <b>↩ Ripristina</b>. Il ripristino disponibile oggi riguarda esclusivamente gli snapshot presenti in <code>tornei_admin_backup</code>.</p></div>'+
      '<div style="padding:10px 12px;border-left:4px solid #9a6700;background:#fff8e6"><b>Importante:</b> il Superadmin non può recuperare magicamente dati che non sono mai stati salvati in un backup. Prima di dichiarare un recupero possibile, controllare che esista un backup relativo all’elemento interessato.</div>'+
      '</div>';
    await Promise.all([loadAudit(),loadBackups()]);
    return true;
  }

  async function loadAudit(){
    const box=$('auditList'); if(!box)return;
    const c=client(); if(!c){box.textContent='Supabase non disponibile.';return}
    const r=await c.from('admin_audit_log').select('id,actor_email,ruolo,action,entity_type,entity_id,summary,created_at').order('created_at',{ascending:false}).limit(100);
    if(r.error){box.innerHTML='<div class="empty">Impossibile leggere il registro: '+esc(r.error.message)+'</div>';return}
    const rows=r.data||[];
    box.innerHTML=rows.length?'<div class="list">'+rows.map(x=>'<div class="list-item"><div class="list-item-main"><div><strong>'+esc(x.action)+' · '+esc(x.summary||'')+'</strong><small>'+esc(x.actor_email||'-')+' · '+esc(x.ruolo)+' · '+esc(x.entity_type||'-')+' '+esc(x.entity_id||'')+'</small></div><span class="pill">'+esc(dt(x.created_at))+'</span></div></div>').join('')+'</div>':'<div class="empty">Nessuna modifica registrata.</div>';
  }

  async function loadBackups(){
    const box=$('backupList'); if(!box)return;
    const c=client(); if(!c){box.textContent='Supabase non disponibile.';return}
    const r=await c.from('tornei_admin_backup').select('id,torneo_id,reason,created_by_email,created_at,snapshot').order('created_at',{ascending:false}).limit(100);
    if(r.error){box.innerHTML='<div class="empty">Impossibile leggere i backup: '+esc(r.error.message)+'</div>';return}
    const rows=r.data||[];
    box.innerHTML=rows.length?'<div class="list">'+rows.map(x=>{
      const nome=x.snapshot?.nome||('Torneo #'+x.torneo_id);
      return '<div class="list-item"><div class="list-item-main"><div><strong>'+esc(nome)+'</strong><small>Backup #'+esc(x.id)+' · '+esc(x.reason||'')+' · '+esc(x.created_by_email||'-')+' · '+esc(dt(x.created_at))+'</small></div><button type="button" class="btn small danger" data-restore-backup="'+esc(x.id)+'">↩ Ripristina</button></div></div>';
    }).join('')+'</div>':'<div class="empty">Nessun backup disponibile.</div>';
    box.querySelectorAll('[data-restore-backup]').forEach(b=>b.onclick=()=>restore(Number(b.dataset.restoreBackup)));
  }

  async function restore(id){
    if(!isSuper()||!Number.isFinite(id))return;
    if(!confirm('Confermi il ripristino del torneo dal backup #'+id+'? Il torneo corrente con lo stesso ID verrà sostituito dai dati del backup.'))return;
    const c=client(); if(!c)return;
    const r=await c.rpc('superadmin_restore_torneo',{p_backup_id:id});
    if(r.error){alert('Ripristino non riuscito: '+r.error.message);return}
    alert('Ripristino completato.');
    await window.caricaTorneiSupabase?.();
    await loadAudit();
    await loadBackups();
  }

  window.apriAreaSuperadmin=openPanel;
  window.isOperazioneSuperadmin=isSuper;
  window.addEventListener('admin:role-ready',roleReady);
  window.addEventListener('admin:rendered',()=>requestAnimationFrame(()=>{addRoleBadge();addSuperadminNav();guardCriticalButtons()}));
  const obs=new MutationObserver(()=>requestAnimationFrame(()=>{addRoleBadge();addSuperadminNav();guardCriticalButtons()}));
  function boot(){
    roleReady();
    const app=$('appContent'); if(app)obs.observe(app,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

})();
