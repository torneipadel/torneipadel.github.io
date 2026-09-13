/*
 * BACKUP ESATTO DELLA LOGICA FUNZIONALE DI index.html
 * Sorgente: index.html
 * SHA: 2f15312df00440fb7093d18f688a1f351824309d
 *
 * Questo file conserva le tre funzioni operative originali,
 * mantenendo anche i listener esattamente nella forma originale.
 */

const sb=supabase.createClient("https://iybjvtmfaupgthqqsngd.supabase.co","sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl",{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const status=document.getElementById("status");
document.getElementById("registerBtn").addEventListener("click",async()=>{const email=document.getElementById("email").value.trim();const password=document.getElementById("password").value;if(!email||!password){status.innerHTML="Inserisci email e password";return}status.innerHTML="Registrazione in corso...";const {error}=await sb.auth.signUp({email,password});if(error){status.innerHTML="Errore: "+error.message;return}status.innerHTML="Registrazione completata. Ora puoi accedere."});
document.getElementById("loginBtn").addEventListener("click",async()=>{const email=document.getElementById("email").value.trim();const password=document.getElementById("password").value;if(!email||!password){status.innerHTML="Inserisci email e password";return}status.innerHTML="Accesso in corso...";const {error}=await sb.auth.signInWithPassword({email,password});if(error){status.innerHTML=error.message;return}window.location.href="2Page.html"});
async function resetPassword(){const email=document.getElementById("email").value.trim();if(!email){status.innerHTML="Inserisci prima la tua email";return}status.innerHTML="Invio richiesta reset password...";const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+"/reset-password.html"});if(error){status.innerHTML="Errore: "+error.message;return}status.innerHTML="✅ Controlla la tua email per reimpostare la password"}
