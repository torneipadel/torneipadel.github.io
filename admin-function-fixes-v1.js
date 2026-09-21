/* ADMIN FLOW FIX V26 - isolated tournament creation wizard */
(()=>{
'use strict';
const FORMULE=[
 ['italiana',"🇮🇹 Torneo all'italiana"],['gironiFinale','🏆 Gironi + Fase Finale'],['eliminazione','⚔️ Eliminazione Diretta'],['svizzero','🇨🇭 Torneo Svizzero'],['americano','🎾 Americano Padel'],['mexicano','🇲🇽 Mexicano Padel'],['king','👑 King of the Court'],['short','⏱ Short Format'],['manuale','⚙️ Torneo Personalizzato']
];
const CONFIG={
 italiana:{title:"Torneo all'italiana",desc:'Tutti contro tutti.',fields:[['turni','Turni','number',1,20,1],['campi','Campi','number',1,20,1]]},
 gironiFinale:{title:'Gironi + Fase Finale',desc:'Fase a gironi seguita dalla fase finale.',fields:[['numeroGironi','Numero gironi','number',1,20,1],['squadrePerGirone','Squadre per girone','number',2,12,1],['formulaFinale','Fase finale','select',[['eliminazione','Eliminazione diretta'],['playoff','Playoff']]],['sCampo1','Campo semifinale 1','number',1,50,1],['sOra1','Ora semifinale 1','time'],['sCampo2','Campo semifinale 2','number',1,50,1],['sOra2','Ora semifinale 2','time'],['fCampo','Campo finale','number',1,50,1],['fOra','Ora finale','time']]},
 eliminazione:{title:'Eliminazione Diretta',desc:'Tabellone a eliminazione diretta.',fields:[['turni','Turni','number',1,10,1],['ripescaggi','Ripescaggi','select',[['no','No'],['si','Sì']]]]},
 svizzero:{title:'Torneo Svizzero',desc:'Turni svizzeri.',fields:[['turni','Turni svizzeri','number',1,20,1],['criterio','Criterio','select',[['punti','Punti'],['ranking','Ranking']]]]},
 americano:{title:'Americano Padel',desc:'Formula individuale a coppie variabili.',fields:[['turni','Turni','number',1,20,1],['puntiPartita','Punti partita','number',1,100,1]]},
 mexicano:{title:'Mexicano Padel',desc:'Accoppiamenti determinati dalla classifica aggiornata.',fields:[['turni','Turni','number',1,20,1],['puntiPartita','Punti partita','number',1,100,1]]},
 king:{title:'King of the Court',desc:'Rotazione dei giocatori sui campi.',fields:[['turni','Turni','number',1,20,1],['campi','Campi','number',1,20,1]]},
 short:{title:'Short Format',desc:'Formato rapido.',fields:[['turni','Turni','number',1,20,1],['durata','Durata partita (min)','number',5,120,5]]},
 manuale:{title:'Torneo Personalizzato',desc:'Configurazione libera.',fields:[['turni','Turni','number',1,50,1],['campi','Campi','number',1,50,1],['noteFormula','Note','text']]}
};
window.FORMULE=FORMULE;window.ADMIN_FORMULE=FORMULE;window.formuleStoriche=FORMULE;window.FORMULE_STORICHE=Object.fromEntries(FORMULE);window.FORMULE_CONFIG=CONFIG;
window.formulaScelta=window.formulaScelta||'';window.formulaConfig=window.formulaConfig||{};
if(window.stato==null)window.stato='bozza';
if(window.pubblicato==null)window.pubblicato=false;
window.assert=window.assert||function(condition,message){if(!condition)throw new Error(message||'Assertion failed');return true};
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>\\\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;'}[m]));
function style(){if($('adminFlowV25Style'))return;const s=document.createElement('style');s.id='adminFlowV25Style';s.textContent='#adminFlowV18{position:fixed;inset:0;background:rgba(5,8,12,.78);z-index:99999;display:grid;place-items:center;padding:24px}#adminFlowV18 .af-card{width:min(800px,96vw);max-height:92vh;overflow:auto;background:#151b22;color:#eef2f6;border:1px solid #445;border-radius:18px;padding:24px}#adminFlowV18 .af-step{display:none}#adminFlowV18 .af-step.active{display:block}#adminFlowV18 .af-grid,#adminFlowV18 .af-formulas,#adminFlowV18 .af-config-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}#adminFlowV18 input,#adminFlowV18 select,#adminFlowV18 textarea{width:100%;box-sizing:border-box;background:#0b1016;color:#fff;border:1px solid #445;border-radius:9px;padding:11px;margin:5px 0 12px}#adminFlowV18 .af-formula{padding:12px;border:1px solid #445;border-radius:10px;background:#0d131a;color:#fff;font-weight:700;text-align:left;cursor:pointer}#adminFlowV18 .af-formula.sel{border-color:#4da3ff}#adminFlowV18 .af-summary{margin-top:14px;padding:14px;background:#0b1016;border:1px solid #334;border-radius:10px;line-height:1.7}#adminFlowV18 .af-actions{display:flex;justify-content:space-between;margin-top:22px;padding-top:16px;border-top:1px solid #334}#adminFlowV18 button{cursor:pointer;border:1px solid #445;background:#252d37;color:#fff;border-radius:9px;padding:10px 14px;font-weight:700}#adminFlowV18 .primary{background:#4da3ff;color:#07111a;border-color:#4da3ff}@media(max-width:650px){#adminFlowV18 .af-grid,#adminFlowV18 .af-formulas,#adminFlowV18 .af-config-grid{grid-template-columns:1fr}}';document.head.appendChild(s)}
function defaults(key){const c=CONFIG[key]||CONFIG.manuale,o={formula:key};(c.fields||[]).forEach(f=>o[f[0]]=f[2]==='number'?(f[0].startsWith('sCampo')||f[0]==='fCampo'?'':f[3]):f[2]==='select'?f[3][0][0]:'');return o}
/*
 * Historical automatic configuration recovered from Bove.html.
 * Only values actually supported by the historical engine are calculated.
 * Americano/Mexicano/King/Short keep their engine defaults because the old
 * engine starts them dynamically (totaleTurni=0 or turno=1) and does not
 * define a fixed historical number of rounds.
 */
function historicalConfig(key,posti){
  const o=defaults(key);
  const n=Math.max(1,Number(posti)||8);
  const gruppi=Math.max(1,Math.ceil(n/4));
  switch(key){
    case 'italiana':
      o.turni=3;
      o.campi=gruppi*2;
      break;
    case 'gironiFinale':
      o.numeroGironi=gruppi;
      o.squadrePerGirone=4;
      o.formulaFinale='eliminazione';
      break;
    case 'eliminazione':
      o.turni=Math.max(1,Math.ceil(Math.log2(n)));
      o.ripescaggi='no';
      break;
    case 'svizzero':
      o.turni=5;
      o.criterio='punti';
      break;
    case 'individualeCoppieVariabili':
      o.puntiVittoria=3;
      o.puntiPareggio=1;
      o.puntiSconfitta=0;
      o.campoDefault='';
      o.oraDefault='';
      break;
  }
  return o;
}
function renderConfig(key,host,values){const c=CONFIG[key]||CONFIG.manuale;host.innerHTML='<div class="af-summary"><b>'+esc(c.title)+'</b><p>'+esc(c.desc)+'</p><div class="af-config-grid">'+(c.fields||[]).map(f=>{if(f[2]==='select')return '<div><label>'+esc(f[1])+'</label><select data-cfg="'+esc(f[0])+'">'+f[3].map(o=>'<option value="'+esc(o[0])+'"'+(values&&values[f[0]]===o[0]?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select></div>';const tipo=f[2]==='number'?'number':f[2]==='time'?'time':'text';const val=values&&values[f[0]]!=null?values[f[0]]:(f[2]==='number'?f[3]:'');return '<div><label>'+esc(f[1])+'</label><input data-cfg="'+esc(f[0])+'" type="'+tipo+'" value="'+esc(val)+'"'+(f[2]==='number'?' min="'+f[3]+'" max="'+f[4]+'" step="'+(f[5]||1)+'"':'')+'></div>'}).join('')+'</div></div>'}
function readConfig(host,key){const o=defaults(key);host.querySelectorAll('[data-cfg]').forEach(e=>o[e.dataset.cfg]=e.type==='number'?(Number(e.value)||0):e.value);return o}
function syncMarkers(ov){const fs=$('formulaScelta'),fc=$('formulaConfig');if(fs)fs.dataset.value=window.formulaScelta||'';if(fc)fc.dataset.value=JSON.stringify(window.formulaConfig||{});ov.dataset.stato=window.stato||'bozza';ov.dataset.pubblicato=String(window.pubblicato===true)}
function openWizard(){if($('adminFlowV18'))$('adminFlowV18').remove();style();let formula='',cfg={};window.formulaScelta='';window.formulaConfig={};const ov=document.createElement('div');ov.id='adminFlowV18';ov.dataset.wizard='tournament';ov.dataset.stato='bozza';ov.dataset.pubblicato='false';ov.innerHTML='<div class="af-card"><h2 id="afTitle">🏆 Nuovo torneo</h2><div>Dati torneo → numero squadre → giocatori calcolati → scelta formula → configurazione formula → riepilogo → creazione</div><div id="formulaScelta" data-formula-scelta=""></div><div id="formulaConfig" data-formula-config="{}"></div><div><b>Torneo:</b> <span id="afCurrentName">Nuovo torneo</span></div><div class="af-step active" data-s="1"><b>1 · Dati torneo</b><div class="af-grid"><div><label>Nome torneo</label><input id="afNome" placeholder="Nome torneo"></div><div><label>Data</label><input id="afData" type="date"></div></div><label>Descrizione</label><textarea id="afDescrizione" placeholder="Descrizione del torneo"></textarea></div><div class="af-step" data-s="2"><b>2 · Numero squadre</b><label>Numero squadre</label><select id="afPosti"><option>8</option><option>12</option><option>16</option><option>20</option><option>24</option></select></div><div class="af-step" data-s="3"><b>3 · Giocatori calcolati</b><div class="af-summary"><span id="afGiocOut">16</span> giocatori necessari<br>Numero squadre: <b id="afSquadreOut">8</b></div></div><div class="af-step" data-s="4"><b>4 · Scelta formula</b><div class="af-formulas">'+FORMULE.map(x=>'<button type="button" class="af-formula" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div></div><div class="af-step" data-s="5"><b>5 · Configurazione formula</b><div class="af-summary"><b id="afFormulaName">Nessuna formula</b><div id="afFormulaConfig"></div></div></div><div class="af-step" data-s="6"><b>6 · Riepilogo</b><div id="afSummary" class="af-summary"></div></div><div class="af-step" data-s="7"><b>7 · Creazione</b><div class="af-summary">Controlla i dati e premi <b>Crea torneo</b>.<div id="afCreateStatus"></div></div></div><div class="af-actions"><button type="button" id="afBack">Indietro</button><div><button type="button" id="afCancel">Annulla</button> <button type="button" class="primary" id="afNext">Avanti</button></div></div></div></div>';document.body.appendChild(ov);window.afNext=$('afNext');const posti=$('afPosti'),nome=$('afNome'),steps=[...ov.querySelectorAll('.af-step')],gioc=document.createElement('input');gioc.id='afGiocatori';gioc.type='hidden';ov.appendChild(gioc);let step=1;
const names=()=>{$('afCurrentName').textContent=nome.value.trim()||'Nuovo torneo';$('afTitle').textContent='🏆 '+(nome.value.trim()||'Nuovo torneo')};
const players=()=>{const n=Number(posti.value)||0;const rot=formula==='individualeCoppieVariabili';gioc.value=rot?n:n*2;$('afSquadreOut').textContent=n;$('afGiocOut').textContent=rot?n:n*2};
const show=n=>{step=Math.max(1,Math.min(7,n));names();players();steps.forEach(x=>x.classList.toggle('active',Number(x.dataset.s)===step));$('afBack').style.visibility=step===1?'hidden':'visible';$('afNext').textContent=step===7?'Crea torneo':'Avanti';if(step===5&&formula){$('afFormulaName').textContent=(FORMULE.find(x=>x[0]===formula)||[])[1]||formula;renderConfig(formula,$('afFormulaConfig'),cfg)}if(step===6){$('afSummary').innerHTML='<b>'+esc(nome.value.trim()||'Nuovo torneo')+'</b><br>Data: '+esc($('afData').value||'-')+'<br>Squadre: '+posti.value+'<br>Giocatori: '+gioc.value+'<br>Formula: '+esc((FORMULE.find(x=>x[0]===formula)||[])[1]||'nessuna')+'<br><br>Configurazione formula<br>'+Object.keys(cfg).filter(k=>k!=='formula').map(k=>esc(k)+': '+esc(cfg[k])).join('<br>')};syncMarkers(ov)};
posti.onchange=players;nome.oninput=names;ov.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{ov.querySelectorAll('[data-f]').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');formula=b.dataset.f;if(formula==='individualeCoppieVariabili'){const label=posti.parentElement?.querySelector('label');if(label)label.textContent='Numero giocatori';posti.innerHTML=Array.from({length:21},(_,i)=>'<option>'+String(i+4)+'</option>').join('');if(Number(posti.value)<4||Number(posti.value)>24)posti.value='8';$('afSquadreOut').textContent=posti.value;$('afGiocOut').textContent=posti.value;}else{const label=posti.parentElement?.querySelector('label');if(label)label.textContent='Numero squadre';posti.innerHTML='<option>8</option><option>12</option><option>16</option><option>20</option><option>24</option>';if(!['8','12','16','20','24'].includes(String(posti.value)))posti.value='8';players()}cfg=historicalConfig(formula,Number(posti.value)||8);window.formulaScelta=formula;window.formulaConfig=cfg;syncMarkers(ov)});$('afBack').onclick=()=>show(step-1);$('afCancel').onclick=()=>ov.remove();$('afNext').onclick=async()=>{if(step===1&&(!nome.value.trim()||!$('afData').value)){alert('Inserisci nome e data del torneo.');return}if(step===4&&!formula){alert('Seleziona una formula.');return}if(step===5){cfg=readConfig($('afFormulaConfig'),formula);window.formulaConfig=cfg}if(step<7){show(step+1);return}$('afNext').disabled=true;$('afCreateStatus').textContent='Salvataggio in corso…';try{await create(nome.value.trim(),$('afData').value,Number(posti.value),$('afDescrizione').value.trim(),formula,cfg);ov.remove()}catch(e){$('afNext').disabled=false;$('afCreateStatus').textContent='';alert('Creazione torneo non riuscita: '+(e.message||e))}};show(1);return ov}
async function create(nome,data,posti,descrizione,formula,formulaConfig){
 const id=Date.now(),numeroGironi=Math.max(1,Math.ceil(posti/4));
 const sCamp=[formulaConfig?.sCampo1||'',formulaConfig?.sCampo2||''];
 const sTime=[formulaConfig?.sOra1||'',formulaConfig?.sOra2||''];
 const fCamp=formulaConfig?.fCampo||'';
 const fTime=formulaConfig?.fOra||'';
 const formulaGironi=formula==='gironiFinale'?'gironi':(formulaConfig?.formulaGironi||'');
 const formulaFinale=formula==='gironiFinale'?(formulaConfig?.formulaFinale||'eliminazione'):(formulaConfig?.formulaFinale||'');
 const configurazione={nomeTorneo:nome,dataTorneo:data,coppie:[],partecipanti:[],sCamp,sTime,fCamp,fTime,rules:{locked:false,tipoTorneo:formula||'',formatoTorneo:formula||'',numeroSquadre:formula==='individualeCoppieVariabili'?0:posti,numeroGiocatori:formula==='individualeCoppieVariabili'?posti:posti*2,numeroGironi:formula==='individualeCoppieVariabili'?0:numeroGironi,squadrePerGirone:formulaConfig?.squadrePerGirone||4,formulaGironi,formulaFinale,formulaScelta:formula||'',formulaConfig:formulaConfig||{}}};if(formula==='individualeCoppieVariabili'){configurazione.rotazione={version:2,numeroGiocatori:posti,giornate:[],puntiVittoria:Number(formulaConfig?.puntiVittoria??3),puntiPareggio:Number(formulaConfig?.puntiPareggio??1),puntiSconfitta:Number(formulaConfig?.puntiSconfitta??0),campoDefault:formulaConfig?.campoDefault||'',oraDefault:formulaConfig?.oraDefault||''};}
 if(!window.sb)throw Error('Supabase non disponibile');
 const r=await window.sb.from('tornei').upsert({id,nome,data,data_torneo:data,posti,descrizione,formula:formula||null,stato:'bozza',pubblicato:false,iscrizioni_chiuse:false,configurazione},{onConflict:'id'});
 if(r.error)throw r.error;
 try{localStorage.setItem('torneoState',JSON.stringify({idTorneo:id,nomeTorneo:nome,dataTorneo:data,formato:posti,partecipanti:[],coppie:[],sCamp,sTime,fCamp,fTime,rules:{...configurazione.rules}}))}catch(e){}
 if(typeof window.openAdminPage==='function')window.openAdminPage('dashboard');
 if(typeof window.caricaTorneiSupabase==='function')await window.caricaTorneiSupabase();
 if(typeof window.selezionaTorneoAdmin==='function')await window.selezionaTorneoAdmin(id)
}
function bind(){if(document.documentElement.dataset.adminCreateBound==='v25')return;document.documentElement.dataset.adminCreateBound='v25';document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b)return;const id=b.id||'';const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(id==='btnNuovoTorneo'||id==='btnCreaTorneo'||id==='btnNuovoTorneoAdmin'||t==='＋ nuovo torneo'||t==='+ nuovo torneo'||t==='＋ crea torneo'||t==='+ crea torneo'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openWizard()}},true)}
function bindApri(){if(document.documentElement.dataset.adminApriBound)return;document.documentElement.dataset.adminApriBound='v1';document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b)return;const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(t!=='apri torneo'&&!t.includes('🚀 apri torneo'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();let id=window.adminState?.torneoSelezionato?.id||null;if(id==null){try{id=JSON.parse(localStorage.getItem('torneoState')||'null')?.idTorneo||null}catch(_){}}if(id==null){console.error('[ADMIN] Apri torneo: nessun torneo selezionato');return}const url='Bove.html?idTorneo='+encodeURIComponent(id);window.open(url,'_blank','noopener,noreferrer')},true)}
function boot(){bind();bindApri()}
window.apriWizardTorneo=openWizard;
window.ensureWizardMarkers=function(){return $('adminFlowV18')||null};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();