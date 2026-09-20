# ADMIN — Console di amministrazione

Riferimento: **NPPADEL-TECH-DOC-01**  
Pagine/moduli principali: `admin.html`, `admin-master.js` e moduli `admin-*.js`.

## Ruolo
`admin.html` è la console centrale per la gestione del progetto. Il codice è modulare ma distribuito su numerosi file JS versionati.

## Creazione torneo
Il flusso funzionale di riferimento è:

**Nuovo torneo → dati torneo → numero squadre → giocatori calcolati → scelta formula → configurazione formula → creazione**

La pagina amministra inoltre:
- tornei;
- iscrizioni;
- partecipanti;
- coppie;
- tabellone;
- calendario;
- comunicazioni;
- news;
- sponsor;
- WhatsApp;
- mercatino;
- archivio;
- King Torneo Individuale a Coppie Variabili.

## Integrazione con Bove
L'admin deve alimentare Bove, non sostituirne la macchina a stati.

Il passaggio admin→Bove è basato sull'identificazione del torneo e sul caricamento della configurazione. Sono presenti funzioni e flussi per l'apertura di Bove con uno specifico ID torneo.

## Stato locale
È presente la chiave localStorage:
`padel_admin_state`

Questa rappresenta stato/UI locale dell'amministrazione e non deve essere considerata sostitutiva del database Supabase.

## Moduli principali
La responsabilità è distribuita tra moduli:
- accesso e guard;
- singleton Supabase;
- approvazioni;
- calendario;
- chiusura torneo;
- archivio/persistenza/ripristino;
- gestione tornei;
- rotazione King;
- news/poster;
- comunicazioni/WhatsApp;
- sponsor;
- layout.

Prima di modificare una funzione, bisogna individuare se un modulo successivo la sovrascrive o la estende.

## Regola di manutenzione
- non introdurre modifiche UI non richieste;
- non duplicare autenticazione;
- mantenere il flusso admin→Bove;
- verificare sempre i riferimenti `?v=` dei file JS dopo una modifica;
- evitare di sostituire il motore Bove con logiche parallele nell'admin.

## Da verificare
La documentazione completa delle colonne Supabase, policy RLS, relazioni e funzioni SQL richiede accesso al progetto Supabase corretto. Il progetto Supabase mostrato in alcune connessioni precedenti non è da considerare fonte ufficiale per questo repository finché non viene verificato il riferimento corretto.
