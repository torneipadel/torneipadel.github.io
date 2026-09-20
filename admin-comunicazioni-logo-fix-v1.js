/* ADMIN COMUNICAZIONI LOGO FIX — solo anteprima logo sponsor.
   Non modifica la route News e non intercetta il click News.
*/
(()=>{
'use strict';

function bindSponsorLogoPreview(){
  const input=document.getElementById('sponsorLogo');
  if(!input||input.dataset.logoPreviewBound)return;
  input.dataset.logoPreviewBound='1';

  const wrap=document.createElement('div');
  wrap.id='sponsorLogoPreview';
  wrap.style.cssText='margin-top:10px;width:180px;height:90px;border:1px solid rgba(148,163,184,.35);border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;';

  const img=document.createElement('img');
  img.alt='Anteprima logo sponsor';
  img.style.cssText='max-width:100%;max-height:100%;object-fit:contain;display:none;';
  wrap.appendChild(img);
  input.insertAdjacentElement('afterend',wrap);

  input.addEventListener('change',()=>{
    const file=input.files?.[0];
    if(!file){
      img.removeAttribute('src');
      img.style.display='none';
      return;
    }

    const allowed=['image/png','image/jpeg','image/webp','image/svg+xml'];
    if(!allowed.includes(file.type)){
      alert('Il logo deve essere un file PNG, JPG, WEBP o SVG.');
      input.value='';
      img.removeAttribute('src');
      img.style.display='none';
      return;
    }

    if(file.size>2*1024*1024){
      alert('Il logo è troppo grande. Usa un file massimo di 2 MB.');
      input.value='';
      img.removeAttribute('src');
      img.style.display='none';
      return;
    }

    const reader=new FileReader();
    reader.onload=()=>{
      img.src=String(reader.result||'');
      img.style.display='block';
    };
    reader.readAsDataURL(file);
  });
}

function initSponsorLogoPreview(){
  if(!document.body){
    document.addEventListener('DOMContentLoaded',bindSponsorLogoPreview,{once:true});
    return;
  }

  bindSponsorLogoPreview();

  const observer=new MutationObserver(()=>bindSponsorLogoPreview());
  observer.observe(document.body,{childList:true,subtree:true});
}

initSponsorLogoPreview();
})();
