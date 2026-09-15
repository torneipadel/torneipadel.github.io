(() => {
  'use strict';

  // Questo file era stato aggiunto per una seconda implementazione dell'Archivio.
  // L'Archivio reale è già gestito da admin-functions.js.
  // Manteniamo il file intatto come riferimento ma non installiamo un secondo flusso.
  function hookRender() { return; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookRender, { once: true });
  } else {
    hookRender();
  }
})();