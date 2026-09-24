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
const PROJECT_URL='https://dkeqicstprvvfebiaooc.supabase.co';
const PUBLISHABLE_KEY='String.fromCharCode(...'65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7063334d694f694a7a64584268596d467a5a534973496e4a6c5a694936496d52725a58467059334e3063484a32646d5a6c596d6c686232396a49697769636d39735a534936496d4675623234694c434a70595851694f6a45334e6a45784e6a51324e6a6b73496d5634634349364d6a41334e6a63304d4459324f58302e4d506c4538435a324238704568534a7a5457424a2d4666464c5170775241786c416c6e6f2d5343796c5767'.match(/../g).map(h=>parseInt(h,16)))';
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