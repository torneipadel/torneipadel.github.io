/* ============================================================
   TABELLONE FIX
   Corregge esclusivamente la visualizzazione:
   - classifiche A/B/C/D/E/F
   - nomi squadre nelle celle dei gironi
   Non modifica calc(), KO, risultati o Supabase.
   ============================================================ */

(function(){
    function installaFix(){
        if(typeof window.state === "undefined") return false;
        if(typeof window.calc !== "function") return false;
        window.renderClass = function(){
            ["A","B","C","D","E","F"].forEach(tag=>{
                const tbody=document.getElementById(tag+"class");
                if(!tbody) return;
                tbody.innerHTML="";
                const squadre=state[tag];
                if(!Array.isArray(squadre)||squadre.length===0) return;
                const risultati=Array.isArray(state[tag+"res"])?state[tag+"res"]:[];
                const classifica=calc(squadre,risultati);
                if(!Array.isArray(classifica)) return;
                classifica.forEach(x=>{
                    const tr=document.createElement("tr");
                    [x?.n??"",x?.pt??0,x?.gf??0,x?.gs??0,x?.df??0].forEach((valore,indice)=>{
                        const td=document.createElement("td");
                        td.textContent=valore;
                        if(indice===0&&x?.qual) td.style.fontWeight="700";
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
            });
        };
        let style=document.getElementById("tabelloneFixVisuale");
        if(!style){style=document.createElement("style");style.id="tabelloneFixVisuale";document.head.appendChild(style);}
        style.textContent=`
            table td.match-cell{height:auto!important;min-height:68px!important;padding:8px 6px!important;vertical-align:middle!important;overflow:visible!important;white-space:normal!important}
            table td.match-cell .team-line{display:block!important;width:100%!important;height:auto!important;min-height:20px!important;line-height:1.2!important;margin:0!important;padding:2px 0!important;white-space:normal!important;overflow:visible!important;overflow-wrap:anywhere!important;word-break:break-word!important;box-sizing:border-box!important}
            table td.match-cell .vs-line{display:block!important;height:auto!important;min-height:18px!important;line-height:18px!important;margin:2px 0!important;padding:0!important;white-space:normal!important}
            #Arows tr,#Brows tr,#Crows tr,#Drows tr,#Erows tr,#Frows tr{height:auto!important}
            #Arows td,#Brows td,#Crows td,#Drows td,#Erows td,#Frows td{vertical-align:middle!important}
            #Aclass tr,#Bclass tr,#Cclass tr,#Dclass tr,#Eclass tr,#Fclass tr{height:auto!important}
            #Aclass td,#Bclass td,#Cclass td,#Dclass td,#Eclass td,#Fclass td{height:auto!important;padding:7px 4px!important;vertical-align:middle!important}
        `;
        if(typeof window.render==="function"&&!window.__TABELLONE_FIX_RENDER__){
            const renderOriginale=window.render;
            window.render=function(){const risultato=renderOriginale.apply(this,arguments);try{window.renderClass()}catch(e){console.error("TABELLONE FIX renderClass:",e)}return risultato};
            window.__TABELLONE_FIX_RENDER__=true;
        }
        try{window.renderClass()}catch(e){console.error("TABELLONE FIX iniziale:",e)}
        console.log("TABELLONE FIX INSTALLATO: classifiche + nomi gironi");
        return true;
    }
    if(installaFix()) return;
    let tentativi=0;
    const timer=setInterval(()=>{tentativi++;if(installaFix()||tentativi>=120)clearInterval(timer)},500);
})();

/* ============================================================
   SPONSOR TABELLONE
   SOLO INSERIMENTO PUBBLICITARIO.
   Usa esclusivamente il client Supabase già creato da Bove.html.
   ============================================================ */
(function(){
    function getClient(){return window.supabaseClient||window.sb||null;}
    function parseConfig(value){
        if(value&&typeof value==='object') return value;
        if(typeof value==='string'){try{return JSON.parse(value)||{}}catch(e){return {}}}
        return {};
    }
    function installaSponsor(){
        if(document.getElementById("tabelloneSponsor")) return true;
        const container=document.querySelector(".container");
        if(!container) return false;
        const style=document.createElement("style");style.id="tabelloneSponsorStyle";style.textContent=`
            #tabelloneSponsor{width:100%;margin:28px auto 8px;padding:14px 0 6px;text-align:center}
            #tabelloneSponsor .sponsor-title{font-size:14px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:10px;color:#e5e7eb}
            #tabelloneSponsor .sponsor-window{width:100%;overflow:hidden;border-radius:14px;background:rgba(17,24,39,.15);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.4)}
            #tabelloneSponsor .sponsor-track{display:flex;align-items:stretch;justify-content:center;gap:12px;width:max-content;min-width:100%;padding:9px}
            #tabelloneSponsor .sponsor-item{width:185px;min-height:58px;padding:9px 12px;border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(17,24,39,.15);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.4);color:#e5e7eb;text-decoration:none;box-sizing:border-box}
            #tabelloneSponsor .sponsor-name{font-weight:800;font-size:13px;line-height:1.2}.sponsor-desc{font-size:11px;opacity:.82;margin-top:4px;line-height:1.2}.sponsor-empty{padding:12px;font-size:12px;opacity:.78}
            @media(max-width:600px){#tabelloneSponsor{margin-top:22px}#tabelloneSponsor .sponsor-item{width:155px;min-height:54px}#tabelloneSponsor .sponsor-title{font-size:13px}}
        `;document.head.appendChild(style);
        const banner=document.createElement("section");banner.id="tabelloneSponsor";banner.innerHTML='<div class="sponsor-title">I nostri sponsor</div><div class="sponsor-window"><div class="sponsor-track"><div class="sponsor-empty">Caricamento sponsor...</div></div></div>';container.appendChild(banner);
        const track=banner.querySelector(".sponsor-track");
        const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
        const client=getClient();
        if(!client){track.innerHTML='<div class="sponsor-empty">Sponsor non disponibili</div>';return true;}
        (async()=>{try{
            const {data,error}=await client.from("tornei").select("id,configurazione");
            if(error) throw error;
            const sponsors=[],seen=new Set();
            (data||[]).forEach(t=>{const cfg=parseConfig(t.configurazione);const list=Array.isArray(cfg.sponsor)?cfg.sponsor:[];list.forEach(s=>{const nome=String(s?.nome||"").trim(),url=String(s?.url||"").trim(),descrizione=String(s?.descrizione||"").trim();if(!nome)return;const key=String(s?.id||"")||`${nome}|${url}`;if(seen.has(key))return;seen.add(key);sponsors.push({nome,url,descrizione})})});
            if(!sponsors.length){track.innerHTML='<div class="sponsor-empty">Nessuno sponsor configurato</div>';return;}
            track.innerHTML=sponsors.map(s=>{const inner=`<span class="sponsor-name">${esc(s.nome)}</span>${s.descrizione?`<span class="sponsor-desc">${esc(s.descrizione)}</span>`:""}`;return s.url?`<a class="sponsor-item" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<div class="sponsor-item">${inner}</div>`}).join("");
        }catch(e){console.error("SPONSOR TABELLONE:",e);track.innerHTML='<div class="sponsor-empty">Sponsor non disponibili</div>'}})();
        return true;
    }
    if(installaSponsor()) return;let tentativiSponsor=0;const timerSponsor=setInterval(()=>{tentativiSponsor++;if(installaSponsor()||tentativiSponsor>=120)clearInterval(timerSponsor)},500);
})();
