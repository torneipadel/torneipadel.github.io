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
        const email=String(session.user?.email||"").trim().toLowerCase();
        const superadminEmail=email==="giose.rizzi@gmail.com";
        const adminEmail=email==="boverob@libero.it"||email==="cfalba@libero.it";
        const ruoloAutorizzato=superadminEmail?"superadmin":adminEmail?"admin":"";

        if(!ruoloAutorizzato){
          window.location.href="2Page.html";
          return false;
        }

        if(superadminEmail){
          window.adminRuolo="superadmin";
          window.isSuperadmin=true;
          window.isAdmin=true;
          document.documentElement.dataset.adminRole="superadmin";

          const mini=document.getElementById("adminEmailMini");
          if(mini && session.user?.email) mini.textContent=session.user.email;

          const badge=document.getElementById("adminRoleBadge");
          if(badge){
            badge.textContent="👑 SUPERADMIN";
            badge.dataset.role="superadmin";
          }

          window.dispatchEvent(new CustomEvent("admin:role-ready",{
            detail:{ruolo:"superadmin",isSuperadmin:true,isAdmin:true}
          }));
          return true;
        }

        const ruolo=ruoloAutorizzato;

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
