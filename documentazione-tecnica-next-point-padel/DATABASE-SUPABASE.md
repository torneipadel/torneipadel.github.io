# Database e Supabase

Riferimento: **NPPADEL-TECH-DOC-01**

## Tecnologia
Il frontend usa Supabase JS v2 e comunica direttamente con il progetto Supabase tramite client browser.

Nel codice Bove corrente è presente il riferimento al progetto:
`https://iybjvtmfaupgthqqsngd.supabase.co`

## Tabelle osservate nel codice
Sono stati osservati riferimenti applicativi almeno a:
- `tornei`
- `iscrizioni`
- `iscritti`
- `news`
- `profili`
- `torneo`

Questa non è ancora una lista certificata dell'intero schema.

## Campi osservati
Per `tornei`, il codice pubblico legge:
`id,nome,data,stato,pubblicato,iscrizioni_chiuse,formula,configurazione`.

Nel flusso Bove/admin sono inoltre comparsi concetti quali:
- nome torneo;
- data torneo;
- ora inizio;
- posti;
- formula;
- stato;
- pubblicazione;
- chiusura iscrizioni;
- configurazione.

Tipi PostgreSQL, nullability, default, chiavi, indici, foreign key, trigger e policy RLS sono **DA VERIFICARE**.

## Autenticazione
Il codice usa Supabase Auth con sessione persistente, auto refresh e rilevazione della sessione da URL.

Bove verifica la sessione e consulta `profili` per il ruolo dell'utente.

## Sicurezza
Le chiavi client pubblicabili presenti nel frontend non devono essere confuse con segreti server-side. Nessuna chiave privata deve essere inserita nella documentazione.

## Punto fondamentale
Il progetto Supabase corretto deve essere verificato prima di documentare:
- schema completo;
- RLS;
- policy;
- funzioni SQL;
- trigger;
- viste;
- storage;
- ruoli;
- relazioni;
- dati di produzione.

Il materiale proveniente da una connessione Supabase non corrispondente al progetto ufficiale non deve essere usato come fonte di verità.
