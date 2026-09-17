/* NEXT POINT PADEL — VISITATORE SESSION WATCHDOG V1
   Evita che il pannello sessione resti bloccato su "Caricamento..."
   se l'inizializzazione/auth di visitatore-public-v2.js non conclude.
   Non modifica il flusso esistente quando questo ha già completato.
*/
(function(){
'use strict';
const URL_SUPABASE='https://iybjvtmfaupgthqqsngd.supabase.co';
const KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
const WAIT_MS=5000;
function renderGuest(box){
  if(!box)return;
  box.innerHTML='<div><h3>Benvenuto su Next Point Padel</h3><p>Accedi per vedere iscrizioni e torneo personale.</p></div><a class="np-btn np-primary" href="index.html">ACCEDI</a>';
}
function renderUser(box,user){
  if(!box)return;
  box.innerHTML=`<div><h3>👋 Bentornato</h3><p>${String(user?.email||'Utente collegato').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</p></div><a class="np-btn np-primary" href="#mioTorneo">IL MIO TORNEO</a>`;
}
async function run(){
  const box=document.getElementById('npUser');
  if(!box)return;
  const title=box.querySelector('h3');
  if(!title||title.textContent.trim()!=='Caricamento...')return;
  try{
    if(!window.supabase||typeof window.supabase.createClient!=='function'){
      renderGuest(box);
      return;
    }
    const client=window.supabase.createClient(URL_SUPABASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const result=await Promise.race([
      client.auth.getSession(),
      new Promise(resolve=>setTimeout(()=>resolve({timeout:true}),WAIT_MS))
    ]);
    if(box.querySelector('h3')?.textContent.trim()!=='Caricamento...')return;
    if(result?.timeout){
      renderGuest(box);
      console.warn('[VISITATORE] Verifica sessione oltre il timeout: pannello sbloccato.');
      return;
    }
    renderUser(box,result?.data?.session?.user||null);
  }catch(err){
    console.warn('[VISITATORE] Session watchdog:',err);
    if(box.querySelector('h3')?.textContent.trim()==='Caricamento...')renderGuest(box);
  }
}
setTimeout(run,WAIT_MS);
})();
