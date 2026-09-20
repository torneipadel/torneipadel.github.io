# Test e verifiche — NEXT POINT PADEL

> Riferimento: **NPPADEL-TECH-DOC-01**

## Metodo
Ogni test deve registrare data, commit/file, funzione/flusso, input, atteso, effettivo, esito e regressioni.

## Matrice iniziale
| Area | Stato |
|---|---|
| Admin → Bove | VERIFICATO nel lavoro recente |
| Salvataggio completo | VERIFICATO nel lavoro recente |
| Regole/configurazione | IN VERIFICA |
| Punti Sconfitta | IMPLEMENTATO; test completo DA VERIFICARE |
| Formati 8/12/16/20/24 | IN VERIFICA |
| Gironi A-F | IN VERIFICA |
| Risultati/classifiche | DA CERTIFICARE |
| Qualificazione | DA CERTIFICARE |
| Quarti | IN VERIFICA |
| Semifinali | IN VERIFICA |
| Finale | IN VERIFICA |
| Campo/ora fase finale | CORRETTO nel lavoro recente |
| Separazione gironi/KO | DA VERIFICARE |
| Stampa bracket | GRAFICA STABILIZZATA |
| King rotazione | TEST STORICO DISPONIBILE; ricertificare |
| King classifica UI | DA RICONTROLLARE |
| Area pubblica | IN VERIFICA |
| Supabase schema/RLS | DA VERIFICARE |
| Deployment Pages | CONFIGURATO |
| PWA | CONFIGURATA |

## Test Bove obbligatori
Per ogni formato 8/12/16/20/24: creare torneo; verificare squadre/gironi; generare partite; inserire risultati; classifiche; qualificate; KO; campo/ora; salvataggio; reload; assenza di dati KO nei gironi sbagliati.

## Regressione
Dopo ogni correzione del motore: reload DB, gironi, KO, salvataggio e stampa se toccato il rendering.

## King
Test storico: 8 giocatori, 12 giornate, 4 coppie/giornata, 6 match/giornata, 72 risultati. È un dato storico, non una garanzia sul codice successivo.

## Stato
Matrice di partenza dell'audit, non certificazione finale.