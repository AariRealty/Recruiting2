import { createClient } from 'jsr:@supabase/supabase-js@2'
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const BUCKET='realty-hub'
const CORS: Record<string,string> = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-io-secret','Access-Control-Allow-Methods':'GET, POST, OPTIONS' }
function J(o: unknown, s=200){ return new Response(JSON.stringify(o),{status:s,headers:{...CORS,'Content-Type':'application/json'}}) }

async function acceptedSecrets(): Promise<string[]> {
  const { data } = await admin.from('realty_config').select('key,value').in('key',['hub_io_secret','hub_io_secret_next'])
  const out: string[] = []
  for (const r of data ?? []) { const v = String((r as {value?: string}).value ?? ''); if (v) out.push(v) }
  return out
}

const BINARY_ROUTES: Record<string,{bucket:string; types:Record<string,string>}> = {
  brand: {
    bucket: 'realty-brand',
    types: { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', svg:'image/svg+xml',
             webp:'image/webp', pdf:'application/pdf', zip:'application/zip', eps:'application/postscript' },
  },
  agreements: {
    bucket: 'signed-agreements',
    types: { pdf:'application/pdf' },
  },
}
function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/\s+/g,''))
  const out = new Uint8Array(bin.length)
  for (let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i)
  return out
}
async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,'0')).join('')
}

function checkScriptSyntax(html: string): { ok: true } | { ok: false; error: string; block: number } {
  const re = /<script[^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null
  let blockNum = 0
  while ((match = re.exec(html)) !== null) {
    blockNum++
    const src = match[0].match(/\bsrc\s*=/i)
    if (src) continue
    const code = match[1]
    if (!code.trim()) continue
    try {
      new Function(code)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false, error: msg, block: blockNum }
    }
  }
  return { ok: true }
}

Deno.serve(async (req: Request) => {
  if (req.method==='OPTIONS') return new Response('ok',{headers:CORS})

  const accepted = await acceptedSecrets()
  if (!accepted.length) {
    return J({ error:'io_secret_not_configured',
               detail:'No hub_io_secret in realty_config. Set realty_config.hub_io_secret to a freshly generated value and set the same value as the HUB_IO_SECRET repository secret, then retry. This function writes nothing until both exist.' }, 503)
  }
  const presented = req.headers.get('x-io-secret') ?? ''
  if (!presented || !accepted.includes(presented)) return J({error:'forbidden'},403)

  const url=new URL(req.url); const path=url.searchParams.get('path')||''

  const prefix = path.split('/')[0]
  const route = BINARY_ROUTES[prefix]
  if (route) {
    const m = path.match(/^[a-z]+\/([A-Za-z0-9._-]+\.([A-Za-z0-9]{2,4}))$/)
    if (!m) return J({error:'bad '+prefix+' path'},400)
    const key = m[1]
    const ctype = route.types[m[2].toLowerCase()]
    if (!ctype) return J({error:'unsupported file type for '+prefix+': '+m[2]},400)

    if (req.method==='GET') {
      const {data,error}=await admin.storage.from(route.bucket).download(key)
      if (error||!data) return J({error:error?.message||'not found'},404)
      const bytes=new Uint8Array(await data.arrayBuffer())
      return J({ok:true,path,bucket:route.bucket,bytes:bytes.length,sha256:await sha256Hex(bytes)})
    }
    if (req.method==='POST') {
      const j = await req.json().catch(()=>null) as {content?:string} | null
      if (!j || typeof j.content!=='string' || !j.content) return J({error:prefix+' upload needs a JSON body with base64 content'},400)
      let bytes: Uint8Array
      try { bytes = b64ToBytes(j.content) } catch(_e){ return J({error:'content is not valid base64'},400) }
      if (!bytes.length) return J({error:'content decoded to nothing'},400)
      if (prefix==='agreements') {
        const {data:exists}=await admin.storage.from(route.bucket).download(key)
        if (exists) {
          const cur=new Uint8Array(await exists.arrayBuffer())
          const same=await sha256Hex(cur)===await sha256Hex(bytes)
          return same
            ? J({ok:true,path,bucket:route.bucket,bytes:cur.length,sha256:await sha256Hex(cur),unchanged:true})
            : J({error:'refusing to overwrite an existing agreement version, publish it as the next version instead'},409)
        }
      }
      const {error:upErr}=await admin.storage.from(route.bucket).upload(key,new Blob([bytes],{type:ctype}),{contentType:ctype,upsert:prefix!=='agreements'})
      if (upErr) return J({error:upErr.message},500)
      return J({ok:true,path,bucket:route.bucket,bytes:bytes.length,sha256:await sha256Hex(bytes),content_type:ctype})
    }
    return J({error:'method not allowed'},405)
  }

  // ---- hub fragments -------------------------------------------------------
  if (!/^[A-Za-z0-9._-]+\.html$/.test(path)) return J({error:'bad path'},400)
  if (req.method==='GET') {
    const {data,error}=await admin.storage.from(BUCKET).download(path)
    if (error||!data) return J({error:error?.message||'not found'},404)
    return new Response(await data.text(),{headers:{...CORS,'Content-Type':'text/plain; charset=utf-8'}})
  }
  if (req.method==='POST') {
    const raw=await req.text(); let body=raw
    const ct=(req.headers.get('content-type')||'').toLowerCase()
    if (ct.includes('json')||(raw.startsWith('{')&&raw.endsWith('}'))) { try { const j=JSON.parse(raw); if (typeof j?.content==='string') body=j.content } catch(_e){} }
    const check = checkScriptSyntax(body)
    if (!check.ok) return J({ error: 'syntax_check_failed', detail: check.error, script_block: check.block, path }, 422)
    const ts=new Date().toISOString().replace(/[:.]/g,'-'); const backupName=path+'.BACKUP-'+ts
    const {data:current}=await admin.storage.from(BUCKET).download(path)
    if (current) await admin.storage.from(BUCKET).upload(backupName,current,{contentType:'text/html; charset=utf-8',upsert:false})
    const {error:upErr}=await admin.storage.from(BUCKET).upload(path,new Blob([body],{type:'text/html; charset=utf-8'}),{contentType:'text/html; charset=utf-8',upsert:true})
    if (upErr) return J({error:upErr.message},500)
    return J({ok:true,path,backup:backupName,size:body.length,syntax_checked:true})
  }
  return J({error:'method not allowed'},405)
})
