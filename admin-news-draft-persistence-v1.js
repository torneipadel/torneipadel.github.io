(()=>{
'use strict';
const q=s=>document.querySelector(s);
const selected=()=>window.getTorneoAdminCorrente?.()||((window.adminState?.tornei||[]).find(t=>String(t.id)===String(window.adminState?.torneoSelezionato))||null);
const fieldIds=['naiType','naiTitle','naiDate','naiTime','naiLocation','naiPairs','naiLevel','naiFee','naiDeadline','naiOffer','naiProduct','naiPrice','naiCta'];
const draftKey=()=>`news-ai-draft-${String(selected()?.id||'')}`;
const readDataUrl=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(new Error('Impossibile leggere la foto della locandina.'));r.readAsDataURL(file)});
async function compressPhoto(file){
 if(!file)return '';
 const data=await readDataUrl(file);
 const img=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=()=>reject(new Error('Impossibile preparare la foto della locandina.'));x.src=data});
 const c=document.createElement('canvas');c.width=1080;c.height=1350;
 const ctx=c.getContext('2d');
 const scale=Math.max(c.width/img.width,c.height/img.height),w=img.width*scale,h=img.height*scale;
 ctx.drawImage(img,(c.width-w)/2,(c.height-h)/2,w,h);
 let out=c.toDataURL('image/jpeg',.78);
 if(out.length>3500000)out=c.toDataURL('image/jpeg',.62);
 return out;
}
function readLayers(){
 return [...document.querySelectorAll('#naiManualLayers .nai-manual-layer')].map(box=>{
  const nums={};
  box.querySelectorAll('.nai-photo-num').forEach(e=>nums[e.dataset.k]=Number(e.value)||0);
  return {
   text:box.querySelector('.nai-photo-text')?.value||'',
   x:nums.x??540,y:nums.y??200,size:nums.size??64,
   color:box.querySelector('.nai-photo-color')?.value||'#fff',
   align:box.querySelector('.nai-photo-align')?.value||'center',
   weight:box.querySelector('.nai-photo-weight')?.value||'700'
  };
 }).filter(x=>x.text.trim());
}
async function saveDraft(){
 const t=selected();
 if(!t)return;
 const draft={};
 fieldIds.forEach(id=>{const e=q('#'+id);if(e)draft[id]=e.value});
 draft.layers=readLayers();
 const photo=q('#naiPhotoInput')?.files?.[0];
 if(photo)draft.photo=await compressPhoto(photo);
 try{
  localStorage.setItem(draftKey(),JSON.stringify(draft));
  const status=q('#naiStatus');
  if(status)status.textContent='Bozza salvata localmente. Non è ancora pubblicata.';
 }catch(e){console.error('Salvataggio bozza News:',e);alert('Impossibile salvare la bozza localmente. La foto potrebbe essere troppo grande.');}
}
function setFileInput(dataUrl){
 const input=q('#naiPhotoInput');
 if(!input||!dataUrl)return false;
 try{
  const comma=dataUrl.indexOf(',');
  const meta=comma>0?dataUrl.slice(0,comma):'data:image/jpeg;base64';
  const mime=(meta.match(/data:([^;]+)/)||[])[1]||'image/jpeg';
  const bytes=atob(dataUrl.slice(comma+1));
  const arr=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);
  const file=new File([arr],'locandina-bozza.jpg',{type:mime});
  const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  return true;
 }catch(e){console.error('Ripristino foto bozza:',e);return false;}
}
function clearLayers(){document.querySelectorAll('#naiManualLayers .nai-photo-layer-delete').forEach(b=>b.click())}
function restoreLayers(layers){
 if(!Array.isArray(layers)||!layers.length)return;
 const add=q('#naiPhotoAdd');if(!add)return;
 clearLayers();
 layers.forEach(l=>{
  add.click();
  const box=[...document.querySelectorAll('#naiManualLayers .nai-manual-layer')].at(-1);if(!box)return;
  const ta=box.querySelector('.nai-photo-text');if(ta){ta.value=l.text||'';ta.dispatchEvent(new Event('input',{bubbles:true}))}
  box.querySelectorAll('.nai-photo-num').forEach(e=>{if(e.dataset.k in l){e.value=l[e.dataset.k];e.dispatchEvent(new Event('input',{bubbles:true}))}});
  const color=box.querySelector('.nai-photo-color');if(color&&l.color){color.value=l.color;color.dispatchEvent(new Event('input',{bubbles:true}))}
  const align=box.querySelector('.nai-photo-align');if(align&&l.align){align.value=l.align;align.dispatchEvent(new Event('change',{bubbles:true}))}
  const weight=box.querySelector('.nai-photo-weight');if(weight&&l.weight){weight.value=l.weight;weight.dispatchEvent(new Event('change',{bubbles:true}))}
 });
}
let restoredKey='';
async function restoreDraft(){
 const t=selected(),key=draftKey();
 if(!t||!key||key===restoredKey)return;
 const raw=localStorage.getItem(key);if(!raw)return;
 let draft;try{draft=JSON.parse(raw)}catch(e){return}
 if(!q('#naiSaveDraft'))return;
 restoredKey=key;
 fieldIds.forEach(id=>{const e=q('#'+id);if(e&&draft[id]!=null)e.value=draft[id]});
 if(draft.photo)setFileInput(draft.photo);
 setTimeout(()=>restoreLayers(draft.layers),700);
 const status=q('#naiStatus');if(status)status.textContent='Bozza locale ripristinata.';
}
function bind(){
 const b=q('#naiSaveDraft');
 if(b){b.onclick=()=>saveDraft().catch(e=>{console.error(e);alert('Impossibile salvare la bozza.');});}
 restoreDraft();
}
const obs=new MutationObserver(bind);obs.observe(document.body,{childList:true,subtree:true});
window.addEventListener('admin:render',()=>{restoredKey='';setTimeout(bind,80)});
setTimeout(bind,700);
})();