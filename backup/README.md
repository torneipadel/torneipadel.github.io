# Backup e versioni di riferimento

Questa è l'unica cartella dedicata agli eventuali backup manuali del repository.

## Regola attuale
Il backup principale del codice è **Git**: ogni commit conserva la storia e permette al Superadmin di ripristinare il file completo di una versione precedente senza modificare i dati Supabase.

Questa cartella contiene solo eventuali copie/manuali di riferimento che servono ancora. Non vengono creati duplicati ad ogni modifica.

## Ripristino
- **Ripristino codice:** dal pannello Superadmin; ripristina il file completo scelto e crea un nuovo commit.
- **Ripristino dati:** tramite i backup Supabase dedicati; è separato dal codice.

Le vecchie cartelle di backup duplicate sono state rimosse dal ramo principale per mantenere il repository ordinato.
