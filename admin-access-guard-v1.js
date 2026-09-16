(function(){
  'use strict';
  document.documentElement.classList.add('admin-auth-checking');

  const client=window.supabase.createClient(
    "https://iybjvtmfaupgthqqsngd.supabase.co",
    "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",
    {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
  );

  async function verificaAccessoAdmin(){
    try{
      const {data:{session}}=await client.auth.getSession();
      if(!session){
        window.location.href="index.html";
        return;
      }

      const {data:profilo,error}=await client
        .from("profili")
        .select("ruolo")
        .eq("user_id",session.user.id)
        .maybeSingle();

      if(error || !profilo || profilo.ruolo!=="admin"){
        window.location.href="2Page.html";
        return;
      }

      document.documentElement.classList.remove('admin-auth-checking');
    }catch(e){
      console.error("Errore verifica accesso amministratore:",e);
      window.location.href="2Page.html";
    }
  }

  verificaAccessoAdmin();
})();
