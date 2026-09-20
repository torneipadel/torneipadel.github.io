# NEXT POINT PADEL — Manuale tecnico

> Riferimento: **NPPADEL-TECH-DOC-01**

## Stato
Versionato direttamente in Git. Fotografia tecnica aggiornata al 20 settembre 2026. Le parti non certificate sono marcate **DA VERIFICARE**.

## 1. Identità
NEXT POINT PADEL è una web application per gestione di tornei e attività di padel. Repository ufficiale: `torneirobertobove/torneirobertobove.github.io`.

Comprende area pubblica, amministrazione, autenticazione, iscrizioni, partecipanti, coppie, calendario, risultati, classifiche, fasi finali, comunicazioni, news, sponsor, mercatino e King individuale a coppie variabili.

## 2. Stack
HTML5, CSS3, JavaScript browser/ES6+, Supabase JS v2, Supabase Auth, PostgreSQL/Supabase, Git/GitHub, GitHub Pages, GitHub Actions, PWA manifest/Service Worker e SheetJS/XLSX in Bove.

## 3. Architettura
- `admin.html` + moduli `admin-*.js`: console amministrativa.
- `Bove.html`: motore torneo/stato.
- `visitatore.html` + moduli pubblici: area pubblica.
- `admin-torneo-rotazione-v1.js`: King individuale.
- Supabase: autenticazione e persistenza.
- GitHub Actions/Pages: rilascio.

## 4. Flussi
Admin: **Nuovo torneo → dati torneo → numero squadre → giocatori calcolati → scelta formula → configurazione formula → creazione**.

Bove: apertura → identificazione → caricamento → regole → formato/gironi → squadre → partite/campi/orari → risultati → classifiche → qualificate → KO → campione → salvataggio/reload.

Pubblico: calendario/tornei → dettaglio → eventuale iscrizione → news/eventi/contenuti.

## 5. Tornei
Formati documentati: 8, 12, 16, 20, 24 squadre.

Formule presenti nel selettore: italiana, gironi + fase finale, eliminazione, svizzero, americano, mexicano, king, short, personalizzato.

La presenza nel selettore **non certifica** la correttezza completa: servono test dedicati.

## 6. Fase KO
**Quarti → semifinali → finale → campione**.

Campo e ora della fase finale sono stati corretti nel lavoro recente. La separazione tra dati gironi e KO resta **DA VERIFICARE** per il caso segnalato su Girone C/D.

## 7. King
Flusso separato con classifica individuale e coppie variabili. Dettagli in `KING-COPPIE-VARIABILI.md`.

## 8. Database
Il codice corrente contiene il riferimento Supabase `iybjvtmfaupgthqqsngd`. Schema SQL, RLS, trigger, viste, funzioni e relazioni sono **DA VERIFICARE** sul progetto corretto.

## 9. Deployment
GitHub Pages è configurato tramite `.github/workflows/deploy-pages.yml`; esiste anche il workflow sponsor. Dettagli in `DEPLOYMENT.md`.

## 10. Inventario
Alla data dell'audit sono stati rilevati 136 file alla radice, oltre alle directory. Dettagli in `INVENTARIO-FILE.md`.

## 11. Regole di manutenzione
Leggere sempre il codice Git corrente; modificare solo il requisito richiesto; separare logica e grafica; committare ogni correzione; marcare DA VERIFICARE ciò che non è certificato; controllare il cache-busting dopo modifiche JS.

## 12. Prossimo livello
Audit funzione-per-funzione dei file centrali e certificazione dei flussi, formule, schema Supabase e test.