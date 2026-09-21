/* admin-system-monitor-v1.js */
(function () {
  'use strict';

  const REPO = 'torneirobertobove/torneirobertobove.github.io';
  const DB_LIMIT = 500 * 1024 * 1024;
  const STORAGE_LIMIT = 1024 * 1024 * 1024;
  const GIT_TARGET = 1024 * 1024 * 1024;
  const $ = (id) => document.getElementById(id);

  const fmtBytes = (bytes) => {
    const n = Number(bytes) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 ** 2) return (n / 1024).toFixed(1) + ' KB';
    if (n < 1024 ** 3) return (n / 1024 ** 2).toFixed(2) + ' MB';
    return (n / 1024 ** 3).toFixed(2) + ' GB';
  };
  const pct = (value, limit) => Math.max(0, Math.min(100, (Number(value) || 0) / limit * 100));
  const status = (p) => p >= 90 ? ['CRITICO', 'critical'] : p >= 75 ? ['ATTENZIONE', 'warning'] : ['OK', 'ok'];
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const dateIt = (v) => { try { return new Date(v).toLocaleString('it-IT'); } catch (_) { return '-'; } };

  function bar(p, cls) {
    return '<div class="asm-meter"><div class="asm-meter-fill ' + cls + '" style="width:' + p.toFixed(1) + '%"></div></div>';
  }


  function providerMenu(title, id, content, openDefault) {
    return '<details class="asm-provider-menu" id="' + id + '"' + (openDefault ? ' open' : '') + '><summary>' + title + '</summary><div class="asm-provider-content">' + content + '</div></details>';
  }

  function supabasePanel(db) {
    const dbBytes = Number(db.database_bytes) || 0;
    const storageBytes = Number(db.storage_bytes) || 0;
    const dbPct = (dbBytes / DB_LIMIT) * 100;
    const storagePct = (storageBytes / STORAGE_LIMIT) * 100;
    const overDb = Math.max(0, dbBytes - DB_LIMIT) / (1024 ** 3);
    const overStorage = Math.max(0, storageBytes - STORAGE_LIMIT) / (1024 ** 3);
    const overCost = overDb * 0.125 + overStorage * 0.021;
    const alerts = [];
    function alertLine(name, pct, detail) {
      if (pct >= 100) alerts.push('<div class="asm-alert asm-alert-critical">🔴 <b>' + name + ':</b> limite raggiunto/superato — ' + pct.toFixed(1) + '% · ' + detail + '</div>');
      else if (pct >= 90) alerts.push('<div class="asm-alert asm-alert-critical">🔴 <b>' + name + ':</b> livello critico — ' + pct.toFixed(1) + '% · ' + detail + '</div>');
      else if (pct >= 75) alerts.push('<div class="asm-alert asm-alert-warning">🟠 <b>' + name + ':</b> attenzione — ' + pct.toFixed(1) + '% · ' + detail + '</div>');
    }
    alertLine('Database', dbPct, 'quota Free 500 MB');
    alertLine('Storage', storagePct, 'quota Free 1 GB');
    if (!alerts.length) alerts.push('<div class="asm-alert asm-alert-ok">🟢 Nessun alert Supabase sulle soglie monitorate.</div>');
    return '<div class="asm-section"><h3>📊 Utilizzo e limiti</h3>' +
      limitGraph([{label:'Database',value:dbBytes,limit:DB_LIMIT},{label:'Storage',value:storageBytes,limit:STORAGE_LIMIT}]) +
      '<div class="asm-grid">' +
      card('Database',fmtBytes(dbBytes),'Quota Free: 500 MB',dbPct) +
      card('Storage',fmtBytes(storageBytes),(Number(db.storage_objects)||0)+' oggetti · quota Free 1 GB',storagePct) +
      card('Utenti Auth',String(Number(db.auth_users)||0),'Quota Free: 50.000 MAU; conteggio utenti presenti',0,'ok') +
      '</div></div>' +
      '<div class="asm-section"><h3>🚨 Alert Supabase</h3>' + alerts.join('') + '</div>' +
      '<div class="asm-section"><h3>💰 Costi Supabase</h3><div class="asm-cost-grid">' +
      '<div class="asm-cost-card"><b>Piano attuale</b><strong>Free · $0/mese</strong><span>Database 500 MB · Storage 1 GB · Egress 5 GB · 50.000 MAU inclusi</span></div>' +
      '<div class="asm-cost-card"><b>Eventuale eccedenza misurabile</b><strong>' + (overCost > 0 ? '$' + overCost.toFixed(2) + '/mese' : '$0 misurabile') + '</strong><span>Database oltre quota: $0,125/GB · Storage oltre quota: $0,021/GB. Egress e MAU richiedono Usage/Billing.</span></div>' +
      '<div class="asm-cost-card"><b>Piano Pro</b><strong>$25/mese + eventuale uso eccedente</strong><span>Quota Pro: 8 GB database/progetto · 100 GB Storage · 250 GB egress · 100.000 MAU inclusi.</span></div>' +
      '</div><div class="asm-note">⚠️ La stima non è una fattura reale.</div></div>';
  }

  function githubPanel(git) {
    const gitBytes = (Number(git.size) || 0) * 1024;
    const gitPct = (gitBytes / GIT_TARGET) * 100;
    const alerts = [];
    if (git.__monitorFallback) alerts.push('<div class="asm-alert asm-alert-info">🔵 <b>GitHub:</b> utilizzo live temporaneamente non disponibile; è attivo il dato locale di sicurezza.</div>');
    else if (gitPct >= 100) alerts.push('<div class="asm-alert asm-alert-critical">🔴 <b>Repository:</b> raggiunta/superata la soglia prudenziale di 1 GB.</div>');
    else if (gitPct >= 90) alerts.push('<div class="asm-alert asm-alert-critical">🔴 <b>Repository:</b> livello critico — ' + gitPct.toFixed(1) + '% della soglia prudenziale.</div>');
    else if (gitPct >= 75) alerts.push('<div class="asm-alert asm-alert-warning">🟠 <b>Repository:</b> attenzione — ' + gitPct.toFixed(1) + '% della soglia prudenziale.</div>');
    else alerts.push('<div class="asm-alert asm-alert-ok">🟢 Nessun alert GitHub sulla soglia prudenziale del repository.</div>');
    alerts.push('<div class="asm-alert asm-alert-info">ℹ️ <b>Actions / Packages / LFS:</b> quote e alert ufficiali esistono, ma i consumi reali non sono leggibili dal monitor browser senza billing autenticato.</div>');
    return '<div class="asm-section"><h3>📦 Repository e soglia monitor</h3>' +
      limitGraph([{label:'Repository — soglia prudenziale',value:gitBytes,limit:GIT_TARGET}]) +
      '<div class="asm-grid">' +
      card('Repository',fmtBytes(gitBytes),'Soglia prudenziale interna: 1 GB',gitPct) +
      card('Ultimo push',git.pushed_at ? dateIt(git.pushed_at) : (git.__monitorFallback ? 'Temporaneamente non disponibile' : '-'),'Branch: '+(git.default_branch||'main'),0,'ok') +
      '</div></div>' +
      '<div class="asm-section"><h3>🚨 Alert GitHub</h3>' + alerts.join('') + '</div>' +
      '<div class="asm-section"><h3>💰 Costi GitHub</h3><div class="asm-cost-grid">' +
      '<div class="asm-cost-card"><b>Piano Free</b><strong>$0/mese</strong><span>Repository pubblico: nessun costo per la dimensione del codice.</span></div>' +
      '<div class="asm-cost-card"><b>Actions</b><strong>500 MB + 2.000 minuti/mese inclusi</strong><span>Servizio separato dal limite del repository.</span></div>' +
      '<div class="asm-cost-card"><b>Packages</b><strong>500 MB + 1 GB trasferimento/mese inclusi</strong><span>Consumi separati dal repository.</span></div>' +
      '<div class="asm-cost-card"><b>Git LFS</b><strong>10 GB storage + 10 GB banda/mese inclusi</strong><span>Consumi separati dal repository.</span></div>' +
      '</div><div class="asm-note">⚠️ Eventuali eccedenze dei servizi a consumo dipendono dall\'utilizzo e dalle impostazioni di billing GitHub.</div></div>';
  }


  function automationPanel() {
    return '<div class="asm-section"><h3>🤖 Automazione 100% — quando serve acquistare</h3>' +
      '<div class="asm-note"><b>Regola semplice:</b> il piano Free resta sufficiente finché vuoi approvare/generare/inviare manualmente. Un acquisto serve quando vuoi che il sistema esegua automaticamente anche il passaggio che oggi richiede il tuo intervento.</div>' +
      '<div class="asm-cost-grid">' +
        '<div class="asm-cost-card"><b>📰 NEWS — situazione attuale</b><strong>FREE · manuale assistita</strong><span>Creazione, modifica, pubblicazione e locandine sono gestibili dall\'Admin. L\'AI può essere collegata via API, ma l\'automazione completa richiede un servizio AI a consumo.</span></div>' +
        '<div class="asm-cost-card"><b>📰 NEWS — 100% automatica</b><strong>AI API + generazione immagine</strong><span>Flusso possibile: dati evento → testo AI → immagine AI → locandina con template → salvataggio → pubblicazione. Le immagini API sono a consumo: ad esempio OpenAI GPT Image 2 ha prezzi indicativi da circa $0,006 per immagine 1024×1024 in qualità bassa; il costo cresce con qualità/dimensione.</span></div>' +
        '<div class="asm-cost-card"><b>💬 WHATSAPP — situazione attuale</b><strong>FREE · invio manuale</strong><span>Il sistema prepara messaggio, destinatari e link WhatsApp; l\'invio finale richiede ancora l\'azione dell\'amministratore. Non è presente un mittente API automatico.</span></div>' +
        '<div class="asm-cost-card"><b>💬 WHATSAPP — 100% automatica</b><strong>WhatsApp Business Platform/API · costo variabile</strong><span>Serve un account/API ufficiale e la gestione dei messaggi secondo le tariffe Meta applicabili a categoria, mercato e volume. Il monitor non inventa un canone fisso: il costo va calcolato sul traffico reale.</span></div>' +
      '</div>' +
      '<h4 style="margin:14px 0 8px">🟢 Quando NON acquistare</h4><div class="asm-alert asm-alert-ok">Se News e WhatsApp vengono confermati manualmente dall\'amministratore, non è necessario aggiungere API a pagamento solo per il normale funzionamento.</div>' +
      '<h4 style="margin:14px 0 8px">🟠 Quando PREPARARSI</h4><div class="asm-alert asm-alert-warning">Se vuoi eliminare attività ripetitive — scrittura automatica, locandine automatiche, pubblicazione automatica o invio automatico WhatsApp — è il momento di definire il budget e il provider, ma non significa che il piano Free sia già insufficiente.</div>' +
      '<h4 style="margin:14px 0 8px">🔴 Quando ACQUISTARE</h4><div class="asm-alert asm-alert-critical">Acquistare/attivare il servizio solo quando viene richiesta l\'automazione senza intervento umano. In quel caso il costo dipende soprattutto da numero di news/locandine generate e messaggi WhatsApp inviati.</div>' +
      '<div class="asm-note">💡 Architettura consigliata: AI per testo/immagine + template deterministico per inserire dati esatti di torneo/offerta + Supabase per salvataggio/pubblicazione + WhatsApp Business Platform per l\'invio automatico. Così i dati come data, ora, prezzo e nome torneo non dipendono dalla precisione grafica dell\'AI.</div>' +
      '</div>';
  }

  function costPanel(db, git) {
    const dbBytes = Number(db.database_bytes) || 0;
    const storageBytes = Number(db.storage_bytes) || 0;
    const dbOver = Math.max(0, dbBytes - DB_LIMIT) / (1024 ** 3);
    const storageOver = Math.max(0, storageBytes - STORAGE_LIMIT) / (1024 ** 3);
    const known = dbOver * 0.125 + storageOver * 0.021;
    return '<div class="asm-section"><h3>💰 Costi e rischio di eccedenza</h3>' +
      '<div class="asm-cost-grid">' +
        '<div class="asm-cost-card"><b>Supabase — piano attuale</b><strong>Free · $0/mese</strong><span>Database 500 MB · Storage 1 GB · Egress 5 GB · 50.000 MAU inclusi</span></div>' +
        '<div class="asm-cost-card"><b>Supabase — eventuale eccedenza</b><strong>' + (known > 0 ? known.toFixed(2) + '/mese' : '$0 misurabile') + '</strong><span>Database oltre quota: $0,125/GB · Storage oltre quota: $0,021/GB. Egress e MAU richiedono Usage/Billing.</span></div>' +
        '<div class="asm-cost-card"><b>Supabase — piano Pro</b><strong>$25/mese + eventuale uso eccedente</strong><span>Quota Pro: 8 GB database/progetto, 100 GB Storage, 250 GB egress e 100.000 MAU inclusi.</span></div>' +
        '<div class="asm-cost-card"><b>GitHub — piano Free</b><strong>$0/mese per il repository pubblico</strong><span>Repository pubblico: la dimensione del codice non è una voce di costo. Actions: 500 MB storage + 2.000 minuti/mese inclusi; Packages: 500 MB + 1 GB trasferimento/mese; Git LFS: 10 GB storage + 10 GB banda/mese. Le eccedenze dei prodotti a consumo possono essere fatturate.</span></div>' +
      '</div>' +
      '<div class="asm-note">⚠️ Stima delle sole eccedenze DB/Storage calcolabili dal monitor; non è una fattura reale. Il monitor mostra le quote GitHub ufficiali, ma non inventa i consumi reali di Actions, Packages o LFS finché non sono disponibili i dati di billing autenticati.</div>' +
    '</div>';
  }

  function card(title, value, sub, p, kind) {
    const s = status(p);
    return '<div class="asm-card">' +
      '<div class="asm-card-title">' + esc(title) + '</div>' +
      '<div class="asm-card-value">' + esc(value) + '</div>' +
      '<div class="asm-card-sub">' + esc(sub) + '</div>' +
      bar(p, kind || s[1]) +
      '<div class="asm-card-foot"><b class="' + s[1] + '">' + s[0] + '</b><span>' + p.toFixed(1) + '%</span></div>' +
    '</div>';
  }

  function limitGraph(items) {
    return '<div class="asm-limit-graph">' +
      items.map(x => {
        const usedPct = pct(x.value, x.limit);
        const s = status(usedPct);
        return '<div class="asm-limit-row">' +
          '<div class="asm-limit-head"><b>' + esc(x.label) + '</b><span>' + esc(fmtBytes(x.value)) + ' / ' + esc(fmtBytes(x.limit)) + '</span></div>' +
          '<div class="asm-limit-track"><div class="asm-limit-used ' + s[1] + '" style="width:' + usedPct.toFixed(1) + '%"></div><div class="asm-limit-max"></div></div>' +
          '<div class="asm-limit-foot"><span>Utilizzo ' + usedPct.toFixed(1) + '%</span><span>Massimo ' + esc(fmtBytes(x.limit)) + '</span></div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  async function readSupabase() {
    const c = window.supabaseClient || window.sb;
    if (!c || typeof c.rpc !== 'function') throw new Error('Client Supabase non disponibile');
    const r = await c.rpc('admin_monitor_snapshot');
    if (r.error) throw r.error;
    return r.data || {};
  }

  const GITHUB_CACHE_KEY = '__NP_ADMIN_GITHUB_MONITOR__';
  const GITHUB_CACHE_TTL = 10 * 60 * 1000;
  const GITHUB_FALLBACK = {
    name: 'torneirobertobove.github.io',
    full_name: REPO,
    size: 65605,
    default_branch: 'main',
    pushed_at: null,
    __monitorFallback: true
  };

  function readGitHubCache() {
    try {
      const raw = sessionStorage.getItem(GITHUB_CACHE_KEY);
      if (!raw) return null;
      const x = JSON.parse(raw);
      if (!x || !x.data) return null;
      return x;
    } catch (_) {
      return null;
    }
  }

  function writeGitHubCache(data) {
    try {
      sessionStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify({ saved_at: Date.now(), data }));
    } catch (_) {}
  }

  async function readGitHub(force) {
    const cached = readGitHubCache();
    const age = cached ? Date.now() - Number(cached.saved_at || 0) : Infinity;

    if (!force && cached && age < GITHUB_CACHE_TTL) {
      return cached.data;
    }

    try {
      const r = await fetch('https://api.github.com/repos/' + REPO, {
        headers: { 'Accept': 'application/vnd.github+json' },
        cache: 'no-store'
      });
      if (!r.ok) throw new Error('GitHub HTTP ' + r.status);
      const data = await r.json();
      writeGitHubCache(data);
      return data;
    } catch (e) {
      if (cached && cached.data) {
        const data = Object.assign({}, cached.data, {
          __monitorStale: true,
          __monitorStaleAt: cached.saved_at
        });
        return data;
      }
      return Object.assign({}, GITHUB_FALLBACK, {
        __monitorFallback: true,
        __monitorError: e?.message || String(e)
      });
    }
  }

  function ensureStyle() {
    if ($('adminSystemMonitorStyle')) return;
    const s = document.createElement('style');
    s.id = 'adminSystemMonitorStyle';
    s.textContent = `
      .asm-wrap{font-family:inherit;color:#334155;max-width:1100px}
      .asm-head{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
      .asm-title{font-size:22px;font-weight:800}.asm-sub{font-size:13px;color:#64748b;margin-top:3px}
      .asm-actions{display:flex;gap:8px;flex-wrap:wrap}.asm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .asm-card{background:rgba(255,255,255,.78);border:1px solid rgba(15,23,42,.10);border-radius:14px;padding:14px;box-sizing:border-box}
      .asm-card-title{font-size:13px;font-weight:700;color:#64748b}.asm-card-value{font-size:24px;font-weight:850;margin:5px 0 2px;color:#0f172a}
      .asm-card-sub{font-size:12px;color:#64748b;min-height:30px}.asm-meter{height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin-top:10px}
      .asm-meter-fill{height:100%;border-radius:99px;background:#16a34a}.asm-meter-fill.warning{background:#d97706}.asm-meter-fill.critical{background:#dc2626}
      .asm-card-foot{display:flex;justify-content:space-between;font-size:12px;margin-top:7px}.ok{color:#15803d}.warning{color:#b45309}.critical{color:#b91c1c}
      .asm-limit-graph{display:grid;gap:15px}.asm-limit-row{display:grid;gap:5px}.asm-limit-head,.asm-limit-foot{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:#475569}
      .asm-limit-head b{font-size:13px;color:#0f172a}.asm-limit-track{position:relative;height:18px;border-radius:99px;background:#e2e8f0;overflow:hidden;border:1px solid rgba(15,23,42,.08)}
      .asm-limit-used{height:100%;border-radius:99px;background:#16a34a;min-width:2px}.asm-limit-used.warning{background:#d97706}.asm-limit-used.critical{background:#dc2626}
      .asm-limit-max{position:absolute;right:0;top:0;bottom:0;width:2px;background:#0f172a}.asm-provider-menu{margin:12px 0;border:1px solid #ddd;border-radius:10px;background:#fff;overflow:hidden}.asm-provider-menu>summary{cursor:pointer;list-style:none;padding:15px 18px;font-weight:700;font-size:15px}.asm-provider-menu>summary::-webkit-details-marker{display:none}.asm-provider-menu>summary:before{content:'▸';display:inline-block;margin-right:8px}.asm-provider-menu[open]>summary:before{content:'▾'}.asm-provider-content{padding:0 12px 12px}.asm-alert{padding:10px 12px;border-radius:8px;margin:7px 0}.asm-alert-warning{background:#fff3cd;color:#7a5700}.asm-alert-critical{background:#f8d7da;color:#842029}.asm-alert-info{background:#dbeafe;color:#1e3a8a}.asm-alert-ok{background:#dcfce7;color:#166534}.asm-cost-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.asm-cost-card{padding:12px;border:1px solid rgba(15,23,42,.10);border-radius:12px;background:rgba(255,255,255,.75);display:grid;gap:5px}.asm-cost-card b{font-size:13px;color:#475569}.asm-cost-card strong{font-size:18px;color:#0f172a}.asm-cost-card span{font-size:12px;color:#64748b;line-height:1.4}.asm-section{margin-top:16px;background:rgba(255,255,255,.70);border:1px solid rgba(15,23,42,.10);border-radius:14px;padding:14px}
      .asm-section h3{margin:0 0 10px;font-size:15px}.asm-table{width:100%;border-collapse:collapse;font-size:13px}.asm-table th,.asm-table td{text-align:left;padding:7px 5px;border-bottom:1px solid rgba(15,23,42,.08)}
      .asm-note{font-size:12px;color:#64748b;line-height:1.45;margin-top:10px}.asm-error{padding:12px;border-radius:10px;background:#fee2e2;color:#991b1b;font-size:13px}
      @media(max-width:800px){.asm-grid{grid-template-columns:1fr 1fr}.asm-cost-grid{grid-template-columns:1fr}}@media(max-width:520px){.asm-grid{grid-template-columns:1fr}.asm-card-value{font-size:21px}}
    `;
    document.head.appendChild(s);
  }

  let monitorTimer = null;
  let renderBusy = false;

  function stopAutoRefresh() {
    if (monitorTimer) { clearInterval(monitorTimer); monitorTimer = null; }
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    monitorTimer = setInterval(() => {
      if (!$('asmBody') || !$('asmRefresh')) { stopAutoRefresh(); return; }
      render(true);
    }, 30000);
  }

  async function render(silent) {
    if (renderBusy) return;
    renderBusy = true;
    ensureStyle();
    const root = $('appContent');
    if (!root) { renderBusy = false; return; }

    root.innerHTML = '<div class="asm-wrap"><div class="asm-head"><div><div class="asm-title">📊 Stato reale GitHub + Supabase</div><div class="asm-sub">Lettura diretta al momento dell\'aggiornamento.</div></div><div class="asm-actions"><button type="button" class="btn" id="asmRefresh">↻ Aggiorna</button></div></div><div id="asmBody">Caricamento dati reali…</div></div>';
    $('asmRefresh')?.addEventListener('click', () => render(false));

    const body = $('asmBody');
    try {
      const [db, git] = await Promise.all([readSupabase(), readGitHub(!silent)]);
      const dbBytes = Number(db.database_bytes) || 0;
      const storageBytes = Number(db.storage_bytes) || 0;
      const dbPct = pct(dbBytes, DB_LIMIT);
      const storagePct = pct(storageBytes, STORAGE_LIMIT);
      const gitBytes = (Number(git.size) || 0) * 1024;
      const gitPct = pct(gitBytes, GIT_TARGET);
      const totalRows = ['tornei','iscrizioni','profili','news','sponsor','mercatino'].reduce((a, k) => a + (Number(db[k]) || 0), 0);

      body.innerHTML =
        '<div class="asm-section"><h3>📌 Panoramica</h3><div class="asm-note">Apri il menu Supabase o il menu GitHub per vedere separatamente utilizzo, limiti, alert e costi.</div></div>' +
        providerMenu('🟢 SUPABASE — utilizzo, limiti, alert e costi','asmSupabaseMenu',supabasePanel(db),true) +
        providerMenu('⚫ GITHUB — repository, limiti, alert e costi','asmGithubMenu',githubPanel(git),false) +
        automationPanel() +
        '<div class="asm-section"><h3>📋 Dati applicativi Supabase</h3><table class="asm-table"><thead><tr><th>Tabella</th><th>Record</th></tr></thead><tbody>' +
          [['tornei',db.tornei],['iscrizioni',db.iscrizioni],['profili',db.profili],['news',db.news],['sponsor',db.sponsor],['mercatino',db.mercatino]]
          .map(x => '<tr><td>' + esc(x[0]) + '</td><td><b>' + Number(x[1]||0) + '</b></td></tr>').join('') +
          '</tbody></table></div>' +
        '<div class="asm-section"><h3>🔄 Controllo operativo</h3>' +
          '<div class="asm-note">Aggiornamento automatico ogni 30 secondi. Il pulsante ↻ Aggiorna resta disponibile per un aggiornamento manuale.</div>' +
          '<div class="asm-note">Ultimo aggiornamento monitor: <b>' + dateIt(db.generated_at || new Date()) + '</b></div>' +
        '</div>';
    } catch (e) {
      body.innerHTML = '<div class="asm-error">Impossibile leggere il monitor: ' + esc(e?.message || e) + '<br><small>Il resto di admin.html non viene modificato.</small></div>';
    } finally {
      renderBusy = false;
      startAutoRefresh();
    }
  }

  function open() {
    const app = $('areaAdmin');
    if (!app || app.classList.contains('hidden')) return false;
    document.querySelectorAll('#areaAdmin .sidebar .nav button[data-page]').forEach(x => x.classList.remove('active'));
    if ($('topbarTitle')) $('topbarTitle').textContent = 'Stato risorse';
    stopAutoRefresh();
    try {
      render(false);
    } catch (e) {
      const root = $('appContent');
      if (root) root.innerHTML = '<div class="asm-wrap"><div class="asm-error">Impossibile aprire il monitor: ' + esc(e?.message || e) + '</div></div>';
      renderBusy = false;
      startAutoRefresh();
    }
    return true;
  }

  function bind() {
    if (window.__adminSystemMonitorBound) return;
    window.__adminSystemMonitorBound = true;
    const handler = (ev) => {
      const side = ev.target?.closest?.('#sideSystemMonitor');
      const mobile = ev.target?.closest?.('#mobileSystemMonitor');
      if (!side && !mobile) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (mobile) $('mobileOverlay')?.classList.remove('open');
      open();
    };
    document.addEventListener('click', handler, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();

  window.apriMonitorSistema = open;
})();