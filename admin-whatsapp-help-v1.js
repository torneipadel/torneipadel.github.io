(()=>{
'use strict';

const HELP_ID='waHelpModal';

function esc(v){
  return String(v??'').replace(/[&<>\"']/g,m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '\"':'&quot;',
    "'":'&#39;'
  }[m]));
}

function closeHelp(){
  document.getElementById(HELP_ID)?.remove();
}

function openHelp(){
  closeHelp();

  const modal=document.createElement('div');
  modal.id=HELP_ID;
  modal.innerHTML=`
    <div style="position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,.76);display:flex;align-items:center;justify-content:center;padding:20px">
      <div role="dialog" aria-modal="true" aria-labelledby="waHelpTitle" style="width:min(860px,100%);max-height:92vh;overflow:auto;background:#fff;color:#172033;border-radius:18px;box-shadow:0 25px 90px rgba(0,0,0,.4);font-family:Arial,sans-serif">

        <div style="position:sticky;top:0;z-index:2;background:#fff;border-bottom:1px solid #e5e7eb;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px">
          <div>
            <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#64748b;text-transform:uppercase">Manuale operativo WhatsApp</div>
            <h2 id="waHelpTitle" style="margin:4px 0 0;font-size:24px">Invio comunicazioni: dalla nostra Admin a WhatsApp Business</h2>
          </div>
          <button type="button" id="waHelpClose" aria-label="Chiudi" style="border:0;background:#f1f5f9;border-radius:10px;width:38px;height:38px;font-size:24px;cursor:pointer">×</button>
        </div>

        <div style="padding:22px 24px 30px">

          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:18px;margin-bottom:20px;line-height:1.6">
            <strong>Obiettivo del flusso</strong><br><br>
            La nostra <strong>Admin</strong> deve rendere il lavoro il più veloce e comodo possibile: prepara tutto ciò che serve per la comunicazione e accompagna l'operatore fino a <strong>WhatsApp Business</strong>.
            L'invio effettivo del <strong>Broadcast</strong> viene poi eseguito direttamente da WhatsApp Business.
          </div>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px;margin-bottom:22px;line-height:1.6">
            <strong>Schema semplice</strong><br><br>
            <b>ADMIN</b> → prepara destinatari + messaggio + locandina → <b>WHATSAPP BUSINESS</b> → prepara Broadcast → controlla → <strong>INVIA</strong>
          </div>

          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px;margin-bottom:22px;line-height:1.6">
            <strong>Prima di iniziare</strong><br><br>
            WhatsApp Business deve essere già configurato con l'account del club e pronto all'uso. La nostra Admin non entra nell'account WhatsApp, non crea automaticamente il Broadcast e non effettua l'invio al posto dell'operatore.
          </div>

          <div style="display:grid;gap:14px">

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">1. Apri la sezione WhatsApp nell'Admin</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Vai in <b>Admin → WhatsApp</b>. Qui parte il flusso di preparazione della comunicazione. Controlla il torneo selezionato e verifica che sia quello per il quale devi effettuare l'invio.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 AUTOMATICO / PREPARATO DALL'ADMIN:</b> dati del torneo e destinatari disponibili.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 MANUALE:</b> controllare che il torneo sia quello corretto.</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">2. Controlla i destinatari</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                L'Admin mostra l'elenco dei partecipanti/destinatari disponibili per la comunicazione. Verifica che siano gli iscritti che vuoi realmente raggiungere.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 ADMIN:</b> prepara e mostra l'elenco dei destinatari.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 OPERATORE:</b> controlla che l'elenco sia corretto prima del broadcast.</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">3. Controlla e prepara il messaggio</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Nel riquadro <b>Messaggio da inviare</b> trovi il testo predisposto. Leggilo, correggilo se necessario e utilizza <b>Copia messaggio</b> quando sei pronto.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 ADMIN:</b> prepara il testo e lo rende copiabile.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 OPERATORE:</b> decide se il testo è pronto e lo copia.</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">4. Prepara la locandina</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Se è presente la locandina, premi <b>Scarica locandina</b> e salvala in una posizione facile da ritrovare. Non serve scaricarla più volte: lo stesso file può essere utilizzato per il Broadcast.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 ADMIN:</b> prepara e rende disponibile la locandina.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 OPERATORE:</b> scarica il file sul dispositivo.</div>
            </div>

            <div style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:12px;padding:17px">
              <strong style="font-size:17px">5. Apri WhatsApp Business</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Apri <b>WhatsApp Business</b> del club sul dispositivo che utilizzi per l'invio. Se utilizzi WhatsApp Web/Desktop, verifica che sia collegato all'account Business corretto.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 ADMIN:</b> può fornire il comando utile per aprire WhatsApp.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 OPERATORE:</b> deve essere già collegato all'account WhatsApp Business del club.</div>
            </div>

            <div style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:12px;padding:17px">
              <strong style="font-size:17px">6. Crea o apri il Broadcast in WhatsApp Business</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                In WhatsApp Business utilizza la funzione <b>Nuovo broadcast</b> / <b>Lista broadcast</b>. La voce e la posizione del comando possono cambiare leggermente in base alla versione di WhatsApp Business e al dispositivo.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 ADMIN:</b> ti prepara il lavoro e l'elenco dei destinatari.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 MANUALE:</b> la nostra pagina non può creare direttamente la lista Broadcast dentro WhatsApp Business.</div>
            </div>

            <div style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:12px;padding:17px">
              <strong style="font-size:17px">7. Seleziona i destinatari del Broadcast</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Seleziona in WhatsApp Business i contatti che devono ricevere la comunicazione. Confrontali con l'elenco preparato dall'Admin e controlla attentamente i nomi prima di proseguire.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 ADMIN:</b> fornisce l'elenco di riferimento.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 MANUALE:</b> la selezione finale dei contatti avviene dentro WhatsApp Business.</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">8. Copia il messaggio dall'Admin</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Torna momentaneamente nella nostra Admin e premi <b>Copia messaggio</b>. In questo modo il testo completo viene copiato negli appunti del dispositivo.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 AUTOMATICO:</b> la nostra Admin prepara il testo e lo mette a disposizione per la copia.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 MANUALE:</b> l'operatore deve effettuare il comando di copia.</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">9. Incolla il messaggio nel Broadcast</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Torna in WhatsApp Business, apri il Broadcast e incolla il testo nel campo del messaggio. Rileggi il contenuto e controlla soprattutto nome del torneo, data, ora, informazioni e link.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 ADMIN:</b> ha già preparato il contenuto.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 MANUALE:</b> l'incolla dentro WhatsApp viene eseguito dall'operatore.</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">10. Allega la locandina</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                In WhatsApp Business premi <b>Allega</b> / <b>Foto e video</b> e seleziona la locandina scaricata al punto 4. Controlla l'anteprima prima dell'invio.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 ADMIN:</b> prepara la locandina.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🟠 MANUALE:</b> la nostra Admin non può allegare automaticamente un file locale dentro WhatsApp Business.</div>
            </div>

            <div style="border:1px solid #fcd34d;background:#fffbeb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">11. Controllo finale</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Prima di inviare, controlla tutto: <b>account WhatsApp Business, destinatari, testo, link e locandina</b>. Questo controllo deve essere fatto dall'operatore per evitare invii al torneo sbagliato o a contatti sbagliati.
              </p>
              <div style="margin-top:10px;color:#9a3412"><b>🟠 MANUALE:</b> controllo umano obbligatorio prima dell'invio.</div>
            </div>

            <div style="border:1px solid #86efac;background:#dcfce7;border-radius:12px;padding:18px">
              <strong style="font-size:18px">12. INVIO DEL BROADCAST</strong>
              <p style="margin:8px 0 0;line-height:1.62">
                Quando tutto è corretto, premi <strong style="font-size:19px">INVIA</strong> direttamente in <b>WhatsApp Business</b>.
                Questo è il momento in cui parte realmente la comunicazione ai destinatari del Broadcast.
              </p>
              <div style="margin-top:10px;color:#166534"><b>🟢 RISULTATO:</b> WhatsApp Business esegue l'invio.</div>
              <div style="margin-top:5px;color:#9a3412"><b>🔴 IMPORTANTE:</b> la nostra Admin non preme questo pulsante e non invia automaticamente il messaggio.</div>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">13. Se invece vuoi inviare a una sola persona</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Per un singolo partecipante puoi utilizzare il pulsante <b>Invia</b> disponibile nella nostra Admin. Il sistema può aprire WhatsApp con destinatario e testo già predisposti. La locandina, se necessaria, viene allegata manualmente e poi si preme <b>Invia</b> in WhatsApp.
              </p>
            </div>

            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:17px">
              <strong style="font-size:17px">14. Dopo l'invio</strong>
              <p style="margin:7px 0 0;line-height:1.58">
                Se hai utilizzato il Broadcast, non è necessario ripetere l'invio singolo agli stessi destinatari. Se devi effettuare una nuova comunicazione, torni nella nostra Admin, prepari il nuovo contenuto e ripeti il flusso.
              </p>
            </div>

          </div>

          <div style="margin-top:22px;background:#f8fafc;border-radius:12px;padding:18px;line-height:1.62">
            <strong>🟢 COSA FA LA NOSTRA ADMIN</strong><br><br>
            ✓ Seleziona e identifica il torneo.<br>
            ✓ Prepara/mostra i destinatari disponibili.<br>
            ✓ Prepara il testo della comunicazione.<br>
            ✓ Permette di copiare il messaggio.<br>
            ✓ Prepara e rende disponibile la locandina.<br>
            ✓ Può facilitare l'apertura di WhatsApp per l'invio singolo.<br>
            ✓ Riduce al minimo il lavoro manuale prima dell'invio.
          </div>

          <div style="margin-top:14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px;line-height:1.62">
            <strong>🟠 COSA RIMANE MANUALE</strong><br><br>
            1. Aprire/controllare WhatsApp Business.<br>
            2. Creare o aprire la lista Broadcast.<br>
            3. Selezionare i destinatari dentro WhatsApp Business.<br>
            4. Incollare il messaggio.<br>
            5. Allegare la locandina.<br>
            6. Controllare il contenuto finale.<br>
            7. Premere <strong>INVIA</strong>.
          </div>

          <div style="margin-top:14px;background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:18px;line-height:1.62">
            <strong>🔴 COSA NON FACCIAMO</strong><br><br>
            ✕ Nessuna WhatsApp Business API a pagamento.<br>
            ✕ Nessun servizio esterno a pagamento.<br>
            ✕ Nessuna automazione che accede al tuo account WhatsApp.<br>
            ✕ Nessuna creazione automatica della lista Broadcast dentro WhatsApp.<br>
            ✕ Nessun allegato automatico del file locale dentro WhatsApp.<br>
            ✕ Nessun invio automatico del messaggio.
          </div>

          <div style="margin-top:18px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px;line-height:1.65">
            <strong>🚀 PROCEDURA RAPIDA A-Z</strong><br><br>
            <b>ADMIN</b><br>
            1. Apri WhatsApp nell'Admin.<br>
            2. Controlla il torneo.<br>
            3. Controlla i destinatari.<br>
            4. Controlla/modifica il messaggio.<br>
            5. Copia il messaggio.<br>
            6. Scarica la locandina.<br><br>
            <b>WHATSAPP BUSINESS</b><br>
            7. Apri WhatsApp Business.<br>
            8. Crea/apri il Broadcast.<br>
            9. Seleziona i destinatari corretti.<br>
            10. Incolla il messaggio.<br>
            11. Allega la locandina.<br>
            12. Controlla tutto.<br>
            13. <strong>PREMI INVIA.</strong><br><br>
            <strong>Fine: il Broadcast è stato inviato da WhatsApp Business.</strong>
          </div>

          <div style="margin-top:18px;text-align:right">
            <button type="button" id="waHelpCloseBottom" class="btn primary" style="cursor:pointer">Ho capito</button>
          </div>

        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  modal.querySelector('#waHelpClose')?.addEventListener('click',closeHelp);
  modal.querySelector('#waHelpCloseBottom')?.addEventListener('click',closeHelp);
  modal.addEventListener('click',e=>{
    if(e.target===modal.firstElementChild)closeHelp();
  });
  document.addEventListener('keydown',function escKey(e){
    if(e.key==='Escape'){
      closeHelp();
      document.removeEventListener('keydown',escKey);
    }
  });
}

function addHelpButton(){
  const heads=document.querySelectorAll('.page-head');
  let found=false;

  heads.forEach(head=>{
    const h=head.querySelector('h1');
    const isWhatsApp=!!h&&h.textContent.trim()==='WhatsApp';

    if(!isWhatsApp){
      head.querySelector('#waHelpButton')?.remove();
      return;
    }

    found=true;
    if(head.querySelector('#waHelpButton'))return;

    const wrap=head.querySelector('div:last-child')||head;
    const b=document.createElement('button');
    b.type='button';
    b.id='waHelpButton';
    b.className='btn';
    b.textContent='❓ Help';
    b.style.cssText='margin-left:8px';
    b.addEventListener('click',openHelp);
    wrap.appendChild(b);
  });

  if(!found){
    document.querySelectorAll('#waHelpButton').forEach(b=>b.remove());
  }
}

window.openWhatsAppHelp=openHelp;

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',addHelpButton,{once:true});
}else{
  addHelpButton();
}

new MutationObserver(addHelpButton).observe(document.body,{childList:true,subtree:true});
})();