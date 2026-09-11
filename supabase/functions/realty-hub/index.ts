import { createClient } from 'jsr:@supabase/supabase-js@2'

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const CORS: Record<string, string> = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' }
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } }) }
async function audit(actorId: string | null, actorType: string, action: string, targetTable: string, targetId: string | null, details: Record<string, unknown>, req: Request) {
  try { await admin.from('audit_log').insert({ actor_id: actorId, actor_type: actorType, action, target_table: targetTable, target_id: targetId, details, ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null, user_agent: req.headers.get('user-agent') || null }) } catch (_e) { /* */ }
}
// A module that downloads as nothing is indistinguishable, downstream, from a
// module that was never wired: inject() returns the html unchanged, says
// nothing, and the page renders fine without it. That ambiguity is exactly what
// produced a wrong diagnosis on 5 September, so an empty or failed download now
// leaves a row behind. ctx is optional so a caller with no user in hand still
// works; every caller here has one.
async function loadModule(name: string, ctx?: { userId: string; req: Request }): Promise<string> {
  const { data, error } = await admin.storage.from('realty-hub').download(name)
  const text = data ? await data.text() : ''
  if (!text && ctx) {
    await audit(ctx.userId, 'realty_member', 'realty_hub_module_empty', 'realty_members', ctx.userId, { module: name, error: error?.message ?? null, downloaded: !!data }, ctx.req)
  }
  return text
}
function inject(html: string, slot: string, content: string): string {
  if (!content) return html
  if (html.includes(slot)) return html.replace(slot, () => content)
  return html.replace('</body>', () => content + '\n</body>')
}
function dedupeGlobals(html: string): string {
  return html.replace('const SB_URL=', 'window.SB_URL=').replace('const SB_KEY=', 'window.SB_KEY=').replace('const sb=window.supabase.createClient', 'window.sb=window.sb||window.supabase.createClient')
}
function round2(n: number) { return Math.round(n * 100) / 100 }
function daysBetween(a: Date, b: Date) { return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)) }
function advanceDate(dateStr: string, frequency: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1)
  else if (frequency === 'quarterly') d.setMonth(d.getMonth() + 3)
  else if (frequency === 'annual') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

async function gateScript(): Promise<string> {
  try {
    const { data } = await admin.from('realty_config').select('value').eq('key', 'ica_gate_js').maybeSingle()
    const js = data?.value ?? ''
    if (!js) return ''
    return '<script>\n' + js + '\n</' + 'script>'
  } catch (_e) { return '' }
}

async function computeBrokerFinancials(brokerId: string) {
  const now = new Date()
  const ms = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const y = now.getFullYear(), m = now.getMonth() + 1

  const { data: paidMonth } = await admin.from('realty_transactions').select('gross_commission, net_commission, off_top_deductions, company_fee, price').eq('status', 'paid').is('legacy_source', null).gte('paid_at', ms)
  let monthIncome = 0
  for (const p of paidMonth ?? []) {
    const g = Number(p.gross_commission) || 0, n = Number(p.net_commission) || 0, ded = Number(p.off_top_deductions) || 0, fee = Number(p.company_fee) || 0
    if (g > 0) monthIncome += Math.max(0, g - n - ded) + fee
  }
  monthIncome = round2(monthIncome)

  const { data: pipe } = await admin.from('realty_transactions').select('price, closing_date').is('legacy_source', null).in('status', ['submitted', 'approved'])
  const pipelineValue = round2((pipe ?? []).reduce((s, p) => s + (Number(p.price) || 0), 0))
  const pipelineCount = (pipe ?? []).length

  const { data: invRows } = await admin.from('realty_invoices').select('id, agent_id, agent_name, agent_email, amount, due_date, status, description, created_at').in('status', ['unpaid', 'sent']).order('due_date', { ascending: true, nullsFirst: false })
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let outstandingTotal = 0, overdueCount = 0
  const invoices = (invRows ?? []).map((r) => {
    const amt = Number(r.amount) || 0
    outstandingTotal += amt
    let overdueDays: number | null = null
    if (r.due_date) {
      const due = new Date(r.due_date + 'T00:00:00')
      const d = daysBetween(today, due)
      overdueDays = d > 0 ? d : null
      if (d > 0) overdueCount++
    }
    return { id: r.id, agent_id: r.agent_id, agent_name: r.agent_name, agent_email: r.agent_email, amount: amt, due_date: r.due_date, status: r.status, description: r.description, overdue_days: overdueDays }
  })
  outstandingTotal = round2(outstandingTotal)

  const { data: goalRow } = await admin.from('realty_broker_goals').select('id, target_amount').eq('broker_id', brokerId).eq('goal_type', 'monthly_income').eq('period_year', y).eq('period_month', m).maybeSingle()
  const goal = goalRow ? Number(goalRow.target_amount) : null
  const goalProgress = goal && goal > 0 ? Math.round((monthIncome / goal) * 100) : null

  const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 90)
  const { data: subRows } = await admin.from('realty_agent_subscriptions').select('id, agent_id, agent_name, plan_label, fee_amount, frequency, next_due_date, status, notes').not('status', 'in', '(exempt,cancelled,paused)').order('next_due_date', { ascending: true, nullsFirst: false })
  let comingUpTotal = 0
  const upcoming = (subRows ?? []).map((s) => {
    const amt = Number(s.fee_amount) || 0
    let daysToDue: number | null = null
    let bucket: 'overdue' | 'this_month' | 'next_month' | 'later' | 'no_date' = 'no_date'
    if (s.next_due_date) {
      const due = new Date(s.next_due_date + 'T00:00:00')
      const d = daysBetween(due, today); daysToDue = d
      if (d < 0) bucket = 'overdue'
      else if (due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth()) bucket = 'this_month'
      else if (due <= horizon) bucket = 'later'
      if (due <= horizon && d >= 0) comingUpTotal += amt
    }
    return { id: s.id, agent_id: s.agent_id, agent_name: s.agent_name, plan_label: s.plan_label, fee_amount: amt, frequency: s.frequency, next_due_date: s.next_due_date, status: s.status, notes: s.notes, days_to_due: daysToDue, bucket }
  }).filter((s) => { if (!s.next_due_date) return true; const due = new Date(s.next_due_date + 'T00:00:00'); return due <= horizon })

  return { month_income: monthIncome, pipeline_value: pipelineValue, pipeline_count: pipelineCount, outstanding_total: outstandingTotal, overdue_count: overdueCount, monthly_income_goal: goal, monthly_income_goal_progress: goalProgress, invoices, upcoming_subscriptions: upcoming, coming_up_total: round2(comingUpTotal) }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const { data: { user }, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !user) return json({ error: 'unauthorized' }, 401)
  const { data: member } = await admin.from('realty_members').select('user_id, role, status, full_name, activated_at, commission_plan, license_number').eq('user_id', user.id).maybeSingle()
  if (!member || member.status !== 'active') { await audit(user.id, 'realty_member', 'realty_hub_access_denied', 'realty_members', user.id, { reason: !member ? 'no_member_row' : 'inactive' }, req); return json({ error: 'forbidden' }, 403) }
  const modCtx = { userId: user.id, req }

  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}))
    const action = body?.action
    const isBroker = member.role === 'broker' && body?.view !== 'agent'

    if (action === 'agreement_status') {
      const { data: ver } = await admin.from('realty_agreement_versions').select('id, version_label, effective_date, materiality').eq('is_current', true).maybeSingle()
      if (!ver) return json({ required: false, reason: 'no_current_version' })

      // Legacy pass-through: prompt only during a 30-day window starting on the
      // agent's recurring anniversary (same month/day as join date, each year).
      // Outside the window the agent passes straight through — no prompt of any kind.
      // Marlenyi has no join date — null is handled explicitly, she is always eligible.
      // 30 days is Marlenyi's business decision, not a technical one.
      const SIGNING_WINDOW_DAYS = 30
      const { data: sub } = await admin.from('realty_agent_subscriptions').select('agent_join_date').eq('agent_id', user.id).maybeSingle()
      const joinDate: string | null = sub?.agent_join_date ?? null
      if (joinDate !== null) {
        const jd = new Date(joinDate + 'T00:00:00')
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        let ann = new Date(today.getFullYear(), jd.getMonth(), jd.getDate())
        if (ann <= jd) ann.setFullYear(ann.getFullYear() + 1)
        const windowEnd = new Date(ann)
        windowEnd.setDate(windowEnd.getDate() + SIGNING_WINDOW_DAYS)
        let inWindow = today >= ann && today < windowEnd
        if (!inWindow) {
          const prevAnn = new Date(ann)
          prevAnn.setFullYear(prevAnn.getFullYear() - 1)
          if (prevAnn > jd) {
            const prevEnd = new Date(prevAnn)
            prevEnd.setDate(prevEnd.getDate() + SIGNING_WINDOW_DAYS)
            inWindow = today >= prevAnn && today < prevEnd
          }
        }
        if (!inWindow) {
          return json({ required: false, reason: 'not_due' })
        }
      }

      const { data: sigs } = await admin.from('realty_agreement_signatures').select('version_id, version_label, signed_at').or('agent_id.eq.' + user.id + ',signer_email.eq.' + String(member.user_id ? '' : '') + '').order('signed_at', { ascending: false })
      let rows = sigs ?? []
      if (!rows.length) { const { data: byId } = await admin.from('realty_agreement_signatures').select('version_id, version_label, signed_at').eq('agent_id', user.id).order('signed_at', { ascending: false }); rows = byId ?? [] }
      const signedCurrent = rows.some((r) => r.version_id === ver.id)
      return json({ required: !signedCurrent, reason: signedCurrent ? null : (rows.length ? 'version_update' : 'never_signed'), version_label: ver.version_label, effective_date: ver.effective_date, materiality: ver.materiality, last_signed_version: rows.length ? rows[0].version_label : null, plan_set: !!member.commission_plan, license_set: !!member.license_number })
    }
    if (action === 'set_license') {
      const raw = String(body?.license_number ?? '').trim().toUpperCase()
      if (!/^[A-Z]{0,3}[0-9]{4,10}$/.test(raw)) return json({ error: 'Enter a valid Florida license number.' }, 400)
      if (member.license_number && member.license_number !== raw) return json({ error: 'A license number is already on file. Contact your broker to change it.' }, 409)
      await admin.from('realty_members').update({ license_number: raw, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      await audit(user.id, 'realty_member', 'realty_member_license_set', 'realty_members', user.id, { license_number: raw }, req)
      return json({ ok: true, license_number: raw })
    }
    if (action === 'password_changed') {
      await admin.from('realty_members').update({ must_change_password: false, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      await audit(user.id, 'realty_member', 'realty_member_password_changed', 'realty_members', user.id, {}, req)
      return json({ ok: true })
    }
    if (action === 'get_onboarding') { const { data: m } = await admin.from('realty_members').select('onboarding_checklist').eq('user_id', user.id).maybeSingle(); return json({ checklist: (m?.onboarding_checklist ?? {}) }) }
    if (action === 'save_onboarding') {
      const raw = (body as any)?.checklist; if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return json({ error: 'checklist object required' }, 400)
      const keys = Object.keys(raw); if (keys.length > 200) return json({ error: 'too many items' }, 400)
      const clean: Record<string, boolean> = {}
      for (const k of keys) { if (!/^[a-z0-9_-]{1,24}$/.test(k)) continue; const v = (raw as Record<string, unknown>)[k]; if (v === true || v === 1 || v === 'true') clean[k] = true }
      if (JSON.stringify(clean).length > 8192) return json({ error: 'checklist too large' }, 400)
      await admin.from('realty_members').update({ onboarding_checklist: clean, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      await audit(user.id, 'realty_member', 'realty_onboarding_saved', 'realty_members', user.id, { items: Object.keys(clean).length }, req)
      return json({ ok: true, count: Object.keys(clean).length })
    }

    if (action === 'list_announcements') {
      const { data: anns } = await admin.from('realty_announcements').select('id, title, body, urgency, requires_ack, posted_at').eq('archived', false).order('posted_at', { ascending: false })
      const { data: reads } = await admin.from('realty_announcement_reads').select('announcement_id, acknowledged, read_at').eq('user_id', user.id)
      const byId: Record<string, any> = {}; for (const r of reads ?? []) byId[r.announcement_id] = r
      const out = (anns ?? []).map((a) => ({ ...a, read: !!byId[a.id], acknowledged: byId[a.id]?.acknowledged ?? false, read_at: byId[a.id]?.read_at ?? null }))
      return json({ announcements: out, unread: out.filter((a) => !a.read).length })
    }
    if (action === 'read_announcement' || action === 'acknowledge_announcement') {
      const annId = String(body.announcement_id ?? ''); if (!annId) return json({ error: 'announcement_id required' }, 400)
      const { data: ann } = await admin.from('realty_announcements').select('id, requires_ack, archived, title').eq('id', annId).maybeSingle()
      if (!ann || ann.archived) return json({ error: 'announcement not found' }, 404)
      const isAck = action === 'acknowledge_announcement'
      const { data: existing } = await admin.from('realty_announcement_reads').select('acknowledged, read_at').eq('announcement_id', annId).eq('user_id', user.id).maybeSingle()
      const nowAck = existing?.acknowledged || isAck
      await admin.from('realty_announcement_reads').upsert({ announcement_id: annId, user_id: user.id, acknowledged: nowAck, read_at: existing?.read_at ?? new Date().toISOString() }, { onConflict: 'announcement_id,user_id' })
      if (isAck && !existing?.acknowledged) await admin.from('realty_announcement_reads').update({ read_at: new Date().toISOString() }).eq('announcement_id', annId).eq('user_id', user.id)
      await audit(user.id, 'realty_member', isAck ? 'realty_announcement_acknowledged' : 'realty_announcement_read', 'realty_announcements', annId, { title: ann.title, requires_ack: ann.requires_ack }, req)
      return json({ ok: true, acknowledged: nowAck })
    }

    if (action === 'list_training') {
      const { data: cats } = await admin.from('realty_training_categories').select('id, name, description, sort').eq('archived', false).order('sort')
      const { data: items } = await admin.from('realty_training_items').select('id, category_id, title, description, content_type, content, file_name, storage_path, required, sort').eq('archived', false).order('sort')
      const { data: comps } = await admin.from('realty_training_completions').select('item_id, completed_at').eq('user_id', user.id)
      const done: Record<string, string> = {}; for (const c of comps ?? []) done[c.item_id] = c.completed_at
      const itemsOut = (items ?? []).map((it) => ({ id: it.id, category_id: it.category_id, title: it.title, description: it.description, content_type: it.content_type, content: it.content_type === 'document' ? null : it.content, file_name: it.file_name, has_file: !!it.storage_path, required: it.required, sort: it.sort, completed: !!done[it.id], completed_at: done[it.id] ?? null }))
      const reqItems = itemsOut.filter((i) => i.required); const reqDone = reqItems.filter((i) => i.completed).length
      return json({ categories: cats ?? [], items: itemsOut, total: itemsOut.length, completed: itemsOut.filter((i) => i.completed).length, required_total: reqItems.length, required_done: reqDone, current: reqItems.length > 0 && reqDone === reqItems.length })
    }
    if (action === 'mark_complete' || action === 'unmark_complete') {
      const itemId = String(body.item_id ?? ''); if (!itemId) return json({ error: 'item_id required' }, 400)
      const { data: it } = await admin.from('realty_training_items').select('id, title, archived').eq('id', itemId).maybeSingle()
      if (!it || it.archived) return json({ error: 'item not found' }, 404)
      if (action === 'mark_complete') { await admin.from('realty_training_completions').upsert({ item_id: itemId, user_id: user.id, completed_at: new Date().toISOString() }, { onConflict: 'item_id,user_id' }); await audit(user.id, 'realty_member', 'realty_training_completed', 'realty_training_items', itemId, { title: it.title }, req); return json({ ok: true, completed: true }) }
      await admin.from('realty_training_completions').delete().eq('item_id', itemId).eq('user_id', user.id)
      await audit(user.id, 'realty_member', 'realty_training_uncompleted', 'realty_training_items', itemId, { title: it.title }, req)
      return json({ ok: true, completed: false })
    }
    if (action === 'training_download') {
      const itemId = String(body.item_id ?? '')
      const { data: it } = await admin.from('realty_training_items').select('storage_path, archived').eq('id', itemId).maybeSingle()
      if (!it || it.archived || !it.storage_path) return json({ error: 'no file' }, 404)
      const { data: signed, error: sErr } = await admin.storage.from('realty-training-docs').createSignedUrl(it.storage_path, 300)
      if (sErr || !signed) return json({ error: sErr?.message ?? 'sign failed' }, 500)
      await audit(user.id, 'realty_member', 'realty_training_download', 'realty_training_items', itemId, {}, req)
      return json({ url: signed.signedUrl })
    }

    if (action === 'home') {
      const now = new Date(); const ms = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const ys = new Date(now.getFullYear(), 0, 1).toISOString()
      const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      const { data: paidMonth } = await admin.from('realty_transactions').select('agent_id, price, net_commission, paid_at').eq('status', 'paid').is('legacy_source', null).gte('paid_at', ms)
      const { data: paidYear } = await admin.from('realty_transactions').select('agent_id, gross_commission, net_commission, paid_at').eq('status', 'paid').is('legacy_source', null).gte('paid_at', ys)
      const { data: agentRows } = await admin.from('realty_members').select('user_id, full_name').eq('role', 'agent')
      const nameById: Record<string, string> = {}; for (const a of agentRows ?? []) nameById[a.user_id] = a.full_name
      const lbAgg: Record<string, { volume: number; closed: number }> = {}
      for (const p of paidMonth ?? []) { const g = (lbAgg[p.agent_id] = lbAgg[p.agent_id] || { volume: 0, closed: 0 }); g.volume += Number(p.price) || 0; g.closed += 1 }
      const lb = Object.entries(lbAgg).map(([id, v]) => ({ user_id: id, name: nameById[id] ?? '?', volume: round2(v.volume), closed: v.closed })).sort((a, b) => b.volume - a.volume)

      if (isBroker) {
        const { count: activeAgents } = await admin.from('realty_members').select('*', { count: 'exact', head: true }).eq('role', 'agent').eq('status', 'active')
        const headlineVol = round2((paidYear ?? []).reduce((s, p) => s + (Number(p.gross_commission) || 0), 0))
        const headlineClosed = (paidYear ?? []).length
        const { data: pipe } = await admin.from('realty_transactions').select('id, agent_id, property_address, tx_type, status, submitted_at').is('legacy_source', null).in('status', ['submitted', 'approved']).order('submitted_at', { ascending: true })
        const ids = (pipe ?? []).map((t) => t.id)
        let docsByTx: Record<string, { pending: number; rejected: number }> = {}
        if (ids.length) { const { data: docs } = await admin.from('realty_tx_documents').select('transaction_id, status').in('transaction_id', ids); for (const d of docs ?? []) { const g = (docsByTx[d.transaction_id] = docsByTx[d.transaction_id] || { pending: 0, rejected: 0 }); if (d.status === 'uploaded') g.pending++; if (d.status === 'rejected') g.rejected++ } }
        let pendingReview = 0
        const queue = (pipe ?? []).map((t) => { const dd = docsByTx[t.id] || { pending: 0, rejected: 0 }; if (dd.pending > 0) pendingReview++; let chip = 'ready to pay', tone = 'ok'; if (dd.pending > 0) { chip = dd.pending + ' to review'; tone = 'red' } else if (dd.rejected > 0) { chip = 'rejected'; tone = 'warn' } else if (t.status === 'approved') { chip = 'ready to pay'; tone = 'ok' } else { chip = 'submitted'; tone = 'warn' } return { address: t.property_address, agent: nameById[t.agent_id] ?? '?', chip, tone } }).slice(0, 4)
        const { data: urg } = await admin.from('realty_announcements').select('id, title, recipient_ids').eq('archived', false).eq('requires_ack', true)
        const urgItems: any[] = []; const outstandingSet = new Set<string>()
        for (const a of urg ?? []) { const recips: string[] = a.recipient_ids ?? []; const { data: rd } = await admin.from('realty_announcement_reads').select('user_id, acknowledged').eq('announcement_id', a.id); const ackd = new Set((rd ?? []).filter((r) => r.acknowledged).map((r) => r.user_id)); const out = recips.filter((r) => !ackd.has(r)); if (out.length) { urgItems.push({ title: a.title, outstanding: out.length }); out.forEach((o) => outstandingSet.add(o)) } }
        const { data: reqItems } = await admin.from('realty_training_items').select('id').eq('archived', false).eq('required', true)
        const reqIds = (reqItems ?? []).map((i) => i.id)
        let current = 0
        const { data: actAgents } = await admin.from('realty_members').select('user_id').eq('role', 'agent').eq('status', 'active')
        if (reqIds.length === 0) { current = (actAgents ?? []).length } else { const { data: allComp } = await admin.from('realty_training_completions').select('item_id, user_id').in('item_id', reqIds); const byUser: Record<string, Set<string>> = {}; for (const c of allComp ?? []) (byUser[c.user_id] = byUser[c.user_id] || new Set()).add(c.item_id); for (const a of actAgents ?? []) { const s = byUser[a.user_id] || new Set(); if (reqIds.every((id) => s.has(id))) current++ } }
        let icaOutstanding = 0
        const { data: curVer } = await admin.from('realty_agreement_versions').select('id, version_label').eq('is_current', true).maybeSingle()
        if (curVer) { const { data: allMembers } = await admin.from('realty_members').select('user_id').eq('status', 'active'); const { data: curSigs } = await admin.from('realty_agreement_signatures').select('agent_id').eq('version_id', curVer.id); const signedSet = new Set((curSigs ?? []).map((s) => s.agent_id).filter(Boolean)); icaOutstanding = (allMembers ?? []).filter((m) => !signedSet.has(m.user_id)).length }
        const fin = await computeBrokerFinancials(user.id)
        return json({ role: 'broker', month: monthLabel, name: member.full_name, headline: { volume: headlineVol, closed: headlineClosed }, active_agents: activeAgents ?? 0, pending_review: pendingReview, urgent: { count: urgItems.length, outstanding_agents: outstandingSet.size, items: urgItems }, training: { current, total: (actAgents ?? []).length }, ica: { version: curVer?.version_label ?? null, outstanding: icaOutstanding }, leaderboard: lb.slice(0, 5), queue, financials: fin })
      }

      const mineYear = (paidYear ?? []).filter((p) => p.agent_id === user.id)
      const vol = round2(mineYear.reduce((s, p) => s + (Number(p.gross_commission) || 0), 0))
      const net = round2(mineYear.reduce((s, p) => s + (Number(p.net_commission) || 0), 0))
      const rankIdx = lb.findIndex((r) => r.user_id === user.id)
      const { data: urg2 } = await admin.from('realty_announcements').select('id, title').eq('archived', false).eq('requires_ack', true)
      const { data: myReads } = await admin.from('realty_announcement_reads').select('announcement_id, acknowledged').eq('user_id', user.id)
      const ackMap: Record<string, boolean> = {}; for (const r of myReads ?? []) ackMap[r.announcement_id] = r.acknowledged
      const ackNeeded = (urg2 ?? []).filter((a) => !ackMap[a.id]).map((a) => ({ id: a.id, title: a.title }))
      const { data: actItems } = await admin.from('realty_training_items').select('id, required').eq('archived', false)
      const reqIds2 = (actItems ?? []).filter((i) => i.required).map((i) => i.id)
      const { data: myComp } = await admin.from('realty_training_completions').select('item_id').eq('user_id', user.id)
      const doneSet = new Set((myComp ?? []).map((c) => c.item_id))
      const reqDone = reqIds2.filter((id) => doneSet.has(id)).length
      return json({ role: 'agent', month: monthLabel, name: member.full_name, headline: { volume: vol, closed: mineYear.length, net }, rank: rankIdx >= 0 ? rankIdx + 1 : null, rank_of: lb.length, ack_needed: ackNeeded, training: { required_done: reqDone, required_total: reqIds2.length, current: reqIds2.length > 0 && reqDone === reqIds2.length } })
    }

    if (action === 'list_invoices') { if (!isBroker) return json({ error: 'forbidden' }, 403); const { data } = await admin.from('realty_invoices').select('*').order('due_date', { ascending: true, nullsFirst: false }); return json({ invoices: data ?? [] }) }
    if (action === 'create_invoice') {
      if (!isBroker) return json({ error: 'forbidden' }, 403)
      const amount = Number(body?.amount); const description = String(body?.description ?? '').trim()
      if (!(amount >= 0)) return json({ error: 'amount must be a non-negative number' }, 400); if (!description) return json({ error: 'description required' }, 400)
      const insertRow: Record<string, unknown> = { agent_id: body?.agent_id || null, agent_name: (body?.agent_name && String(body.agent_name).trim()) || null, agent_email: (body?.agent_email && String(body.agent_email).trim()) || null, agent_phone: (body?.agent_phone && String(body.agent_phone).trim()) || null, description, amount, due_date: body?.due_date || null, period_start: body?.period_start || null, period_end: body?.period_end || null, notes: (body?.notes && String(body.notes).trim()) || null, created_by: user.id }
      const { data: inv, error } = await admin.from('realty_invoices').insert(insertRow).select().single()
      if (error) return json({ error: error.message }, 500)
      await audit(user.id, 'realty_broker', 'realty_invoice_created', 'realty_invoices', inv.id, { amount, description, agent_id: insertRow.agent_id, agent_name: insertRow.agent_name }, req)
      return json({ ok: true, invoice: inv })
    }
    if (action === 'mark_invoice_paid') {
      if (!isBroker) return json({ error: 'forbidden' }, 403); const invoiceId = String(body?.invoice_id ?? ''); if (!invoiceId) return json({ error: 'invoice_id required' }, 400)
      const { data: inv, error } = await admin.from('realty_invoices').update({ status: 'paid', paid_at: new Date().toISOString(), paid_by: user.id, paid_method: String(body?.paid_method ?? '') || null }).eq('id', invoiceId).select().single()
      if (error || !inv) return json({ error: error?.message ?? 'not found' }, 404)
      await audit(user.id, 'realty_broker', 'realty_invoice_paid', 'realty_invoices', invoiceId, { amount: inv.amount, agent_name: inv.agent_name }, req)
      return json({ ok: true, invoice: inv })
    }
    if (action === 'delete_invoice') { if (!isBroker) return json({ error: 'forbidden' }, 403); const invoiceId = String(body?.invoice_id ?? ''); if (!invoiceId) return json({ error: 'invoice_id required' }, 400); const { error } = await admin.from('realty_invoices').delete().eq('id', invoiceId); if (error) return json({ error: error.message }, 500); await audit(user.id, 'realty_broker', 'realty_invoice_deleted', 'realty_invoices', invoiceId, {}, req); return json({ ok: true }) }

    if (action === 'set_goal') {
      if (!isBroker) return json({ error: 'forbidden' }, 403)
      const goalType = String(body?.goal_type ?? 'monthly_income'); if (!['monthly_income', 'agent_count', 'monthly_closings', 'pipeline_value'].includes(goalType)) return json({ error: 'invalid goal_type' }, 400)
      const target = Number(body?.target_amount); if (!(target >= 0)) return json({ error: 'target_amount must be a non-negative number' }, 400)
      const now = new Date(); const year = Number(body?.period_year) || now.getFullYear(); const month = body?.period_month !== undefined ? Number(body?.period_month) : (now.getMonth() + 1)
      const { data: goal, error } = await admin.from('realty_broker_goals').upsert({ broker_id: user.id, goal_type: goalType, period_year: year, period_month: month, target_amount: target, notes: (body?.notes && String(body.notes).trim()) || null }, { onConflict: 'broker_id,goal_type,period_year,period_month' }).select().single()
      if (error) return json({ error: error.message }, 500)
      await audit(user.id, 'realty_broker', 'realty_goal_set', 'realty_broker_goals', goal.id, { goal_type: goalType, target, year, month }, req)
      return json({ ok: true, goal })
    }
    if (action === 'list_goals') { if (!isBroker) return json({ error: 'forbidden' }, 403); const { data } = await admin.from('realty_broker_goals').select('*').eq('broker_id', user.id).order('period_year', { ascending: false }).order('period_month', { ascending: false }); return json({ goals: data ?? [] }) }

    if (action === 'list_subscriptions') {
      if (!isBroker) return json({ error: 'forbidden' }, 403)
      const { data } = await admin.from('realty_agent_subscriptions').select('*').order('agent_name', { ascending: true })
      return json({ subscriptions: data ?? [] })
    }
    if (action === 'create_subscription') {
      if (!isBroker) return json({ error: 'forbidden' }, 403)
      const agentName = String(body?.agent_name ?? '').trim(); if (!agentName) return json({ error: 'agent_name required' }, 400)
      const planLabel = String(body?.plan_label ?? '').trim(); if (!planLabel) return json({ error: 'plan_label required' }, 400)
      const fee = Number(body?.fee_amount); if (!(fee >= 0)) return json({ error: 'fee_amount must be a non-negative number' }, 400)
      const frequency = String(body?.frequency ?? ''); if (!['monthly', 'quarterly', 'annual', 'one_time'].includes(frequency)) return json({ error: 'invalid frequency' }, 400)
      const status = String(body?.status ?? 'active'); if (!['active','overdue','exempt','pending_activation','pending_decision','paused','cancelled'].includes(status)) return json({ error: 'invalid status' }, 400)
      const { data: sub, error } = await admin.from('realty_agent_subscriptions').insert({ agent_id: body?.agent_id || null, agent_name: agentName, agent_email: (body?.agent_email && String(body.agent_email).trim()) || null, plan_label: planLabel, fee_amount: fee, frequency, next_due_date: body?.next_due_date || null, status, notes: (body?.notes && String(body.notes).trim()) || null }).select().single()
      if (error) return json({ error: error.message }, 500)
      await audit(user.id, 'realty_broker', 'realty_subscription_created', 'realty_agent_subscriptions', sub.id, { agent_name: agentName, plan_label: planLabel, fee, frequency }, req)
      return json({ ok: true, subscription: sub })
    }
    if (action === 'update_subscription') {
      if (!isBroker) return json({ error: 'forbidden' }, 403)
      const subId = String(body?.subscription_id ?? ''); if (!subId) return json({ error: 'subscription_id required' }, 400)
      const patch: Record<string, unknown> = {}
      if (body?.agent_name !== undefined) patch.agent_name = String(body.agent_name).trim() || null
      if (body?.agent_email !== undefined) patch.agent_email = String(body.agent_email).trim() || null
      if (body?.plan_label !== undefined) patch.plan_label = String(body.plan_label).trim() || 'Unspecified'
      if (body?.fee_amount !== undefined) { const n = Number(body.fee_amount); if (!(n >= 0)) return json({ error: 'fee_amount must be non-negative' }, 400); patch.fee_amount = n }
      if (body?.frequency !== undefined) { if (!['monthly','quarterly','annual','one_time'].includes(String(body.frequency))) return json({ error: 'invalid frequency' }, 400); patch.frequency = body.frequency }
      if (body?.status !== undefined) { if (!['active','overdue','exempt','pending_activation','pending_decision','paused','cancelled'].includes(String(body.status))) return json({ error: 'invalid status' }, 400); patch.status = body.status }
      if (body?.next_due_date !== undefined) patch.next_due_date = body.next_due_date || null
      if (body?.notes !== undefined) patch.notes = (body.notes && String(body.notes).trim()) || null
      if (Object.keys(patch).length === 0) return json({ error: 'nothing to update' }, 400)
      const { data: sub, error } = await admin.from('realty_agent_subscriptions').update(patch).eq('id', subId).select().single()
      if (error || !sub) return json({ error: error?.message ?? 'not found' }, 404)
      await audit(user.id, 'realty_broker', 'realty_subscription_updated', 'realty_agent_subscriptions', subId, patch, req)
      return json({ ok: true, subscription: sub })
    }
    if (action === 'mark_subscription_paid') {
      if (!isBroker) return json({ error: 'forbidden' }, 403)
      const subId = String(body?.subscription_id ?? ''); if (!subId) return json({ error: 'subscription_id required' }, 400)
      const { data: cur } = await admin.from('realty_agent_subscriptions').select('*').eq('id', subId).maybeSingle()
      if (!cur) return json({ error: 'not found' }, 404)
      const today = new Date().toISOString().slice(0, 10)
      const baseDate = cur.next_due_date || today
      const nextDue = advanceDate(baseDate, cur.frequency)
      const newStatus = cur.status === 'pending_activation' || cur.status === 'pending_decision' ? 'active' : (cur.status === 'overdue' ? 'active' : cur.status)
      const { data: sub, error } = await admin.from('realty_agent_subscriptions').update({ last_paid_date: today, next_due_date: nextDue, status: newStatus }).eq('id', subId).select().single()
      if (error || !sub) return json({ error: error?.message ?? 'not found' }, 404)
      await audit(user.id, 'realty_broker', 'realty_subscription_paid', 'realty_agent_subscriptions', subId, { agent_name: sub.agent_name, advanced_from: baseDate, advanced_to: nextDue, frequency: cur.frequency }, req)
      return json({ ok: true, subscription: sub })
    }
    if (action === 'delete_subscription') {
      if (!isBroker) return json({ error: 'forbidden' }, 403)
      const subId = String(body?.subscription_id ?? ''); if (!subId) return json({ error: 'subscription_id required' }, 400)
      const { error } = await admin.from('realty_agent_subscriptions').delete().eq('id', subId)
      if (error) return json({ error: error.message }, 500)
      await audit(user.id, 'realty_broker', 'realty_subscription_deleted', 'realty_agent_subscriptions', subId, {}, req)
      return json({ ok: true })
    }

    return json({ error: 'unknown_action' }, 400)
  }

  // Which document to serve. The preview query string is the override during
  // the transition to hub_next and stays broker only, because widening it is
  // the cutover itself and that is a decision, not a side effect of this
  // change. The shell default is untouched.
  //
  // Both documents now go through the same composition below. hub_next used to
  // return here, before dedupeGlobals and all three injects, which is why it
  // carried no transaction module, no broker module, and, quietly, no ICA gate.
  const wantsNext = new URL(req.url).searchParams.get('preview') === 'next' && member.role === 'broker'
  const build = wantsNext ? 'hub_next.html' : 'hub_payload.html'

  let html = await loadModule(build, modCtx)
  if (!html) { await audit(user.id, 'realty_member', 'realty_hub_payload_error', 'realty_members', user.id, { message: 'hub payload missing', build }, req); return json({ error: 'content_unavailable' }, 500) }
  html = dedupeGlobals(html)
  html = inject(html, '<!--TX_SLOT-->', dedupeGlobals(await loadModule('tx_module.html', modCtx)))
  if (member.role === 'broker') html = inject(html, '<!--BROKER_SLOT-->', dedupeGlobals(await loadModule('broker_module.html', modCtx)))
  const gate = await gateScript()
  // The gate is the one inject whose absence is a compliance question rather
  // than a missing feature, so a run that produced no gate script leaves a row
  // behind instead of serving a page with no agreement check on it.
  if (!gate) await audit(user.id, 'realty_member', 'realty_hub_gate_empty', 'realty_members', user.id, { build }, req)
  html = inject(html, '<!--ICA_GATE_SLOT-->', gate)
  const patch: Record<string, unknown> = { last_login_at: new Date().toISOString() }
  if (!member.activated_at) patch.activated_at = new Date().toISOString()
  await admin.from('realty_members').update(patch).eq('user_id', user.id)
  await audit(user.id, 'realty_member', wantsNext ? 'realty_hub_preview' : 'realty_hub_access', 'realty_members', user.id, { role: member.role, build }, req)
  // The new build is not cached while it is still changing under her.
  const cache = wantsNext ? 'no-store' : 'private, max-age=300, must-revalidate'
  return new Response(html, { headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': cache } })
})
