# BACKUP — SINCRONIZZAZIONE SMART TV BOVE

Data: 21 settembre 2026

## Obiettivo
Permettere alla Smart TV di visualizzare il torneo Bove e aggiornarsi automaticamente quando dal PC viene modificato e salvato un risultato, senza premere F5.

## Problema iniziale
La TV non riceveva gli aggiornamenti dei risultati modificati dal PC. Sono state provate diverse soluzioni di sincronizzazione, ma le prime versioni non aggiornavano correttamente la visualizzazione.

## Lavoro eseguito

### 1. Salvataggio remoto Bove
È stato verificato e corretto il salvataggio dello stato completo del torneo su Supabase.
- Il PC salva la configurazione completa nella tabella `public.tornei`.
- `updated_at` viene aggiornato.
- Il torneo di test utilizzato è **🏆 La Vita è bella**, ID **1789859108413**.

### 2. Protezione modalità TV
La modalità `?tv=1` è stata resa di sola lettura.
- La TV non deve mai riscrivere il torneo.
- `updateAndSync()` viene bloccata quando la pagina è in modalità TV.

### 3. Correzione della rigenerazione dei gironi
`generaPartiteGironi()` è stata corretta affinché non azzeri i risultati, campi e orari già salvati durante un refresh/sincronizzazione.

Commit: `c3092e7d1e40962b6b5ffefdc71b45c27a23e88d`

### 4. Sincronizzazione TV V7
È stata installata la soluzione definitiva attuale:
- Supabase Realtime è il canale principale.
- La TV ascolta gli UPDATE della riga del torneo corrente.
- Quando arriva un UPDATE, viene richiamata la vera `loadState()` di Bove.
- La pagina viene quindi aggiornata usando la macchina di stato reale del torneo, senza ricostruire artificialmente uno stato parallelo.
- È presente un polling REST di sicurezza ogni 3 secondi.
- Se Realtime non arriva, il controllo REST può rilevare la variazione di `updated_at`.
- La TV rimane sempre in sola lettura.

Commit V7: `7a36cb9107ce0f61839588d0639188d0e646a7d0`

### 5. Correzione ID TV
È stato corretto anche il collegamento tra l'ID del torneo nella modalità TV e `loadState()`.
La TV può quindi usare l'ID del torneo come fonte di verità anche quando il vecchio link utilizzava il parametro `torneo`.

Commit: `bdf915000251d8c3d5fb801deaf5add0f5c71ea7`

## Configurazione Supabase verificata
Per `public.tornei` è stato verificato che:
- la tabella è presente nella publication `supabase_realtime`;
- la lettura pubblica della tabella è consentita;
- l'UPDATE pubblico è consentito per il normale salvataggio del torneo.

## Stato attuale
La sincronizzazione TV è **funzionante** nel test reale: modificando un risultato dal PC, la TV ora riceve l'aggiornamento senza F5.

È stato osservato occasionalmente un ritardo/incaglio di alcuni secondi. Questo è l'unico punto rimasto da rifinire e riguarda la fluidità della sincronizzazione TV, non il salvataggio del torneo.

## Regola per i prossimi interventi
Non modificare la logica del torneo, dei gironi, dei risultati, delle classifiche o del salvataggio PC per risolvere il piccolo ritardo TV.
Il prossimo intervento, se necessario, dovrà riguardare esclusivamente la parte di sincronizzazione/rendering della modalità `?tv=1`.

## URL di test
`Bove.html?idTorneo=1789859108413&tv=1`
