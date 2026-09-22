/* ADMIN ORGANIZATION COMPATIBILITY V3
 * The real admin pages already exist in admin.html and are managed by
 * admin-desktop-v3.js. The previous organization layer moved those real DOM
 * sections into synthetic org-page containers and periodically rebuilt/emptied
 * the tournament list, which emptied the real menus. This file remains referenced
 * by the historical admin shell, but is intentionally passive.
 */
(()=>{
  'use strict';
  function neutralize(){
    const a=document.getElementById('areaAdmin');
    if(!a)return;
    a.classList.remove('admin-organized');
    a.querySelectorAll('.org-page').forEach(p=>{
      p.classList.remove('org-active');
      p.style.display='none';
    });
    a.querySelectorAll('.admin-page').forEach(p=>{
      p.classList.remove('org-installed-hidden');
      if(p.id&&p.id.indexOf('page-')===0)p.style.display='';
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',neutralize);
  else neutralize();
  window.addEventListener('load',neutralize);
})();
