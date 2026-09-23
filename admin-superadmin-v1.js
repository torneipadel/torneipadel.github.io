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
    const duplicates=[...document.querySelectorAll('#sideSuperadmin')];
    if(duplicates.length>1)duplicates.slice(1).forEach(x=>x.remove());
    const mobileDuplicates=[...document.querySelectorAll('#mobileSuperadmin')];
    if(mobileDuplicates.length>1)mobileDuplicates.slice(1).forEach(x=>x.remove());

    const groups=[...document.querySelectorAll('#areaAdmin .sidebar .nav-group')];
    const system=groups.find(g=>g.querySelector('.nav-label')?.textContent?.trim()==='Sistema');
    if(system&&!$('sideSuperadmin')){
      const nav=system.querySelector('.nav');
      if(nav){
        const b=document.createElement('button');
        b.type='button';
        b.id='sideSuperadmin';
        b.textContent='👑 Superadmin';
        b.style.display=isSuper()?'block':'none';
        b.onclick=()=>openPanel();
        nav.insertBefore(b,nav.firstChild);
      }
    }

    const mobileNav=document.querySelector('.mobile-nav');
    if(!mobileNav)return;
    mobileNav.querySelectorAll('#mobileSuperadmin').forEach((x,i)=>{if(i>0)x.remove()});
    let mobile=$('mobileSuperadmin');
    if(!isSuper()){
      mobile?.remove();
      return;
    }
    if(!mobile){
      mobile=document.createElement('button');
      mobile.type='button';
      mobile.id='mobileSuperadmin';
      mobile.textContent='👑 Superadmin';
      const first=mobileNav.querySelector('[data-page]');
      if(first)mobileNav.insertBefore(mobile,first);
      else mobileNav.prepend(mobile);
    }
    mobile.style.display=isSuper()?'block':'none';
    mobile.onclick=()=>{
      $('mobileOverlay')?.classList.remove('open');
      openPanel();
    };
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
      '<div class="page-head"><div><h1>👑 Area Superadmin</h1><p>Controllo accessi, registro modifiche, backup e ripristino.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn" id="openSuperadminHelp">❓ Help</button><button type="button" class="btn" id="closeSuperadmin">← Torna al pannello</button></div></div>'+
      '<details class="card" id="superadminHelp" style="margin-bottom:18px"><summary style="cursor:pointer;list-style:none;padding:18px 20px;font-weight:800;font-size:16px">❓ Help — Manuale operativo Superadmin <span class="notice" style="font-weight:400;margin-left:8px">Come usare ogni funzione e quando usarla</span></summary><div class="card-body" style="line-height:1.55">'+
      '<div style="display:grid;gap:16px">'+
      '<div><h3 style="margin:0 0 6px">1. 🔐 Ruolo e protezioni</h3><p><b>A cosa serve:</b> mostra l’account con cui sei entrato, conferma che il ruolo attivo è SUPERADMIN e indica le operazioni protette.</p><p><b>Quando usarlo:</b> all’inizio di una sessione, se vuoi verificare di essere entrato con l’account Superadmin corretto o prima di un’operazione delicata.</p></div>'+
      '<div><h3 style="margin:0 0 6px">2. 🛡️ Cosa può fare il Superadmin</h3><p><b>A cosa serve:</b> è la mappa delle autorizzazioni. Indica quali operazioni sono riservate al Superadmin e quali dati hanno un meccanismo di backup/ripristino.</p><p><b>Quando usarlo:</b> quando devi decidere quale funzione utilizzare o vuoi controllare prima di un’operazione distruttiva. Non modifica dati da solo.</p></div>'+
      '<div><h3 style="margin:0 0 6px">3. 📋 Registro modifiche — Audit</h3><p><b>A cosa serve:</b> mostra le operazioni amministrative registrate, con azione, riepilogo, account che l’ha eseguita, ruolo, elemento interessato e data/ora.</p><p><b>Come usarlo:</b> apri il menu e premi <b>↻ Aggiorna</b> per rileggere il registro. Usa questo elenco per capire <b>chi ha fatto cosa e quando</b>.</p><p><b>Quando usarlo:</b> dopo una modifica importante, quando devi ricostruire cosa è successo a un torneo o quando vuoi verificare un’operazione eseguita da un Admin.</p><p><b>Importante:</b> il registro documenta le operazioni che vengono effettivamente registrate dal sistema; non deve essere interpretato come una copia dei dati.</p></div>'+
      '<div><h3 style="margin:0 0 6px">4. 💾 Backup tornei</h3><div style="padding:10px 12px;border-left:4px solid #dc3545;background:#fff0f0;color:#842029;margin-bottom:10px"><b>⚠️ ATTENZIONE — RIPRISTINO:</b> il ripristino può sovrascrivere dati correnti e causare perdita di modifiche. Prima di confermare, verifica sempre torneo, ID, data e motivo del backup. Un ripristino effettuato sul backup sbagliato può causare danni difficili o impossibili da recuperare.</div><p><b>A cosa serve:</b> contiene gli snapshot completi dei tornei salvati dal sistema prima delle operazioni per cui è previsto il backup. Ogni voce identifica torneo, motivo, autore e data.</p><p><b>Come usarlo:</b> apri il menu, individua il backup corretto, controlla attentamente ID/nome, motivo e data, poi usa <b>↩ Ripristina</b> solo se sei certo che quello sia lo stato da recuperare.</p><p><b>Quando usarlo:</b> se un torneo è stato modificato o eliminato e devi recuperare uno stato precedente disponibile nel backup.</p><p><b>Prima di ripristinare:</b> verifica che il backup sia quello corretto. Il ripristino sostituisce i dati correnti del torneo con quelli presenti nello snapshot.</p></div>'+
      '<div><h3 style="margin:0 0 6px">5. 🗄️ Backup dati amministrativi</h3><div style="padding:10px 12px;border-left:4px solid #dc3545;background:#fff0f0;color:#842029;margin-bottom:10px"><b>⚠️ ATTENZIONE — RIPRISTINO:</b> la funzione sostituisce il dato corrente con lo snapshot selezionato. Se scegli la riga o il backup sbagliato, puoi sovrascrivere dati corretti e perdere modifiche non recuperabili.</div><p><b>A cosa serve:</b> gestisce gli snapshot delle singole righe per dati amministrativi come iscrizioni, profili, News, Sponsor e Mercatino.</p><p><b>Come usarlo:</b> apri il menu, identifica tabella, ID riga, azione, autore e data. Se devi recuperare quella riga, premi <b>↩ Ripristina</b> sulla voce corretta e conferma.</p><p><b>Quando usarlo:</b> quando una singola riga è stata modificata o cancellata e vuoi riportarla allo stato salvato.</p><p><b>Limite importante:</b> non è un’immagine completa dell’intero database. Se per quella specifica riga non esiste uno snapshot, il dato non può essere ricostruito tramite questa funzione.</p></div>'+
      '<div><h3 style="margin:0 0 6px">6. 🧩 Backup e ripristino codice — Commit GitHub</h3><div style="padding:10px 12px;border-left:4px solid #dc3545;background:#fff0f0;color:#842029;margin-bottom:10px"><b>⚠️ ATTENZIONE — RIPRISTINO CODICE:</b> ripristinare un file a un commit precedente può annullare modifiche successive presenti nel file. Se selezioni il commit sbagliato puoi reintrodurre bug o perdere correzioni. Prima di procedere, usa <b>Apri</b> e <b>Confronta</b> per verificare esattamente la versione.</div><p><b>A cosa serve:</b> mostra le versioni GitHub dei file controllati dal pannello e permette di contrassegnarle come <b>⭐ Stabile</b>, <b>🟡 Test</b> o <b>🔴 Problematica</b>. Permette inoltre di richiedere il ripristino completo di un file a uno specifico commit.</p><p><b>Come usare:</b> apri il menu e scegli il file. <b>Apri</b> porta al commit GitHub; <b>Confronta</b> mostra le differenze verso <code>main</code>; i tre pulsanti di stato servono a classificare la versione; <b>↩ Ripristina</b> avvia la richiesta di recupero del file.</p><p><b>Quando usare il ripristino:</b> dopo una modifica al codice che introduce un problema e quando hai identificato una versione precedente funzionante. Scegli sempre il commit preciso del file da recuperare.</p><p><b>Importante:</b> il ripristino del codice non cancella la cronologia. Genera una nuova richiesta/commit e conserva le versioni precedenti. Il processo viene eseguito automaticamente da GitHub Actions.</p></div>'+
      '<div><h3 style="margin:0 0 6px">7. ⭐ Stabile / 🟡 Test / 🔴 Problematica</h3><p><b>Stabile:</b> usa questo stato quando hai verificato che quella versione funziona ed è una versione di riferimento. <b>Test:</b> usa questo stato mentre una versione è ancora in verifica. <b>Problematica:</b> usalo quando hai verificato che quella versione introduce un problema o non deve essere usata come riferimento.</p><p><b>Attenzione:</b> questi pulsanti classificano una versione nel registro; non modificano il codice del commit.</p></div>'+
      '<div><h3 style="margin:0 0 6px">8. 🔄 Aggiorna</h3><p>I pulsanti <b>↻ Aggiorna</b> rileggono i dati della rispettiva sezione. Usali dopo una modifica, un ripristino o quando vuoi verificare che siano comparsi nuovi record.</p></div>'+
      '<div style="padding:12px;border-left:4px solid #9a6700;background:#fff8e6"><b>Regola operativa consigliata:</b> prima di una modifica delicata controlla il ruolo, poi verifica il registro e i backup disponibili. Dopo l’operazione premi <b>Aggiorna</b> e controlla il risultato. Per il codice, identifica prima il commit corretto e usa il ripristino solo dopo aver verificato la versione da recuperare.</div>'+
      '</div></div></details>'+
      '<details class="card" open><summary style="cursor:pointer;list-style:none;padding:18px 20px;font-weight:800;font-size:16px">🔐 Ruolo e protezioni <span class="notice" style="font-weight:400;margin-left:8px">Accesso e autorizzazioni</span></summary><div class="card-body" id="superadminSummary"></div></details>'+
      '<details class="card" style="margin-top:18px"><summary style="cursor:pointer;list-style:none;padding:18px 20px;font-weight:800;font-size:16px">🛡️ Cosa può fare il Superadmin <span class="notice" style="font-weight:400;margin-left:8px">Operazioni consentite</span></summary><div class="card-body" id="superadminCapabilities"></div></details>'+
      '<details class="card" style="margin-top:18px"><summary style="cursor:pointer;list-style:none;padding:18px 20px;font-weight:800;font-size:16px">📋 Registro modifiche <span class="notice" style="font-weight:400;margin-left:8px">Audit</span><button type="button" class="btn" id="refreshAudit" style="float:right">↻ Aggiorna</button></summary><div class="card-body"><div id="auditList"></div></div></details>'+
      '<details class="card" style="margin-top:18px"><summary style="cursor:pointer;list-style:none;padding:18px 20px;font-weight:800;font-size:16px">💾 Backup tornei <span class="notice" style="font-weight:400;margin-left:8px">Backup completi e ripristino</span><button type="button" class="btn" id="refreshBackups" style="float:right">↻ Aggiorna</button></summary><div class="card-body"><div id="backupList"></div></div></details>'+
      '<details class="card" style="margin-top:18px"><summary style="cursor:pointer;list-style:none;padding:18px 20px;font-weight:800;font-size:16px">🗄️ Backup dati amministrativi <span class="notice" style="font-weight:400;margin-left:8px">Iscrizioni, profili, News, Sponsor e Mercatino</span><button type="button" class="btn" id="refreshDataBackups" style="float:right">↻ Aggiorna</button></summary><div class="card-body"><div id="dataBackupList"></div></div></details>'+
      '<details class="card" style="margin-top:18px"><summary style="cursor:pointer;list-style:none;padding:18px 20px;font-weight:800;font-size:16px">🧩 Backup e ripristino codice <span class="notice" style="font-weight:400;margin-left:8px">Commit GitHub e versioni</span><button type="button" class="btn" id="refreshCodeBackups" style="float:right">↻ Aggiorna</button></summary><div class="card-body"><div id="codeBackupList"></div></div></details>';
    $('appContent')?.replaceChildren(root);
    $('closeSuperadmin').onclick=()=>window.renderCleanAdmin?.();
    $('openSuperadminHelp').onclick=()=>{const h=$('superadminHelp');if(h)h.open=true;h?.scrollIntoView({behavior:'smooth',block:'start'})};
    $('refreshAudit').onclick=loadAudit;
    $('refreshBackups').onclick=loadBackups;
    $('refreshDataBackups')?.addEventListener('click',loadDataBackups);
    $('refreshCodeBackups')?.addEventListener('click',loadCodeBackups);
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
      '<li>Eliminare definitivamente tornei e iscrizioni.</li>'+
      '<li>Archiviare e riaprire tornei.</li>'+
      '<li>Consultare audit e backup.</li>'+
      '<li>Ripristinare dati da backup disponibili.</li>'+
      '<li>Gestire i ruoli utenti a livello database, inclusa la protezione contro l’auto-promozione degli Admin.</li>'+
      '</ul></div>'+
      '<div><h3 style="margin:0 0 6px">↩️ Copertura ripristino</h3><table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;padding:7px;border-bottom:1px solid #ddd">Elemento</th><th style="text-align:left;padding:7px;border-bottom:1px solid #ddd">Backup</th><th style="text-align:left;padding:7px;border-bottom:1px solid #ddd">Ripristino</th></tr>'+
      '<tr><td style="padding:7px">Torneo + configurazione/regole</td><td style="padding:7px"><b>SI</b></td><td style="padding:7px"><b>SI</b></td></tr>'+
      '<tr><td style="padding:7px">Iscrizioni</td><td style="padding:7px"><b>SI</b></td><td style="padding:7px"><b>SI</b></td></tr>'+
      '<tr><td style="padding:7px">Profili/ruoli</td><td style="padding:7px"><b>SI</b></td><td style="padding:7px"><b>SI</b></td></tr>'+
      '<tr><td style="padding:7px">News</td><td style="padding:7px"><b>SI</b></td><td style="padding:7px"><b>SI</b></td></tr>'+
      '<tr><td style="padding:7px">Sponsor</td><td style="padding:7px"><b>SI</b></td><td style="padding:7px"><b>SI</b></td></tr>'+
      '<tr><td style="padding:7px">Mercatino</td><td style="padding:7px"><b>SI</b></td><td style="padding:7px"><b>SI</b></td></tr>'+
      '</table></div>'+
      '<div style="padding:10px 12px;border-left:4px solid #198754;background:#eefaf2"><b>Come funziona:</b> per i dati amministrativi il sistema conserva lo snapshot della singola riga quando viene inserita, modificata o cancellata. Il Superadmin può quindi riportare quella riga allo stato salvato. Non è un’immagine completa dell’intero database in un unico backup.</div>'+
      '<div style="padding:10px 12px;border-left:4px solid #9a6700;background:#fff8e6"><b>Importante:</b> il ripristino è possibile solo se esiste il relativo snapshot. Un dato creato e mai passato da un backup non può essere ricostruito.</div>'+
      '</div>';
    await Promise.all([loadAudit(),loadBackups(),loadDataBackups(),loadCodeBackups()]);
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

  async function loadDataBackups(){
    const box=$('dataBackupList'); if(!box)return;
    const c=client(); if(!c){box.textContent='Supabase non disponibile.';return}
    const r=await c.from('admin_data_backup').select('id,table_name,row_id,action,reason,created_by_email,created_at').order('created_at',{ascending:false}).limit(200);
    if(r.error){box.innerHTML='<div class="empty">Impossibile leggere i backup dati: '+esc(r.error.message)+'</div>';return}
    const rows=r.data||[];
    box.innerHTML=rows.length?'<div class="list">'+rows.map(x=>'<div class="list-item"><div class="list-item-main"><div><strong>'+esc(x.table_name)+' · riga #'+esc(x.row_id)+' · '+esc(x.action)+'</strong><small>Backup #'+esc(x.id)+' · '+esc(x.created_by_email||'-')+' · '+esc(dt(x.created_at))+'</small></div><button type="button" class="btn small danger" data-restore-data-backup="'+esc(x.id)+'">↩ Ripristina</button></div></div>').join('')+'</div>':'<div class="empty">Nessun backup dati disponibile.</div>';
    box.querySelectorAll('[data-restore-data-backup]').forEach(b=>b.onclick=()=>restoreData(Number(b.dataset.restoreDataBackup)));
  }


  const CODE_FILES=['Bove.html','admin.html','admin-superadmin-v1.js','manuale.html','admin-system-monitor-v1.js','admin-torneo-rotazione-v1.js'];
  const GITHUB_REPO='torneirobertobove/torneirobertobove.github.io';
  const COMPLETE_PROJECT_BACKUP_FUNCTION='project-complete-backup';

  async function loadCodeBackups(){
    const box=$('codeBackupList'); if(!box)return;
    const c=client(); if(!c){box.textContent='Supabase non disponibile.';return}
    const reg=await c.from('code_backup_registry').select('file_path,commit_sha,status,note,marked_by_email,created_at').order('created_at',{ascending:false}).limit(500);
    if(reg.error){box.innerHTML='<div class="empty">Impossibile leggere il registro codice: '+esc(reg.error.message)+'</div>';return}
    const registry={};
    (reg.data||[]).forEach(x=>registry[x.file_path+'@'+x.commit_sha]=x);
    const results=await Promise.all(CODE_FILES.map(async file=>{
      try{
        const r=await fetch('https://api.github.com/repos/'+GITHUB_REPO+'/commits?path='+encodeURIComponent(file)+'&per_page=12',{headers:{Accept:'application/vnd.github+json'}});
        if(!r.ok)throw new Error('GitHub HTTP '+r.status);
        const data=await r.json();
        return {file,commits:data};
      }catch(e){return {file,commits:[],error:e.message}}
    }));
    let html=
      '<div style="margin-bottom:16px;padding:14px;border:1px solid #198754;border-radius:10px;background:#eefaf2">'+
      '<div style="font-weight:800;font-size:16px">💾 Backup completo progetto</div>'+
      '<div style="margin-top:6px">Crea in qualsiasi momento un nuovo snapshot completo dell’intero repository, senza modificare <code>main</code>.</div>'+
      '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">'+
      '<button type="button" class="btn small" id="createCompleteProjectBackup">💾 Esegui backup completo adesso</button>'+
      '<button type="button" class="btn small" id="refreshCompleteProjectBackups">↻ Aggiorna backup</button>'+
      '</div>'+
      '<div id="completeProjectBackupStatus" style="margin-top:10px"></div>'+
      '<div id="completeProjectBackupHistory" style="margin-top:10px"></div>'+
      '</div>'+
      '<div style="display:grid;gap:16px">';
    results.forEach(group=>{
      html+='<div style="border:1px solid #ddd;border-radius:10px;padding:12px"><h3 style="margin:0 0 10px">'+esc(group.file)+'</h3>';
      if(group.error){html+='<div class="empty">Errore: '+esc(group.error)+'</div></div>';return}
      if(!group.commits.length){html+='<div class="empty">Nessuna versione trovata.</div></div>';return}
      html+='<div style="display:grid;gap:8px">';
      group.commits.forEach(cm=>{
        const sha=cm.sha;
        const meta=registry[group.file+'@'+sha];
        const status=meta?.status||'TEST';
        const badge=status==='STABILE'?'🟢 STABILE':status==='PROBLEMATICA'?'🔴 PROBLEMATICA':'🟡 TEST';
        const msg=cm.commit?.message?.split('\n')[0]||'';
        const date=cm.commit?.author?.date||cm.committer?.date;
        html+='<div style="padding:10px;border:1px solid #eee;border-radius:8px"><div style="display:flex;gap:10px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap"><div><strong>'+badge+' · '+esc(sha.slice(0,10))+'</strong><small style="display:block">'+esc(dt(date))+' · '+esc(msg)+'</small></div><div style="display:flex;gap:6px;flex-wrap:wrap">'+
          '<a class="btn small" href="https://github.com/'+GITHUB_REPO+'/commit/'+sha+'" target="_blank" rel="noopener">Apri</a>'+
          '<a class="btn small" href="https://github.com/'+GITHUB_REPO+'/compare/'+sha+'...main" target="_blank" rel="noopener">Confronta</a>'+
          '<button type="button" class="btn small" data-code-status="STABILE" data-code-file="'+esc(group.file)+'" data-code-sha="'+sha+'">⭐ Stabile</button>'+
          '<button type="button" class="btn small" data-code-status="TEST" data-code-file="'+esc(group.file)+'" data-code-sha="'+sha+'">🟡 Test</button>'+
          '<button type="button" class="btn small" data-code-status="PROBLEMATICA" data-code-file="'+esc(group.file)+'" data-code-sha="'+sha+'">🔴 Problematica</button>'+
          '<button type="button" class="btn small danger" data-code-restore="'+sha+'" data-code-file="'+esc(group.file)+'">↩ Ripristina</button>'+
          '</div></div></div>';
      });
      html+='</div></div>';
    });
    html+='</div><div style="margin-top:12px;padding:10px 12px;border-left:4px solid #9a6700;background:#fff8e6"><b>Ripristino:</b> il Superadmin seleziona una versione completa del file; la richiesta viene presa automaticamente da GitHub Actions e genera un nuovo commit, senza cancellare la cronologia precedente. Il controllo viene eseguito ogni 5 minuti.</div>';
    box.innerHTML=html;
    $('createCompleteProjectBackup')?.addEventListener('click',createCompleteProjectBackup);
    $('refreshCompleteProjectBackups')?.addEventListener('click',loadCompleteProjectBackups);
    await loadCompleteProjectBackups();
    box.querySelectorAll('[data-code-status]').forEach(b=>b.onclick=()=>setCodeStatus(b.dataset.codeFile,b.dataset.codeSha,b.dataset.codeStatus));
    box.querySelectorAll('[data-code-restore]').forEach(b=>b.onclick=()=>requestCodeRestore(b.dataset.codeFile,b.dataset.codeRestore));
  }

  async function loadCompleteProjectBackups(){
    const box=$('completeProjectBackupHistory');
    if(!box)return;
    box.innerHTML='<div class="empty">Lettura backup completi...</div>';
    try{
      const c=client();
      if(!c?.functions?.invoke)throw new Error('Servizio backup non disponibile');
      const r=await c.functions.invoke(COMPLETE_PROJECT_BACKUP_FUNCTION,{method:'GET'});
      if(r.error)throw r.error;
      const rows=(r.data?.backups||[]).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
      box.innerHTML=rows.length?'<div style="display:grid;gap:6px">'+rows.map(b=>'<div style="padding:9px;border:1px solid #eee;border-radius:8px"><div><b>'+esc(b.branch_name)+'</b> · '+esc(dt(b.created_at))+'</div><small>Commit: <code>'+esc(String(b.commit_sha||'').slice(0,10))+'</code> · '+esc(b.created_by_email||'-')+'</small><div style="margin-top:5px"><a href="https://github.com/'+GITHUB_REPO+'/tree/'+encodeURIComponent(b.branch_name)+'" target="_blank" rel="noopener">Apri backup</a> · <a href="https://github.com/'+GITHUB_REPO+'/commit/'+encodeURIComponent(b.commit_sha)+'" target="_blank" rel="noopener">Apri commit</a></div></div>').join('')+'</div>':'<div class="empty">Nessun backup completo trovato.</div>';
    }catch(e){box.innerHTML='<div class="empty">Impossibile leggere i backup completi: '+esc(e.message||e)+'</div>'}
  }

  async function createCompleteProjectBackup(){
    if(!isSuper())return;
    const status=$('completeProjectBackupStatus');
    const button=$('createCompleteProjectBackup');
    if(button)button.disabled=true;
    if(status)status.innerHTML='<span class="notice">Creazione backup completo in corso...</span>';
    try{
      const c=client();
      if(!c?.functions?.invoke)throw new Error('Servizio backup non disponibile');
      const r=await c.functions.invoke(COMPLETE_PROJECT_BACKUP_FUNCTION,{method:'POST',body:{}});
      if(r.error)throw r.error;
      if(!r.data?.ok)throw new Error(r.data?.error||'Backup non creato');
      const b=r.data.backup||{};
      if(status)status.innerHTML='<span class="notice">✅ Backup completo creato: <code>'+esc(b.branch_name||'-')+'</code> · commit <code>'+esc(String(b.commit_sha||'').slice(0,10))+'</code></span>';
      await loadCompleteProjectBackups();
    }catch(e){
      if(status)status.innerHTML='<span class="notice" style="color:#b42318">❌ Backup non creato: '+esc(e.message||e)+'</span>';
    }finally{
      if(button)button.disabled=false;
    }
  }

  async function setCodeStatus(file,sha,status){
    if(!isSuper())return;
    const c=client(); if(!c)return;
    const user=(await c.auth.getUser())?.data?.user;
    const r=await c.from('code_backup_registry').upsert({file_path:file,commit_sha:sha,status,marked_by:user?.id||null,marked_by_email:user?.email||null,note:status==='STABILE'?'Versione approvata dal Superadmin':status==='PROBLEMATICA'?'Versione marcata come problematica':'Versione in test'},{onConflict:'file_path,commit_sha'});
    if(r.error){alert('Impossibile aggiornare lo stato: '+r.error.message);return}
    await loadCodeBackups();
  }

  async function requestCodeRestore(file,sha){
    if(!isSuper())return;
    if(!confirm('⚠️ ATTENZIONE: il ripristino del file può annullare modifiche successive, reintrodurre problemi o causare danni difficili da recuperare.\n\nVerifica prima il commit con Apri e Confronta.\n\nConfermi il ripristino COMPLETO di '+file+' alla versione '+sha.slice(0,10)+'? Verrà creato un nuovo commit senza cancellare la cronologia.'))return;
    const c=client(); if(!c)return;
    const r=await c.rpc('superadmin_request_code_restore',{p_file_path:file,p_commit_sha:sha});
    if(r.error){alert('Richiesta di ripristino non creata: '+r.error.message);return}
    alert('Richiesta registrata. GitHub Actions eseguirà automaticamente il ripristino e creerà un nuovo commit entro pochi minuti.');
    await loadCodeBackups();
  }

  async function restoreData(id){
    if(!isSuper()||!Number.isFinite(id))return;
    if(!confirm('⚠️ ATTENZIONE: il dato corrente verrà sostituito dallo snapshot. Se il backup è errato puoi perdere modifiche corrette e causare danni difficili o impossibili da recuperare.\n\nConfermi il ripristino del dato dal backup #'+id+'?'))return;
    const c=client(); if(!c)return;
    const r=await c.rpc('superadmin_restore_data_backup',{p_backup_id:id});
    if(r.error){alert('Ripristino dati non riuscito: '+r.error.message);return}
    alert('Ripristino dati completato.');
    await loadAudit();
    await loadDataBackups();
  }

  async function restore(id){
    if(!isSuper()||!Number.isFinite(id))return;
    if(!confirm('⚠️ ATTENZIONE: il torneo corrente verrà sostituito dai dati del backup. Un backup errato può causare perdita di modifiche e danni difficili o impossibili da recuperare.\n\nVerifica attentamente ID, nome, data e motivo del backup.\n\nConfermi il ripristino del torneo dal backup #'+id+'?'))return;
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
