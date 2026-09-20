# Area pubblica — NEXT POINT PADEL

Riferimento: **NPPADEL-TECH-DOC-01**  
Pagina principale: `visitatore.html`.

## Ruolo
L'area pubblica presenta tornei, eventi, news e contenuti del circolo senza esporre la console amministrativa.

## Componenti
- `visitatore.html`
- `visitatore-public-v2.js`
- `visitatore-eventi-v1.js`
- `visitatore-news-preview-v1.js`
- `tornei-public-redesign-v1.js`
- `torneo-flow-public-fix-v1.js`
- moduli sponsor pubblici.

## Navigazione
La struttura desiderata/documentata comprende:
- Home
- Tornei
- News
- Mercatino
- Eventi
- Info
- Contatti.

La pagina utilizza un'impostazione visuale glass con sfondo dedicato e tipografia compatta.

## Calendario tornei
Il modulo eventi legge la tabella `tornei` con campi attualmente richiesti dal codice pubblico:
`id,nome,data,stato,pubblicato,iscrizioni_chiuse,formula,configurazione`.

I tornei sono filtrati e mostrati in calendario/mese e in elenco. Il dettaglio consente apertura del torneo e, quando previsto, iscrizione.

## Supabase client
Il codice pubblico utilizza un singleton per evitare la creazione ripetuta del client GoTrue. Il riferimento applicativo è:
- `window.sb`
- `__NP_SUPABASE_CLIENT__` dove utilizzato dal relativo codice.

La presenza di un singleton è importante per evitare i problemi di client/auth duplicati già riscontrati.

## King pubblico
È prevista la visualizzazione pubblica della classifica King.

## Contatti
Contatti pubblici documentati nel progetto:
- `info@nextpointpadel.it`
- `+39 333444556`

## Regole di manutenzione
- non creare pulsanti profilo/dashboard non richiesti;
- evitare barre bianche orizzontali sotto le classifiche;
- non rompere il calendario pubblico quando si modifica il King;
- il caricamento news deve tollerare l'assenza del contenitore opzionale `#npNews`.

## Da verificare
La lista completa delle sezioni effettivamente renderizzate in ogni breakpoint deve essere verificata sul DOM e sui riferimenti HTML/JS correnti prima di essere considerata specifica definitiva.
