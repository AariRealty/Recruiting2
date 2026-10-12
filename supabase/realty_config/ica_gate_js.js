(function(){
  if (window.__aariIcaGate) return; window.__aariIcaGate = 1;

  var client = (window.sb && window.sb.auth && window.sb.auth.getSession) ? window.sb
    : (window.__sb && window.__sb.auth && window.__sb.auth.getSession) ? window.__sb
    : null;
  if (!client) return;

  var AARI_LOGO = 'https://joinaari.com/aari-logo-white.svg';
  var AARI_MARK = 'https://joinaari.com/aari-watermark.png';
  var FN = (window.SB_URL || client.supabaseUrl || '') + '/functions/v1';
  var KEY = window.SB_KEY || client.supabaseKey || '';

  try {

  /* Returns {token, why}. Never a bare empty string: an empty token that got
     posted anyway as "Authorization: Bearer " is how a diagnosable problem
     became the single word "unauthorized" on a compliance screen. why names the
     first thing that was missing, so the page can say it out loud. */
  function tok(){
    if (!client.auth || !client.auth.getSession)
      return Promise.resolve({ token:'', why:'client carries no auth.getSession' });
    return client.auth.getSession().then(function(r){
      var t = (r && r.data && r.data.session && r.data.session.access_token) || '';
      return { token:t, why: t ? '' : 'client is resolved and the session is empty' };
    }).catch(function(e){
      return { token:'', why:'getSession threw: ' + ((e && e.message) || e) };
    });
  }

  function post(path, token, body){
    return fetch(FN + path, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body || {})
    }).then(function(r){ return r.json().then(function(j){ return { status:r.status, json:j }; }); });
  }

  var CSS = ''
    + '#aariGate{position:fixed;inset:0;z-index:2147483000;background:rgba(16,16,16,.72);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif}'
    + '#aariGate *{box-sizing:border-box}'
    + '#aariGateCard{background:#fff;max-width:560px;width:100%;max-height:94vh;display:flex;flex-direction:column;border-radius:12px;box-shadow:0 24px 64px rgba(0,0,0,.34);overflow:hidden}'
    + '#aariGateCard .hd{background:#101010;color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-shrink:0}'
    + '#aariGateCard .hd .hd-txt{flex:1;min-width:0}'
    + '#aariGateCard .hd h2{margin:0;font-family:Georgia,serif;font-size:17px;font-weight:600;line-height:1.3}'
    + '#aariGateCard .hd p{margin:5px 0 0;font-size:11px;color:#b9b5ad;letter-spacing:.5px}'
    + '#aariGateCard .hd .exit{background:none;border:1px solid rgba(255,255,255,.3);color:#fff;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:7px 12px;border-radius:5px;cursor:pointer;font-weight:600;flex-shrink:0;font-family:inherit;line-height:1}'
    + '#aariGateCard .hd .exit:hover{background:rgba(255,255,255,.1)}'
    + '#aariGateCard .bd{padding:18px 20px 20px;color:#1a1a1a;font-size:14px;line-height:1.55;overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch}'
    + '#aariGateCard .ft{padding:14px 20px;border-top:1px solid #ece8dd;background:#fafaf7;flex-shrink:0}'
    + '#aariGateCard label{display:block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#6b675f;margin:14px 0 5px}'
    + '#aariGateCard input[type=text]{width:100%;padding:11px 12px;border:1px solid #d8d4ca;border-radius:6px;font-size:16px;font-family:inherit}'
    + '#aariSigWrap{border:1px solid #d8d4ca;border-radius:6px;background:#fcfbf8;position:relative}'
    + '#aariSig{display:block;width:100%;height:140px;touch-action:none;border-radius:6px}'
    + '#aariSigHint{position:absolute;left:12px;top:56px;font-size:12px;color:#a9a49a;pointer-events:none}'
    + '#aariGateCard .row{display:flex;gap:10px;align-items:flex-start;margin-top:16px}'
    + '#aariGateCard .row input{margin-top:3px}'
    + '#aariGateCard .row span{font-size:12px;color:#4a4740;line-height:1.5}'
    + '#aariGateBtns{display:flex;gap:10px}'
    + '#aariGateBtns button{flex:1;padding:14px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid #d8d4ca;background:#fff;color:#1a1a1a;font-family:inherit}'
    + '#aariGateBtns button.p{background:#101010;color:#fff;border-color:#101010}'
    + '#aariGateBtns button[disabled]{opacity:.45;cursor:not-allowed}'
    + '#aariGateCard .quiet{display:block;margin:10px auto 0;background:none;border:none;color:#a39e94;font-size:11.5px;text-decoration:underline;cursor:pointer;padding:4px 8px;font-family:inherit}'
    + '#aariGateMsg{margin-top:14px;font-size:13px;padding:10px 12px;border-radius:6px;display:none}'
    + '#aariGateMsg.e{display:block;background:#fdecec;color:#8a1c1c}'
    + '#aariGateMsg.o{display:block;background:#eaf6ec;color:#1c6b2e}'
    + '#aariGateCard .blocked{background:#fff8e6;border-left:3px solid #d9a520;padding:12px 14px;border-radius:4px;font-size:13px}'
    + '#aariGateCard .clr{background:none;border:none;color:#6b675f;font-size:12px;text-decoration:underline;cursor:pointer;padding:6px 10px;font-family:inherit}'
    + '#aariDocBox{margin-top:12px;border:1px solid #d8d4ca;border-radius:8px;background:#f4f2ee;overflow:hidden;min-height:140px}'
    + '#aariDocBox iframe{display:block;width:100%;height:50vh;min-height:380px;max-height:520px;border:0;background:#fff}'
    + '#aariDocLoad{padding:16px;font-size:13px;color:#6b675f;text-align:center}'
    + '#aariDocBox .derr{padding:16px;font-size:13px;color:#8a1c1c;background:#fdecec}'
    + '#aariScrollHint{display:block;width:100%;margin:14px 0 4px;padding:12px 14px;background:#faf5eb;border:1px solid #ece8dd;border-radius:6px;font-family:inherit;font-size:12.5px;font-weight:600;color:#5a5148;text-align:center;cursor:pointer;transition:background .15s,color .15s}#aariScrollHint:hover{background:#f0e6c8;color:#1a1a1a}'
    + '#aariPlanBox{margin:16px 0 4px;background:#f5f1e8;border:2px solid #d9a520;border-radius:8px;padding:16px 18px;font-size:13px;line-height:1.55;color:#2a2620}'
    + '#aariPlanBox .ptitle{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a7f6a;font-weight:700;margin:0 0 8px}'
    + '#aariPlanBox .pname{font-size:18px;font-weight:700;color:#141210;margin:0 0 6px;font-family:Georgia,serif}'
    + '#aariPlanBox .pdetail{font-size:14px;color:#4a4740;margin:0 0 4px}'
    + '@media(max-width:640px){'
    + '#aariGate{padding:0;align-items:stretch}'
    + '#aariGateCard{max-height:100vh;max-height:100dvh;max-width:100%;height:100vh;height:100dvh;border-radius:0}'
    + '#aariGateCard .hd h2{font-size:15.5px}'
    + '#aariGateCard .bd{padding:16px 18px 20px}'
    + '#aariGateCard .ft{padding:12px 18px;padding-bottom:calc(12px + env(safe-area-inset-bottom))}'
    + '#aariDocBox iframe{height:60dvh;min-height:340px;max-height:520px}'
    + '}';

  /* Decision 105, 12 Oct 2026: the save your card screen. Shown right after
     signing and, locked, on every Hub load until the card is saved. */
  function cardStep(url, locked){
    return '<div class="hd" style="align-items:center"><img src="' + AARI_LOGO + '" alt="Aari Realty" style="height:30px;width:auto;display:block"><p style="margin:0">ONE LAST STEP</p></div>'
      + '<div class="bd" style="position:relative;overflow:hidden;text-align:center;padding:36px 28px 40px">'
      + '<img src="' + AARI_MARK + '" alt="" aria-hidden="true" style="position:absolute;right:-30px;bottom:-30px;width:230px;height:auto;opacity:.035;pointer-events:none">'
      + '<div style="position:relative">'
      + '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#1c6b2e;font-weight:700;margin-bottom:12px">&#10003; Agreement signed</div>'
      + '<div style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#141210;margin-bottom:14px">One last thing.</div>'
      + '<div style="font-size:15px;color:#4a4740;line-height:1.6;max-width:400px;margin:0 auto">Your agreement is signed.</div>'
      + '<div style="font-size:15px;color:#4a4740;line-height:1.6;max-width:400px;margin:12px auto 0">Now save your card. <b style="color:#141210">Once.</b> Your plan fee runs on its own from there, so you never chase an invoice and we never chase you.</div>'
      + '<div style="margin:20px auto 0;max-width:300px;background:#f5f1e8;border-radius:10px;padding:12px 14px;font-size:14px;color:#141210"><b>Charged today: <span class="aariDue">$0</span></b></div>'
      + '<div style="margin:14px auto 0;max-width:400px;font-size:13px;color:#4a4740;line-height:1.55">This card will be used for your Monthly Brokerage Fee and your yearly E&amp;O + Compliance Fee. To change it, contact the Broker.</div>'
      + '<div style="margin-top:22px"><a id="aariSaveCard" href="' + url + '" style="display:inline-block;background:#101010;color:#fff;text-decoration:none;padding:15px 34px;border-radius:50px;font-size:13px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase">Save my card</a></div>'
      + '<div style="margin-top:14px;font-size:12px;color:#8a857c">' + (locked ? 'Your hub opens as soon as your card is saved.' : 'Two minutes. This step finishes your onboarding.') + '</div>'
      + '</div></div>';
  }

  /* Decision 103a: an agent who owes a past fee sees the amount here and pays it on the
     next screen. The amount comes from the Hub record (my_card_due), never the page. */
  function fillDue(root){
    try { if(!client.rpc) return; client.rpc('my_card_due').then(function(c){
      var n = Number(c && c.data) || 0; if (n <= 0) return;
      var t = '$' + (n/100).toFixed(2) + ' (past due E&amp;O)';
      Array.prototype.forEach.call(root.querySelectorAll('.aariDue'), function(x){ x.innerHTML = t; });
      var b = root.querySelector('#aariSaveCard'); if (b) b.textContent = 'Pay and save my card';
    }).catch(function(){}); } catch(e) {}
  }

  function el(html){ var d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

  function render(st, token){
    var s=document.createElement('style'); s.textContent=CSS; document.head.appendChild(s);

    var needLicense = !st.license_set;
    var needPhone = true;
    /* The one case that stays a hard block. A first agreement is not the same
       as an update to one already signed: there is no earlier version in force
       to work under. agreement_status reports never_signed for exactly that. */
    /* Decision 106, 12 Oct 2026: no skipping. Every agent signs the current
       version before the hub opens, first agreement or update alike. */
    var canDismiss = false;
    var head = st.reason === 'version_update'
      ? 'Your agreement has been updated'
      : 'Sign your Independent Contractor Agreement';
    var sub = st.reason === 'version_update'
      ? 'Version ' + st.version_label + ' is now in effect. You last signed ' + (st.last_signed_version || 'an earlier version') + '. Signing the current version is required to continue.'
      : 'Version ' + st.version_label + ', effective ' + (st.effective_date || '') + '. This is required before you can use the hub.';

    if (!st.plan_set){
      var b = el('<div id="aariGate"><div id="aariGateCard">'
        + '<div class="hd"><div class="hd-txt"><h2>' + head + '</h2><p>AARI REALTY LLC</p></div><button class="exit" id="aariGateOutTop">Sign out</button></div>'
        + '<div class="bd"><div class="blocked"><b>Your commission plan has not been assigned yet.</b><br>'
        + 'Your broker must set your commission plan before you can sign. Your agreement cannot be executed without it, '
        + 'because the plan determines your split and fees on the fee schedule page.</div>'
        + '<p style="margin-top:16px;font-size:13px;color:#4a4740">Contact Marlenyi Paredes to have your plan assigned, then sign in again.</p>'
        + '</div>'
        + '<div class="ft"><div id="aariGateBtns"><button id="aariGateOut">Sign out</button></div></div>'
        + '</div></div>');
      document.body.appendChild(b);
      var out0 = function(){ try { client.auth.signOut().then(function(){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); }); } catch(e){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); } };
      b.querySelector('#aariGateOut').onclick = out0;
      b.querySelector('#aariGateOutTop').onclick = out0;
      return;
    }

    var g = el('<div id="aariGate"><div id="aariGateCard">'
      + '<div class="hd"><div class="hd-txt"><h2>' + head + '</h2><p>AARI REALTY LLC</p></div></div>'
      + '<div class="bd">'
      + '<p style="margin:0 0 4px">' + sub + '</p>'
      + '<div id="aariDocBox"><div id="aariDocLoad">Loading the agreement...</div></div>'
      + '<button type="button" id="aariScrollHint">Scroll down to sign &#8595;</button>'
      + (st.plan_name ? '<div id="aariPlanBox"><div class="ptitle">Your Commission Plan</div><div class="pname">' + st.plan_name + '</div><div class="pdetail">' + st.plan_split + ' commission split</div><div class="pdetail">' + st.plan_fee + ' brokerage fee</div></div>' : '')
      + (needLicense ? '<label for="aariLic">Florida real estate license number</label><input type="text" id="aariLic" autocomplete="off" placeholder="SL1234567">' : '')
      + (needPhone ? '<label for="aariPhone">Mobile number</label><input type="text" id="aariPhone" inputmode="tel" autocomplete="tel" placeholder="(239) 555-0134"><div style="font-size:11.5px;color:#8a857c;margin-top:5px">Used by your broker to reach you on transactions.</div>' : '')
      + '<label for="aariTyped">Type your full legal name</label><input type="text" id="aariTyped" autocomplete="off">'
      + '<label for="aariIni">Initials</label><input type="text" id="aariIni" maxlength="5" autocomplete="off" style="max-width:120px">'
      + '<label>Draw your signature</label>'
      + '<div id="aariSigWrap"><canvas id="aariSig"></canvas><div id="aariSigHint">Sign here</div></div>'
      + '<div style="text-align:right"><button class="clr" id="aariSigClr" type="button">Clear signature</button></div>'
      + (st.plan_name ? '<div class="row" style="margin-top:12px;background:#faf5eb;padding:10px 12px;border-radius:6px;border:1px solid #ece8dd"><input type="checkbox" id="aariPlanAck"><span style="font-weight:600">I understand I am signing onto the ' + st.plan_name + ' plan, ' + (st.plan_article || 'a') + ' ' + st.plan_split + ' commission split with a ' + (st.plan_fee_amount || st.plan_fee) + ' monthly brokerage fee.</span></div>' : '')
      + '<div class="row"><input type="checkbox" id="aariConsent"><span>I intend to electronically sign this Agreement and consent to the use of electronic records and signatures under the federal ESIGN Act and Florida’s Uniform Electronic Transactions Act, Chapter 668, Florida Statutes.</span></div>'
      + '<div id="aariGateMsg"></div>'
      + '</div>'
      + '<div class="ft"><div id="aariGateBtns">'
      + (canDismiss ? '<button id="aariGateLater">Continue to the hub</button>' : '')
      + '<button class="p" id="aariGateGo">Sign agreement</button></div><button type="button" class="quiet" id="aariGateOut">Not you? Sign out</button>'
      + '<div class="blocked" style="margin-top:12px">Your hub opens as soon as you sign. Signing the current agreement comes first.</div>'
      + '</div>'
      + '</div></div>');
    document.body.appendChild(g);

    var cv=g.querySelector('#aariSig'), hint=g.querySelector('#aariSigHint');
    var ctx, drew=false;
    function fit(){
      var r=cv.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
      cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr);
      ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
      ctx.lineWidth=2.1; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#101010';
    }
    fit(); window.addEventListener('resize', function(){ if(!drew) fit(); });
    var drawing=false;
    function pt(e){ var r=cv.getBoundingClientRect(); var t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left, y:t.clientY-r.top}; }
    function down(e){ e.preventDefault(); drawing=true; drew=true; hint.style.display='none'; var p=pt(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); }
    function move(e){ if(!drawing) return; e.preventDefault(); var p=pt(e); ctx.lineTo(p.x,p.y); ctx.stroke(); }
    function up(){ drawing=false; }
    cv.addEventListener('mousedown',down); cv.addEventListener('mousemove',move);
    window.addEventListener('mouseup',up);
    cv.addEventListener('touchstart',down,{passive:false}); cv.addEventListener('touchmove',move,{passive:false});
    cv.addEventListener('touchend',up);
    g.querySelector('#aariSigClr').onclick=function(){ ctx.clearRect(0,0,cv.width,cv.height); drew=false; hint.style.display='block'; };

    // Scroll-down hint: tap to jump to the first form field
    var scrollBtn=g.querySelector('#aariScrollHint');
    if(scrollBtn){ scrollBtn.addEventListener('click',function(){ var t=g.querySelector('label[for="aariLic"]')||g.querySelector('label[for="aariPhone"]')||g.querySelector('label[for="aariTyped"]'); if(t)t.scrollIntoView({behavior:'smooth',block:'start'}); }); }

    var msg=g.querySelector('#aariGateMsg');
    function say(t,cls){ msg.textContent=t; msg.className=cls; }

    var box=g.querySelector('#aariDocBox');
    var f=document.createElement('iframe');
    f.setAttribute('title','Independent Contractor Agreement');
    function icaDocFail(){ var l=box.querySelector('#aariDocLoad'); if(l) l.innerHTML='The agreement could not be loaded. Refresh the page, and if it still does not appear contact the broker.'; }
    /* 11 Oct 2026. This used to frame joinaari.com/ica-preview.html, a recruiting
       page carrying a coupon bar, a LIMITED TO 25 AGENTS pitch and a LOG IN link,
       wrapped around the agreement. An agent now reads the file that actually gets
       stamped and stored: the current row of realty_agreement_versions, served by a
       one hour signed URL because signed-agreements is private and stays private. */
    client.from('realty_agreement_versions').select('base_pdf_path').eq('is_current',true).limit(1)
      .then(function(r){
        var rows=(r&&r.data)||[];
        var p=rows[0]&&rows[0].base_pdf_path;
        if(!p) return null;
        return client.storage.from('signed-agreements').createSignedUrl(p,3600);
      })
      .then(function(s){
        var u=s&&s.data&&s.data.signedUrl;
        if(!u){ icaDocFail(); return; }
        f.onload=function(){ var l=box.querySelector('#aariDocLoad'); if(l) l.remove(); };
        f.src=u+'#view=FitH&toolbar=0';
      })
      .catch(function(){ icaDocFail(); });
    box.appendChild(f);
    setTimeout(function(){ var l=box.querySelector('#aariDocLoad'); if(l){ l.innerHTML='If the agreement does not appear, refresh the page.'; } },5000);

    var out = function(){ try { client.auth.signOut().then(function(){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); }); } catch(e){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); } };
    g.querySelector('#aariGateOut').onclick = out;

    /* Continue is allowed only once the notice is recorded. The evidence is the
       whole reason the gate was softened, so a dismissal that could not be
       written is a dismissal that does not happen. */
    var later = g.querySelector('#aariGateLater');
    if (later) later.onclick = function(){
      later.disabled = true;
      notice('dismissed', token).then(function(r){
        if (!r || r.status !== 200 || !r.json || r.json.recorded !== true) {
          later.disabled = false;
          say('Could not record that you were shown this. Nothing was skipped. Try again, or sign now.', 'e');
          return;
        }
        g.remove();
        icaBanner(st);
      }).catch(function(e){
        later.disabled = false;
        say('Could not record that you were shown this: ' + ((e && e.message) || e), 'e');
      });
    };

    var go=g.querySelector('#aariGateGo');
    go.onclick=function(){
      var typed=(g.querySelector('#aariTyped').value||'').trim();
      var ini=(g.querySelector('#aariIni').value||'').trim();
      var lic=needLicense?((g.querySelector('#aariLic').value||'').trim()):'';
      var ph=needPhone?((g.querySelector('#aariPhone').value||'').trim()):'';
      if(needLicense && lic.length<5){ return say('Enter your Florida license number.','e'); }
      if(needPhone && ph.replace(/[^0-9]/g,'').length<10){ return say('Enter a 10 digit mobile number.','e'); }
      if(typed.length<3){ return say('Type your full legal name.','e'); }
      if(!ini){ return say('Enter your initials.','e'); }
      if(!drew){ return say('Draw your signature in the box.','e'); }
      if(st.plan_name && !g.querySelector('#aariPlanAck').checked){ return say('You must acknowledge your commission plan before signing.','e'); }
      if(!g.querySelector('#aariConsent').checked){ return say('You must consent to electronic signature.','e'); }

      go.disabled=true; say('Signing and generating your document. This can take a moment.','o');
      var dataUrl=cv.toDataURL('image/png');

      /* A fresh token, not the one captured when this card was built. This is a
         107 page agreement: reading it, typing a name, drawing a signature all
         take time, and an access token expires. The captured one was arriving at
         realty-sign-ica already dead, and the function answered with the single
         word "unauthorized", which is true and useless. */
      tok().then(function(a){
        if(!a.token){
          throw new Error('Your session expired before this could be submitted. '
            + 'Reload the page and sign in again.' + (a.why ? ' (' + a.why + ')' : ''));
        }
        var fresh = a.token;
        var pre = needLicense
          ? post('/realty-hub', fresh, { action:'set_license', license_number:lic })
          : Promise.resolve({ status:200, json:{ ok:true } });
        return pre.then(function(r){
          if(r.status!==200 || !r.json || r.json.error){ throw new Error((r.json&&r.json.error)||'Could not save your license number.'); }
          return post('/realty-sign-ica', fresh, { consent:true, plan_acknowledged:!!(st.plan_name && g.querySelector('#aariPlanAck') && g.querySelector('#aariPlanAck').checked), typed_name:typed, initials:ini, phone:ph, signature_data_url:dataUrl });
        });
      }).then(function(r){
        if(r.status!==200 || !r.json || r.json.error){ throw new Error((r.json&&(r.json.detail||r.json.error))||'Signing failed.'); }
        var card = g.querySelector('#aariGateCard');
        /* Decision 95/97, 12 Oct 2026: right after signing, an agent who still needs a
           card on file sees the save your card step here. realty-sign-ica returns
           billing_url only for an active, non exempt agent with no card saved. The
           email with the same link stays as the backup. */
        if (r.json.billing_url && /^https:\/\/joinaari\.com\/billing\.html\?t=[0-9a-f-]{36}$/.test(r.json.billing_url)) {
          card.innerHTML = cardStep(r.json.billing_url, false);
          fillDue(card);
          return;
        }
        card.innerHTML = '<div class=\"hd\"><div class=\"hd-txt\"><h2>Agreement signed</h2><p>AARI REALTY LLC</p></div></div><div class=\"bd\" style=\"text-align:center;padding:40px 30px\"><div style=\"font-size:44px;margin-bottom:16px;color:#1c6b2e\">&#10003;</div><div style=\"font-family:Georgia,serif;font-size:22px;font-weight:600;color:#141210;margin-bottom:12px\">You are all set.</div><div style=\"font-size:15px;color:#4a4740;line-height:1.6;max-width:380px;margin:0 auto\">Your Independent Contractor Agreement has been signed and a copy has been emailed to you.</div><div style=\"margin-top:24px\"><button type=\"button\" style=\"background:#101010;color:#fff;border:none;padding:14px 28px;border-radius:50px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit\" onclick=\"if(window.__aariExitPreview)window.__aariExitPreview();location.reload()\">Return to my hub</button></div></div>';
      }).catch(function(e){
        go.disabled=false;
        say(String(e&&e.message||e).slice(0,240),'e');
      });
    };
  }

  /* A gate that cannot run says so. The only quiet case is a genuinely empty
     session, which is the normal signed out page and needs no agreement check.
     Every other reason is a defect in this script, and it is written where
     somebody can read it rather than swallowed. */
  /* The notice is the evidence, so it is written before the card paints and
     again if the agent chooses to continue. Server derived: this only names the
     event, and realty-ica-notice reads the version and the signature history
     itself. A client that asserts which version it showed can assert the wrong
     one. */
  function notice(kind, token){
    return fetch(FN + '/realty-ica-notice', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ event: kind })
    }).then(function(r){ return r.json().then(function(j){ return { status:r.status, json:j }; }); });
  }

  /* Persistent, and per load. No dismissed-forever flag anywhere: this bar is
     drawn fresh each time the card is dismissed, and the card itself returns on
     the next load because agreement_status still says the version is unsigned. */
  function icaBanner(st){
    if (document.getElementById('aariIcaBar')) return;
    var b = document.createElement('div');
    b.id = 'aariIcaBar';
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147482999;'
      + 'background:#141210;color:#fff;font:500 12.5px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;'
      + 'padding:10px 16px;display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap';
    var t = document.createElement('span');
    t.textContent = 'Your Independent Contractor Agreement, version ' + (st.version_label || '')
      + ', is not signed. You can keep working, and this stays until it is signed.';
    var a = document.createElement('button');
    a.type = 'button';
    a.textContent = 'Sign it now';
    a.style.cssText = 'background:#fff;color:#141210;border:0;border-radius:999px;'
      + 'padding:6px 14px;font:600 12px inherit;cursor:pointer';
    a.onclick = function(){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); };
    b.appendChild(t); b.appendChild(a);
    document.body.appendChild(b);
  }

  function gateBroken(why){
    try {
      client.auth.getSession().then(function(r){
        var t = (r && r.data && r.data.session && r.data.session.access_token) || '';
        if (t) notice('gate_error', t).catch(function(){});
      }).catch(function(){});
    } catch(e) {}
  }

  /* Decision 105: signing and a card on file come before anything else. An
     active, non exempt agent with an unsaved card invite cannot get past this
     screen; my_card_gate returns that invite token for the signed in agent only. */
  function lockForCard(token){
    var s=document.createElement('style'); s.textContent=CSS; document.head.appendChild(s);
    var url='https://joinaari.com/billing.html?t=' + token;
    var g = el('<div id="aariGate"><div id="aariGateCard">' + cardStep(url, true)
      + '<div class="ft" style="padding:8px 20px"><button type="button" class="quiet" id="aariGateOut" style="margin:0 auto">Not you? Sign out</button></div></div></div>');
    var hd=g.querySelector('.hd p'); if(hd) hd.textContent='BEFORE YOUR HUB OPENS';
    document.body.appendChild(g);
    fillDue(g);
    g.querySelector('#aariGateOut').onclick=function(){ try { client.auth.signOut().then(function(){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); }); } catch(e){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); } };
  }

  function boot(){
    tok().then(function(a){
      var t = a.token;
      if(!t){
        if (a.why && a.why.indexOf('session is empty') === -1) gateBroken(a.why);
        return;
      }
      return post('/realty-hub', t, { action:'agreement_status' }).then(function(r){
        var st=r.json||{};
        if(r.status===200 && st.required===true){
          /* Recorded before the card paints, so a row exists even if the tab is
             closed straight away, and recorded on every load rather than once. */
          notice('shown', t).catch(function(){});
          render(st, t);
          return;
        }
        if(r.status===200 && client.rpc){
          return client.rpc('my_card_gate').then(function(c){
            var tk = c && c.data;
            if (typeof tk === 'string' && /^[0-9a-f-]{36}$/.test(tk)) lockForCard(tk);
          });
        }
      });
    }).catch(function(){ /* never block the hub on gate failure */ });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else setTimeout(boot,300);

  } catch(e) {
    try {
      client.auth.getSession().then(function(r){
        var t = (r && r.data && r.data.session && r.data.session.access_token) || '';
        if (t) {
          fetch(FN + '/realty-ica-notice', {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + t },
            body: JSON.stringify({ event: 'gate_error' })
          }).catch(function(){});
        }
      }).catch(function(){});
    } catch(e2) {}
  }
})();
