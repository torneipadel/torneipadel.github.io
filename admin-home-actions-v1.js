(function(){
'use strict';
function addAdminHomeActions(){
  const root=document.getElementById('appContent');
  if(!root)return;
  if(document.getElementById('adminHomeActions'))return;
  const target=root.querySelector('.management-grid');
  if(!target)return;
  const card=document.createElement('div');
  card.id='adminHomeActions';
  card.className='card';
  card.style.marginTop='18px';
  card.innerHTML='<div class="card-head"><h2>📣 Comunicazioni e creazione</h2><span class="notice">Accesso rapido</span></div><div class="card-body"><div class="action-grid">'+
    '<button type="button" class="btn action-tile" id="adminHomeNewTournament">🏆 <strong>Crea nuovo torneo</strong><span>Avvia la procedura completa</span></button>'+ 
    '<button type="button" class="btn action-tile" id="adminHomeNews">📰 <strong>Crea News</strong><span>Nuova comunicazione</span></button>'+ 
    '<button type="button" class="btn action-tile" id="adminHomeWhatsApp">📱 <strong>Crea WhatsApp</strong><span>Prepara una comunicazione WhatsApp</span></button>'+ 
  '</div></div>';
  target.parentNode.insertBefore(card,target.nextSibling);
  document.getElementById('adminHomeNewTournament')?.addEventListener('click',()=>window.apriWizardTorneo?.());
  document.getElementById('adminHomeNews')?.addEventListener('click',()=>window.openAdminCommunication?.('news'));
  document.getElementById('adminHomeWhatsApp')?.addEventListener('click',()=>window.openAdminCommunication?.('whatsapp'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addAdminHomeActions);else addAdminHomeActions();
new MutationObserver(addAdminHomeActions).observe(document.body,{childList:true,subtree:true});
})();
