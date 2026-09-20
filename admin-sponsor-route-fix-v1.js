/* ADMIN SPONSOR ROUTE FIX — route indipendente dal flusso News. */
(()=>{
'use strict';
function openSponsor(){
  document.getElementById('mobileOverlay')?.classList.remove('open');
  const fn=window.openAdminSponsor;
  if(typeof fn==='function')return fn();
  const router=window.openAdminComPage;
  if(typeof router==='function')return router('sponsor');
}
function bind(){
  if(document.documentElement.dataset.sponsorRouteFix==='1')return;
  document.documentElement.dataset.sponsorRouteFix='1';
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('[data-com-page="sponsor"]');
    if(!b)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openSponsor();
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();