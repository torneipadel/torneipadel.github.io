(() => {
  'use strict';

  function getClient() {
    return window.supabaseClient || window.sb || null;
  }

  function getState() {
    return window.adminState || { tornei: [] };
  }

  function dateOf(t) {
    const raw = t?.data_torneo || t?.data || t?.created_at || '';
    if (!raw) return null;
    const d = new Date(String(raw).slice(0, 10) + 'T00:00:00');
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function nameOf(t) {
    return String(t?.nome || t?.titolo || 'Torneo senza nome');
  }

  function isArchived(t) {
    return String(t?.stato || '').trim().toLowerCase() === 'archiviato';
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>\"]/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '\"': '&quot;'
    }[ch]));
  }

  async function loadArchivedFromServer() {
    const client = getClient();
    if (!client) return [];

    const { data, error } = await client
      .from('tornei')
      .select('id,nome,data,data_torneo,created_at,stato,pubblicato,iscrizioni_chiuse')
      .eq('stato', 'archiviato')
      .order('data_torneo', { ascending: false });

    if (error) {
      console.error('Errore caricamento Archivio Tornei:', error);
      return [];
    }

    return Array.isArray(data) ? data : [];
  }

  function removeArchivedFromMainSelector() {
    const select = document.getElementById('torneoSelector');
    if (!select) return;

    [...select.options].forEach(option => {
      if (!option.value) return;
      const torneo = (getState().tornei || []).find(
        t => String(t.id) === String(option.value)
      );
      if (isArchived(torneo)) option.remove();
    });

    const selected = (getState().tornei || []).find(
      t => String(t.id) === String(select.value)
    );
    if (isArchived(selected)) {
      select.value = '';
      getState().torneoSelezionato = null;
    }
  }

  function getPanel() {
    let panel = document.getElementById('adminArchivePanelV1');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'adminArchivePanelV1';
      panel.style.cssText = 'position:fixed;top:76px;right:18px;z-index:10000;display:none;width:min(760px,calc(100vw - 36px));max-height:82vh;overflow:auto;background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:16px;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.38)';
      document.body.appendChild(panel);
    }
    return panel;
  }

  async function renderArchivePanel() {
    const panel = getPanel();
    panel.style.display = 'block';
    panel.innerHTML = '<div style="padding:18px;text-align:center;opacity:.8">Caricamento archivio…</div>';

    const rows = await loadArchivedFromServer();
    const groups = {};

    rows.forEach(t => {
      const d = dateOf(t);
      const year = d ? String(d.getFullYear()) : 'Senza anno';
      if (!groups[year]) groups[year] = [];
      groups[year].push(t);
    });

    const years = Object.keys(groups).sort((a, b) => {
      if (a === 'Senza anno') return 1;
      if (b === 'Senza anno') return -1;
      return Number(b) - Number(a);
    });

    let html = '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">' +
      '<div><strong style="font-size:18px">📦 Archivio Tornei</strong><div style="opacity:.7;font-size:12px;margin-top:3px">Solo tornei archiviati</div></div>' +
      '<button type="button" id="closeAdminArchiveV1" style="border:0;background:none;color:#fff;font-size:20px;cursor:pointer">✕</button></div>';

    if (!years.length) {
      html += '<div style="padding:18px 4px;opacity:.72">Nessun torneo archiviato.</div>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:8px">';

      years.forEach(year => {
        const items = groups[year].slice().sort((a, b) => {
          return (dateOf(b)?.getTime() || 0) - (dateOf(a)?.getTime() || 0);
        });

        html += '<details style="border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden">';
        html += '<summary style="cursor:pointer;padding:12px 14px;font-weight:700;list-style:none;display:flex;align-items:center;justify-content:space-between">' +
          '<span>Anno ' + esc(year) + '</span>' +
          '<span style="opacity:.7;font-size:12px">' + items.length + ' torneo' + (items.length === 1 ? '' : 'i') + '</span></summary>';

        html += '<div style="overflow:auto;padding:0 10px 10px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Mese</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Giorno</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Torneo</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">ID Torneo</th>' +
          '<th style="text-align:left;padding:9px;border-bottom:1px solid rgba(255,255,255,.16)">Apri</th>' +
          '</tr></thead><tbody>';

        items.forEach(t => {
          const d = dateOf(t);
          const month = d ? String(d.getMonth() + 1).padStart(2, '0') : '-';
          const day = d ? String(d.getDate()).padStart(2, '0') : '-';

          html += '<tr>';
          html += '<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">' + esc(month) + '</td>';
          html += '<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">' + esc(day) + '</td>';
          html += '<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">' + esc(nameOf(t)) + '</td>';
          html += '<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)">' + esc(t.id) + '</td>';
          html += '<td style="padding:9px;border-bottom:1px solid rgba(255,255,255,.08)"><button type="button" class="btn primary" data-open-archived-tournament="' + esc(t.id) + '" style="padding:6px 10px">Apri</button></td>';
          html += '</tr>';
        });

        html += '</tbody></table></div></details>';
      });

      html += '</div>';
    }

    panel.innerHTML = html;
    panel.querySelector('#closeAdminArchiveV1')?.addEventListener('click', () => {
      panel.style.display = 'none';
    });

    panel.querySelectorAll('[data-open-archived-tournament]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-open-archived-tournament');
        if (!id) return;
        if (typeof window.apriBoveConTorneo === 'function') {
          window.apriBoveConTorneo(id);
        } else {
          window.open('Bove.html?idTorneo=' + encodeURIComponent(id), '_blank');
        }
      });
    });
  }

  function ensureArchiveButton() {
    const bar = document.getElementById('adminTournamentControls');
    if (!bar) {
      removeArchivedFromMainSelector();
      return;
    }

    const legacy = document.getElementById('adminArchiveOpen');
    if (legacy) legacy.remove();

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
      const panel = getPanel();
      if (panel.style.display === 'block') {
        panel.style.display = 'none';
      } else {
        renderArchivePanel();
      }
    };

    removeArchivedFromMainSelector();
  }

  function refreshArchiveButton() {
    setTimeout(ensureArchiveButton, 0);
    setTimeout(ensureArchiveButton, 50);
  }

  function hookRender() {
    if (window.__ADMIN_ARCHIVE_BUTTON_V1__) return;
    const original = window.renderCleanAdmin;
    if (typeof original !== 'function') return;

    window.renderCleanAdmin = function (...args) {
      const result = original.apply(this, args);
      refreshArchiveButton();
      return result;
    };

    window.__ADMIN_ARCHIVE_BUTTON_V1__ = true;
    refreshArchiveButton();
  }

  window.renderArchivePanel = renderArchivePanel;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookRender, { once: true });
  } else {
    hookRender();
  }
})();
