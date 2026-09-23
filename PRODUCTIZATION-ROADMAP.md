# ROADMAP PRODOTTO — Separazione LAB / MASTER
Data: 24/09/2026

## Obiettivo
Mantenere il progetto attuale come laboratorio di sviluppo e collaudo e costruire, su branch separato, una versione Master pulita, generica e replicabile.

## Regole
1. main resta l'ambiente operativo/laboratorio e non viene trasformato nel prodotto.
2. productizzazione-configurazione è il ramo di lavoro del prodotto Master.
3. Nessuna cancellazione viene fatta solo perché un file sembra vecchio.
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
4. Classificazione funzione-per-funzione: da completare.
5. Separazione LAB/MASTER: da completare.
6. Configurazione centrale: da progettare e implementare.
7. Migrazione dei riferimenti hardcoded a configurazione: da completare.
8. Pulizia Master: solo dopo classificazione e verifica.
9. Collaudo completo: da eseguire.
10. Master replicabile: da dichiarare pronto solo dopo collaudo.

## Stato attuale
- Branch Master di lavoro: productizzazione-configurazione.
- main non modificato dalla fase di productizzazione.
- Non è ancora corretto dichiarare il Master "pulito": la mappatura completa delle dipendenze è ancora da terminare.
- Non vengono eliminati ora i contenuti di TEMP_AUDIT: appartengono al patrimonio di laboratorio finché non viene completata la classificazione.

## Primo obiettivo operativo
Completare la mappa reale delle dipendenze partendo dalle pagine operative e dai moduli caricati direttamente, quindi classificare i file per CORE / CONFIGURAZIONE / LAB-TEST / OBSOLETO prima di qualsiasi ulteriore pulizia.
