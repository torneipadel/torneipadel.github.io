# King Torneo Individuale a Coppie Variabili

Riferimento: **NPPADEL-TECH-DOC-01**  
Modulo principale: `admin-torneo-rotazione-v1.js`.

## Nome funzionale
**🏆 King Torneo Individuale a Coppie Variabili**

È una funzione distinta dai tornei standard.

## Posizionamento nell'admin
Il King deve essere accessibile come pulsante dedicato nella sidebar sotto Gestione Tornei. Non deve comparire come normale torneo nel selettore/lista di creazione standard e non deve introdurre un normale pulsante "crea torneo" duplicato.

## Modello sportivo
- classifica individuale;
- coppie variabili/rotanti;
- punteggio vittoria: 3;
- pareggio: 1;
- sconfitta: 0;
- statistiche individuali PF, PS e differenza;
- criteri di spareggio;
- modifica manuale sempre disponibile;
- automazione per generazione squadre/coppie.

## Calendario
Sono previsti slot:
- 6;
- 8;
- 10;
- 12;
- manuale.

La configurazione deve supportare giorni/orari dinamici, inclusi esempi di due giornate settimanali.

## Test noto
È stato utilizzato un torneo di prova con:
- ID: `1789694489754`
- nome: `TEST - Individuale Coppie Variabili - SIMULAZIONE`
- formula: `individualeCoppieVariabili`
- 8 giocatori approvati;
- campo predefinito: Campo 1;
- orario predefinito: 19:00;
- piano: 12 giornate settimanali;
- 4 coppie per giornata;
- 6 partite per giornata;
- 72 risultati nel ciclo di 12 giornate.

L'audit precedente aveva verificato:
- 3 partite per giocatore/giornata;
- 0 violazioni nel test;
- stessa coppia ripetuta 1-2 volte;
- avversari incontrati circa 10-11 volte.

Questi numeri documentano il test storico e non devono essere trattati come garanzia automatica del codice attuale dopo modifiche successive.

## Problema UI noto
È stato rilevato un overflow orizzontale della classifica King (`scrollWidth 760`, `clientWidth 665`) nel wrapper `div.king-ranking-wrap`. L'obiettivo di stabilizzazione è far rientrare la classifica nella form senza scrollbar orizzontale.

Lo stato finale di questo punto deve essere ricontrollato dopo l'ultima modifica.

## Regola di manutenzione
Il King deve rimanere separato dalla logica dei tornei standard. Le correzioni al calendario King non devono alterare Bove o il flusso normale di creazione torneo.
