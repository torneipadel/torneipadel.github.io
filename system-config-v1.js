(function(){
'use strict';
const defaults={
nomeAttivita:'Organizzazione sportiva',
sottotitolo:'Tornei, sport e comunità',
logo:'loghi/icona_app1.jpg',
sfondo:'2pages.jpg',
email:'info@example.com',
telefono:'',
sede:'',
cfPiva:'',
whatsapp:'',
facebook:'',
instagram:'',
descrizione:''
};
const KEY='np_system_config';
let saved={};
try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){saved={}}
window.NP_SYSTEM_CONFIG=Object.assign({},defaults,saved);
const PROJECT_URL='https://iybjvtmfaupgthqqsngd.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl';
try{
  const xhr=new XMLHttpRequest();
  xhr.open('GET',PROJECT_URL+'/rest/v1/system_config?id=eq.1&select=config',false);
  xhr.setRequestHeader('apikey',PUBLISHABLE_KEY);
  xhr.setRequestHeader('Authorization','Bearer '+PUBLISHABLE_KEY);
  xhr.send(null);
  if(xhr.status>=200&&xhr.status<300){
    const rows=JSON.parse(xhr.responseText);
    if(rows&&rows[0]&&rows[0].config){
      const remote=Object.assign({},defaults,rows[0].config);
      window.NP_SYSTEM_CONFIG=remote;
      try{localStorage.setItem(KEY,JSON.stringify(remote))}catch(e){}
    }
  }
}catch(e){}
})();