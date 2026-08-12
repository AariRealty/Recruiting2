---
name: weekly-content-dashboard
description: >
  Generates a real estate agent's weekly content dashboard from their connected
  Coffee & Contracts account. Shows what's working in their analytics and what it
  means, builds a strategy for the week focused on local, relocation, and listing
  content to convert leads, pulls their C&C content calendar, and presents every
  post as original + customized side by side so agents see exactly what was
  personalized for them. Delivers both a chat digest and a visual Instrument Serif
  dashboard artifact. Use when the user asks for their weekly content plan, "what
  should I post this week," "plan my content," "content dashboard," or the scheduled
  Sunday run fires.
  Schedule: every Sunday at 5pm.
metadata:
  version: "0.2.0"
---

# Weekly Content Dashboard

Pull the agent's data, write the strategy, customize every post, and render a
beautiful dashboard they can work from all week. The agent should open this and
know exactly what to post, why, and have it ready to go.

Do the work first. Show it beautifully. Never leave a placeholder.

---

## Pre-flight: load brand brain and profile

Read `brand-brain.md` first. Extract and hold:
- Their voice, market, and neighborhoods
- Their ideal client (buyer? seller? move-up? relocation?)
- Any content preferences saved in `content-preferences.md`

If `brand-brain.md` is absent, call `get_my_profile` and build from the C&C
profile. Every caption must sound like them — not generic, not AI-flavored.

---

## Step 1 — Pull all data before writing anything

Pull everything in parallel before writing a single word. See
`references/c-and-c-data-sources.md` for tool names.

**Analytics:**
- `get_instagram_summary` — 30-day account trends (reach, engagement, growth)
- `get_instagram_posts(sort_by: "reach", limit: 10)` — top posts by reach; read
  every caption for hook patterns and voice signals
- `get_instagram_posts(sort_by: "saves", limit: 10)` — saved posts reveal the
  agent's "trusted expert" content; look for repeating themes
- `get_instagram_posting_frequency` — cadence data

**Content calendar:**
- `get_content_calendar` with the coming 7 days — the agent's scheduled posts;
  these are the posts to customize first
- `get_content_drops` — this week's new C&C content; full post data included

**Supporting context:**
- `get_posts(trending: true)` — what's trending across C&C right now
- `get_trending_reels` — top reel formats this week
- `list_content_pillars` — pillar breakdown for strategy framing

If any call fails, note it briefly and continue with what's available.

---

## Step 2 — Analyze: what's working and why

Before writing strategy, do real analysis. Don't summarize numbers — find
the signal.

Look for:
- **Which pillars are performing?** Local? Market education? Listings? Personal?
- **Which formats are carrying reach?** Reels? Carousels? Static?
- **What hook patterns appear in top posts?** Question hooks? Contrarian
  statements? "Here's what no one tells you"?
- **What's underperforming?** Note it once, don't dwell.
- **Saves vs. reach:** saves signal trust-building content; reach signals
  discovery content. Both matter but in different ways.
- **Cadence signal:** are they posting consistently or in bursts?

Synthesize into one clear headline insight:
> *"Local market content is your reach driver right now. Saves are highest on
> your buyer education posts — that's your trust builder. Post one of each
> this week."*

This is the through-line for everything that follows.

---

## Step 3 — Build the week's strategy

Write 3–4 specific, actionable moves for the week. Ground every recommendation
in the analytics from Step 2.

**Lead with conversion content every week.** The goal of Instagram isn't just
reach — it's converting followers into clients. Every week the strategy should
include at least one of:

- **Local content** — neighborhood features, local business spotlights, things
  to do in [their market], "best streets in [neighborhood]" style posts. This
  is the highest-converting content type for building community authority and
  attracting relocation buyers who are searching for their future city.
- **Relocation content** — "Why people are moving to [market]," cost of living
  comparisons, "what $X buys you in [city] vs. [comparison city]." These posts
  are search magnets and attract out-of-market buyers who don't know an agent yet.
- **Listing features** — even a general listing post ("just sold in [neighborhood],"
  "what sold this week," "what buyers are competing for right now") signals active
  business and attracts sellers tracking the market. This builds social proof
  with future listing clients.

Format each strategy move as:
> **Do this:** [specific action]
> **Why:** [tied to the analytics, one sentence]
> **Use this:** [specific C&C post or content type recommendation]

---

## Step 4 — Customize every post: title, caption, and a toggle for the original

This is the core value of the dashboard. For every post — from the calendar and
from the drop — deliver a fully customized, post-ready version. The original is
available as a collapsible toggle underneath, not shown by default.

**For each post, produce:**

1. **Post title — customized, not templated.** The C&C post title often contains
   placeholders like "[Your City]" or "[Neighborhood]." Replace them before
   displaying. The agent should never see a placeholder anywhere in the dashboard
   — not in the title, not in the caption, not in the header.
   > ✗ "Why Everyone's Moving to [Your City] Right Now"
   > ✓ "Why Everyone's Moving to Austin Right Now"

2. **Post details** — date (if scheduled), customized title, pillar, format
   (Reel/Carousel/Static/Story), link to `https://coffeecontracts.com/post/{slug}`

3. **Your version** — the customized caption, shown prominently and immediately.
   Fully written for their market, voice, and ideal client. No placeholders.
   Real neighborhood names, local references, their sign-off. Post-ready.

4. **▸ See original** — a collapsed toggle underneath the customized caption.
   When expanded, shows the C&C original verbatim so the agent can see what
   was changed. Collapsed by default — the customized version is the default view.

5. **What changed** — one line below the toggle explaining the key customization:
   > *"Replaced [City] with Austin + South Austin; added specific neighborhoods
   > and a price anchor; tightened the CTA to one word."*

6. **Use it?** — one-line recommendation tied to strategy:
   > *"✓ Use this week — local content is your top performer"*
   > *"→ Save for next week — calendar is full Thursday–Saturday"*

**Customization rules (non-negotiable):**
- **No placeholder anywhere in the dashboard** — every [bracket] in a title,
  caption, or header gets filled before the agent sees it. Always.
- Real, well-known local specifics only — neighborhoods, parks, restaurants,
  streets. Never invent businesses or places.
- Match their voice from the brand brain exactly — their rhythm, their sign-off,
  their CTAs. If their captions are short and punchy, the customization is too.
- Lead with their market's specific context. Generic captions get skipped; hyper-
  local ones get saved and shared.
- The only blanks left are things only the agent knows: a specific listing price
  or address, a specific client name. Mark them clearly as `[FILL IN]`.

---

## Step 5 — This week's extras from the Content Vault

Pull off-social content from the Vault that's worth using this week. Surface
**real, linked items** only — not generic suggestions. See
`references/c-and-c-data-sources.md` for types and tools.

**Time-of-month rule:** if today is within 5 days of the 1st, prioritize the
monthly newsletter (Email Template / Marketing Campaign). Otherwise pick 2–4
vault items matched to the agent's focus and season.

For each extra: title, type, link, and one-line "why this, this week."

---

## Step 6 — Render the dashboard artifact

Generate a beautiful, self-contained HTML artifact named `content-dashboard`.
Update in place each week — never duplicate.

The agent should be able to work through their entire week from this one screen.

---

### Design system

**Typography**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```
- Dashboard title, section headers, agent name: `'Instrument Serif', serif`
- All body copy, captions, labels, stats: `'Inter', sans-serif`

**Color palette** — light background, dark text
```
--bg:           #FAFAF8;
--surface:      #FFFFFF;
--border:       #E8E4DF;
--text:         #1A1A18;
--muted:        #6B6560;
--light:        #9E9890;
--accent:       #C4704A;   /* terracotta */
--ok:           #4A7C6A;   /* sage — "use this week" */
--save:         #9E9890;   /* neutral — "save for later" */
```

**Original caption panels:** `background: #F5F2EF` — slightly warm gray, visually
distinct from the customized version.
**Customized caption panels:** `background: #FFFFFF` with a left border in
`--accent` (3px) — prominent, clearly "theirs."

**Layout:** 860px max-width, centered, 48px top padding.
Sections separated by `--border` rules and generous whitespace.

---

### Dashboard structure

---

**HEADER**
```
Your Content Week
Week of [June 9–15, 2026]          [Agent name — small, --muted]
```
Title in large Instrument Serif (30px). Week dates below in Inter light,
letter-spaced. A thin `--accent` horizontal rule below.

---

**① WHAT'S WORKING**
Section header: "What's Working" in Instrument Serif.

**Analytics row** — four stat chips in a line:
```
[Reach] 30-day    [Engagement rate]    [Top format]    [Posts this month]
```
Numbers in Instrument Serif, labels in Inter light `--muted`. Deltas shown in
sage (up) or standard muted (flat/down) — never alarming red for a marketing tool.

**Insight block** — the single clearest signal from Step 2 analysis, displayed
prominently:
```
─────────────────────────────────────────────────────
"Local market content is your reach driver right now.
 Saves are highest on your buyer education posts."
─────────────────────────────────────────────────────
```
Italic Instrument Serif, 18px, `--text`. This is the headline. Everything else
supports it.

**Top performers** — 2–3 post cards in a row:
Each card: post title, pillar chip, reach number, 1-line note on why it worked.
Compact — this is context, not a full breakdown.

---

**② YOUR STRATEGY THIS WEEK**
Section header: "Your Strategy This Week" in Instrument Serif.

3–4 strategy cards, each:
```
[Do this — bold, 14px]
[Why — --muted, tied to analytics]
[Use this: → linked C&C post or content type]
```
The first card should always be the conversion play (local, relocation, or
listing content) with a specific C&C recommendation.

---

**③ YOUR WEEK**
Section header: "Your Week" in Instrument Serif.
Sub-label: "Scheduled from your C&C content calendar"

Each scheduled post as a card:

```
[Day, Date]  [Customized title — no placeholders]  [Pillar]  [Format]  [↗ link]

[Customized caption — shown prominently, post-ready, left terracotta border]

▸ See original   ← collapsed toggle; expands to show C&C original verbatim

What changed: [one-line note]
Use it? [✓ Use this week  /  → Save]
```

Captions are shown open by default for scheduled posts. The "See original"
toggle is collapsed by default — the customized version is always the hero.

---

**④ NEW THIS WEEK — C&C DROP**
Section header: "New This Week" in Instrument Serif.
Sub-label: "From this week's Coffee & Contracts drop"

Same card format as ③ — customized version prominent, "See original" toggle
collapsed underneath. New drop post cards themselves are collapsed by default
(click to expand) since these are optional additions, not commitments.

---

**⑤ THIS WEEK'S EXTRAS**
Section header: "Don't Miss" in Instrument Serif.

2–4 vault items as compact rows:
```
[Type chip]  [Title — linked]  [Why this week — --muted]
```

---

**FOOTER**
Small, `--light`:
`[Agent name] · Coffee & Contracts · Week of [dates] · Preferences saved`

---

## Step 7 — Chat delivery

Post a brief, scannable summary in chat before or after the artifact:

> **Week of [dates]**
> Signal: [one-sentence "what's working" insight]
> Strategy: [one sentence on the conversion focus this week]
> [N] posts customized · [N] scheduled · [N] from this week's drop
> Review the dashboard above — captions are post-ready.

---

## Step 8 — Save preferences and learn

When the agent tells you what they liked or picked:
1. Append a dated note to `content-preferences.md` — what they chose, what
   they want more or less of.
2. On next run, read `content-preferences.md` before building strategy and weight
   the recommendations accordingly.

---

## Rules

- **Original caption always shown first.** The side-by-side comparison is the
  proof of value. Never skip the original.
- **Fully customized, post-ready.** Real local specifics. No `[placeholders]`
  except `[FILL IN]` for truly agent-specific details.
- **Strategy must include at least one conversion play** — local, relocation,
  or listing content — every single week. This is the content that builds the
  pipeline.
- **Voice from the brand brain always.** If a caption sounds like it could belong
  to any agent, rewrite it.
- **Never fabricate metrics.** Every number comes from a tool call or is left out.
- **The dashboard is a weekly snapshot** — bake data in directly; don't call
  connectors live.
