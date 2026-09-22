(function () {
  "use strict";

  var results = [];
  var started = Date.now();

  function add(status, name, detail) {
    results.push({
      status: status,
      name: name,
      detail: detail || ""
    });
  }

  function pass(name, detail) {
    add("PASS", name, detail);
  }

  function fail(name, detail) {
    add("FAIL", name, detail);
  }

  function warn(name, detail) {
    add("WARN", name, detail);
  }

  function hasElement(id) {
    return !!document.getElementById(id);
  }

  function hasSelector(selector) {
    return !!document.querySelector(selector);
  }

  function hasFunction(name) {
    return typeof window[name] === "function";
  }

  function testElement(id, label) {
    if (hasElement(id)) {
      pass(label || ("Elemento #" + id), "presente");
    } else {
      fail(label || ("Elemento #" + id), "MANCANTE");
    }
  }

  function testFunction(name) {
    if (hasFunction(name)) {
      pass("Funzione " + name, "disponibile");
    } else {
      warn("Funzione " + name, "non presente");
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================
     1. DOCUMENTO
     ========================================================= */

  if (document && document.body) {
    pass("Documento HTML", "caricato correttamente");
  } else {
    fail("Documento HTML", "body non disponibile");
  }

  if (document.title) {
    pass("Titolo pagina", document.title);
  } else {
    warn("Titolo pagina", "titolo non impostato");
  }

  /* =========================================================
     2. CSS E LAYOUT
     ========================================================= */

  if (hasSelector(".desktop-app")) {
    pass("Layout desktop", ".desktop-app presente");
  } else {
    fail("Layout desktop", ".desktop-app MANCANTE");
  }

  if (hasSelector(".desktop-sidebar")) {
    pass("Sidebar desktop", "presente");
  } else {
    fail("Sidebar desktop", "MANCANTE");
  }

  if (hasSelector(".desktop-main")) {
    pass("Main desktop", "presente");
  } else {
    fail("Main desktop", "MANCANTE");
  }

  if (hasSelector(".desktop-topbar")) {
    pass("Topbar desktop", "presente");
  } else {
    warn("Topbar desktop", "non trovata");
  }

  if (hasSelector(".desktop-content")) {
    pass("Contenuto desktop", "presente");
  } else {
    fail("Contenuto desktop", "MANCANTE");
  }

  var cssLinks = document.querySelectorAll('link[rel="stylesheet"]');

  if (cssLinks.length > 0) {
    pass("Foglio CSS", cssLinks.length + " stylesheet trovati");
  } else {
    fail("Foglio CSS", "nessun stylesheet trovato");
  }

  var desktopCssFound = false;

  for (var c = 0; c < cssLinks.length; c++) {
    var href = cssLinks[c].getAttribute("href") || "";

    if (href.indexOf("admin-desktop.css") !== -1) {
      desktopCssFound = true;
      pass("admin-desktop.css", href);
    }
  }

  if (!desktopCssFound) {
    fail("admin-desktop.css", "non collegato");
  }

  /* =========================================================
     3. PAGINE ADMIN
     ========================================================= */

  var pages = [
    "dashboard",
    "configurazione",
    "iscritti",
    "coppie",
    "tabellone",
    "news",
    "sponsor",
    "whatsapp",
    "link"
  ];

  for (var p = 0; p < pages.length; p++) {
    var pageId = "page-" + pages[p];

    if (hasElement(pageId)) {
      pass(
        "Pagina " + pages[p],
        "#" + pageId + " presente"
      );
    } else {
      warn(
        "Pagina " + pages[p],
        "#" + pageId + " non trovato"
      );
    }
  }

  /* =========================================================
     4. MENU
     ========================================================= */

  var navButtons = document.querySelectorAll(
    ".desktop-nav button, .nav button, [data-page]"
  );

  if (navButtons.length > 0) {
    pass(
      "Menu amministrazione",
      navButtons.length + " elementi trovati"
    );
  } else {
    fail(
      "Menu amministrazione",
      "nessun pulsante di navigazione trovato"
    );
  }

  var expectedNav = [
    "dashboard",
    "configurazione",
    "iscritti",
    "coppie",
    "tabellone",
    "news",
    "sponsor",
    "whatsapp",
    "link"
  ];

  for (var n = 0; n < expectedNav.length; n++) {
    var navFound = false;

    for (var b = 0; b < navButtons.length; b++) {
      var target =
        navButtons[b].getAttribute("data-page") ||
        navButtons[b].getAttribute("data-target") ||
        navButtons[b].getAttribute("onclick") ||
        "";

      if (
        target.toLowerCase().indexOf(
          expectedNav[n].toLowerCase()
        ) !== -1
      ) {
        navFound = true;
        break;
      }
    }

    if (navFound) {
      pass(
        "Menu " + expectedNav[n],
        "collegamento trovato"
      );
    } else {
      warn(
        "Menu " + expectedNav[n],
        "collegamento non rilevato"
      );
    }
  }

  /* =========================================================
     5. NAVIGAZIONE
     ========================================================= */

  testFunction("openAdminPage");

  if (typeof window.normalizzaPagina === "function") {
    pass(
      "normalizzaPagina",
      "funzione disponibile"
    );

    try {
      var normalizedWhatsapp =
        window.normalizzaPagina("whatsapp");

      if (normalizedWhatsapp === "whatsapp") {
        pass(
          "Navigazione WhatsApp",
          "normalizzaPagina('whatsapp') restituisce whatsapp"
        );
      } else {
        fail(
          "Navigazione WhatsApp",
          "restituisce " + String(normalizedWhatsapp)
        );
      }
    } catch (e) {
      fail(
        "Navigazione WhatsApp",
        "errore: " + e.message
      );
    }
  } else {
    warn(
      "normalizzaPagina",
      "funzione non disponibile"
    );
  }

  /* =========================================================
     6. FUNZIONI PUBBLICHE
     ========================================================= */

  var functions = [
    "avviaAdmin",
    "loginAdmin",
    "logoutAdmin",
    "caricaTorneiAdmin",
    "caricaTornei",
    "creaTorneo",
    "eliminaTorneo",
    "pubblicaTorneo",
    "chiudiTorneo",
    "caricaIscrizioni",
    "approvaIscrizione",
    "rifiutaIscrizione",
    "caricaPartecipanti",
    "generaCoppie",
    "generaCoppieLocali",
    "inviaWhatsApp",
    "caricaNews",
    "creaNews",
    "modificaNews",
    "eliminaNews",
    "caricaSponsor",
    "creaSponsor",
    "modificaSponsor",
    "eliminaSponsor",
    "caricaCalendario",
    "generaLink",
    "copiaLink",
    "apriLink"
  ];

  for (var f = 0; f < functions.length; f++) {
    testFunction(functions[f]);
  }

  /* =========================================================
     7. DASHBOARD
     ========================================================= */

  var dashboardElements = [
    "totTornei",
    "totIscritti",
    "totCoppie",
    "totPartite"
  ];

  for (var d = 0; d < dashboardElements.length; d++) {
    if (hasElement(dashboardElements[d])) {
      pass(
        "Dashboard #" + dashboardElements[d],
        "presente"
      );
    } else {
      warn(
        "Dashboard #" + dashboardElements[d],
        "elemento non trovato"
      );
    }
  }

  /* =========================================================
     8. ISCRITTI
     ========================================================= */

  var iscrittiElements = [
    "listaIscritti",
    "listaPartecipanti",
    "tabellaIscritti"
  ];

  var iscrittiFound = false;

  for (var i = 0; i < iscrittiElements.length; i++) {
    if (hasElement(iscrittiElements[i])) {
      pass(
        "Area iscritti",
        "#" + iscrittiElements[i] + " presente"
      );

      iscrittiFound = true;
    }
  }

  if (!iscrittiFound) {
    warn(
      "Area iscritti",
      "contenitore lista non rilevato"
    );
  }

  /* =========================================================
     9. COPPIE E TABELLONE
     ========================================================= */

  var coppieSelectors = [
    "#listaCoppie",
    "#coppieContainer",
    "#tabellone",
    "#tabelloneContainer"
  ];

  var coppieFound = false;

  for (var cp = 0; cp < coppieSelectors.length; cp++) {
    if (hasSelector(coppieSelectors[cp])) {
      pass(
        "Area coppie/tabellone",
        coppieSelectors[cp] + " presente"
      );

      coppieFound = true;
    }
  }

  if (!coppieFound) {
    warn(
      "Area coppie/tabellone",
      "contenitore non rilevato"
    );
  }

  /* =========================================================
     10. NEWS
     ========================================================= */

  var newsSelectors = [
    "#listaNews",
    "#newsContainer",
    "#newsList"
  ];

  var newsFound = false;

  for (var nw = 0; nw < newsSelectors.length; nw++) {
    if (hasSelector(newsSelectors[nw])) {
      pass(
        "Area News",
        newsSelectors[nw] + " presente"
      );

      newsFound = true;
    }
  }

  if (!newsFound) {
    warn(
      "Area News",
      "contenitore non rilevato"
    );
  }

  /* =========================================================
     11. SPONSOR
     ========================================================= */

  var sponsorSelectors = [
    "#listaSponsor",
    "#sponsorContainer",
    "#sponsorList"
  ];

  var sponsorFound = false;

  for (var sp = 0; sp < sponsorSelectors.length; sp++) {
    if (hasSelector(sponsorSelectors[sp])) {
      pass(
        "Area Sponsor",
        sponsorSelectors[sp] + " presente"
      );

      sponsorFound = true;
    }
  }

  if (!sponsorFound) {
    warn(
      "Area Sponsor",
      "contenitore non rilevato"
    );
  }

  /* =========================================================
     12. WHATSAPP
     ========================================================= */

  if (hasElement("whatsapp")) {
    pass(
      "Pagina WhatsApp",
      "#whatsapp presente"
    );
  } else if (hasElement("page-whatsapp")) {
    pass(
      "Pagina WhatsApp",
      "#page-whatsapp presente"
    );
  } else {
    fail(
      "Pagina WhatsApp",
      "contenitore WhatsApp MANCANTE"
    );
  }

  var whatsappButtons = document.querySelectorAll(
    "#whatsapp button, #page-whatsapp button"
  );

  if (whatsappButtons.length > 0) {
    pass(
      "Pulsanti WhatsApp",
      whatsappButtons.length + " trovati"
    );
  } else {
    warn(
      "Pulsanti WhatsApp",
      "nessun pulsante trovato"
    );
  }

  /* =========================================================
     13. LINK
     ========================================================= */

  var linkSelectors = [
    "#link",
    "#page-link",
    "#linkContainer",
    "#linkTorneo"
  ];

  var linkFound = false;

  for (var l = 0; l < linkSelectors.length; l++) {
    if (hasSelector(linkSelectors[l])) {
      pass(
        "Area Link",
        linkSelectors[l] + " presente"
      );

      linkFound = true;
    }
  }

  if (!linkFound) {
    warn(
      "Area Link",
      "contenitore link non rilevato"
    );
  }

  /* =========================================================
     14. LOGIN
     ========================================================= */

  var loginSelectors = [
    "#loginAdmin",
    "#adminLogin",
    "#loginForm",
    "#passwordAdmin"
  ];

  var loginFound = false;

  for (var lg = 0; lg < loginSelectors.length; lg++) {
    if (hasSelector(loginSelectors[lg])) {
      pass(
        "Login",
        loginSelectors[lg] + " presente"
      );

      loginFound = true;
    }
  }

  if (!loginFound) {
    warn(
      "Login",
      "elementi login non rilevati"
    );
  }

  /* =========================================================
     15. SUPABASE
     ========================================================= */

  if (window.supabase) {
    pass(
      "Supabase globale",
      "window.supabase presente"
    );
  } else {
    warn(
      "Supabase globale",
      "window.supabase non presente"
    );
  }

  if (window.supabaseClient) {
    pass(
      "Supabase client",
      "window.supabaseClient presente"
    );
  } else {
    warn(
      "Supabase client",
      "window.supabaseClient non presente"
    );
  }

  if (window._supabase) {
    pass(
      "_supabase",
      "client presente"
    );
  } else {
    warn(
      "_supabase",
      "client non presente"
    );
  }

  /* =========================================================
     16. ADMIN STATE
     ========================================================= */

  if (window.adminState) {
    pass(
      "adminState",
      "stato amministrazione presente"
    );

    if (
      typeof window.adminState === "object" &&
      !Array.isArray(window.adminState)
    ) {
      pass(
        "adminState struttura",
        "oggetto valido"
      );
    } else {
      warn(
        "adminState struttura",
        "tipo inatteso"
      );
    }
  } else {
    warn(
      "adminState",
      "non presente"
    );
  }

  /* =========================================================
     17. BOTTONI
     ========================================================= */

  var allButtons = document.querySelectorAll("button");

  if (allButtons.length > 0) {
    pass(
      "Pulsanti pagina",
      allButtons.length + " pulsanti trovati"
    );
  } else {
    fail(
      "Pulsanti pagina",
      "nessun pulsante trovato"
    );
  }

  var buttonsWithoutAction = 0;

  for (var bt = 0; bt < allButtons.length; bt++) {
    var button = allButtons[bt];

    var onclick = button.getAttribute("onclick");
    var dataPage = button.getAttribute("data-page");
    var dataAction = button.getAttribute("data-action");
    var type = button.getAttribute("type");

    var hasAction =
      !!onclick ||
      !!dataPage ||
      !!dataAction ||
      type === "submit";

    if (!hasAction) {
      buttonsWithoutAction++;
    }
  }

  if (buttonsWithoutAction === 0) {
    pass(
      "Bottoni senza azione",
      "nessuno rilevato"
    );
  } else {
    warn(
      "Bottoni senza azione",
      buttonsWithoutAction +
        " pulsanti senza azione esplicita"
    );
  }

  /* =========================================================
     18. HASH
     ========================================================= */

  var hash = window.location.hash || "";

  if (hash) {
    pass(
      "Hash pagina",
      hash
    );
  } else {
    warn(
      "Hash pagina",
      "nessun hash presente"
    );
  }

  if (hash === "#whatsapp") {
    pass(
      "Hash WhatsApp",
      "pagina WhatsApp richiesta"
    );
  }

  /* =========================================================
     19. ERRORI RUNTIME
     ========================================================= */

  var runtimeErrors =
    window.__adminTestRuntimeErrors || [];

  if (runtimeErrors.length === 0) {
    pass(
      "Errori runtime",
      "nessun errore registrato"
    );
  } else {
    for (
      var er = 0;
      er < runtimeErrors.length;
      er++
    ) {
      fail(
        "Errore runtime",
        runtimeErrors[er]
      );
    }
  }

  /* =========================================================
     20. RIEPILOGO
     ========================================================= */

  var passCount = 0;
  var failCount = 0;
  var warnCount = 0;

  for (var r = 0; r < results.length; r++) {
    if (results[r].status === "PASS") {
      passCount++;
    }

    if (results[r].status === "FAIL") {
      failCount++;
    }

    if (results[r].status === "WARN") {
      warnCount++;
    }
  }

  var duration = Date.now() - started;

  window.adminTestResults = results;

  window.adminTestSummary = {
    pass: passCount,
    fail: failCount,
    warn: warnCount,
    duration: duration
  };

  /* =========================================================
     21. PANNELLO
     ========================================================= */

  var oldPanel =
    document.getElementById("adminTestPanel");

  if (oldPanel) {
    oldPanel.remove();
  }

  var panel = document.createElement("div");

  panel.id = "adminTestPanel";

  panel.style.position = "fixed";
  panel.style.right = "20px";
  panel.style.bottom = "20px";
  panel.style.width = "430px";
  panel.style.maxHeight = "75vh";
  panel.style.overflow = "auto";
  panel.style.zIndex = "999999";
  panel.style.background = "#111";
  panel.style.color = "#fff";
  panel.style.border = "1px solid #444";
  panel.style.borderRadius = "14px";
  panel.style.padding = "18px";
  panel.style.boxSizing = "border-box";
  panel.style.fontFamily = "Arial, sans-serif";
  panel.style.fontSize = "13px";
  panel.style.boxShadow =
    "0 15px 50px rgba(0,0,0,.5)";

  var headerColor =
    failCount > 0 ? "#ff5252" : "#4caf50";

  var html = "";

  html +=
    '<div style="font-size:18px;font-weight:700;margin-bottom:12px;">' +
    "ADMIN — CONTROLLO COMPLETO" +
    "</div>";

  html +=
    '<div style="padding:10px;background:#1d1d1d;border-radius:10px;margin-bottom:14px;">' +
    '<span style="color:#4caf50;font-weight:700;">PASS: ' +
    passCount +
    "</span>" +
    " &nbsp; " +
    '<span style="color:#ff5252;font-weight:700;">FAIL: ' +
    failCount +
    "</span>" +
    " &nbsp; " +
    '<span style="color:#ffb300;font-weight:700;">WARN: ' +
    warnCount +
    "</span>" +
    "</div>";

  html +=
    '<div style="margin-bottom:12px;color:' +
    headerColor +
    ';font-weight:700;">' +
    (
      failCount > 0
        ? "ATTENZIONE: sono presenti errori."
        : "Controllo terminato."
    ) +
    "</div>";

  for (var q = 0; q < results.length; q++) {
    var item = results[q];

    var itemColor = "#aaa";

    if (item.status === "PASS") {
      itemColor = "#4caf50";
    }

    if (item.status === "FAIL") {
      itemColor = "#ff5252";
    }

    if (item.status === "WARN") {
      itemColor = "#ffb300";
    }

    html +=
      '<div style="padding:7px 0;border-bottom:1px solid #292929;">' +
      '<span style="display:inline-block;width:48px;color:' +
      itemColor +
      ';font-weight:700;">' +
      escapeHtml(item.status) +
      "</span>" +
      "<strong>" +
      escapeHtml(item.name) +
      "</strong>" +
      (
        item.detail
          ? '<div style="margin-left:48px;margin-top:2px;color:#aaa;">' +
            escapeHtml(item.detail) +
            "</div>"
          : ""
      ) +
      "</div>";
  }

  html +=
    '<div style="margin-top:14px;color:#888;font-size:11px;">' +
    "Tempo controllo: " +
    duration +
    " ms" +
    "</div>";

  panel.innerHTML = html;

  document.body.appendChild(panel);

  /* =========================================================
     22. REPORT
     ========================================================= */

  if (
    window.console &&
    typeof console.log === "function"
  ) {
    console.log(
      "ADMIN TEST COMPLETATO",
      window.adminTestSummary
    );

    if (typeof console.table === "function") {
      console.table(results);
    }
  }
})();
