import { createClient } from 'jsr:@supabase/supabase-js@2';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REALTY_RESEND_KEY = Deno.env.get('REALTY_RESEND_API_KEY') ?? '';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const BRAND_FROM = 'Aari Realty <onboarding@aarirealty.com>';
const REPLY_TO = 'marlenyi@aarirealty.com';
const HUB_URL = 'https://hub.joinaari.com';
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
const CORS: Record<string,string> = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-aari-cron', 'Access-Control-Allow-Methods':'POST, OPTIONS', 'Access-Control-Max-Age':'86400' };
function json(b: unknown, s=200){ return new Response(JSON.stringify(b), { status:s, headers:{...CORS,'Content-Type':'application/json'} }); }
function esc(x: string){ return String(x ?? '').replace(/[&<>'"]/g, (c)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]!); }
function firstName(f: string){ return String(f ?? '').trim().split(/\s+/)[0] || ''; }
function b64ToBytes(b64: string){ const bin=atob(b64); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i); return u; }
function bytesToB64(bytes: Uint8Array){ let bin=''; const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk){ bin+=String.fromCharCode(...bytes.subarray(i,i+chunk)); } return btoa(bin); }
function deriveInitials(name: string){ return String(name||'').trim().split(/\s+/).map(w=>w[0]||'').join('').toUpperCase().slice(0,5); }

// The fee printed on the signature certificate has to be the fee stated in the version being
// signed, because the certificate is bound into that document.
//
// These went to a flat $99.00/quarter on 7 September for ICA v8 and are back to the per plan
// monthly figures the same day, because v8 was withdrawn and v5 is the current version again.
// v5 section 41.1 is a Monthly Brokerage Fee that varies by plan: $59 Mentorship, $79 Growth,
// $99 Max. These three strings and that table have to say the same thing.
//
// If a future version changes the fee, this changes in the same deploy that makes that version
// current. Ahead of it, the certificate states a fee no signed agreement contains; behind it,
// it states a superseded one.
function planInfo(raw: string): { code:'75_25'|'85_15'|'100_max'; name:string; split:string; fee:string } | null {
  const s = String(raw||'').toLowerCase();
  if (/mentor|75_25|(^|[^0-9])75([^0-9]|$)/.test(s)) return { code:'75_25', name:'Mentorship Path', split:'75/25', fee:'$59.00/month' };
  if (/growth|85_15|(^|[^0-9])85([^0-9]|$)/.test(s)) return { code:'85_15', name:'Aari Growth', split:'85/15', fee:'$79.00/month' };
  if (/max|100_max|(^|[^0-9])100([^0-9]|$)/.test(s)) return { code:'100_max', name:'Aari Max', split:'100/0', fee:'$99.00/month' };
  return null;
}
function planDisplay(raw: string): string {
  const p = planInfo(raw);
  return p ? (p.name + ' — ' + p.split + ' split — ' + p.fee) : String(raw||'');
}

// Splits people sit on today that the agreement does not offer. They are inherited from before
// the current ICA: valid rows, not offered plans. Exhibit A section 38.1 has three plans and
// these are not among them, so an agreement signed from one of these would carry no plan
// initial and no acknowledged compensation term. The plan moves first, then the agent signs.
const LEGACY_SPLITS: Record<string,string> = { '70_30': '75_25', '80_20': '85_15' };

type Layout = { page1:number; coords:Record<string,{x:number;y:number}> };
function resolveLayout(ver: any): Layout | null {
  const p = Number(ver?.plan_initial_page);
  const c = ver?.plan_initial_coords;
  if (!Number.isFinite(p) || p < 1 || !c || typeof c !== 'object') return null;
  return { page1: Math.trunc(p), coords: c as Record<string,{x:number;y:number}> };
}

async function blocked(userId: string|null, code: string, detail: Record<string, unknown>, req: Request) {
  // Recorded so a refusal reaches the broker rather than living only in the agent's browser.
  try {
    await admin.from('audit_log').insert({
      actor_id: userId, actor_type: 'realty_member', action: 'realty_ica_sign_blocked',
      target_table: 'realty_members', target_id: userId, details: { code, ...detail },
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      user_agent: req.headers.get('user-agent') || null,
    });
  } catch (e) {
    // Never let the audit write mask the refusal, so this still does not throw. It does now
    // leave a line in the function logs, because an audit write that fails quietly is not an
    // audit trail. Three call sites in this project silently wrote nothing for months.
    console.error('[audit] realty-sign-ica audit_log insert failed:', e)
  }
}

async function buildSignedPdf(baseBytes: Uint8Array, sigPngBytes: Uint8Array | null, info: any): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(baseBytes);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvI = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const bodyC = rgb(0.14,0.13,0.10);

  const ini = String(info.initials || deriveInitials(info.typed_name || info.name));
  const pages = pdf.getPages();

  if (ini) {
    for (const pg of pages) {
      const sz = pg.getSize();
      const w = helvB.widthOfTextAtSize(ini, 8);
      pg.drawText(ini, { x: sz.width - 56 - w, y: 46, size: 8, font: helvB, color: rgb(0.34,0.32,0.28) });
    }
  }

  const pInfo = planInfo(String(info.plan||''));
  if (ini && pInfo && info.layout) {
    const idx = info.layout.page1 - 1;
    const spot = info.layout.coords[pInfo.code];
    if (!spot || !Number.isFinite(Number(spot.x)) || !Number.isFinite(Number(spot.y))) {
      throw new Error('no coordinates configured for plan ' + pInfo.code + ' on version ' + info.version_label);
    }
    if (idx < 0 || idx >= pages.length) {
      throw new Error('plan_initial_page ' + info.layout.page1 + ' is out of range for a ' + pages.length + ' page base PDF');
    }
    pages[idx].drawText(ini, { x: Number(spot.x), y: Number(spot.y), size:10, font:helvB, color:bodyC });
  }

  const page = pdf.addPage([612, 792]);
  const dark = rgb(0.102,0.102,0.102); const gray = rgb(0.42,0.40,0.36); const body = bodyC;
  page.drawRectangle({ x:0, y:752, width:612, height:40, color:dark });
  page.drawText('SIGNATURE CERTIFICATE', { x:612-56-helvB.widthOfTextAtSize('SIGNATURE CERTIFICATE',9), y:772, size:9, font:helvB, color:rgb(1,1,1) });
  page.drawText('AARI REALTY LLC · FLORIDA LICENSED BROKERAGE', { x:612-56-helv.widthOfTextAtSize('AARI REALTY LLC · FLORIDA LICENSED BROKERAGE',6.5), y:760, size:6.5, font:helv, color:rgb(0.8,0.78,0.73) });
  let y = 700;
  page.drawText('Certificate of Electronic Signature', { x:56, y, size:20, font:helvB, color:body }); y -= 10;
  page.drawLine({ start:{x:56,y}, end:{x:556,y}, thickness:1, color:dark }); y -= 30;
  const label=(t:string)=>{ page.drawText(t.toUpperCase(), { x:56, y, size:7.5, font:helvB, color:gray }); y-=15; };
  const line=(t:string,f=helv,s=11)=>{ page.drawText(t, { x:56, y, size:s, font:f, color:body }); y-=Math.round(s*1.6); };
  label('Agreement');
  line('Aari Realty LLC — Independent Contractor Agreement', helvB, 12);
  line('Full package including all incorporated documents and Exhibit A');
  line('Version: ' + (info.version_label||''), helv, 10); y-=12;
  label('Signed by');
  line(info.name, helvB, 13);
  line('Typed legal name: ' + info.typed_name, helv, 10);
  line('Initials: ' + ini, helv, 10);
  if (info.license) line('License: ' + info.license, helv, 10);
  if (info.plan && info.plan!=='—') line('Commission Plan: ' + planDisplay(info.plan), helv, 10);
  y-=8;
  page.drawText('SIGNATURE', { x:56, y, size:7.5, font:helvB, color:gray }); y-=6;
  if (sigPngBytes) {
    try {
      const png = await pdf.embedPng(sigPngBytes);
      const dims = png.scaleToFit(230, 70);
      page.drawImage(png, { x:56, y:y-dims.height, width:dims.width, height:dims.height });
      page.drawLine({ start:{x:56,y:y-dims.height-4}, end:{x:56+250,y:y-dims.height-4}, thickness:0.75, color:gray });
      y -= (dims.height + 22);
    } catch(_e){ page.drawText('[signature on file]', { x:56, y:y-14, size:10, font:helv, color:body }); y-=34; }
  } else {
    const sig = String(info.typed_signature || info.name || '');
    page.drawText(sig, { x:60, y:y-32, size:26, font:helvI, color:body });
    page.drawLine({ start:{x:56,y:y-40}, end:{x:56+260,y:y-40}, thickness:0.75, color:gray });
    page.drawText('Typed electronic signature', { x:56, y:y-52, size:7, font:helv, color:gray });
    y -= 68;
  }
  label('Execution Details');
  line('Signed at: ' + info.signed_display, helv, 10);
  line('IP address: ' + (info.ip||'not recorded'), helv, 10);
  line('Device: ' + (info.ua||'not recorded').slice(0,80), helv, 9);
  line('Document hash (SHA-256): ' + info.sha.slice(0,48) + '…', helv, 8); y-=14;
  const stmt = ['By signing above, the Associate intends to electronically sign this Agreement and consents to','the use of electronic records and signatures. Under the federal ESIGN Act (15 U.S.C. § 7001 et','seq.) and Florida’s Uniform Electronic Transactions Act (Ch. 668, Fla. Stat.), this electronic','signature has the same legal force and effect as a handwritten signature.'];
  page.drawText('ESIGN / UETA CONSENT', { x:56, y, size:7.5, font:helvB, color:gray }); y-=14;
  for(const l of stmt){ page.drawText(l, { x:56, y, size:8.5, font:helv, color:body }); y-=13; }
  page.drawRectangle({ x:0, y:0, width:612, height:34, color:dark });
  page.drawText('Aari.', { x:56, y:12, size:13, font:helvB, color:rgb(1,1,1) });
  const cf='CONFIDENTIAL — BROKERAGE FILE RECORD';
  page.drawText(cf, { x:306-helv.widthOfTextAtSize(cf,6.5)/2, y:13, size:6.5, font:helv, color:rgb(0.56,0.53,0.49) });
  page.drawText('Broker of Record: Marlenyi L. Paredes · BK3530153', { x:56, y:44, size:8, font:helv, color:gray });
  return await pdf.save();
}

const ITH = 'font-family:Fraunces,Georgia,serif;font-style:italic;font-weight:500;color:#141210';
const TOP = `<div style="background:#141210;padding:18px 30px"><div style="font-family:Fraunces,Georgia,serif;font-weight:600;font-size:20px;color:#fff;letter-spacing:-.3px">Aari Realty</div><div style="font-size:9.5px;letter-spacing:2px;text-transform:uppercase;color:#a59d90;font-weight:600;margin-top:2px">Florida Licensed Brokerage</div></div>`;
const FOOT = `<div style="text-align:center;padding:18px;font-size:11px;color:#a7a29a;line-height:1.6">Aari Realty LLC, Florida Licensed Real Estate Brokerage<br>Broker of Record: Marlenyi L. Paredes, License BK3530153</div>`;
function signOff(closing: string){ return `<div style="padding:22px 30px 30px;font-size:14px;color:#4a453d;line-height:1.6">${closing}<br><br><span style="font-family:Fraunces,Georgia,serif;font-weight:600;color:#141210;font-size:16px">Marlenyi Paredes</span><br><span style="color:#8a857c;font-size:12.5px">Qualifying Broker, Aari Realty LLC</span></div>`; }
function shell(inner: string, closing: string){ return `<div style="margin:0;background:#f2f1ef;padding:24px 12px;font-family:Inter,Arial,sans-serif"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eceae4;border-radius:18px;overflow:hidden">${TOP}${inner}${signOff(closing)}</div>${FOOT}</div>`; }

function recordBlock(rows: Array<[string,string]>){
  const lines = rows.map(([k,v]) => `<div><span style="color:#8a857c">${esc(k)}</span> &nbsp;${esc(v)}</div>`).join('');
  return `<div style="margin:18px 30px 0;background:#f5f1e8;border-radius:12px;padding:15px 18px;font-size:12.5px;line-height:1.9;color:#2a2620"><div style="font-size:9.5px;letter-spacing:1.8px;text-transform:uppercase;color:#8a7f6a;font-weight:700;margin-bottom:6px">On file</div>${lines}</div>`;
}

function agentSignedHtml(o: { first:string; resign:boolean; rows:Array<[string,string]> }){
  const eyebrow = o.resign ? 'Updated and executed' : 'Signed and executed';
  const head = o.resign
    ? `Signed and current, <span style="font-style:italic;font-weight:500">${esc(o.first)}</span>.`
    : `It&#39;s official, <span style="font-style:italic;font-weight:500">${esc(o.first)}</span>.`;
  const kicker = o.resign
    ? 'You are on the current agreement. Nothing is outstanding.'
    : 'The paperwork is done. The upside is yours.';
  const para = o.resign
    ? `Your updated <b style="color:#141210">Independent Contractor Agreement</b> is signed and attached. This replaces the version you signed previously. Everything you had before still stands, and the current terms are now <span style="${ITH}">on record</span>. Keep this copy.`
    : `Plenty of brokerages take your split and vanish the second it gets hard. Not this one. Your fully executed <b style="color:#141210">Independent Contractor Agreement</b> is attached. Proof, in writing, that this is <span style="${ITH}">yours</span>. Keep it somewhere safe.`;
  const inner = `<div style="padding:34px 30px 4px"><div style="font-size:10px;letter-spacing:2.2px;text-transform:uppercase;color:#b0a06a;font-weight:700">${eyebrow}</div><div style="font-family:Fraunces,Georgia,serif;font-weight:600;font-size:32px;line-height:1.02;letter-spacing:-.6px;color:#141210;margin:12px 0 0">${head}</div><div style="font-family:Fraunces,Georgia,serif;font-style:italic;font-weight:500;font-size:18px;color:#8a7f6a;margin:10px 0 0;line-height:1.3">${kicker}</div></div><div style="font-size:15px;line-height:1.62;color:#4a453d;padding:18px 30px 0">${para}</div>${recordBlock(o.rows)}<div style="padding:20px 30px 0"><a href="${HUB_URL}" style="display:inline-block;background:#141210;color:#fff;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:1.3px;text-transform:uppercase;padding:14px 28px;border-radius:50px">Open my hub</a></div>`;
  return shell(inner, o.resign ? 'Appreciate you keeping it current.' : 'Proud to have you. Let&#39;s build something.');
}

function telHref(raw: string){
  const d = String(raw||'').replace(/[^0-9]/g,'');
  if (d.length === 10) return '+1' + d;
  if (d.length === 11 && d[0] === '1') return '+' + d;
  return d ? '+' + d : '';
}
function prettyPhone(raw: string){
  const d = String(raw||'').replace(/[^0-9]/g,'');
  const t = d.length === 11 && d[0] === '1' ? d.slice(1) : d;
  if (t.length === 10) return '(' + t.slice(0,3) + ') ' + t.slice(3,6) + '-' + t.slice(6);
  return String(raw||'');
}

// Broker email. Warm, celebratory, Alex voice. Broker perspective: she just got a new agent.
function brokerSignedHtml(o: { name:string; resign:boolean; rows:Array<[string,string]>; email:string; phone:string }){
  const eyebrow = o.resign ? 'Re-signed and current' : 'New agent, signed on';
  const first = firstName(o.name);
  const head = o.resign
    ? `<span style="font-style:italic;font-weight:500">${esc(first)}</span> is on the updated agreement.`
    : `You just got a new agent.`;
  const kicker = o.resign
    ? 'Nothing outstanding. Everything current.'
    : `${esc(o.name)} is officially yours.`;
  const para = o.resign
    ? `<b style="color:#141210">${esc(o.name)}</b> re-signed the current version of the Independent Contractor Agreement. The executed copy is attached for the file. Their info is below so you can check in whenever you want.`
    : `They signed. They committed. They&#39;re <span style="${ITH}">in</span>. The executed <b style="color:#141210">Independent Contractor Agreement</b> is attached for the file. Their info is right here so you can text, call, or email them the second you finish reading this.`;

  const lines = o.rows.map(([k,v]) => `<div><span style="color:#8a857c">${esc(k)}</span> &nbsp;${esc(v)}</div>`).join('');
  const record = `<div style="margin:18px 30px 0;background:#f5f1e8;border-radius:12px;padding:15px 18px;font-size:12.5px;line-height:1.9;color:#2a2620"><div style="font-size:9.5px;letter-spacing:1.8px;text-transform:uppercase;color:#8a7f6a;font-weight:700;margin-bottom:6px">On file</div>${lines}</div>`;

  // Contact block. Gmail iOS is known to strip bare sms: links, so we use the iOS-native
  // sms:...?&body=... form (Apple's specific quirk that many clients pass through intact) with a
  // prefilled opener the broker can send in one tap. tel: and mailto: are universally honored.
  // The plain-text line below is a real tel:/mailto: fallback for any client that still blocks sms:.
  const tel = telHref(o.phone);
  const smsBody = encodeURIComponent(`Hi ${first}, this is Marlenyi at Aari Realty. Congrats on signing on, thrilled to have you.`);
  const smsHref = tel ? `sms:${tel}?&body=${smsBody}` : '';
  const btn = 'display:inline-block;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;padding:8px 14px;border-radius:50px;margin:0 6px 6px 0;';
  const btns = (tel ? `<a href="${smsHref}" style="${btn}background:#141210;color:#fff">Text</a><a href="tel:${tel}" style="${btn}background:#fff;color:#141210;border:1px solid #d8d4ca">Call</a>` : '')
    + (o.email ? `<a href="mailto:${esc(o.email)}" style="${btn}background:#fff;color:#141210;border:1px solid #d8d4ca">Email</a>` : '');
  const plainParts:string[] = [];
  if (tel) plainParts.push(`<a href="tel:${tel}" style="color:#141210;text-decoration:underline;text-underline-offset:2px">${esc(prettyPhone(o.phone))}</a>`);
  if (o.email) plainParts.push(`<a href="mailto:${esc(o.email)}" style="color:#141210;text-decoration:underline;text-underline-offset:2px">${esc(o.email)}</a>`);
  const plainLine = plainParts.length
    ? `<div style="font-size:12px;color:#6b675f;margin-top:10px;line-height:1.5">${plainParts.join(' &middot; ')}</div>`
    : '';
  const hint = tel
    ? `<div style="font-size:10.5px;color:#a59d90;margin-top:4px">If Text doesn&#39;t open Messages, long-press the number above.</div>`
    : '';
  const contact = `<div style="margin:18px 30px 0;background:#fff;border:1px solid #e6e2d8;border-radius:12px;padding:14px 16px"><div style="font-size:9.5px;letter-spacing:1.8px;text-transform:uppercase;color:#8a7f6a;font-weight:700;margin-bottom:10px">Reach them now</div>${btns || '<div style="font-size:12.5px;color:#8a1c1c">No phone number on file for this agent.</div>'}${plainLine}${hint}</div>`;

  const inner = `<div style="padding:34px 30px 4px"><div style="font-size:10px;letter-spacing:2.2px;text-transform:uppercase;color:#b0a06a;font-weight:700">${eyebrow}</div><div style="font-family:Fraunces,Georgia,serif;font-weight:600;font-size:32px;line-height:1.02;letter-spacing:-.6px;color:#141210;margin:12px 0 0">${head}</div><div style="font-family:Fraunces,Georgia,serif;font-style:italic;font-weight:500;font-size:18px;color:#8a7f6a;margin:10px 0 0;line-height:1.3">${kicker}</div></div><div style="font-size:15px;line-height:1.62;color:#4a453d;padding:18px 30px 0">${para}</div>${record}${contact}`;

  return shell(inner, o.resign ? 'Nice work keeping the roster tight.' : 'Go say hi. This is the good part.');
}

async function sendEmail(from:string, to:string, subject:string, html:string, pdfB64:string, filename:string){
  const key = REALTY_RESEND_KEY || RESEND_API_KEY;
  if(!key) return { ok:false, err:'no resend api key' };
  try{
    const r=await fetch('https://api.resend.com/emails',{ method:'POST', headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'}, body: JSON.stringify({ from, to:[to], reply_to: REPLY_TO, subject, html, attachments:[{ filename, content: pdfB64 }] }) });
    if(!r.ok) return { ok:false, err:(await r.text()).slice(0,200) };
    return { ok:true };
  }catch(e){ return { ok:false, err:String(e).slice(0,160) }; }
}

Deno.serve(async (req: Request) => {
  if (req.method==='OPTIONS') return new Response('ok',{headers:CORS});
  if (req.method!=='POST') return json({error:'method_not_allowed'},405);

  const { data: cfg } = await admin.from('realty_config').select('key,value').in('key',['digest_cron_secret']);
  const cmap:Record<string,string>={}; for(const c of cfg??[]) cmap[c.key]=c.value;
  const cronSecret=cmap['digest_cron_secret']??'';
  // Broker notifications route to the onboarding inbox, not Marlenyi's personal address.
  const BROKER_EMAIL='join@aarirealty.com';

  const bodyIn = await req.json().catch(()=>({}));
  const isTest = !!(cronSecret && req.headers.get('x-aari-cron') && req.headers.get('x-aari-cron')===cronSecret);

  let signer:{ id:string|null; email:string; name:string; license:string|null; plan:string|null; phone:string|null };
  if (isTest) {
    const em = String(bodyIn?.test_email??BROKER_EMAIL);
    signer = { id:null, email:em, name: String(bodyIn?.name??'Test Signer'), license:'TEST-LICENSE', plan: String(bodyIn?.commission_plan??'—'), phone: String(bodyIn?.phone??'') };
  } else {
    const token=(req.headers.get('Authorization')??'').replace('Bearer ','');
    const { data:{ user } } = await admin.auth.getUser(token);
    if(!user) return json({error:'unauthorized'},401);
    const { data:m } = await admin.from('realty_members').select('user_id,email,full_name,license_number,status,commission_plan,phone').eq('user_id',user.id).maybeSingle();
    if(!m || m.status!=='active') return json({error:'forbidden'},403);
    signer = { id:m.user_id, email:m.email, name:m.full_name, license:m.license_number, plan:m.commission_plan, phone:m.phone };
  }

  const consent = bodyIn?.consent===true;
  const planAcknowledged = bodyIn?.plan_acknowledged===true;
  const typed = String(bodyIn?.typed_name??'').trim();
  const sigUrl = String(bodyIn?.signature_data_url??'');
  const initialsIn = String(bodyIn?.initials??'').trim();
  const phoneIn = String(bodyIn?.phone??'').replace(/[^0-9]/g,'');
  if(!consent) return json({error:'ESIGN consent required'},400);
  if(!typed) return json({error:'typed legal name required'},400);
  if(!sigUrl.startsWith('data:image')) return json({error:'signature image required'},400);

  const { data:ver } = await admin.from('realty_agreement_versions')
    .select('id,version_label,base_pdf_path,plan_initial_page,plan_initial_coords,effective_date')
    .eq('is_current',true).maybeSingle();
  if(!ver || !ver.base_pdf_path) return json({error:'no current agreement version / base pdf'},500);

  // ------------------------------------------------------------------
  // The compensation term is not optional.
  //
  // This used to refuse only when a plan half matched: a plan planInfo could read
  // but the version had no coordinates for. A plan it could not read at all fell
  // through both this check and the stamping branch, and the agreement executed
  // with nothing acknowledged on the fee schedule. That is the exact path a legacy
  // split agent would have taken, and it is the one an ICA must never take, because
  // the split is the term most likely to be disputed and the one a supervision
  // review looks for.
  //
  // Refused before anything is written: no PDF in storage, no signature row, no
  // email, no partial state. The refusal is recorded in audit_log so it reaches
  // the broker rather than living only in the agent's browser.
  //
  // The cron test path may still pass the em dash sentinel for an email preview,
  // and says so in its answer rather than quietly skipping the rule.
  // ------------------------------------------------------------------
  const rawPlan = String(signer.plan ?? '').trim();
  const testNoPlan = isTest && (rawPlan === '' || rawPlan === '—');
  let planGuard = 'enforced';
  if (testNoPlan) {
    planGuard = 'skipped_cron_test';
  } else {
    if (!rawPlan) {
      await blocked(signer.id, 'commission_plan_missing', { plan: null, version: ver.version_label }, req);
      return json({ error:'commission_plan_missing', plan:null, version_label: ver.version_label,
        detail:'This member has no commission plan on file. The broker sets the plan before the agreement can be signed, because the agreement records the split that was agreed.' }, 409);
    }
    const pInfo = planInfo(rawPlan);
    if (!pInfo) {
      const movesTo = LEGACY_SPLITS[rawPlan] ?? null;
      const code = movesTo ? 'commission_plan_legacy' : 'commission_plan_unrecognised';
      await blocked(signer.id, code, { plan: rawPlan, moves_to: movesTo, version: ver.version_label }, req);
      return json({ error: code, plan: rawPlan, moves_to: movesTo, version_label: ver.version_label,
        detail: movesTo
          ? ('This member is on the ' + rawPlan.replace('_','/') + ' legacy split, which the current agreement does not offer. The broker moves the plan to ' + movesTo.replace('_','/') + ' first, then the agreement can be signed. Nothing was signed and nothing was recorded.')
          : ('Commission plan "' + rawPlan + '" is not a plan in agreement version ' + ver.version_label + '. Nothing was signed and nothing was recorded.') }, 409);
    }
    const layoutCheck = resolveLayout(ver);
    if (!layoutCheck) {
      await blocked(signer.id, 'agreement_layout_not_configured', { plan: pInfo.code, version: ver.version_label }, req);
      return json({ error:'agreement_layout_not_configured', plan: pInfo.code, version_label: ver.version_label,
        detail:'Version '+ver.version_label+' has no plan_initial_page / plan_initial_coords. Set them on the version row before signing.' }, 409);
    }
    const spot = layoutCheck.coords[pInfo.code];
    if (!spot || !Number.isFinite(Number(spot.x)) || !Number.isFinite(Number(spot.y))) {
      await blocked(signer.id, 'agreement_layout_missing_plan', { plan: pInfo.code, version: ver.version_label }, req);
      return json({ error:'agreement_layout_missing_plan', plan: pInfo.code, version_label: ver.version_label,
        detail:'Version '+ver.version_label+' has no coordinates for plan '+pInfo.code+'. Nothing was signed and nothing was recorded.' }, 409);
    }
  }

  const layout = resolveLayout(ver);

  // Past the guard, so this is a signature that is going to complete. The phone write sits
  // here rather than earlier so a refused attempt leaves the member row untouched too.
  if (signer.id && (phoneIn.length === 10 || phoneIn.length === 11)) {
    const norm = phoneIn.length === 11 && phoneIn[0] === '1' ? phoneIn.slice(1) : phoneIn;
    if (norm !== String(signer.phone ?? '').replace(/[^0-9]/g,'')) {
      await admin.from('realty_members').update({ phone: norm, updated_at: new Date().toISOString() }).eq('user_id', signer.id);
    }
    signer.phone = norm;
  }

  const { data:baseFile, error:dlErr } = await admin.storage.from('signed-agreements').download(ver.base_pdf_path);
  if(dlErr || !baseFile) return json({error:'base pdf not found: '+(dlErr?.message||ver.base_pdf_path)},500);
  const baseBytes = new Uint8Array(await baseFile.arrayBuffer());

  const sigBytes = b64ToBytes(sigUrl.split(',')[1]||'');
  const now = new Date();
  const signedDisplay = now.toLocaleString('en-US',{ timeZone:'America/New_York', dateStyle:'long', timeStyle:'short' }) + ' ET';
  const ip = (req.headers.get('x-forwarded-for')?.split(',')[0]||'').trim();
  const ua = req.headers.get('user-agent')||'';

  const preHashBuf = await crypto.subtle.digest('SHA-256', baseBytes);
  const preSha = [...new Uint8Array(preHashBuf)].map(b=>b.toString(16).padStart(2,'0')).join('');

  let outBytes: Uint8Array;
  try {
    outBytes = await buildSignedPdf(baseBytes, sigBytes, { name:signer.name, typed_name:typed, typed_signature:'', initials:initialsIn, license:signer.license, plan:signer.plan, layout, version_label:ver.version_label, signed_display:signedDisplay, ip, ua, sha:preSha });
  } catch (e) {
    return json({ error:'stamp_failed', detail:String((e as Error)?.message||e).slice(0,300) }, 409);
  }
  const hashBuf = await crypto.subtle.digest('SHA-256', outBytes);
  const sha = [...new Uint8Array(hashBuf)].map(b=>b.toString(16).padStart(2,'0')).join('');

  const safeName = signer.name.replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'agent';
  const ts = now.getTime();
  const idPart = signer.id || 'test';
  const pdfPath = `${idPart}/${ver.version_label}/${ts}.pdf`;
  const sigPath = `${idPart}/${ts}.png`;
  const filename = `Aari-Realty-ICA-${safeName}-signed.pdf`;

  // The row records pdf_path and pdf_sha256 a few lines below, so if this upload
  // fails and nobody looks, the signature of record names a document that was
  // never stored. That reads as accounted for, which is worse than a null: the
  // only executed agreement this brokerage holds already has null fields and it
  // took an audit to notice. Refuse before writing the row instead.
  const { error: upErr } = await admin.storage.from('signed-agreements').upload(pdfPath, outBytes, { contentType:'application/pdf', upsert:true });
  if (upErr) {
    await blocked(signer.id, 'pdf_store_failed', { path: pdfPath, detail: upErr.message, version: ver.version_label }, req);
    return json({ error:'pdf_store_failed', detail:'The signed PDF could not be stored, so nothing was recorded. Nobody is signed. ' + upErr.message }, 500);
  }
  let storedSigPath: string | null = null;
  try {
    const { error:sErr } = await admin.storage.from('signatures').upload(sigPath, sigBytes, { contentType:'image/png', upsert:true });
    if (!sErr) storedSigPath = sigPath;
  } catch(_e){}

  let priorCount = 0;
  if (signer.id) {
    const { count } = await admin.from('realty_agreement_signatures').select('*', { count:'exact', head:true }).eq('agent_id', signer.id);
    priorCount = count ?? 0;
  }
  const isResign = priorCount > 0;

  const { data:sigRow } = await admin.from('realty_agreement_signatures').insert({ agent_id:signer.id, signer_email:signer.email, signer_name:signer.name, version_id:ver.id, version_label:ver.version_label, commission_plan: (signer.plan && signer.plan!=='—')?signer.plan:null, source: isTest?'website':'hub', signed_at:now.toISOString(), ip_address:ip||null, user_agent:ua||null, signature_image_path:storedSigPath, pdf_path:pdfPath, pdf_sha256:sha, record_origin:'signed', plan_acknowledged_at: planAcknowledged ? now.toISOString() : null }).select('id').single();

  const pdfB64 = bytesToB64(outBytes);

  const agentRows: Array<[string,string]> = [
    ['Agent', signer.name],
    ['License', signer.license || 'not on file'],
    ['Signed', signedDisplay]
  ];
  const brokerRows: Array<[string,string]> = [
    ['Agent', signer.name],
    ['License', signer.license || 'not on file'],
    ['Phone', signer.phone ? prettyPhone(signer.phone) : 'not on file'],
    ['Email', signer.email],
    ['Signed', signedDisplay]
  ];

  const agentSubject = isResign ? 'Your updated Aari agreement is signed.' : 'It is official. Your Aari agreement is signed.';
  const brokerSubject = isResign
    ? `${signer.name} just re-signed the current agreement.`
    : `Congratulations, Marlenyi. ${signer.name} just signed on.`;

  const brokerRes = await sendEmail(BRAND_FROM, BROKER_EMAIL, brokerSubject, brokerSignedHtml({ name: signer.name, resign: isResign, rows: brokerRows, email: signer.email, phone: signer.phone || '' }), pdfB64, filename);

  let agentRes:{ok:boolean;err?:string} = { ok:true };
  if (signer.email) {
    agentRes = await sendEmail(BRAND_FROM, signer.email, agentSubject, agentSignedHtml({ first: firstName(signer.name), resign: isResign, rows: agentRows }), pdfB64, filename);
  }

  return json({ ok:true, signature_id:sigRow?.id||null, pdf_path:pdfPath, signature_image_path:storedSigPath, sha256:sha, version_label:ver.version_label, plan_guard:planGuard, resign:isResign, emailed_broker:brokerRes.ok, emailed_agent:agentRes.ok, errors:[brokerRes.err,agentRes.err].filter(Boolean) });
});
