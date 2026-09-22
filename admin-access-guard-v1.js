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

        const ruoloDb=String(profilo?.ruolo||"").trim().toLowerCase();
        const email=String(session.user?.email||"").trim().toLowerCase();
        const superadminEmail=email==="giose.rizzi@gmail.com";
        const ruolo=superadminEmail?"superadmin":ruoloDb;
        const autorizzato=ruolo==="admin"||ruolo==="superadmin";

        if(error || !profilo || !autorizzato){
          window.location.href="2Page.html";
          return false;
        }

        window.adminRuolo=ruolo;
        window.isSuperadmin=ruolo==="superadmin";
        window.isAdmin=ruolo==="admin"||ruolo==="superadmin";

        document.documentElement.dataset.adminRole=ruolo;

        const mini=document.getElementById("adminEmailMini");
        if(mini && session.user?.email){
          mini.textContent=session.user.email;
        }

        const badge=document.getElementById("adminRoleBadge");
        if(badge){
          badge.textContent=ruolo==="superadmin"?"👑 SUPERADMIN":"👤 ADMIN";
          badge.dataset.role=ruolo;
        }

        window.dispatchEvent(new CustomEvent("admin:role-ready",{
          detail:{ruolo,isSuperadmin:ruolo==="superadmin",isAdmin:true}
        }));

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
