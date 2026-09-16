(function(){
  const STORAGE_KEY="nextpoint_language";
  const LANGS={
    it:{flag:"🇮🇹",short:"IT",name:"Italiano",dir:"ltr"},
    en:{flag:"🇺🇸",short:"EN",name:"English",dir:"ltr"},
    fr:{flag:"🇫🇷",short:"FR",name:"Français",dir:"ltr"},
    es:{flag:"🇪🇸",short:"ES",name:"Español",dir:"ltr"}
  };
  const TEXT={
    it:{
      brandSub:"Tornei • Eventi • Competizioni di padel",
      access:"Accesso utenti",emailLabel:"Email",emailPlaceholder:"Inserisci la tua email",
      passwordLabel:"Password",passwordPlaceholder:"Inserisci la tua password",remember:"Ricordami",
      forgot:"Password dimenticata?",login:"ACCEDI",register:"REGISTRATI",
      notRegistered:"Non sei iscritto?",registerLink:"Registrati",
      enterCredentials:"Inserisci email e password",registering:"Registrazione in corso...",
      registered:"Registrazione completata. Ora puoi accedere.",accessing:"Accesso in corso...",
      resetSending:"Invio richiesta reset password...",resetSent:"Controlla la tua email per reimpostare la password",
      enterEmail:"Inserisci prima la tua email",language:"Lingua"
    },
    en:{
      brandSub:"Tournaments • Events • Padel competitions",
      access:"User login",emailLabel:"Email",emailPlaceholder:"Enter your email",
      passwordLabel:"Password",passwordPlaceholder:"Enter your password",remember:"Remember me",
      forgot:"Forgot password?",login:"LOGIN",register:"REGISTER",
      notRegistered:"Not registered?",registerLink:"Register",
      enterCredentials:"Enter email and password",registering:"Registration in progress...",
      registered:"Registration completed. You can now log in.",accessing:"Signing in...",
      resetSending:"Sending password reset request...",resetSent:"Check your email to reset your password",
      enterEmail:"Enter your email first",language:"Language"
    },
    fr:{
      brandSub:"Tournois • Événements • Compétitions de padel",
      access:"Accès utilisateurs",emailLabel:"E-mail",emailPlaceholder:"Saisissez votre e-mail",
      passwordLabel:"Mot de passe",passwordPlaceholder:"Saisissez votre mot de passe",remember:"Se souvenir de moi",
      forgot:"Mot de passe oublié ?",login:"SE CONNECTER",register:"S’INSCRIRE",
      notRegistered:"Pas encore inscrit ?",registerLink:"Inscrivez-vous",
      enterCredentials:"Saisissez votre e-mail et votre mot de passe",registering:"Inscription en cours...",
      registered:"Inscription terminée. Vous pouvez maintenant vous connecter.",accessing:"Connexion en cours...",
      resetSending:"Envoi de la demande de réinitialisation...",resetSent:"Consultez votre e-mail pour réinitialiser votre mot de passe",
      enterEmail:"Saisissez d’abord votre e-mail",language:"Langue"
    },
    es:{
      brandSub:"Torneos • Eventos • Competiciones de pádel",
      access:"Acceso de usuarios",emailLabel:"Correo electrónico",emailPlaceholder:"Introduce tu correo electrónico",
      passwordLabel:"Contraseña",passwordPlaceholder:"Introduce tu contraseña",remember:"Recordarme",
      forgot:"¿Has olvidado la contraseña?",login:"ACCEDER",register:"REGISTRARSE",
      notRegistered:"¿No estás registrado?",registerLink:"Regístrate",
      enterCredentials:"Introduce el correo electrónico y la contraseña",registering:"Registrando...",
      registered:"Registro completado. Ya puedes acceder.",accessing:"Iniciando sesión...",
      resetSending:"Enviando solicitud para restablecer la contraseña...",resetSent:"Revisa tu correo electrónico para restablecer la contraseña",
      enterEmail:"Introduce primero tu correo electrónico",language:"Idioma"
    }
  };
  function current(){return localStorage.getItem(STORAGE_KEY)||"it";}
  function getText(key){const lang=current();return (TEXT[lang]&&TEXT[lang][key])||TEXT.it[key]||key;}
  function setLanguage(lang){
    if(!LANGS[lang]) lang="it";
    localStorage.setItem(STORAGE_KEY,lang);
    document.documentElement.lang=lang;
    document.documentElement.dir=LANGS[lang].dir;
    document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(TEXT[lang][key]!==undefined)el.textContent=TEXT[lang][key];});
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const key=el.dataset.i18nPlaceholder;if(TEXT[lang][key]!==undefined)el.placeholder=TEXT[lang][key];});
    const selector=document.getElementById("languageSelector");
    if(selector){
      const active=LANGS[lang];
      const currentLabel=selector.querySelector(".language-current");
      if(currentLabel)currentLabel.textContent=active.flag+" "+active.short+" ▾";
      selector.querySelectorAll("[data-lang]").forEach(item=>item.classList.toggle("active",item.dataset.lang===lang));
    }
    document.dispatchEvent(new CustomEvent("nextpointlanguagechange",{detail:{language:lang}}));
  }
  function init(){
    const selector=document.getElementById("languageSelector");
    if(selector){
      const button=selector.querySelector(".language-button");
      button.addEventListener("click",function(e){e.stopPropagation();selector.classList.toggle("open");});
      selector.querySelectorAll("[data-lang]").forEach(item=>item.addEventListener("click",function(){setLanguage(item.dataset.lang);selector.classList.remove("open");}));
      document.addEventListener("click",function(){selector.classList.remove("open");});
    }
    setLanguage(current());
  }
  window.NextPointLanguage={setLanguage,getText,current,LANGS,TEXT};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();