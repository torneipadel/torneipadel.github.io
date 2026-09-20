# Architettura — NEXT POINT PADEL

> Riferimento: NPPADEL-TECH-DOC-01

## Livelli

1. Browser / UI
2. HTML + CSS + JavaScript
3. Supabase JS client
4. Supabase Auth
5. PostgreSQL
6. GitHub / GitHub Actions / GitHub Pages

## Flusso principale

Utente → pagina HTML → JavaScript → Supabase → PostgreSQL/Auth.

Codice → Git → GitHub → GitHub Actions → GitHub Pages → sito pubblicato.

## Principio di manutenzione

Bove.html è il motore centrale del torneo. Le modifiche grafiche devono rimanere separate dalla logica di stato, salvataggio, risultati e fase finale.
