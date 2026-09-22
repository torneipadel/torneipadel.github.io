(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let mounted = false;

  function move(id, parent) {
    const el = $(id);
    if (el && parent) parent.appendChild(el);
    return el;
  }

  function button(label, className, handler) {
    const b = document.createElement('button');
    b.className = `desktop-btn ${className || ''}`.trim();
    b.type = 'button';
    b.textContent = label;
    if (handler) b.addEventListener('click', handler);
    return b;
  }

  function mount() {
    const area = $('areaAdmin');
    if (!area || mounted) return;
    mounted = true;

    const old = {
      title: area.querySelector(':scope > h1'),
      create: area.querySelector(':scope > details:nth-of-type(1)'),
      tournaments: area.querySelector(':scope > details:nth-of-type(2)'),
      manage: $('gestioneTorneoAdmin'),
      news: area.querySelector(':scope > details:nth-of-type(3)'),
      sponsors: area.querySelector(':scope > details:nth-of-type(4)')
    };

    const shell = document.createElement('div');
    shell.className = 'desktop-app';
    shell.innerHTML = `
      <aside class="desktop-sidebar">
        <div class="desktop-brand">
          <div class="desktop-brand-icon">🏆</div>
          <div><strong>ADMIN TORNEI</strong><span>Gestione campionati</span></div>
        </div>
        <div class="desktop-nav-section">Gestione</div>
        <nav class="desktop-nav">
          <button class="active" data-target="tornei">🏆 <span>Tornei</span></button>
          <button data-target="iscritti">👥 <span>Iscritti</span></button>
          <button data-target="coppie">🔀 <span>Accoppiamenti</span></button>
          <button data-target="tabellone">📋 <span>Tabellone</span></button>
        </nav>
        <div class="desktop-nav-section">Sistema</div>
        <nav class="desktop-nav">
          <button data-target="config">⚙️ <span>Configurazione</span></button>
          <button data-target="link">🔗 <span>Link pubblici</span></button>
        </nav>
        <div class="desktop-sidebar-bottom">● Amministratore<br><span>Console gestione tornei</span></div>
      </aside>
      <main class="desktop-main">
        <header class="desktop-topbar">
          <div class="desktop-breadcrumb">Gestione / <b>Tornei</b></div>
          <div class="desktop-top-actions"></div>
        </header>
        <section class="desktop-content">
          <div class="desktop-page-title">
            <div><h1>Dashboard Tornei</h1><p>Panoramica e accesso rapido alle operazioni amministrative.</p></div>
            <div class="desktop-title-actions"></div>
          </div>
          <div class="desktop-stats"></div>
          <div class="desktop-grid">
            <div class="desktop-card desktop-tournaments"><div class="desktop-card-head"><h2>🏆 Tornei</h2><span>Elenco recente</span></div><div class="desktop-card-body desktop-tournament-body"></div></div>
            <div class="desktop-card"><div class="desktop-card-head"><h2>⚡ Azioni rapide</h2><span>Operazioni frequenti</span></div><div class="desktop-card-body desktop-quick"></div></div>
          </div>
          <div class="desktop-lower"></div>
        </section>
      </main>`;

    area.classList.add('desktop-mode');
    area.innerHTML = '';
    area.appendChild(shell);

    const top = shell.querySelector('.desktop-top-actions');
    const titleActions = shell.querySelector('.desktop-title-actions');
    const lower = shell.querySelector('.desktop-lower');
    const tournamentBody = shell.querySelector('.desktop-tournament-body');
    const quick = shell.querySelector('.desktop-quick');
    const stats = shell.querySelector('.desktop-stats');

    const refresh = button('↻ Aggiorna', '', () => {
      if (typeof caricaTorneiSupabase === 'function') caricaTorneiSupabase();
      if (typeof caricaNewsAdmin === 'function') caricaNewsAdmin();
      if (typeof caricaSponsorAdmin === 'function') caricaSponsorAdmin();
    });
    const settings = button('⚙ Impostazioni');
    const exit = button('↪ Esci', '', () => {
      if (typeof logoutAdmin === 'function') {
        logoutAdmin();
      }
    });
    const newTop = button('＋ Nuovo torneo', 'primary', () => {
      if (old.create) { old.create.open = true; lower.scrollIntoView({behavior:'smooth'}); }
    });
    top.append(refresh, settings, newTop, exit);
    titleActions.appendChild(button('＋ Crea torneo', 'primary', () => {
      if (old.create) { old.create.open = true; lower.scrollIntoView({behavior:'smooth'}); }
    }));

    function renderStats() {
      const tornei = Array.isArray(window.adminState?.tornei) ? window.adminState.tornei : [];
      const attivi = tornei.filter(t => t && (t.stato === 'attivo' || t.pubblicato === true)).length;
      const iscritti = Array.isArray(window.iscrizioniTorneo) ? window.iscrizioniTorneo.length : 0;
      const approvati = Array.isArray(window.iscrizioniTorneo) ? window.iscrizioniTorneo.filter(x => x && (x.stato === 'approvato' || x.approvato === true)).length : 0;
      const daApprovare = Math.max(0, iscritti - approvati);
      stats.innerHTML = '';
      [['Tornei attivi', attivi, '● Online'],['Iscritti', iscritti, 'Dati reali'],['Da approvare', daApprovare, 'Richiedono attenzione'],['Tabelloni', tornei.length, 'Tornei disponibili']].forEach(([l,v,n]) => {
        const s=document.createElement('div'); s.className='desktop-stat'; s.innerHTML=`<div class="desktop-stat-label">${l}</div><div class="desktop-stat-value">${v}</div><div class="desktop-stat-note">${n}</div>`; stats.appendChild(s);
      });
    }

    function renderTournaments() {
      const tornei = Array.isArray(window.adminState?.tornei) ? window.adminState.tornei : [];
      tournamentBody.innerHTML = '';
      if (!tornei.length) { tournamentBody.innerHTML = '<p class="desktop-muted">Nessun torneo creato.</p>'; return; }
      tornei.slice(0,8).forEach(t => {
        const row=document.createElement('div'); row.className='desktop-tournament-row';
        const info=document.createElement('div'); info.className='desktop-t-info';
        const name=document.createElement('strong'); name.textContent=t.nome || 'Torneo senza nome';
        const small=document.createElement('small'); small.textContent=`${t.data || '-'} · ${t.posti || '-'} posti`;
        const st=document.createElement('span'); st.className='desktop-status' + (t.stato === 'chiuso' ? ' closed' : ''); st.textContent=`● ${t.stato || 'bozza'}`;
        info.append(name,small,st);
        const actions=document.createElement('div'); actions.className='desktop-actions';
        actions.appendChild(button('Gestisci','',()=>{ if(typeof selezionaTorneoAdmin==='function') selezionaTorneoAdmin(t.id); setTimeout(()=>renderAll(),150); }));
        actions.appendChild(button('🔗','',()=>{ if(typeof generaLinkBove==='function'){ if(typeof selezionaTorneoAdmin==='function') selezionaTorneoAdmin(t.id); setTimeout(()=>generaLinkBove(),150); } }));
        actions.appendChild(button('Elimina','',()=>{
          if (typeof eliminaTorneo === 'function') eliminaTorneo(t.id);
        }));
        row.append(info,actions); tournamentBody.appendChild(row);
      });
    }

    function renderQuick() {
      quick.innerHTML='';
      const items=[
        ['👥 Approva iscritti','Gestisci le richieste',()=>{ activate('iscritti'); }],
        ['🔀 Accoppiamenti','Gestisci le coppie',()=>{ activate('coppie'); }],
        ['📋 Apri tabellone','Apri il torneo selezionato',()=>{ if(typeof apriBoveConTorneo==='function' && window.adminState?.torneoSelezionato) apriBoveConTorneo(window.adminState.torneoSelezionato); }],
        ['🔗 Copia link','Link pubblico',()=>{ if(typeof copiaLinkBove==='function') copiaLinkBove(); }]
      ];
      items.forEach(([a,b,fn])=>{const q=button('','');q.innerHTML=`<b>${a}</b><span>${b}</span>`;q.addEventListener('click',fn);quick.appendChild(q);});
    }

    function moveLower() {
      if (old.create) lower.appendChild(old.create);
      if (old.tournaments) { old.tournaments.style.display='none'; }
      if (old.manage) lower.appendChild(old.manage);
      if (old.news) lower.appendChild(old.news);
      if (old.sponsors) lower.appendChild(old.sponsors);
    }

    function activate(target) {
      shell.querySelectorAll('.desktop-nav button').forEach(b=>b.classList.toggle('active',b.dataset.target===target));
      if(target==='tornei') shell.querySelector('.desktop-tournaments')?.scrollIntoView({behavior:'smooth'});
      else if(target==='iscritti' || target==='coppie') {
        if (old.manage) { old.manage.classList.remove('hidden'); old.manage.open = true; old.manage.scrollIntoView({behavior:'smooth'}); }
        if(target==='iscritti') setTimeout(()=>document.getElementById('richiesteIscrizione')?.scrollIntoView({behavior:'smooth'}),250);
        if(target==='coppie') setTimeout(()=>document.getElementById('creaCoppieBox')?.scrollIntoView({behavior:'smooth'}),250);
      } else if(target==='config') old.create?.scrollIntoView({behavior:'smooth'});
      else if(target==='link') document.getElementById('linkBoveGenerato')?.scrollIntoView({behavior:'smooth'});
      else if(target==='tabellone' && typeof apriBoveConTorneo==='function' && window.adminState?.torneoSelezionato) apriBoveConTorneo(window.adminState.torneoSelezionato);
    }

    shell.querySelectorAll('.desktop-nav button').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.target)));
    moveLower();
    renderStats(); renderTournaments(); renderQuick();

    window.__adminDesktopRender = () => { renderStats(); renderTournaments(); renderQuick(); };
  }

  function watch() {
    const area = $('areaAdmin');
    if (!area) return;
    if (!mounted && !area.classList.contains('hidden')) mount();
    if (mounted && window.__adminDesktopRender) window.__adminDesktopRender();
  }

  document.addEventListener('DOMContentLoaded', () => {
    watch();
    setTimeout(watch, 250);
    setTimeout(watch, 1000);
    const observer = new MutationObserver(() => setTimeout(watch, 0));
    observer.observe(document.body, {subtree:true, attributes:true, attributeFilter:['class']});
  });
})();
