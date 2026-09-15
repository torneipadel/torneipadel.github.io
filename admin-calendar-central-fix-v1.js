(()=>{
'use strict';
function bindCentralCalendar(){
  const root=document.getElementById('appContent');
  if(!root||root.dataset.centralCalendarFix==='1')return;
  root.dataset.centralCalendarFix='1';
  root.addEventListener('click',function(event){
    const button=event.target.closest('#calendar');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(typeof window.openAdminCalendar==='function')window.openAdminCalendar();
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindCentralCalendar,{once:true});
else bindCentralCalendar();
})();
