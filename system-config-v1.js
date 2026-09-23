(function(){
'use strict';
const defaults={
nomeAttivita:'Next Point Padel',
sottotitolo:'Tornei, sport e comunità',
logo:'loghi/icona_app1.jpg',
sfondo:'2pages.jpg',
email:'info@nextpointpadel.it',
telefono:'+39 333444556',
sede:'',
cfPiva:'',
whatsapp:'',
facebook:'',
instagram:'',
descrizione:''
};
let saved={};
try{saved=JSON.parse(localStorage.getItem('np_system_config')||'{}')||{}}catch(e){saved={}}
window.NP_SYSTEM_CONFIG=Object.assign({},defaults,saved);
})();