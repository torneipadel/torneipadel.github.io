(() => {
  function restoreNeutralFormulaFromAdmin() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('apriRegole') !== 'true') return;
      const raw = params.get('torneo');
      if (!raw) return;
      const torneo = JSON.parse(decodeURIComponent(raw));
      const rules = torneo?.configurazione?.rules || torneo?.rules || {};
      if (typeof state !== 'undefined' && state.rules) {
        if (rules.tipoTorneo === '') state.rules.tipoTorneo = '';
        if (rules.formatoTorneo === '') state.rules.formatoTorneo = '';
        if (rules.formulaGironi === '') state.rules.formulaGironi = '';
        if (rules.formulaFinale === '') state.rules.formulaFinale = '';
      }
    } catch (e) { console.error('Errore ripristino formula neutra:', e); }
  }

  function preserveTournamentResults() {
    try {
      if (typeof generaPartiteGironi !== 'function' || typeof state === 'undefined') return;
      if (window.__BOVE_RESULTS_PATCHED__) return;
      const original = generaPartiteGironi;
      window.__BOVE_RESULTS_PATCHED__ = true;
      generaPartiteGironi = function () {
        const saved = {};
        ['A','B','C','D','E','F','G'].forEach(g => ['res','time','camp'].forEach(suffix => {
          const key = g + suffix;
          if (Array.isArray(state[key]) && state[key].length) saved[key] = state[key].slice();
        }));
        original();
        Object.keys(saved).forEach(key => {
          if (Array.isArray(state[key]) && state[key].length === saved[key].length) state[key] = saved[key];
        });
      };
    } catch (e) { console.error('Errore protezione risultati torneo:', e); }
  }

  preserveTournamentResults();

  function preserveKOLegacyKeys() {
    try {
      if (typeof window.updateKOField !== 'function' || typeof window.state === 'undefined') return;
      if (window.__BOVE_KO_KEYS_PATCHED__) return;
      const original = window.updateKOField;
      window.updateKOField = function(type, index, field, valore) {
        const v = String(valore ?? '').trim();
        if (type === 'S') {
          if (!Array.isArray(state.sCamp)) state.sCamp = [];
          if (!Array.isArray(state.sTime)) state.sTime = [];
          state[field === 'camp' ? 'sCamp' : 'sTime'][index] = v;
        } else if (type === 'F') {
          if (!Array.isArray(state.fCamp)) state.fCamp = [];
          if (!Array.isArray(state.fTime)) state.fTime = [];
          state[field === 'camp' ? 'fCamp' : 'fTime'][index] = v;
        }
        return original(type, index, field, valore);
      };
      window.__BOVE_KO_KEYS_PATCHED__ = true;
    } catch (e) { console.error('Errore compatibilita chiavi KO:', e); }
  }

  preserveKOLegacyKeys();

  function openRequestedRules() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('apriRegole') !== 'true') return;
      restoreNeutralFormulaFromAdmin();
      if (typeof window.openRules === 'function') window.openRules();
    } catch (e) { console.error('Errore apertura configurazione formula:', e); }
  }

  document.addEventListener('DOMContentLoaded', openRequestedRules, { once: true });

  function captureKOFieldsBeforeSave(s) {
    if (!s) return;
    const capture = (selector, campKey, timeKey, count) => {
      const rows = [...document.querySelectorAll(selector + ' tr')].filter(row => row.querySelector('.campo-cell input') || row.querySelector('.orario-cell input'));
      if (!Array.isArray(s[campKey])) s[campKey] = Array(count).fill('');
      if (!Array.isArray(s[timeKey])) s[timeKey] = Array(count).fill('');
      for (let i = 0; i < count; i++) {
        const row = rows[i];
        if (!row) continue;
        const camp = row.querySelector('.campo-cell input');
        const time = row.querySelector('.orario-cell input');
        if (camp) s[campKey][i] = camp.value || '';
        if (time) s[timeKey][i] = time.value || '';
      }
    };
    capture('tbody#S', 'sCamp', 'sTime', 2);
    capture('tbody#finaleBox', 'fCamp', 'fTime', 1);
  }

  async function salvaTorneoBove() {
    const client = window.supabaseClient || window.sb;
    const s = typeof state !== 'undefined' ? state : null;
    const id = s?.idTorneo || new URLSearchParams(location.search).get('idTorneo');
    if (!client || !id) { alert('Torneo non disponibile.'); return false; }
    captureKOFieldsBeforeSave(s);
    const snapshot = (() => { try { return JSON.parse(JSON.stringify(s || {})); } catch (e) { return {}; } })();
    const rules = snapshot.rules || {};
    const payload = { configurazione: snapshot, nome: snapshot.nomeTorneo || undefined, data_torneo: snapshot.dataTorneo || undefined, posti: Number(rules.numeroSquadre) || undefined, formula: rules.formulaScelta || snapshot.formula || undefined };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    const { error } = await client.from('tornei').update(payload).eq('id', id);
    if (error) { console.error(error); alert('Salvataggio torneo non riuscito: ' + error.message); return false; }
    try { localStorage.setItem('torneoState', JSON.stringify(snapshot)); } catch (e) {}
    alert('Torneo salvato correttamente.');
    return true;
  }

  async function archiviaTorneoBove() {
    const client = window.supabaseClient || window.sb;
    const s = typeof state !== 'undefined' ? state : null;
    const id = s?.idTorneo || new URLSearchParams(location.search).get('idTorneo');
    if (!client || !id) { alert('Torneo non disponibile.'); return false; }
    if (!confirm('Confermi la chiusura definitiva e l\'archiviazione del torneo?')) return false;
    if (!(await salvaTorneoBove())) return false;
    const { error } = await client.from('tornei').update({ stato: 'archiviato', iscrizioni_chiuse: true, pubblicato: false }).eq('id', id);
    if (error) { alert('Archiviazione non riuscita: ' + error.message); return false; }
    if (s) { s.stato = 'archiviato'; s.iscrizioni_chiuse = true; }
    alert('Torneo archiviato correttamente.');
    return true;
  }

  async function eliminaTorneoBove() {
    const client = window.supabaseClient || window.sb;
    const id = (typeof state !== 'undefined' ? state?.idTorneo : null) || new URLSearchParams(location.search).get('idTorneo');
    if (!client || !id) { alert('Torneo non disponibile.'); return false; }
    if (!confirm('ATTENZIONE: eliminare definitivamente questo torneo e le relative iscrizioni?')) return false;

    const r1 = await client.from('iscrizioni').delete().eq('torneo_id', id);
    if (r1.error) {
      alert('Eliminazione iscrizioni non riuscita: ' + r1.error.message);
      return false;
    }

    const r2 = await client.from('tornei').delete().eq('id', id);
    if (r2.error) {
      alert('Eliminazione torneo non riuscita: ' + r2.error.message);
      return false;
    }

    try {
      localStorage.removeItem('torneoState');
      localStorage.removeItem('savedTeams');
    } catch (e) {}

    window.location.href = 'admin.html';
    return true;
  }

  async function leggiStatoRemoto(client, id) {
    try {
      const { data, error } = await client
        .from('tornei')
        .select('stato')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Errore lettura stato torneo:', error);
        return null;
      }

      return data ? data.stato : null;
    } catch (e) {
      console.error('Errore lettura stato torneo:', e);
      return null;
    }
  }

  function preservaStatoTorneo(nomeFunzione) {
    try {
      const originale = window[nomeFunzione];
      if (typeof originale !== 'function') return;
      const flag = '__BOVE_STATUS_PATCHED_' + nomeFunzione + '__';
      if (window[flag]) return;

      window[nomeFunzione] = async function (...args) {
        const client = window.supabaseClient || window.sb;
        const s = typeof state !== 'undefined' ? state : null;
        const id = s?.idTorneo || new URLSearchParams(location.search).get('idTorneo');

        let statoOriginale = null;

        if (client && id) {
          statoOriginale = await leggiStatoRemoto(client, id);
        }

        let risultato;

        try {
          risultato = await originale.apply(this, args);
        } finally {
          if (client && id && statoOriginale !== null && statoOriginale !== undefined) {
            const { error } = await client
              .from('tornei')
              .update({ stato: statoOriginale })
              .eq('id', id);

            if (error) {
              console.error('Errore ripristino stato torneo:', error);
            }
          }
        }

        return risultato;
      };

      window[flag] = true;
    } catch (e) {
      console.error('Errore protezione stato torneo:', e);
    }
  }

  /*
   * RIPARAZIONE ANOMALIA ARCHIVIO:
   * Bove.html contiene vecchi salvataggi che impostano sempre
   * stato='attivo'. Prima di ciascun salvataggio leggiamo lo stato
   * reale del torneo e, se il torneo esiste già, lo ripristiniamo
   * dopo il salvataggio. Un nuovo torneo resta normalmente 'attivo'.
   */
  preservaStatoTorneo('updateAndSync');
  preservaStatoTorneo('salvaTorneoSupabase');

  let saveInProgress = false;

  document.addEventListener('click', async function(event) {
    const button = event.target && event.target.closest ? event.target.closest('#menuComandi button') : null;
    if (!button || !/salva/i.test(button.textContent || '')) return;
    event.preventDefault();
    event.stopPropagation();
    if (saveInProgress) return;
    saveInProgress = true;
    try { await salvaTorneoBove(); }
    finally { saveInProgress = false; }
  }, true);

  function neutralizeSaveButton() {
    const menu = document.getElementById('menuComandi');
    if (!menu) return;
    const save = [...menu.querySelectorAll('button')].find(b => /salva/i.test(b.textContent || ''));
    if (!save) return;
    save.disabled = false;
    save.removeAttribute('disabled');
    save.textContent = '💾 Salva Torneo';
    save.removeAttribute('onclick');
    save.onclick = null;
  }

  window.salvaTorneoBove = salvaTorneoBove;
  window.archiviaTorneoBove = archiviaTorneoBove;
  window.eliminaTorneoBove = eliminaTorneoBove;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', neutralizeSaveButton, { once: true });
  } else {
    neutralizeSaveButton();
  }
})();