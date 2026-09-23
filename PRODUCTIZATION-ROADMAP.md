# ROADMAP PRODOTTO — Separazione LAB / MASTER
Data: 24/09/2026

## Obiettivo
Mantenere il progetto attuale come laboratorio di sviluppo e collaudo e costruire, su branch separato, una versione Master pulita, generica e replicabile.

## Regole
1. main resta l'ambiente operativo/laboratorio e non viene trasformato nel prodotto.
2. productizzazione-configurazione è il ramo di lavoro del prodotto Master.
3. Nessuna cancellazione viene fatta solo perché un file semble vecchio.
4. Prima di eliminare: ricerca riferimenti, verifica uso reale, classificazione.
5. Il motore torneo non viene riscritto per rendere il prodotto generico: si separano invece motore e configurazione.
6. TEMP_AUDIT resta disponibile come archivio tecnico finché la classificazione non è conclusa.
7. Ogni fase significativa termina con verifica e commit identificabile.

## Classificazione
- CORE: logica necessaria al funzionamento del prodotto.
- CONFIGURAZIONE: dati personalizzabili dal proprietario.
- LAB/TEST: prove, simulazioni, trigger e strumenti di sviluppo.
- OBSOLETO: elemento verificato come non utilizzato e sostituibile/rimuovibile.

## Fasi
1. Protezione laboratorio: completata. main invariato come base operativa.
2. Backup: completato. Backup branch 4184d14f7c disponibile.
3. Mappatura: in corso. Prima mappa esistente in TEMP_AUDIT/AUDIT-PROGETTO-2026-09-22.md.
4. Classificazione funzione-per-funzione: in corso — Archivio classificato salvo persistenza storica; Torneo/Coppie classificato.
5. Separazione LAB/MASTER: da completare.
6. Configurazione centrale: in corso — configurazione identità e dati legali già centralizzata su Supabase.
7. Migrazione dei riferimenti hardcoded a configurazione: in corso.
8. Pulizia Master: SOSPESA come attività distruttiva; da ora si lavora per duplicazione/migrazione e la cancellazione non è il metodo di lavoro.
9. Collaudo completo: da eseguire.
10. Master replicabile: da dichiarare pronto solo dopo collaudo.

## Stato attuale
- Branch Master di lavoro: productizzazione-configurazione.
- main non modificato dalla fase di productizzazione.
- Non è ancora corretto dichiarare il Master "pulito": la mappatura completa delle dipendenze è ancora da terminare.
- Non vengono eliminati ora i contenuti di TEMP_AUDIT non ancora classificati.
- La famiglia Archivio è stata analizzata: tre moduli duplicati e non caricati sono stati rimossi dal branch Master; la persistenza storica è mantenuta per ulteriore verifica. La famiglia Torneo/Coppie è stata analizzata: quattro moduli legacy non caricati sono stati rimossi e il vecchio tabellone-fix è stato eliminato dopo confronto con il motore attuale.

## Prossimo obiettivo operativo
Prossimo blocco: vecchia architettura Admin, sempre con classificazione prima della rimozione.


### Stato News/Poster
- `admin-news-ai-hide-v1.js` e `admin-news-poster-premium-v2-stable.js` classificati come obsoleti e rimossi da TEMP_AUDIT dopo confronto con le versioni attive.


### Stato Sponsor
- Vecchi moduli Sponsor classificati e rimossi da TEMP_AUDIT dopo confronto con gestione attiva su tabella `sponsor`.


### Stato WhatsApp
- Vecchi moduli broadcast/final classificati e rimossi da TEMP_AUDIT; restano attivi router, override, anteprima poster e guida WhatsApp correnti.


## Nuovo metodo LAB → MASTER — 24/09/2026
- Il prodotto Master viene costruito come copia separata del LAB prima delle migrazioni.
- Creata branch `MASTER-BASE-LAB-20260924` partendo direttamente da `main`, così la base Master conserva integralmente il progetto LAB al momento della separazione.
- Creata anche la cartella `MASTER/` nella nuova branch come area documentale iniziale.
- Da questo punto le funzioni vengono duplicate/migrate e verificate prima di qualsiasi eventuale rimozione.
- `main` resta il LAB e non viene modificato.
