# BOVE — Motore tornei

Riferimento: **NPPADEL-TECH-DOC-01**  
File principale: `Bove.html`  
SHA rilevato: `112b9c8ef1b4b08b991464425a68c8e4d94437f1`  
Aggiornamento inventario: 20 settembre 2026.

## Ruolo
`Bove.html` è il motore/stato operativo del torneo. La pagina contiene HTML, CSS e JavaScript del tabellone e integra Supabase JS v2.

## Flusso logico di riferimento
Il flusso applicativo documentato per Bove è:

1. apertura della pagina;
2. identificazione del torneo;
3. caricamento dello stato;
4. inizializzazione delle regole mancanti;
5. determinazione del formato e dei gironi;
6. caricamento/inserimento delle squadre;
7. generazione di partite, campi e orari;
8. rendering dei gironi;
9. inserimento risultati;
10. aggiornamento classifiche;
11. determinazione delle qualificate;
12. fase KO;
13. finale e campione;
14. salvataggio e successivo reload.

## Stato torneo
Chiavi di stato utilizzate/documentate nel progetto:
- `idTorneo`
- `nomeTorneo`
- `dataTorneo`
- `formato`
- `rules`
- squadre/gironi
- risultati
- campi
- orari.

Le regole includono, tra gli altri, punti vittoria, pareggio e sconfitta, criteri di spareggio, qualificate e flag della fase KO.

## Formati
Il motore è predisposto per:
- 8 squadre
- 12 squadre
- 16 squadre
- 20 squadre
- 24 squadre.

La struttura dei gironi utilizza le lettere A-F secondo il formato. Il dettaglio completo della distribuzione deve essere verificato direttamente nelle funzioni di generazione prima di essere considerato specifica contrattuale.

## Partite dei gironi
Per un girone da 4 squadre l'ordine previsto/documentato è:
`[0,1]`, `[2,3]`, `[0,3]`, `[1,2]`, `[0,2]`, `[1,3]`.

La visualizzazione della coppia è prevista in forma sintetica:
`Cognome1 / Cognome2 VS Cognome3 / Cognome4`.

## Fase finale
La catena è:
**QUARTI DI FINALE → SEMIFINALI → FINALE → CAMPIONE**

Nel codice sono presenti strutture per quarti, semifinali, finale e relativi risultati/valori di avanzamento. Sono inoltre presenti campi per campo e ora della fase finale.

### Stato verificato recentemente
- salvataggio e ricaricamento di campo/ora della fase finale: corretto nel lavoro recente;
- attivazione della fase quarti/semifinali: oggetto di correzioni recenti;
- esiste una verifica ancora necessaria sulla separazione visiva/logica tra gironi e fase KO, perché è stato segnalato un caso in cui dati KO comparivano sotto Girone C/D.

Questa ultima voce resta **DA VERIFICARE** prima di dichiarare il motore KO definitivamente certificato.

## Regole
Il progetto ha una funzione di inizializzazione delle regole che deve aggiungere solo i valori mancanti e non sovrascrivere configurazioni già presenti. Il problema storico `ensureRules is not defined` è stato affrontato nel lavoro di manutenzione.

La voce **Punti Sconfitta** è stata aggiunta nella configurazione recente.

## Formule presenti nel selettore
Sono documentate queste formule:
- Torneo all'italiana
- Gironi + Fase Finale
- Eliminazione Diretta
- Torneo Svizzero
- Americano Padel
- Mexicano Padel
- King of the Court
- Short Format
- Torneo Personalizzato.

La loro presenza nel selettore non equivale alla certificazione completa della logica. La certificazione deve essere fatta con test dedicati.

## Salvataggio
Principio operativo: caricamento da URL/DB → completamento dei default mancanti → rendering → modifica → salvataggio → reload.

Il progetto ha inoltre una protezione contro la creazione duplicata del torneo durante il salvataggio; il reset è una operazione intenzionale separata.

## Stampa
La stampa del tabellone finale utilizza una pagina A4 landscape e una struttura grafica dedicata. La configurazione grafica del bracket è considerata stabile e non deve essere modificata incidentalmente durante interventi sulla logica.

Riferimenti di stabilizzazione storica:
- `f28068d1413144ec37299278ec6e3831cd67e083`
- `bb2c35afcc8963d4932123e51285f0a875eb56c1`
- `37e2ebcac01dc6a07d36065f62ee2e7d44dd4643`
- `7c65304bec3dc19a17d658f5d578846a913c792`
- `66e0df8002fab864e20ef1ff88a434ea9d61fc0c`

**Regola di manutenzione:** non modificare il layout grafico del bracket mentre si ripara la logica dati, salvo richiesta esplicita.

## Dipendenze
Nel file corrente sono presenti:
- Supabase JS v2;
- SheetJS/XLSX da CDN;
- Supabase project URL nel codice client.

La chiave presente nel frontend è una chiave pubblicabile/client-side; segreti server-side non devono essere inseriti nella documentazione.

