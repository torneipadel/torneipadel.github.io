(function(){
  'use strict';

  function init(){
    const client=window.sb||window.supabaseClient;
    if(!client){
      setTimeout(init,25);
      return;
    }

    async function verificaAccessoAdmin(session){
      if(!session)return true;
      try{
        const {data:profilo,error}=await client
          .from("profili")
          .select("ruolo")
          .eq("user_id",session.user.id)
          .maybeSingle();

        if(error || !profilo || profilo.ruolo!=="admin"){
          window.location.href="2Page.html";
          return false;
        }
        return true;
      }catch(e){
        console.error("Errore verifica accesso amministratore:",e);
        window.location.href="2Page.html";
        return false;
      }
    }

    client.auth.getSession().then(({data:{session}})=>verificaAccessoAdmin(session));

    client.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_IN" && session) verificaAccessoAdmin(session);
      if(event==="SIGNED_OUT") window.location.href="index.html";
    });
  }

  init();
})();
