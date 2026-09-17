(()=>{
'use strict';

const sup=window.supabase;
if(!sup?.createClient)return;
if(sup.createClient.__adminSingletonWrapper)return;

const originalCreateClient=sup.createClient.bind(sup);
const singletonCreateClient=function(...args){
  const existing=window.supabaseClient||window.sb;
  if(existing)return existing;
  const client=originalCreateClient(...args);
  window.sb=client;
  window.supabaseClient=client;
  return client;
};

singletonCreateClient.__adminSingletonWrapper=true;
sup.createClient=singletonCreateClient;
})();
