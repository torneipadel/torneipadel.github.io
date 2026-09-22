# AUDIT PROGETTO — 22/09/2026

## Metodo
Audit statico della root di main:
- riferimenti `src/href` negli HTML principali;
- script caricati direttamente da `admin.html`, `Bove.html`, `visitatore.html`, `tv.html`, `mercatino.html`, `iscrizione.html`;
- presenza di funzioni nei JS;
- confronto tra versioni/duplicati;
- nessuna cancellazione definitiva dei file sospetti.

## CORE OPERATIVO

| Area | File | Funzioni chiave |
|---|---|---|
| Motore torneo | Bove.html | macchina a stati, salvataggio, regole, gironi, KO, risultati, stampa |
| Bridge Admin/Bove | bove-admin-flow-fix.js | restoreNeutralFormulaFromAdmin, preserveTournamentResults, preserveKOLegacyKeys, openRequestedRules, captureKOFieldsBeforeSave, salvaTorneoBove, archiviaTorneoBove, eliminaTorneoBove, leggiStatoRemoto, preservaStatoTorneo |
| Admin base | admin-functions.js | salvaAdminState, caricaAdminState, caricaTorneiSupabase, creaNuovoTorneo, selezionaTorneoAdmin, eliminaTorneoAdmin, pubblicaTorneo, chiudiIscrizioniTorneo, caricaRichiesteIscrizione, generaLinkBove, apriBoveConTorneo, renderAdmin |
| Admin configurazione | admin-function-fixes-v1.js | historicalConfig, renderConfig, readConfig, syncMarkers, openWizard, create |
| Layout Admin | admin-layout-v2.js | ensureRegistrations, eliminaIscrittoAdmin, savePairs, existingPairs, pairPlayer, renderPairsPage, openPairsPage |
| Auth/ruoli | admin-access-guard-v1.js | controllo ruolo admin/superadmin |
| Supabase | admin-supabase-singleton-v1.js | singleton client |
| Superadmin | admin-superadmin-v1.js | audit, backup dati, restore dati, backup codice, restore codice |
| Monitor | admin-system-monitor-v1.js | readSupabase, readGitHub, render, startAutoRefresh |
| King | admin-torneo-rotazione-v1.js | config, players, standings, generateRound, autoDaySquads, validateDaySquads, rebuildDayMatches, inputScore, render, simulate |
| King audit | admin-torneo-rotazione-audit-v1.js | audit della logica King |
| News | admin-news-ai-v1.js + moduli news v1 | saveNews, localGenerate, aiGenerate, persist e gestione poster/news |
| Sponsor | admin-sponsor-route-fix-v1.js + admin-sponsor-help-v2.js | routing/help sponsor |
| Pubblico | visitatore-public-v2.js + visitatore-eventi-v1.js | pagina pubblica, eventi |
| Mercatino | mercatino-public-v1.js | pubblico mercatino |
| Iscrizioni | torneo-flow-public-fix-v1.js | flusso iscrizione |
| TV | tv-mode-v1.js | sincronizzazione/modalità TV |
| Sponsor pubblico | sponsor-public-v2.js | sponsor pubblico |
| Lingue | lingue.js | sistema lingue |

## SCRIPT ROOT CONFERMATI COME CARICATI DA ADMIN
admin.html carica direttamente questi moduli:
admin-supabase-singleton-v1.js
admin-access-guard-v1.js
admin-functions.js
admin-function-fixes-v1.js
admin-home-actions-v1.js
admin-layout-v2.js
admin-duplicate-controls-fix-v1.js
admin-wizard-calculation-fix-v1.js
admin-approval-sync-v1.js
admin-calendar-v1.js
admin-comunicazioni-v1.js
admin-comunicazioni-logo-fix-v1.js
admin-comunicazioni-whatsapp-override-v1.js
admin-whatsapp-poster-preview-v1.js
admin-whatsapp-help-v1.js
admin-close-tournament-v1.js
admin-news-ai-v1.js
admin-news-ai-hide-v2-stable.js
admin-news-ai-theme-v1.js
admin-news-poster-premium-v1.js
admin-news-poster-publish-fix-v1.js
admin-news-poster-photo-fix-v1.js
admin-news-poster-auto-data-v1.js
admin-news-auto-v1.js
admin-news-help-v1.js
admin-sponsor-route-fix-v1.js
admin-sponsor-help-v2.js
admin-torneo-rotazione-v1.js
admin-torneo-rotazione-audit-v1.js
admin-stabilizza-bar-v1.js
admin-calendar-central-fix-v1.js
admin-archivio-button-v1.js
admin-system-monitor-v1.js
admin-privacy-v1.js
admin-superadmin-v1.js

## SCRIPT ROOT PUBBLICI CONFERMATI
Bove.html:
- bove-admin-flow-fix.js
- sponsor-public-v2.js

visitatore.html:
- visitatore-public-v2.js
- visitatore-eventi-v1.js
- sponsor-public-v2.js

tv.html:
- tv-mode-v1.js

mercatino.html:
- mercatino-public-v1.js

iscrizione.html:
- torneo-flow-public-fix-v1.js
- sponsor-public-v2.js

## TEMP_AUDIT — PARCHEGGIATI, NON CANCELLATI

### Chiaramente temporanei/test
- .admin-wizard-deploy-trigger
- .ko-layout-trigger
- .pages-redeploy-2026-08-22.txt
- BOVE-REPAIR-TRIGGER.txt
- BOVE-TEST-TRIGGER.txt
- DEPLOY_TRIGGER.txt
- KO-FIX-PR.txt
- KO-FIX-PR2.txt
- KO-FIX-TRIGGER.txt
- KO-LAYOUT-TRIGGER.txt
- KO_LAYOUT_TRIGGER.txt
- REPAIR_TRIGGER.txt
- SAVE_RESET_TRIGGER_FINAL.txt
- SAVE_RESET_TRIGGER_V2.txt
- SPONSOR_SEPARATE_TRIGGER.txt
- TEMP_DO_NOT_USE
- TEMP_DO_NOT_USE_2
- V24_FINAL_DEPLOY_TRIGGER.txt
- __admin_restore_marker.txt
- _pages_refresh_2026-08-23.txt
- admin-desktop-test.html
- crea_torneo_test_8.html
- admin-test.js

### Vecchie architetture Admin — da confrontare, non recuperare alla cieca
- admin-master.js — contiene una vecchia implementazione Admin molto ampia; oggi duplicata/sostituita dall'insieme modulare caricato da admin.html.
- admin-layout-v1.js — vecchio layout, sostituito da admin-layout-v2.js.
- admin-desktop.js
- admin-desktop-v2.js
- admin-desktop-v3.js
- admin-desktop-v4.js
- admin-desktop-v8.js
- admin-legacy-navigation.js
- admin-final-click-fix-v1.js
- admin-organization-v1.js

### Vecchi moduli archivio
- admin-archive-persistence-v1.js
- admin-archive-restore-v1.js
- admin-archived-lock-v1.js
- admin-dashboard-archive.js

Questi contengono logiche di archivio interessanti ma oggi la gestione archivio è presente nei moduli correnti. Vanno confrontati prima di un eventuale recupero.

### Vecchi moduli torneo
- admin-creation-repair-v1.js
- admin-delete-fix.js
- admin-torneo-management-v1.js
- admin-random-pairs.js
- tabellone-fix.js

Particolarmente interessante admin-random-pairs.js: contiene generaSquadreAutomatiche e gestione comunicazioni/archivio. Da conservare in TEMP per eventuale recupero mirato, non da rimettere nella root.

### Vecchi moduli News
- admin-news-ai-hide-v1.js
- admin-news-poster-premium-v2-stable.js

La v2 stable del poster contiene un editor completo e va confrontata con la versione v1 attualmente caricata prima di eliminare definitivamente.

### Vecchi moduli Sponsor
- admin-sponsor-help-v1.js
- sponsor-global-fix.js

### Vecchi moduli WhatsApp
- admin-whatsapp-broadcast-v1.js
- admin-whatsapp-final-v1.js

### Vecchi moduli pubblico
- tornei-public-redesign-v1.js
- visitatore-news-preview-v1.js

## FILE DA NON TOCCARE SENZA AUDIT SPECIFICO
- sw.js — service worker: non è caricato con src classico ma può avere comportamento indipendente.
- bovejose.html
- DashboardPlayer.html
- 2Page.html
- admin-mercatino.html
- wansport.html
- profil* / reset-password / pagine legali

Sono pagine che possono essere raggiunte direttamente tramite URL, bookmark o altri flussi e quindi non vengono considerate inutili solo perché non risultano referenziate da admin.html.

## DECISIONE
La root è stata ripulita dai file chiaramente temporanei/legacy individuati nel primo audit.
I file sospetti sono in TEMP_AUDIT e sono recuperabili.
Non è stata modificata la logica dei file operativi.
Non sono stati cancellati commit Git.

## Prossimo audit consigliato
Analizzare TEMP_AUDIT per famiglie:
1. archivio;
2. torneo/coppie;
3. News/poster;
4. Sponsor;
5. WhatsApp;
6. vecchia architettura Admin.

Solo dopo il confronto funzione-per-funzione si decide cosa eliminare definitivamente o recuperare.
