# TEMP_AUDIT — file parcheggiati dopo audit

Questa cartella contiene file presenti nella root che, nell'audit del 22/09/2026, non risultano richiamati dalle pagine operative correnti oppure sono chiaramente trigger/test/legacy.

NON sono stati cancellati.
Sono stati solo parcheggiati per una revisione successiva.

Criterio:
- file JS non referenziati dagli HTML operativi correnti;
- vecchi script/versioni duplicate;
- file di test;
- trigger/deploy marker temporanei.

Prima di eliminarli definitivamente va verificato se qualche codice li carica dinamicamente o se contengono una funzione ancora utile.

Il Git storico resta intatto: ogni file è recuperabile anche dai commit precedenti.
