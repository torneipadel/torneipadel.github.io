# Deployment e infrastruttura

Riferimento: **NPPADEL-TECH-DOC-01**

## Hosting
Il progetto è pubblicato tramite GitHub Pages dal repository:
`torneirobertobove/torneirobertobove.github.io`

Branch di pubblicazione:
`main`

## Workflow principale
File:
`.github/workflows/deploy-pages.yml`

Trigger:
- push su `main`;
- `workflow_dispatch`.

Azioni principali:
1. checkout;
2. configurazione GitHub Pages;
3. generazione favicon con ImageMagick;
4. upload dell'intero repository come Pages artifact;
5. deploy con `actions/deploy-pages@v4`.

## Workflow sponsor
File:
`.github/workflows/patch-bove-sponsor.yml`

Il workflow interviene sulle pagine:
- `2Page.html`
- `Bove.html`
- `visitatore.html`

e mantiene l'integrazione sponsor globale. Effettua anche il commit/push automatico delle modifiche risultanti.

## PWA
File:
- `manifest.json`
- `sw.js`

Manifest:
- nome: NEXT POINT PADEL;
- short name: NEXT POINT PADEL;
- start URL: `/`;
- scope: `/`;
- display: standalone;
- orientamento: portrait-primary.

Il service worker corrente usa un modello semplice: install/activate e proxy delle richieste GET tramite rete; non implementa una cache applicativa offline completa.

## Cache busting
Il progetto utilizza versioni nei riferimenti script, ad esempio `?v=...`. Quando un modulo viene modificato, il riferimento HTML deve essere controllato per evitare di caricare una versione vecchia.

## Regola di rilascio
Ogni correzione deve essere:
1. verificata nel file Git corrente;
2. committata;
3. controllata nel workflow Pages;
4. verificata sul comportamento reale dopo il deploy.

## Da verificare
Stato/risultato dell'ultima esecuzione GitHub Actions non viene dichiarato qui senza una lettura diretta del run corrente.
