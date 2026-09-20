/* NEXT POINT PADEL — TV MODE REAL-TIME V1
   Visualizzazione torneo per Smart TV / monitor.
   Fonte unica: public.tornei.configurazione
*/
(function(){
  "use strict";

  const SUPABASE_URL = "https://iybjvtmfaupgthqqsngd.supabase.co";
  const SUPABASE_KEY = "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl";

  let sb = null;
  let channel = null;
  let currentId = null;
  let state = null;
  let reconnectTimer = null;

  const $ = (s,root=document) => root.querySelector(s);

  function esc(v){
    return String(v == null ? "" : v)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function displayTeam(v){
    if(v == null) return "";
    if(typeof v === "string") return v.replace(/^\s+|\s+$/g,"");
    if(typeof v === "object"){
      if(v.n != null) return displayTeam(v.n);
      if(v.nome != null) return displayTeam(v.nome);
      if(v.coppia != null) return displayTeam(v.coppia);
      if(v.cognome1 != null || v.cognome2 != null)
        return [v.cognome1,v.cognome2].filter(Boolean).join(" / ");
    }
    return String(v);
  }

  function pairKey(v){ return displayTeam(v); }

  function resultParts(v){
    const p=String(v==null?"":v).split("-");
    return [p[0]==="-"?"":(p[0]||""),p[1]||""];
  }

  function matchList(st,tag){
    const teams=Array.isArray(st[tag]) ? st[tag] : [];
    if(teams.length<2) return [];
    if(st.partiteGironi && Array.isArray(st.partiteGironi[tag]))
      return st.partiteGironi[tag];

    const out=[];
    for(let i=0;i<teams.length;i++)
      for(let j=i+1;j<teams.length;j++)
        out.push({casa:i,ospite:j});
    return out;
  }

  function groupHtml(st,tag){
    const teams=Array.isArray(st[tag]) ? st[tag] : [];
    if(!teams.length) return "";
    const matches=matchList(st,tag);
    const res=Array.isArray(st[tag+"res"]) ? st[tag+"res"] : [];
    const times=Array.isArray(st[tag+"time"]) ? st[tag+"time"] : [];
    const fields=Array.isArray(st[tag+"camp"]) ? st[tag+"camp"] : [];

    return '<section class="group"><h2>Girone '+esc(tag)+'</h2>'+
      '<div class="table-wrap"><table><thead><tr><th>Campo</th><th>Ora</th><th>Match</th><th>Ris</th></tr></thead><tbody>'+
      matches.map((m,i)=>{
        const a=m.casa!==undefined?m.casa:m[0];
        const b=m.ospite!==undefined?m.ospite:m[1];
        const r=resultParts(res[i]||"-");
        return '<tr><td>'+esc(fields[i]||"")+'</td><td>'+esc(times[i]||"")+'</td><td><b>'+
          esc(displayTeam(teams[a]))+'</b><span class="vs">VS</span><b>'+esc(displayTeam(teams[b]))+
          '</b></td><td class="score">'+esc(r[0])+' - '+esc(r[1])+'</td></tr>';
      }).join("")+'</tbody></table></div></section>';
  }

  function calc(st,tag){
    const teams=Array.isArray(st[tag])?st[tag]:[];
    const results=Array.isArray(st[tag+"res"])?st[tag+"res"]:[];
    const rules=st.rules||{};
    const rows=teams.map((n,i)=>({n:displayTeam(n),i,pt:0,gf:0,gs:0,df:0}));
    const matches=matchList(st,tag);
    matches.forEach((m,i)=>{
      const r=resultParts(results[i]);
      if(r[0]===""||r[1]==="") return;
      const a=Number(r[0]),b=Number(r[1]);
      if(!Number.isFinite(a)||!Number.isFinite(b)) return;
      const ia=m.casa!==undefined?m.casa:m[0], ib=m.ospite!==undefined?m.ospite:m[1];
      if(!rows[ia]||!rows[ib]) return;
      rows[ia].gf+=a; rows[ia].gs+=b;
      rows[ib].gf+=b; rows[ib].gs+=a;
      if(a>b){ rows[ia].pt+=Number(rules.w||3); rows[ib].pt+=Number(rules.l||0); }
      else if(b>a){ rows[ib].pt+=Number(rules.w||3); rows[ia].pt+=Number(rules.l||0); }
      else { rows[ia].pt+=Number(rules.d||1); rows[ib].pt+=Number(rules.d||1); }
    });
    rows.forEach(x=>x.df=x.gf-x.gs);
    rows.sort((a,b)=>b.pt-a.pt||b.df-a.df||b.gf-a.gf||a.gs-b.gs);
    return rows;
  }

  function qualified(st){
    const out=[];
    const n=Number(st.rules&&st.rules.qualificatePerGirone)||2;
    ["A","B","C","D","E","F"].forEach(tag=>{
      if(!Array.isArray(st[tag])||!st[tag].length) return;
      const q=calc(st,tag);
      q.slice(0,n).forEach((x,i)=>out.push({nome:x.n,girone:tag,pos:i+1}));
    });
    return out;
  }

  function koCard(title,a,b,field,time,res){
    const r=resultParts(res);
    return '<div class="ko-card"><div class="ko-title">'+esc(title)+'</div>'+
      '<div class="ko-meta">'+esc(field||"")+(time?' · '+esc(time):"")+'</div>'+
      '<div class="ko-team">'+esc(displayTeam(a))+' <strong>'+esc(r[0])+'</strong></div>'+
      '<div class="ko-team">'+esc(displayTeam(b))+' <strong>'+esc(r[1])+'</strong></div></div>';
  }

  function koHtml(st){
    const rules=st.rules||{};
    if(!(rules.usaQuarti||rules.usaSemifinali||rules.usaFinale)) return "";
    const q=Array.isArray(st.qRes)?st.qRes:[];
    const s=Array.isArray(st.sTopRes)?st.sTopRes:[];
    const f=st.fTopRes||"-";
    const qt=Array.isArray(st.qTime)?st.qTime:[];
    const qc=Array.isArray(st.qCamp)?st.qCamp:[];
    const stt=Array.isArray(st.sTopTime)?st.sTopTime:[];
    const sc=Array.isArray(st.sTopCamp)?st.sTopCamp:[];
    const ft=Array.isArray(st.fTopTime)?st.fTopTime:[];
    const fc=Array.isArray(st.fTopCamp)?st.fTopCamp:[];
    const teams=qualified(st);
    let html='<section class="knockout"><h2>Fase finale</h2>';

    if(rules.usaQuarti){
      const m=teams.length>=8?[[teams[0]?.nome,teams[7]?.nome],[teams[3]?.nome,teams[4]?.nome],[teams[1]?.nome,teams[6]?.nome],[teams[2]?.nome,teams[5]?.nome]]:
        [["1ª qualificata","8ª qualificata"],["4ª qualificata","5ª qualificata"],["2ª qualificata","7ª qualificata"],["3ª qualificata","6ª qualificata"]];
      html+='<div class="ko-grid">'+m.map((x,i)=>koCard("Quarto "+(i+1),x[0],x[1],qc[i],qt[i],q[i])).join("")+'</div>';
    }

    if(rules.usaSemifinali){
      const m=[["Vincente Quarto 1","Vincente Quarto 2"],["Vincente Quarto 3","Vincente Quarto 4"]];
      html+='<div class="ko-block"><h3>Semifinali</h3><div class="ko-grid">'+m.map((x,i)=>koCard("Semifinale "+(i+1),x[0],x[1],sc[i],stt[i],s[i])).join("")+'</div></div>';
    }

    if(rules.usaFinale){
      html+='<div class="ko-block final"><h3>Finale</h3>'+koCard("Finale",st.finalTop?.[0]||"Vincente Semifinale 1",st.finalTop?.[1]||"Vincente Semifinale 2",fc[0],ft[0],f)+'</div>';
      if(st.campioneTop) html+='<div class="champion">🏆 CAMPIONE TORNEO<br><strong>'+esc(displayTeam(st.campioneTop))+'</strong></div>';
    }
    return html+'</section>';
  }

  function render(st){
    state=st||{};
    document.title=(state.nomeTorneo||"NEXT POINT PADEL")+" — TV";
    $("#title").textContent=state.nomeTorneo||"Torneo Padel";
    $("#date").textContent=state.dataTorneo||"";
    $("#status").textContent="LIVE";
    $("#updated").textContent="Aggiornato "+new Date().toLocaleTimeString("it-IT");
    const groups=["A","B","C","D","E","F"].map(x=>groupHtml(state,x)).filter(Boolean).join("");
    $("#content").innerHTML=groups+koHtml(state);
  }

  let loading=false;

  async function load(){
    if(!sb||!currentId||loading) return;
    loading=true;
    const {data,error}=await sb.from("tornei").select("id,nome,data,stato,configurazione,updated_at").eq("id",currentId).maybeSingle();
    if(error){ console.error("[TV] load",error); $("#status").textContent="ERRORE"; loading=false; return; }
    if(!data){ $("#status").textContent="TORNEO NON TROVATO"; loading=false; return; }
    const st=Object.assign({},data.configurazione||{});
    st.idTorneo=data.id; st.nomeTorneo=data.nome||st.nomeTorneo; st.dataTorneo=data.data||st.dataTorneo;
    render(st);
    loading=false;
  }

  function subscribe(){
    if(channel){
      try{ sb.removeChannel(channel); }catch(e){ console.warn("[TV] removeChannel",e); }
      channel=null;
    }

    const channelName="tv-torneo-"+currentId+"-"+Date.now();
    console.log("[TV] subscribe:",channelName,"id=",currentId);

    channel=sb.channel(channelName)
      .on("postgres_changes",{
        event:"UPDATE",
        schema:"public",
        table:"tornei",
        filter:"id=eq."+currentId
      },(payload)=>{
        console.log("[TV] UPDATE ricevuto:",payload);
        load();
      })
      .subscribe((status,err)=>{
        console.log("[TV] Realtime status:",status,err||"");
        const el=$("#connection");
        if(status==="SUBSCRIBED"){
          el.textContent="● Connessione live";
          el.className="live";
          clearTimeout(reconnectTimer);
        }else{
          el.textContent="○ "+status;
          el.className="offline";
        }
        if(status==="CHANNEL_ERROR"||status==="TIMED_OUT"){
          clearTimeout(reconnectTimer);
          reconnectTimer=setTimeout(subscribe,3000);
        }
      });
  }

  async function start(){
    const params=new URLSearchParams(location.search);
    currentId=params.get("id")||params.get("torneo");
    if(!currentId){ $("#status").textContent="ID TORNEO MANCANTE"; return; }
    if(!window.supabase||typeof window.supabase.createClient!=="function"){
      $("#status").textContent="SUPABASE NON DISPONIBILE"; return;
    }
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    await load();
    subscribe();
  }

  window.addEventListener("beforeunload",()=>{ if(channel&&sb) sb.removeChannel(channel); });
  start();
})();