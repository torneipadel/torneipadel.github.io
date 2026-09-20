# Architettura — NEXT POINT PADEL

> Riferimento: **NPPADEL-TECH-DOC-01**

## Livelli
1. Browser/UI
2. HTML + CSS + JavaScript
3. Supabase JS client
4. Supabase Auth
5. PostgreSQL/Supabase
6. Git/GitHub
7. GitHub Actions/GitHub Pages

## Flusso
`Pagina HTML → modulo JS → Supabase → Auth/Database`

`Codice → Git → GitHub main → GitHub Actions → GitHub Pages`

## Aree
- **Admin:** `admin.html` e moduli `admin-*.js`.
- **Bove:** configurazione, gironi, risultati, classifiche e KO.
- **Pubblico:** `visitatore.html` e moduli pubblici.
- **King:** torneo individuale con coppie variabili.
- **Servizi:** Supabase, sponsor, PWA, deployment.

## Separazioni da preservare
Admin non sostituisce Bove. King resta separato. Grafica bracket e logica dati vanno trattate separatamente. Stato localStorage admin non sostituisce il DB. Il singleton Supabase pubblico deve evitare client Auth duplicati.

## Punti sensibili
Cache-busting `?v=`, ordine script, funzioni globali, serializzazione stato torneo, salvataggio/reload, campi/orari KO e workflow automatici GitHub.

## Principio
Ogni modifica parte dal codice Git corrente, è limitata al requisito, viene committata e verificata dopo il deploy.