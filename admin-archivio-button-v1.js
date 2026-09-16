(() => {
  'use strict';

  function getState() {
    return window.adminState || { tornei: [] };
  }

  function getArchiveRows() {
    return (getState().tornei || [])
      .filter(t => String(t.stato || '').toLowerCase() === 'archiviato')
      .map(t => {
        const rawDate = t.data_torneo || t.data || t.created_at || '';
        const d = rawDate ? new Date(String(rawDate).slice(0, 10) + 'T00:00:00') : null;
        const year = d && !Number.isNaN(d.getTime()) ? d.getFullYear() : '-';
        const date = d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('it-IT') : (rawDate || '-');
        const time = t.ora_inizio || t.ora || t.configurazione?.ora_inizio || t.configurazione?.oraInizio || '-';
        return { year, date, name: t.nome || 'Torneo', time, id: t.id, sortDate: d && !Number.isNaN(d.getTime()) ? d.getTime() : 0 };
      });
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>\"]/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;'
    }[ch]));
  }

  function renderArchivePanel() {
    let panel = document.getElementById('adminArchivePanelV1');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'adminArchivePanelV1';
      panel.style.cssText = 'position:fixed;top:76px;right:18px;z-index:10000;display:none;width:min(760px,calc(100vw - 36px));max-height:72vh;overflow:auto;background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:16px;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.38)';
      document.body.appendChild(panel);
    }

    const rows = getArchiveRows();
    let html = '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><div><strong style="font-size:18px">📦 Archivio Tornei</strong><div style="opacity:.7;font-size:12px;margin-top:3px">Solo tornei archiviati</div></div><button type="button" id="closeAdminArchiveV1" style="border:0;background:none;color:#fff;font-size:20px;cursor:pointer">✕</button></div>';

    if (!rows.length) {
      html += '<div style="padding:18px 4px;opacity:.72">Nessun torneo archiviato.</div>';
    } else {
      const groups = new Map();
      rows.forEach(r => {
        const key = String(r.year);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(r);
      });

      const orderedGroups = [...groups.entries()].sort((a, b) => {
        const ay = Number(a[0]);
        const by = Number(b[0]);
        if (Number.isFinite(ay) && Number.isFinite(by)) return by - ay;
        if (Number.isFinite(ay)) return -1;
        if (Number.isFinite(by)) return 1;
        return a[0].localeCompare(b[0]);
      });

      orderedGroups.forEach(([year, groupRows], groupIndex) => {
        groupRows.sort((a, b) => b.sortDate - a.sortDate);
        const groupId = 'archiveYear_' + groupIndex;
        const isOpen = groupIndex === 0;

        html += `<div style="margin-top:${groupIndex ? '12px' : '4px'};border:1px solid rgba(255,255,255,.12);border-radius:10px;overflow:hidden">`;
        html += `<button type="button" data-archive-year-toggle="${groupId}" aria-expanded="${isOpen}" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border:0;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;text-align:left;font-size:14px;font-weight:700"><span>📁 Anno ${esc(year)}</span><span data-archive-year-arrow="${groupId}" style="font-size:12px;opacity:.75">${isOpen ? '▲' : '▼'}</span></button>`;
        html += `<div id="${groupId}" style="display:${isOpen ? 'block' : 'none'};padding:0 8px 8px">`;
        html += '<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Anno</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Data</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Nome Torneo</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Ora</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">ID Torneo</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Azioni</th>' +
          '</tr></thead><tbody>';
        groupRows.forEach(r => {
          html += `<tr><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.year)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.date)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.name)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.time)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.id)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)"><button type="button" class="btn" data-open-archived-tournament="${esc(r.id)}" style="padding:6px 10px">Apri</button></td></tr>`;
        });
        html += '</tbody></table></div></div></div>';
      });
    }

    panel.innerHTML = html;
    panel.querySelector('#closeAdminArchiveV1')?.addEventListener('click', () => { panel.style.display = 'none'; });
    panel.querySelectorAll('[data-archive-year-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-archive-year-toggle');
        const content = id ? panel.querySelector('#' + id) : null;
        const arrow = id ? panel.querySelector('[data-archive-year-arrow="' + id + '"]') : null;
        if (!content) return;
        const open = content.style.display !== 'none';
        content.style.display = open ? 'none' : 'block';
        button.setAttribute('aria-expanded', String(!open));
        if (arrow) arrow.textContent = open ? '▼' : '▲';
      });
    });
    panel.querySelectorAll('[data-open-archived-tournament]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-open-archived-tournament');
        if (!id) return;
        window.open('Bove.html?idTorneo=' + encodeURIComponent(id), '_blank');
      });
    });
    return panel;
  }

  function ensureArchiveButton() {
    const bar = document.getElementById('adminTournamentControls');
    if (!bar) return;
    let button = document.getElementById('adminArchiveOpenV1');
    if (!button) {
      button = document.createElement('button');
      button.id = 'adminArchiveOpenV1';
      button.type = 'button';
      button.className = 'btn action-tile';
      button.textContent = '📦 Archivio Tornei';
      bar.appendChild(button);
    }
    button.onclick = () => {
      const panel = renderArchivePanel();
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    };
  }

  function removeDuplicateArchiveActionButton() {
    const button = document.getElementById('adminArchiveTournament');
    if (button) button.remove();
  }

  function refreshArchiveButton() {
    setTimeout(ensureArchiveButton, 0);
    setTimeout(ensureArchiveButton, 50);
  }

  function filterArchivedFromMainSelector() {
    const selector = document.getElementById('torneoSelector');
    if (!selector) return;
    [...selector.options].forEach(option => {
      if (!option.value) return;
      const torneo = (getState().tornei || []).find(t => String(t.id) === String(option.value));
      if (String(torneo?.stato || '').toLowerCase() === 'archiviato') option.remove();
    });
    if (selector.value) {
      const current = (getState().tornei || []).find(t => String(t.id) === String(selector.value));
      if (String(current?.stato || '').toLowerCase() === 'archiviato') selector.value = '';
    }
  }

  function getClient() {
    return window.supabaseClient || window.sb || null;
  }

  async function deleteSelectedTournament() {
    const s = getState();
    const t = (s.tornei || []).find(x => String(x.id) === String(s.torneoSelezionato));
    if (!t) { alert('Seleziona prima un torneo.'); return false; }
    if (!confirm('ATTENZIONE: eliminare definitivamente il torneo "' + (t.nome || 'Torneo') + '" e tutti i dati collegati?')) return false;
    const client = getClient();
    if (!client) { alert('Connessione Supabase non disponibile.'); return false; }
    try {
      let r = await client.from('iscrizioni').delete().eq('torneo_id', t.id);
      if (r.error) throw new Error('Eliminazione iscrizioni non riuscita: ' + r.error.message);
      r = await client.from('iscritti').delete().eq('torneo_id', t.id);
      if (r.error) throw new Error('Eliminazione partecipanti non riuscita: ' + r.error.message);
      r = await client.from('tornei').delete().eq('id', t.id);
      if (r.error) throw new Error('Eliminazione torneo non riuscita: ' + r.error.message);
      s.tornei = (s.tornei || []).filter(x => String(x.id) !== String(t.id));
      s.torneoSelezionato = null;
      window.adminState = s;
      try { localStorage.removeItem('torneoState'); localStorage.removeItem('savedTeams'); } catch (e) {}
      try { localStorage.setItem('padel_admin_state', JSON.stringify(s)); } catch (e) {}
      if (typeof window.caricaTorneiSupabase === 'function') await window.caricaTorneiSupabase();
      else if (typeof window.renderCleanAdmin === 'function') window.renderCleanAdmin();
      alert('Torneo eliminato correttamente.');
      return true;
    } catch (e) {
      console.error('Errore eliminazione torneo:', e);
      alert(e?.message || 'Eliminazione torneo non riuscita.');
      return false;
    }
  }

  function ensureDeleteButton() {
    const root = document.getElementById('appContent');
    if (!root) return;
    const operations = [...root.querySelectorAll('.action-grid')].find(x => x.querySelector('#publish') && x.querySelector('#closeReg'));
    if (!operations) return;
    let button = document.getElementById('adminDeleteTournamentV1');
    if (!button) {
      button = document.createElement('button');
      button.id = 'adminDeleteTournamentV1';
      button.type = 'button';
      button.className = 'btn action-tile danger';
      button.innerHTML = '🗑️ <strong>Elimina torneo</strong><span>Elimina definitivamente il torneo</span>';
      operations.appendChild(button);
    }
    button.onclick = deleteSelectedTournament;
  }

  function refreshArchiveUI() {
    refreshArchiveButton();
    setTimeout(removeDuplicateArchiveActionButton, 0);
    setTimeout(removeDuplicateArchiveActionButton, 50);
    setTimeout(filterArchivedFromMainSelector, 0);
    setTimeout(filterArchivedFromMainSelector, 50);
    setTimeout(filterArchivedFromMainSelector, 150);
    setTimeout(ensureDeleteButton, 0);
    setTimeout(ensureDeleteButton, 50);
    setTimeout(ensureDeleteButton, 150);
  }

  function hookRender() {
    if (window.__ADMIN_ARCHIVE_BUTTON_V1__) return;
    window.__ADMIN_ARCHIVE_BUTTON_V1__ = true;
    window.addEventListener('admin:render', refreshArchiveUI);
    const appContent = document.getElementById('appContent');
    if (appContent) {
      const navigationObserver = new MutationObserver(() => {
        const archiveButtonMissing = !document.getElementById('adminArchiveOpenV1');
        const selector = document.getElementById('torneoSelector');
        const archivedVisible = !!selector && [...selector.options].some(option => {
          if (!option.value) return false;
          const torneo = (getState().tornei || []).find(t => String(t.id) === String(option.value));
          return String(torneo?.stato || '').toLowerCase() === 'archiviato';
        });
        if (archiveButtonMissing || archivedVisible) refreshArchiveUI();
      });
      navigationObserver.observe(appContent, { childList: true, subtree: true });
    }
    refreshArchiveUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookRender, { once: true });
  } else {
    hookRender();
  }
})();
