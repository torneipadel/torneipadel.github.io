# NEXT POINT PADEL — Documentazione tecnica

## Riferimento di lavoro
**NPPADEL-TECH-DOC-01**

Questa cartella è il contenitore ufficiale della documentazione tecnica del progetto NEXT POINT PADEL.

## Obiettivo
Raccogliere in Git, in modo versionato e progressivo, tutta la documentazione necessaria per descrivere il progetto a livello tecnico e manutentivo:

- architettura generale;
- tecnologie e linguaggi;
- struttura del repository;
- pagine HTML, CSS e JavaScript;
- flussi amministrativi e pubblici;
- motore torneo Bove;
- formule, gironi, classifiche e fase KO;
- torneo individuale a coppie variabili;
- Supabase, autenticazione, database e sicurezza;
- Git/GitHub/GitHub Pages/GitHub Actions;
- PWA e Service Worker;
- stampa e tabellone;
- manutenzione, test e troubleshooting;
- inventario file e glossario.

## Regola documentale
Ogni informazione non verificata direttamente nel codice o nel progetto Supabase corretto deve essere indicata come **DA VERIFICARE** e non deve essere inventata.

## Struttura prevista
- README.md — indice e riferimento di lavoro.
- MANUALE-TECNICO.md — manuale completo.
- ARCHITETTURA.md — architettura e flussi.
- DATABASE-SUPABASE.md — schema, relazioni, RLS, trigger e funzioni.
- BOVE-MOTORE-TORNEI.md — documentazione dettagliata del motore Bove.
- ADMIN.md — documentazione della console amministrativa.
- AREA-PUBBLICA.md — documentazione dell’area pubblica.
- KING-COPPIE-VARIABILI.md — documentazione del modulo King.
- DEPLOYMENT.md — GitHub, Actions e Pages.
- TEST-E-VERIFICHE.md — test, controlli e stato delle verifiche.
- INVENTARIO-FILE.md — inventario tecnico del repository.

## Metodo di lavoro
La documentazione viene costruita direttamente nel repository e aggiornata con commit Git separati e descrittivi. Il manuale deve rimanere sincronizzato con il codice reale.