# NEXT POINT PADEL — Manuale tecnico

> Riferimento: NPPADEL-TECH-DOC-01

## Stato del documento

**In costruzione e versionato direttamente nel repository Git.**

Questo file è il manuale tecnico centrale. Le sezioni vengono completate sulla base del codice reale del repository e, per Supabase, sulla base del progetto corretto.

## 1. Scopo del progetto

NEXT POINT PADEL è una web application per la gestione di attività e tornei di padel. Il sistema comprende area pubblica, area amministrativa, autenticazione, gestione dei tornei, iscrizioni, partecipanti, coppie, calendario, risultati, classifiche, fasi finali, comunicazioni, news, sponsor, mercatino e torneo individuale a coppie variabili.

## 2. Architettura

Il frontend è costituito da HTML, CSS e JavaScript eseguiti nel browser. Supabase fornisce autenticazione e persistenza dei dati tramite PostgreSQL. GitHub contiene il codice sorgente e GitHub Pages pubblica il sito tramite GitHub Actions.

## 3. Metodo di documentazione

Ogni funzione importante viene ricondotta al file che la implementa e al flusso che la utilizza. Le informazioni non ancora certificate vengono marcate **DA VERIFICARE**.

## 4. Prossime sezioni

- Tecnologie e dipendenze
- Inventario completo del repository
- Flusso autenticazione
- Console amministrativa
- Creazione/configurazione torneo
- Motore Bove
- Formule e formati
- Gironi, risultati e classifiche
- Fase KO
- Stampa
- King individuale a coppie variabili
- Area pubblica
- Supabase e sicurezza
- Deployment
- PWA
- Test e manutenzione
