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
    capture('tbody#S', 'sTopCamp', 'sTopTime', 2);
    capture('tbody#finaleBox', 'fTopCamp', 'fTopTime', 1);

    /* Compatibilità con i nomi storici letti da loadState(). */
    s.sCamp = Array.isArray(s.sTopCamp) ? s.sTopCamp.slice() : [];
    s.sTime = Array.isArray(s.sTopTime) ? s.sTopTime.slice() : [];
    s.fCamp = Array.isArray(s.fTopCamp) ? s.fTopCamp.slice() : [''];
    s.fTime = Array.isArray(s.fTopTime) ? s.fTopTime.slice() : [''];
  }

  function restoreKOFieldKeysAfterLoad(s) {
    if (!s) return s;

    if ((!Array.isArray(s.sTopCamp) || s.sTopCamp.every(v => !String(v || '').trim())) && Array.isArray(s.sCamp)) {
      s.sTopCamp = s.sCamp.slice();
    }
    if ((!Array.isArray(s.sTopTime) || s.sTopTime.every(v => !String(v || '').trim())) && Array.isArray(s.sTime)) {
      s.sTopTime = s.sTime.slice();
    }
    if ((!Array.isArray(s.fTopCamp) || s.fTopCamp.every(v => !String(v || '').trim())) && Array.isArray(s.fCamp)) {
      s.fTopCamp = s.fCamp.slice();
    }
    if ((!Array.isArray(s.fTopTime) || s.fTopTime.every(v => !String(v || '').trim())) && Array.isArray(s.fTime)) {
      s.fTopTime = s.fTime.slice();
    }

    return s;
  }

  /*
   * loadState() recupera ancora i nomi storici sCamp/sTime/fCamp/fTime.
   * Il motore del tabellone usa invece sTopCamp/sTopTime/fTopCamp/fTopTime.
   * Riallineiamo i dati subito dopo il caricamento, senza sostituire
   * o riscrivere la macchina di caricamento esistente.
   */
  try {
    if (typeof window.loadState === 'function' && !window.__BOVE_KO_LOAD_PATCHED__) {
      const originalLoadState = window.loadState;
      window.__BOVE_KO_LOAD_PATCHED__ = true;
      window.loadState = async function () {
        const result = await originalLoadState.apply(this, arguments);
        const restored = restoreKOFieldKeysAfterLoad(result || (typeof state !== 'undefined' ? state : null));
        if (typeof renderKO === 'function') renderKO();
        return restored;
      };
    }
  } catch (e) {
    console.error('Errore patch caricamento campi KO:', e);
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
    if (r1.error) { alert('Eliminazione iscrizioni non riuscita: ' + r1.error.message); return false; }
    const r2 = await client.from('iscritti').delete().eq('torneo_id', id);
    if (r2.error) { alert('Eliminazione partecipanti non riuscita: ' + r2.error.message); return false; }
    const r3 = await client.from('tornei').delete().eq('id', id);
    if (r3.error) { alert('Eliminazione torneo non riuscita: ' + r3.error.message); return false; }
    try { localStorage.removeItem('torneoState'); localStorage.removeItem('savedTeams'); } catch (e) {}
    window.location.href = 'admin.html';
    return true;
  }

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