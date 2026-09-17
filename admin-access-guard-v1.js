(function(){
  'use strict';

  const client=window.supabase.createClient(
    "https://iybjvtmfaupgthqqsngd.supabase.co",
    "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",
    {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
  );

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
})();
