/* Admin navigation cleanup: one creation entry, no injected configuration menu. */
(() => {
  'use strict';

  const pageAliases = { config: 'configurazione', configurazione: 'configurazione' };
  const titles = {
    dashboard: 'Tornei',
    iscritti: 'Iscritti',
    coppie: 'Accoppiamenti',
    tabellone: 'Tabellone',
    configurazione: 'Nuovo torneo',
    news: 'News',
    sponsor: 'Sponsor',
    link: 'Link pubblici'
  };

  function show(page) {
    page = pageAliases[page] || page || 'dashboard';
    const target = document.getElementById('page-' + page);
    if (!target) return false;

    document.querySelectorAll('.admin-page').forEach(el => el.classList.remove('active'));
    target.classList.add('active');
    document.querySelectorAll('.sidebar .nav button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    const crumb = document.getElementById('breadcrumbTitle');
    if (crumb) crumb.textContent = titles[page] || 'Gestione';

    if (page === 'configurazione') {
      const h = target.querySelector('h1');
      const p = target.querySelector('.page-title p');
      if (h) h.textContent = '＋ Nuovo torneo';
      if (p) p.textContent = 'Inserisci i dati di base del torneo. Le regole e la formula saranno configurate in Bove.';
      target.querySelectorAll('button').forEach(btn => {
        if ((btn.textContent || '').toLowerCase().includes('regole')) btn.remove();
      });
    }

    try { history.replaceState(null, '', '#' + page); } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }

  function clean() {
    const area = document.getElementById('areaAdmin');
    if (!area) return;

    // Configuration is a creation screen, not a sidebar section.
    area.querySelectorAll('.sidebar .nav button[data-page="configurazione"]').forEach(btn => btn.remove());
    area.querySelectorAll('.top-actions button[data-page="configurazione"]').forEach(btn => {
      const text = (btn.textContent || '').toLowerCase();
      if (text.includes('impostazioni') || text.includes('nuovo torneo')) btn.remove();
    });

    const sections = [...area.querySelectorAll('.nav-section')];
    sections.forEach(section => {
      if ((section.textContent || '').trim().toLowerCase() === 'sistema') {
        const nav = section.nextElementSibling;
        if (nav && nav.classList.contains('nav')) nav.remove();
        section.remove();
      }
    });

    const create = area.querySelector('#page-dashboard .page-title button[data-page="configurazione"]');
    if (create) {
      create.textContent = '＋ Nuovo torneo';
      create.type = 'button';
      create.onclick = e => { e.preventDefault(); e.stopPropagation(); show('configurazione'); };
    }

    const cfg = area.querySelector('#page-configurazione');
    if (cfg) {
      const h = cfg.querySelector('.page-title h1');
      const p = cfg.querySelector('.page-title p');
      if (h) h.textContent = '＋ Nuovo torneo';
      if (p) p.textContent = 'Inserisci i dati di base del torneo. Le regole e la formula saranno configurate in Bove.';
      cfg.querySelectorAll('button').forEach(btn => {
        if ((btn.textContent || '').toLowerCase().includes('regole')) btn.remove();
      });
    }
  }

  window.openAdminPage = show;
  window.goAdminPage = show;
  window.adminGoPage = show;
  window.apriRegoleNuovoTorneo = () => show('configurazione');

  function boot() {
    clean();
    const hash = location.hash.slice(1).toLowerCase();
    if (hash === 'config') show('configurazione');
    else if (hash && document.getElementById('page-' + hash)) show(hash);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  new MutationObserver(clean).observe(document.documentElement, { childList: true, subtree: true });
})();
