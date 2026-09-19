(function(){
  'use strict';
  const STORAGE_KEY='padel_admin_state';

  function setUI(isAdmin){
    document.documentElement.classList.remove('admin-auth-checking');
    document.getElementById('boxLoginAdmin')?.classList.toggle('hidden',isAdmin);
    document.getElementById('areaAdmin')?.classList.toggle('hidden',!isAdmin);
  }

  function clearLocalAdminState(){
    try{localStorage.removeItem(STORAGE_KEY)}catch(e){}
    if(window.adminState){
      window.adminState.adminLoggato=false;
      window.adminState.adminEmail='';
    }
  }

  async function verificaAccessoAdmin(session){
    const client=window.sb||window.supabaseClient;
    if(!session){
      window.__ADMIN_AUTH_OK__=false;
      clearLocalAdminState();
      setUI(false);
      return false;
    }
    try{
      const {data:profilo,error}=await client.from('profili').select('ruolo').eq('user_id',session.user.id).maybeSingle();
      if(error||!profilo||String(profilo.ruolo||'').toLowerCase()!=='admin'){
        window.__ADMIN_AUTH_OK__=false;
        clearLocalAdminState();
        setUI(false);
        try{await client.auth.signOut()}catch(e){}
        window.location.href='2Page.html';
        return false;
      }
      window.__ADMIN_AUTH_OK__=true;
      setUI(true);
      window.dispatchEvent(new CustomEvent('admin:auth-verified'));
      return true;
    }catch(e){
      console.error('Errore verifica accesso amministratore:',e);
      clearLocalAdminState();
      setUI(false);
      try{await client.auth.signOut()}catch(_e){}
      window.location.href='2Page.html';
      return false;
    }
  }

  function wrapLoginAdmin(client){
    if(typeof window.loginAdmin!=='function'||window.loginAdmin.__roleGuardWrapped)return false;
    const original=window.loginAdmin;
    const wrapped=async function(){
      window.__ADMIN_AUTH_OK__=false;
      const result=await original.apply(this,arguments);
      const {data:{session}}=await client.auth.getSession();
      await verificaAccessoAdmin(session);
      return result;
    };
    wrapped.__roleGuardWrapped=true;
    window.loginAdmin=wrapped;
    return true;
  }

  function init(){
    document.documentElement.classList.add('admin-auth-checking');
    const client=window.sb||window.supabaseClient;
    if(!client){setTimeout(init,25);return}

    client.auth.getSession().then(({data:{session}})=>verificaAccessoAdmin(session));
    client.auth.onAuthStateChange((event,session)=>{
      if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED')verificaAccessoAdmin(session);
      if(event==='SIGNED_OUT'){
        clearLocalAdminState();
        setUI(false);
        window.location.href='index.html';
      }
    });

    const timer=setInterval(()=>{if(wrapLoginAdmin(client))clearInterval(timer)},25);
    setTimeout(()=>clearInterval(timer),10000);
  }

  init();
})();
