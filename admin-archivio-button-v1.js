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
        return { year, date, name: t.nome || 'Torneo', time, id: t.id };
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
      html += '<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>' +
        '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Anno</th>' +
        '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Data</th>' +
        '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Nome Torneo</th>' +
        '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Ora</th>' +
        '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">ID Torneo</th>' +
        '</tr></thead><tbody>';
      rows.forEach(r => {
        html += `<tr><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.year)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.date)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.name)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.time)}</td><td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">${esc(r.id)}</td></tr>`;
      });
      html += '</tbody></table></div>';
    }

    panel.innerHTML = html;
    panel.querySelector('#closeAdminArchiveV1')?.addEventListener('click', () => { panel.style.display = 'none'; });
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
      if (String(torneo?.stato || '').toLowerCase() === 'archiviato') {
        option.remove();
      }
    });
    if (selector.value) {
      const current = (getState().tornei || []).find(t => String(t.id) === String(selector.value));
      if (String(current?.stato || '').toLowerCase() === 'archiviato') selector.value = '';
    }
  }

  function refreshArchiveUI() {
    refreshArchiveButton();
    setTimeout(filterArchivedFromMainSelector, 0);
    setTimeout(filterArchivedFromMainSelector, 50);
    setTimeout(filterArchivedFromMainSelector, 150);
  }

  function hookRender() {
    if (window.__ADMIN_ARCHIVE_BUTTON_V1__) return;
    const original = window.renderCleanAdmin;
    if (typeof original !== 'function') return;
    window.renderCleanAdmin = function (...args) {
      const result = original.apply(this, args);
      refreshArchiveUI();
      return result;
    };
    window.__ADMIN_ARCHIVE_BUTTON_V1__ = true;
    refreshArchiveUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookRender, { once: true });
  } else {
    hookRender();
  }
})();
