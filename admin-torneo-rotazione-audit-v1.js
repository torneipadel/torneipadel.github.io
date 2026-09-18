/* AUDIT NON DISTRUTTIVO — Individuale a Coppie Variabili
 * Non modifica Supabase, localStorage o il DOM del torneo.
 * Uso dalla console della pagina admin.html:
 *   window.auditTorneoRotazione()
 */
(()=> {
'use strict';
function audit(){
  const s=window.adminState||{};
  const t=(s.tornei||[]).find(x=>String(x.id)===String(s.torneoSelezionato))||null;
  const c=t?.configurazione&&typeof t.configurazione==='object'?t.configurazione:{};
  const r=c.rotazione&&typeof c.rotazione==='object'?c.rotazione:{};
  const giornate=Array.isArray(r.giornate)?r.giornate:[];
  const partite=giornate.flatMap(g=>(Array.isArray(g.partite)?g.partite:[]));
  const risultati=partite.filter(m=>m.risA!==''&&m.risA!=null&&m.risB!==''&&m.risB!=null);
  const campiMancanti=partite.filter(m=>!String(m.campo??'').trim());
  const oreMancanti=partite.filter(m=>!String(m.ora??'').trim());
  const ids=new Set();
  giornate.forEach(g=>(g.partite||[]).forEach(m=>[...(m.coppiaA||[]),...(m.coppiaB||[])].forEach(id=>ids.add(String(id)))));
  const iscritti=Array.isArray(window.iscrizioniTorneo)?window.iscrizioniTorneo:[];
  const approvati=iscritti.filter(x=>x?.stato==='approvato'||x?.approvato===true);
  const report={
    torneo:t?{id:t.id,nome:t.nome,formula:t.formula,posti:t.posti}:null,
    configurazione:{
      numeroGiocatori:r.numeroGiocatori??null,
      puntiVittoria:r.puntiVittoria??null,
      puntiPareggio:r.puntiPareggio??null,
      puntiSconfitta:r.puntiSconfitta??null,
      campoDefault:r.campoDefault??null,
      oraDefault:r.oraDefault??null
    },
    iscritti:{totali:iscritti.length,approvati:approvati.length},
    calendario:{giornate:giornate.length,partite:partite.length,risultati:risultati.length,campiMancanti:campiMancanti.length,oreMancanti:oreMancanti.length},
    funzioni:{
      openGestione:typeof window.apriGestioneIndividualeCoppieVariabili==='function',
      openRotazione:typeof window.apriGestioneRotazione==='function',
      renderAdmin:typeof window.renderCleanAdmin==='function'
    },
    coerenza:{
      campoDefaultValorizzato:!!String(r.campoDefault??'').trim(),
      oraDefaultValorizzata:!!String(r.oraDefault??'').trim(),
      tuttiRisultatiPresenti:partite.length===risultati.length,
      tuttiCampiPresenti:campiMancanti.length===0,
      tuttiOrariPresenti:oreMancanti.length===0,
      giocatoriCoerenti:Number(r.numeroGiocatori||0)===approvati.length,
      coppiePartiteConosciute:[...ids].filter(id=>!approvati.some(p=>String(p.id??p.user_id??p.email??p.nome_giocatore)===id)).length===0
    },
    dettagli:{
      campiMancanti:campiMancanti.map(m=>m.id),
      oreMancanti:oreMancanti.map(m=>m.id)
    }
  };
  console.group('🔎 AUDIT TORNEO INDIVIDUALE A COPPIE VARIABILI');
  console.table(report.configurazione);
  console.table(report.calendario);
  console.table(report.funzioni);
  console.table(report.coerenza);
  console.log('Report completo:',report);
  console.groupEnd();
  return report;
}
window.auditTorneoRotazione=audit;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>console.info('Audit disponibile: window.auditTorneoRotazione()'),{once:true});
else console.info('Audit disponibile: window.auditTorneoRotazione()');
})();