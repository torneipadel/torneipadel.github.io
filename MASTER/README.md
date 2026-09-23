# MASTER — BASE DUPLICATA DEL LABORATORIO

Questa branch è una copia del progetto `main` al momento della separazione LAB/MASTER.

## Regola di lavoro

- `main` = LABORATORIO operativo: resta intatto e contiene test, storico e sviluppo.
- Questa branch = BASE MASTER: da qui si costruirà il prodotto generico.
- In questa fase **non si cancellano file del LAB**.
- Le funzioni vengono migrate per duplicazione, isolamento e verifica.
- Una funzione viene considerata pronta per il MASTER solo dopo test funzionale.
- I dati personali, i dati di test e le impostazioni specifiche del laboratorio verranno sostituiti progressivamente con configurazione.

## Obiettivo

Realizzare un prodotto replicabile per più circoli/attività sportive, dove ogni installazione possa configurare identità, branding, contatti, privacy, amministratori e impostazioni senza modificare il motore del torneo.

## Stato iniziale

Questa branch parte da `main` e quindi conserva integralmente la base LAB. Nessuna pulizia distruttiva è stata applicata alla copia iniziale.

