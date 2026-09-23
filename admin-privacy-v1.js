(()=>{'use strict';
const S=()=>window.sb||window.supabaseClient;
const e=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
async function loadPrivacyAdmin(){
 const root=document.getElementById('appContent');const sb=S();if(!root||!sb)return;
 const{data,error}=await sb.from('privacy_settings').select('*').eq('id',1).maybeSingle();
 if(error){root.innerHTML='<div class="card"><div class="card-body"><div class="empty">Impossibile caricare i dati Privacy.</div></div></div>';console.error(error);return}
 root.innerHTML='<div class="page-head"><div><h1>🔐 Dati Privacy</h1><p>Dati del Titolare da pubblicare nell’informativa Privacy.</p></div></div><div class="card"><div class="card-head"><h2>Dati del Titolare del trattamento</h2><span class="notice">Modifica qui: non serve intervenire nel codice</span></div><div class="card-body"><div class="section-grid"><div class="field"><label>TITOLARE / RAGIONE SOCIALE</label><input id="privacyTitolare" value="'+e(data?.titolare)+'" placeholder="Es. ASD o società sportiva"></div><div class="field"><label>SEDE</label><input id="privacySede" value="'+e(data?.sede)+'" placeholder="Indirizzo completo"></div><div class="field"><label>CODICE FISCALE / P.IVA</label><input id="privacyCfPiva" value="'+e(data?.cf_piva)+'" placeholder="CF o P.IVA"></div><div class="field"><label>E-MAIL PRIVACY</label><input id="privacyEmail" type="email" value="'+e(data?.email_privacy)+'" placeholder="privacy@..."></div><div class="field"><label>PEC (se disponibile)</label><input id="privacyPec" value="'+e(data?.pec)+'" placeholder="PEC"></div><div class="field"><label>DPO / RPD (solo se nominato)</label><input id="privacyDpo" value="'+e(data?.dpo)+'" placeholder="Nome e contatto oppure lascia vuoto"></div></div><div class="list-actions" style="margin-top:18px"><button class="btn primary" id="savePrivacy">💾 Salva dati Privacy</button><button class="btn" id="openPrivacy">👁️ Apri Privacy</button></div><p class="notice" style="margin-top:14px">Questi dati vengono salvati nel database e usati dalla pagina Privacy pubblica. Inserisci solo dati reali e verificati del Titolare.</p></div></div>';
 document.getElementById('savePrivacy').onclick=async()=>{
  const payload={titolare:document.getElementById('privacyTitolare').value.trim(),sede:document.getElementById('privacySede').value.trim(),cf_piva:document.getElementById('privacyCfPiva').value.trim(),email_privacy:document.getElementById('privacyEmail').value.trim(),pec:document.getElementById('privacyPec').value.trim(),dpo:document.getElementById('privacyDpo').value.trim(),updated_at:new Date().toISOString()};
  if(!payload.titolare||!payload.sede||!payload.cf_piva||!payload.email_privacy){alert('Compila almeno Titolare, sede, CF/P.IVA ed e-mail Privacy.');return}
  const{error}=await sb.from('privacy_settings').update(payload).eq('id',1);
  if(error){console.error(error);alert('Salvataggio non riuscito: '+error.message);return}
  alert('✅ Dati Privacy salvati.');loadPrivacyAdmin();
 };
 document.getElementById('openPrivacy').onclick=()=>window.open('privacy.html','_blank','noopener');
}
window.openAdminPrivacy=loadPrivacyAdmin;
})();