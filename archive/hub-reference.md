# Hub reference: the paths to copy, not rewrite

Transcribed verbatim from `archive/hub_payload.html` in this directory, which is
the live Hub build, byte identical to what the publish workflow put in the
`realty-hub` Storage bucket on 25 August 2026 at 13:02 UTC.

- Source blob sha `604cb205efb99f453ff44419ac5304e0b819f7cf`
- 1,482,843 bytes
- Line numbers below refer to that file and nothing else.

**This document is a transcription.** Nothing here has been corrected, tidied or
improved. Where something looks wrong or improvable it is called out in a
`> Note` block and left alone. Deciding what to change is the hub-next build's
call, not this document's.

---

## Contents

1. [`__dbUpdateWithCascade`, the household cascade](#1-__dbupdatewithcascade-the-household-cascade)
2. [The snooze downgrade at five](#2-the-snooze-downgrade-at-five)
3. [The `db_state` promotion rules](#3-the-db_state-promotion-rules)
4. [The `agent_activity` insert with the `last_touch` update](#4-the-agent_activity-insert-with-the-last_touch-update)
5. [The tier editor's inline save](#5-the-tier-editors-inline-save)
6. [The gap prompt logic, every field it checks](#6-the-gap-prompt-logic-every-field-it-checks)
7. [`contact_type` and `vendor_type` filter logic](#7-contact_type-and-vendor_type-filter-logic)

---

## 1. `__dbUpdateWithCascade`, the household cascade

The single choke point for every field that describes relationship state. If a
write should apply to both spouses, it goes through here. Personal fields do not.

**Lines 6661 to 6683.**

```js
  // Cascade helper. For fields that describe RELATIONSHIP STATE (last_touch,
  // tier, db_state, snoozed_until, snooze_count), update every member of the
  // household. Personal info (name/phone/email/notes/address) does NOT cascade
  // and is handled by the individual save path.
  async function __dbUpdateWithCascade(contactId, patch){
    var c = __db.contacts.find(function(x){return x.id===contactId;});
    if(!c) return { data: null, error: {message:'contact not found'} };
    var members = __dbHouseholdMembers(c);
    var q;
    if(c.household_id){
      q = sb.from('agent_contacts').update(patch).eq('household_id', c.household_id).select();
    } else {
      q = sb.from('agent_contacts').update(patch).eq('id', contactId).select();
    }
    var res = await q;
    if(res.error) return res;
    // Sync local cache for all members touched by the update.
    (res.data||members).forEach(function(row){
      var local = __db.contacts.find(function(x){return x.id===row.id;});
      if(local) Object.assign(local, row);
    });
    return res;
  }
```

Its two helpers:

**Line 6435**

```js
  function __dbToday(){ var d=new Date(); return d.toISOString().slice(0,10); }
```

**Lines 6616 to 6626** (`__dbHouseholdMembers`)

```js
  function __dbHouseholdMembers(contactOrId){
    var c = typeof contactOrId==='string'
      ? __db.contacts.find(function(x){return x.id===contactOrId;})
      : contactOrId;
    if(!c) return [];
    if(!c.household_id) return [c];
    return __db.contacts.filter(function(x){return x.household_id===c.household_id;});
  }
  function __dbHouseholdPrimary(contactOrId){
    var members=__dbHouseholdMembers(contactOrId);
    return members.find(function(m){return m.household_primary;}) || members[0];
```

> **Note, not a fix.** The local-cache sync on line 6679 falls back to `members`
> when `res.data` is empty: `(res.data||members).forEach(...)`. If Supabase
> returns a successful response with an empty `data` array, the fallback writes
> the *pre-update* member objects back over the cache. It cannot misreport an
> error, because `res.error` is checked first, but the cache and the row could
> disagree until the next read.

---

## 2. The snooze downgrade at five

Two copies exist, one per screen. They are described in the source as mirrors of
each other. **Both are transcribed** because they are not identical and hub-next
should decide deliberately which behaviour it wants.

### 2a. Database detail view, lines 8536 to 8575

```js
  // Postpone from Database detail view. Mirrors __tdPostpone: bumps
  // snooze_count, sets snoozed_until = today + days, auto-downgrades tier
  // at count=5. Never writes agent_activity, never touches last_touch.
  async function __dbPostpone(contactId, days, btn){
    var c = __db.contacts.find(function(x){ return x.id===contactId; });
    if(!c) return;
    if(btn){ btn.disabled = true; btn.textContent = 'Snoozing.'; }
    var today = __dbToday();
    var newCount = (Number(c.snooze_count)||0) + 1;
    var snoozedUntil = __txISO(__txAddDays(__txParseISO(today), days));
    var patch = { snoozed_until: snoozedUntil, snooze_count: newCount };
    var downgraded = false;
    var noteToAppend = null;
    if(newCount === 5){
      if(c.tier === 'A'){ patch.tier = 'B'; downgraded = true; noteToAppend = 'Auto-downgraded from tier A to B on '+today+': postponed 5 consecutive times without contact.'; }
      else if(c.tier === 'B'){ patch.tier = 'C'; downgraded = true; noteToAppend = 'Auto-downgraded from tier B to C on '+today+': postponed 5 consecutive times without contact.'; }
      else { noteToAppend = 'Postponed 5 consecutive times at bottom tier C on '+today+'. Consider marking Lost or changing stage.'; }
    }
    if(noteToAppend){
      var existing = c.notes ? String(c.notes) : '';
      patch.notes = existing ? (existing + '\n\n' + noteToAppend) : noteToAppend;
    }
    try{
      // Snooze applies to the household — postponing the primary postpones
      // both spouses. Note also, on Marlenyi's spec: "Postponing the
      // primary postpones the household."
      var upd = await __dbUpdateWithCascade(contactId, patch);
      if(upd.error) throw upd.error;
      __dbRenderPostponeStrip();
      __dbRenderList();
      var toast = downgraded
        ? 'Postponed. Tier auto-downgraded to '+patch.tier+'.'
        : 'Postponed until '+snoozedUntil+'.';
      if(typeof showGoalToast==='function') showGoalToast(toast);
    }catch(e){
      console.error('db postpone', e);
      if(btn){ btn.disabled = false; btn.textContent = '3d'; }
      if(typeof showGoalToast==='function') showGoalToast('Could not postpone. '+(e.message||''));
    }
  }
```

### 2b. Today tab, lines 12354 to 12395

```js
  // Postpone: sets snoozed_until = today + days, bumps snooze_count. At
  // 5 consecutive postpones with no logged activity between, auto-downgrades
  // tier (A→B, B→C) and appends a note. C stays put — the note names the
  // situation but tier can't go lower per Marlenyi's rule (no D). Never
  // writes an agent_activity row, never touches last_touch.
  async function __tdPostpone(contactId, days, btn){
    var c = __td.contacts.find(function(x){ return x.id===contactId; });
    if(!c) return;
    if(btn){ btn.disabled = true; btn.textContent = 'Snoozing.'; }
    var today = __td.today || __dbToday();
    var newCount = (Number(c.snooze_count)||0) + 1;
    var snoozedUntil = __txISO(__txAddDays(__txParseISO(today), days));
    var patch = { snoozed_until: snoozedUntil, snooze_count: newCount };
    var downgraded = false;
    var noteToAppend = null;
    if(newCount === 5){
      if(c.tier === 'A'){ patch.tier = 'B'; downgraded = true; noteToAppend = 'Auto-downgraded from tier A to B on '+today+': postponed 5 consecutive times without contact.'; }
      else if(c.tier === 'B'){ patch.tier = 'C'; downgraded = true; noteToAppend = 'Auto-downgraded from tier B to C on '+today+': postponed 5 consecutive times without contact.'; }
      else { noteToAppend = 'Postponed 5 consecutive times at bottom tier C on '+today+'. Consider marking Lost or changing stage.'; }
    }
    if(noteToAppend){
      var existing = c.notes ? String(c.notes) : '';
      patch.notes = existing ? (existing + '\n\n' + noteToAppend) : noteToAppend;
    }
    try{
      // Cascade snooze to household — postponing the primary postpones both.
      var q = c.household_id
        ? sb.from('agent_contacts').update(patch).eq('household_id', c.household_id).select()
        : sb.from('agent_contacts').update(patch).eq('id', contactId).select();
      var upd = await q;
      if(upd.error) throw upd.error;
      (upd.data||[]).forEach(function(row){
        var m = __td.contacts.find(function(x){ return x.id===row.id; });
        if(m) Object.assign(m, row);
      });
      // Postpone from the sheet closes it — we're done with this
      // contact for today. Postpone from the row (legacy path) still
      // uses the leaving animation and refreshes in place.
      var fromSheet = __td.detailId === contactId;
      if(fromSheet) __tdCloseDetail();
      var rowEl = document.querySelector('#td-board .td-row[data-id="'+contactId+'"]');
      if(rowEl){
```

The rule in both: `snooze_count` increments on every postpone. **At exactly
`newCount === 5`**, tier A drops to B and tier B drops to C, each with a
timestamped line appended to `notes`. Tier C does not drop further; it appends a
note suggesting Lost or a stage change. Snooze cascades to the household.

> **Note, not a fix.** The downgrade fires on `newCount === 5` exactly, not
> `>= 5`. A contact postponed a sixth, seventh or eighth time never downgrades
> again, which is intended if the counter only ever moves by one, and is a silent
> no-op if anything else ever writes `snooze_count`.

> **Note, not a fix.** Un-snoozing (line 8578 onward) deliberately leaves
> `snooze_count` alone, so the running total survives. Only a logged conversation
> resets it to 0, in section 4.

---

## 3. The `db_state` promotion rules

Three distinct paths write `db_state`, and they differ on whether they also
count as a touch.

### 3a. Promotion without a touch, lines 7523 to 7539

```js
  // Flip a contact's db_state from 'unworked' → 'active' without recording
  // any activity. Used by the Start-working button on unworked rows. Does
  // NOT touch last_touch (a state promotion is not a touch).
  async function __dbStartWorking(contactId, btn){
    if(btn){ btn.disabled=true; btn.textContent='Started'; }
    try{
      // Cascades to household — db_state applies to the household per spec.
      var upd=await __dbUpdateWithCascade(contactId, {db_state:'active'});
      if(upd.error) throw upd.error;
      __dbRenderList();
      if(typeof showGoalToast==='function') showGoalToast('Now in your working set.');
    }catch(e){
      console.error('start-working', e);
      if(btn){ btn.disabled=false; btn.textContent='Start working'; }
      if(typeof showGoalToast==='function') showGoalToast('Could not activate. '+(e.message||''));
    }
  }
```

### 3b. Promotion as a side effect of logging

Inside the quick-log path, transcribed in full in section 4. The relevant line
is **7510**, which sets `db_state: 'active'` alongside `last_touch`.

### 3c. Where `db_state` decides what the list shows, lines 7006 to 7010

```js
    var isD = function(c){ return c.tier === 'D'; };
    var allClient=__db.contacts.filter(function(c){return !c.is_agent && c.record_class==='client' && c.db_state!=='unworked' && !isSnoozed(c) && !isD(c) && !isSecondary(c);});
    var unworkedClient=__db.contacts.filter(function(c){return !c.is_agent && c.record_class==='client' && c.db_state==='unworked' && !isD(c) && !isSecondary(c);});
    var snoozedClient=__db.contacts.filter(function(c){return !c.is_agent && c.record_class==='client' && isSnoozed(c) && !isD(c) && !isSecondary(c);});
    var dClient=__db.contacts.filter(function(c){return !c.is_agent && c.record_class==='client' && isD(c) && !isSecondary(c);});
```

The three states in use are `'unworked'`, `'active'`, and null. The working set
is everything that is **not** `'unworked'`, not snoozed, not tier D, and not a
household secondary.

---

## 4. The `agent_activity` insert with the `last_touch` update

The quick-log path from the contact list. **Lines 7492 to 7521.**

```js
    if(recent){
      if(typeof showGoalToast==='function') showGoalToast('Already logged. Skipping duplicate.');
      return;
    }
    if(btn){ btn.disabled=true; btn.classList.add('done'); btn.textContent='Logged'; }
    try{
      var ures=await sb.auth.getUser();
      var uid=ures&&ures.data&&ures.data.user&&ures.data.user.id; if(!uid) throw new Error('no session');
      var ins=await sb.from('agent_activity').insert({
        agent_id: uid, contact_id: contactId, type: 'conversation', occurred_on: today, note: null
      }).select().single();
      if(ins.error) throw ins.error;
      // First logged activity also auto-flips db_state → active (per
      // Marlenyi's rule: working a contact promotes them out of unworked).
      // Also clears any snooze state — a contacted person is no longer
      // postponed, and their consecutive-postpone counter resets to 0.
      // Cascades to every household member: logging with either spouse is
      // one conversation with the household, not two.
      var upd=await __dbUpdateWithCascade(contactId, {last_touch: today, db_state: 'active', snoozed_until: null, snooze_count: 0});
      if(upd.error) throw upd.error;
      (__db.activityByContact[contactId] = __db.activityByContact[contactId] || []).unshift(ins.data);
      __dbBumpToday(1);
      __dbRenderList();  // re-render so days-since-touch resets to 0 and health flips
      if(typeof showGoalToast==='function') showGoalToast('Logged conversation.');
    }catch(e){
      console.error('quick-log',e);
      if(btn){ btn.disabled=false; btn.classList.remove('done'); btn.textContent='+ Conv'; }
      if(typeof showGoalToast==='function') showGoalToast('Could not log. '+(e.message||''));
    }
  }
```

One tap does five things, in this order: insert the activity row, flip
`db_state` to active, stamp `last_touch`, clear both snooze fields, and cascade
all four to the household. The insert happens **before** the cascade, and the
cascade is a second round trip.

> **Note, not a fix.** These are two separate writes with no transaction. If the
> insert succeeds and the cascade fails, the activity row exists but
> `last_touch` is stale, and the `catch` re-enables the button as though nothing
> was written. The Hub has no rollback for this case.

There are eight other `agent_activity` insert sites in the file. The full list,
so none is missed:

| line | type | contact_id | also updates |
|---|---|---|---|
| 7500 | `conversation` | the contact | `last_touch`, `db_state`, snooze reset, cascade |
| 7614 | variable | `null` | nothing |
| 8754 | variable | the contact | `last_touch`, `db_state`, snooze reset, cascade |
| 10285 | `item_of_value` | `null` | nothing |
| 11116 | `item_of_value` | the contact | nothing |
| 11400 | `item_of_value` | the contact | nothing |
| 13379 | `pop_by` **and** `conversation`, two rows | the contact | `last_touch`, `db_state`, snooze reset, cascade |
| 13421 | `attempt` | the contact | **nothing, deliberately** |

The `pop_by` pair and the `attempt` row are in `__pbAct`. Delivered writes two
rows sharing one `occurred_on` so the weekly pop-by count and the daily
conversation count both stay honest. Nobody home writes `attempt` only and
deliberately does not touch `last_touch` or the daily counter.

The `type` column has a CHECK constraint permitting exactly:
`conversation`, `attempt`, `appointment`, `consult`, `agreement`, `offer`,
`contract`, `closing`, `pop_by`, `item_of_value`.

---

## 5. The tier editor's inline save

**Lines 7356 to 7391.** Optimistic write with a real rollback.

```js
  // Optimistic write; roll back on error. Cascades to the household so
  // linked spouses move together — the household rule everywhere else.
  async function __dbSortSetTier(contactId, tier, btnEl){
    var c = __db.contacts.find(function(x){ return x.id === contactId; });
    if(!c || c.tier === tier) return;
    var members = __dbHouseholdMembers(c);
    var prev = members.map(function(m){ return { id: m.id, tier: m.tier }; });
    // Reflect the tap visually first.
    var row = btnEl.closest('.db-sort-row');
    if(row){
      row.querySelectorAll('.db-sort-tbtn').forEach(function(b){
        b.classList.toggle('active', b.getAttribute('data-tier') === tier);
      });
      row.classList.add('db-sort-saving');
    }
    members.forEach(function(m){ m.tier = tier; });
    var res = await __dbUpdateWithCascade(contactId, { tier: tier });
    if(res.error){
      // Roll back local cache + visuals.
      prev.forEach(function(p){
        var m = __db.contacts.find(function(x){ return x.id === p.id; });
        if(m) m.tier = p.tier;
      });
      if(row) row.classList.remove('db-sort-saving');
      __dbRenderList();
      if(typeof showGoalToast==='function') showGoalToast('Could not save tier. '+(res.error.message||''));
      return;
    }
    if(row) row.classList.remove('db-sort-saving');
    // Refresh the context line so "Tier X" updates in place. Cheap — just
    // re-render this row's HTML in place, no full list rebuild.
    if(row){
      var ctxEl = row.querySelector('.db-sort-row-ctx');
      if(ctxEl) ctxEl.textContent = __dbSortContext(c);
    }
  }
```

The sibling handler for the Qualified checkbox, **lines 7393 to 7409**, is the
counter-example worth reading beside it: it deliberately does **not** cascade.

```js
  async function __dbSortSetQualified(contactId, q, cbEl){
    var c = __db.contacts.find(function(x){ return x.id === contactId; });
    if(!c) return;
    var prev = c.qualified;
    c.qualified = q;
    // Qualified is a fact about a specific conversation Marlenyi had —
    // does NOT cascade to spouse. Direct per-row write.
    var res = await sb.from('agent_contacts').update({ qualified: q })
      .eq('id', contactId).select().single();
    if(res.error){
      c.qualified = prev;
      if(cbEl) cbEl.checked = prev;
      if(typeof showGoalToast==='function') showGoalToast('Could not save. '+(res.error.message||''));
      return;
    }
    Object.assign(c, res.data);
  }
```

### `pre_household_tier` handling

`pre_household_tier` is a snapshot, written only when a household is formed and
read only when one is dissolved. The inline tier save above never touches it.

**Linking, lines 6698 to 6717:**

```js
    var maxTier = aRank <= bRank ? a.tier : b.tier;
    // Two UPDATEs — one per contact — since primary flag + tier snapshot differ.
    var p1 = await sb.from('agent_contacts').update({
      household_id: householdId,
      household_primary: true,
      pre_household_tier: a.tier || null,
      tier: maxTier || a.tier || null
    }).eq('id', a.id).select().single();
    if(p1.error) throw p1.error;
    var p2 = await sb.from('agent_contacts').update({
      household_id: householdId,
      household_primary: false,
      pre_household_tier: b.tier || null,
      tier: maxTier || b.tier || null
    }).eq('id', b.id).select().single();
    if(p2.error){
      // Rollback the first UPDATE — leave the DB clean.
      await sb.from('agent_contacts').update({household_id:null,household_primary:false,pre_household_tier:null,tier:a.tier||null}).eq('id',a.id);
      throw p2.error;
    }
```

**Unlinking, lines 6722 to 6740:**

```js
  // contact's tier from pre_household_tier if present, clear the snapshot.
  async function __dbUnlinkHousehold(householdId){
    var members = __db.contacts.filter(function(x){return x.household_id===householdId;});
    if(!members.length) return;
    // One UPDATE per member so we can restore the per-contact tier.
    for(var i=0;i<members.length;i++){
      var m=members[i];
      var restoredTier = m.pre_household_tier || m.tier || null;
      var r=await sb.from('agent_contacts').update({
        household_id:null,
        household_primary:false,
        pre_household_tier:null,
        tier:restoredTier
      }).eq('id', m.id).select().single();
      if(r.error) throw r.error;
      Object.assign(m, r.data);
    }
  }

```

> **Note, not a fix.** Linking snapshots each contact's tier and levels both to
> the higher one. Unlinking restores from the snapshot with
> `m.pre_household_tier || m.tier || null`. So a tier change made *while* linked
> is discarded on unlink in favour of the pre-link value. That may be intended,
> since the point of the snapshot is to survive the levelling, but it means the
> inline tier editor's effect is not permanent for a linked pair.

---

## 6. The gap prompt logic, every field it checks

**Lines 9530 to 9601.** The priority table, the always-on set, and the builder.

```js
  var __TD_GAP_PRIORITY = {
    homeowner: 1,
    household: 2,
    address: 3,
    address_unresolved: 4,
    language: 5,
    email: 6,
    birthday: 7,
    anniversary: 8,
    wedding_anniversary: 9
  };

  // Structural gaps that stay on regardless of the agent's mute list.
  // Household and address are prerequisites for the mailer working at
  // all — you cannot opt out of collecting them. Every other kind is
  // mutable via Settings → Prompt me about.
  var __TD_GAP_ALWAYS_ON = { household: true, address: true };

  // Priority-ordered list of ALL gaps. Row chip strip shows every gap in
  // priority order; detail sheet shows the same list.
  function __tdAllGaps(c){
    var gaps = [];
    var partner = __tdHouseholdPartner(c);
    if(partner) gaps.push({ kind:'household', partner: partner });
    if(!c.street) gaps.push({ kind:'address' });
    // Address on file but the geocoder couldn't place it. `geocoded_at`
    // set + coords still null = tried and failed. Surfaces as a prompt
    // to confirm on the next call — never as a task to fix.
    if(c.street && c.geocoded_at && (c.latitude == null || c.longitude == null))
      gaps.push({ kind:'address_unresolved' });
    if(!c.birthday) gaps.push({ kind:'birthday' });
    if(!__tdEffectiveAnniversary(c)) gaps.push({ kind:'anniversary' });
    if(!c.email) gaps.push({ kind:'email' });
    // Mailer language — mailer and market report can't go out to a
    // household until this is set. Skip the prompt for people who are
    // already excluded from mailers anyway (businesses and opt-outs).
    if(!c.language && !c.is_business && !c.do_not_market) gaps.push({ kind:'language' });
    // Homeowner status. Tri-state: null = unknown. If they already
    // have a home_anniversary or a closed transaction linked, we know
    // they're a homeowner and skip the prompt. Otherwise ask.
    if(c.is_homeowner == null && !c.home_anniversary && !c._isPastClient){
      gaps.push({ kind:'homeowner' });
    }
    // Wedding anniversary — separate from home_anniversary. Not every
    // contact is married so this stays optional; the prompt still
    // surfaces when null and Marlenyi can skip by tapping Not today
    // for the whole row.
    if(!c.wedding_anniversary) gaps.push({ kind:'wedding_anniversary' });
    // Filter out anything this agent has muted from Settings, except
    // structural gaps (household, address) which stay on always.
    var muted = (__td && __td.mutedGaps) || {};
    gaps = gaps.filter(function(g){
      if(__TD_GAP_ALWAYS_ON[g.kind]) return true;
      return !muted[g.kind];
    });
    // Per-contact skips (kebab menu > "Skip for this person"). Same
    // always-on rule as global mutes — structural gaps ignore skips.
    var skips = Array.isArray(c.gap_skips) ? c.gap_skips : [];
    if(skips.length){
      gaps = gaps.filter(function(g){
        if(__TD_GAP_ALWAYS_ON[g.kind]) return true;
        return skips.indexOf(g.kind) === -1;
      });
    }
    // Sort by priority table — unknown kinds sort to the back.
    gaps.sort(function(a, b){
      var pa = __TD_GAP_PRIORITY[a.kind] || 99;
      var pb = __TD_GAP_PRIORITY[b.kind] || 99;
      return pa - pb;
    });
    return gaps;
  }
```

Every field checked, in priority order:

| # | kind | condition | column |
|---|---|---|---|
| 1 | `homeowner` | `is_homeowner == null` and no `home_anniversary` and not a past client | `is_homeowner` |
| 2 | `household` | `__tdHouseholdPartner(c)` returns a partner | `household_id` |
| 3 | `address` | `!c.street` | `street` |
| 4 | `address_unresolved` | has `street` and `geocoded_at` but `latitude` or `longitude` is null | `latitude`, `longitude`, `geocoded_at` |
| 5 | `language` | `!c.language` and not `is_business` and not `do_not_market` | `language` |
| 6 | `email` | `!c.email` | `email` |
| 7 | `birthday` | `!c.birthday` | `birthday` |
| 8 | `anniversary` | `!__tdEffectiveAnniversary(c)` | `home_anniversary` |
| 9 | `wedding_anniversary` | `!c.wedding_anniversary` | `wedding_anniversary` |

Two suppression layers, both of which **`household` and `address` ignore**
because they are marked always-on:

- **Global mute**, `__td.mutedGaps`, set in Settings under "Prompt me about".
- **Per contact skip**, the `agent_contacts.gap_skips` array column, written by
  the kebab menu's "Skip for this person".

The two helpers, **lines 9472 to 9490**:

```js
  function __tdEffectiveAnniversary(c){
    if(c.home_anniversary) return c.home_anniversary;
    if(!c.street || !c.city) return null;
    var st = String(c.street).toLowerCase().replace(/[.,]+$/,'').replace(/\s+/g,' ').trim();
    var ci = String(c.city).toLowerCase().trim();
    return __td.closedByAddress[st+'|'+ci] || null;
  }
  // Find an unconfirmed household partner. Returns the partner contact
  // (with .full_name, .tier, .id) or null. Match rule = same normalized
  // street + city as Database uses, excluding already-linked pairs and
  // pairs the agent has dismissed on either side.
  function __tdHouseholdPartner(c){
    if(!c || c.household_id) return null;          // already linked or no contact
    if(!c.street || !c.city) return null;
    // Guard against __td state not being fully initialized — a partial
    // hydration path could otherwise throw here and take the detail
    // sheet down with it. Return no partner instead.
    var pool = (__td && Array.isArray(__td.allContacts)) ? __td.allContacts : [];
    var dismissed = (__td && __td.dismissedPairs) || {};
```

The per-contact skip write, **lines 11974 to 11995**:

```js
  // Per-contact skip — append kind to agent_contacts.gap_skips and
  // patch the in-memory contact so __tdAllGaps drops the row on the
  // next render.
  async function __tdSkipGapForContact(cid, kind){
    var c = (__td.contacts||[]).find(function(x){ return x.id === cid; });
    if(!c) return;
    var prev = Array.isArray(c.gap_skips) ? c.gap_skips.slice() : [];
    if(prev.indexOf(kind) !== -1){ __tdRender(); return; }
    var next = prev.concat([kind]);
    // Optimistic UI.
    c.gap_skips = next;
    __tdRender();
    try{
      var r = await sb.from('agent_contacts').update({ gap_skips: next }).eq('id', cid).select().single();
      if(r.error) throw r.error;
      Object.assign(c, r.data);
      if(typeof showGoalToast==='function') showGoalToast('Skipped.');
    }catch(e){
      console.error('td skip gap', e);
      c.gap_skips = prev;
      __tdRender();
      if(typeof showGoalToast==='function') showGoalToast('Could not save. ' + (e.message||''));
```

> **Note, not a fix.** The priority comment block at line 9514 lists homeowner
> as 1 and household as 2, and `__TD_GAP_PRIORITY` agrees. But `__tdAllGaps`
> **pushes** household first and homeowner second. The final `sort` by the
> priority table fixes the order, so the output is correct; the push order just
> does not match the reading order of the code above it.

---

## 7. `contact_type` and `vendor_type` filter logic

This is the correction that prompted the section. **The buyer / seller / both
axis is `contact_type`. `record_class` is the separate client / vendor axis.**

Verified against the database on 25 August 2026:

| `contact_type` | `record_class` | rows |
|---|---|---|
| Buyer and Seller | client | 195 |
| Buyer | client | 12 |
| Seller | client | 6 |
| *(null)* | vendor | 10 |

### The option lists, lines 6903 to 6920

```js
  function __dbPopulateFilters(){
    var stages=['New Lead','Contacted','Appointment Set','Consult Completed','Agreement Signed','Actively Working','Under Contract','Closed'];
    var types =['Buyer','Seller','Buyer and Seller','Investor','Renter'];
    var vtypes=['Title','Lender','Agent','Inspector','Contractor','Photographer','Other'];
    var s=document.getElementById('db-f-stage');
    var t=document.getElementById('db-f-type');
    var v=document.getElementById('db-f-vtype');
    function fill(sel, opts){
      if(!sel) return;
      // Keep the first "All …" option.
      var first=sel.querySelector('option');
      sel.innerHTML=''; if(first) sel.appendChild(first);
      opts.forEach(function(o){ var op=document.createElement('option'); op.value=o; op.textContent=o; sel.appendChild(op); });
    }
    fill(s, stages); fill(t, types); fill(v, vtypes);
  }

  function __dbRenderList(){
```

### The comparisons, lines 6976 to 6990

```js
          if(isSnoozed(c)) return false;
        }
        if(fStage && c.stage!==fStage) return false;
        if(fTier  && c.tier!==fTier)   return false;
        if(fType  && c.contact_type!==fType) return false;
        // Health-chip filter — only applies on client tab; vendors don't have health.
        // D chip doesn't use health-chip semantics (D has no health).
        if(__db.healthFilter && !showUnworked && !showSnoozed && !showD){
          var h=__dbHealth(c);
          if(h !== __db.healthFilter) return false;
        }
      } else {
        if(fVtype && c.vendor_type!==fVtype) return false;
      }
      return true;
```

### The two dead options

`Investor` and `Renter` are offered in the `db-f-type` dropdown and **no contact
in the database uses either**. Selecting one returns an empty list every time.
The list is hardcoded at line 6905; it is not derived from the data.

`vendor_type` is a parallel axis with its own hardcoded list at line 6906:
`Title`, `Lender`, `Agent`, `Inspector`, `Contractor`, `Photographer`, `Other`.
It is compared only on the vendor tab, at line 6988, and vendors carry a null
`contact_type`.

> **Note, not a fix.** Both lists are hardcoded rather than read from the
> column's distinct values or a constraint, so they can drift from the data in
> either direction: an option nobody uses, as above, or a value in the database
> that the filter cannot select.

---

## What is not in here

**Duplicates are out of scope for this pass** and were not transcribed.

Nothing in this document has been executed, tested or modified. It is a reading
of the file as it stands.
