-- Decision 103a (12 Oct 2026): an agent who owes a past fee pays it on the card step, before the Hub opens.
-- First case: Odalis Mora, 2026 E&O + Compliance Fee (anniversary 30 Sept 2026), $199 per Exhibit A 41.2, confirmed unpaid by Marlenyi.
create table if not exists public.realty_fee_arrears (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null,
  kind text not null check (kind in ('eo')),
  period text not null,
  amount_cents integer not null check (amount_cents > 0),
  note text,
  created_at timestamptz not null default now(),
  collected_at timestamptz,
  payment_id text,
  unique (agent_id, kind, period)
);
alter table public.realty_fee_arrears enable row level security;

insert into public.realty_fee_arrears(agent_id, kind, period, amount_cents, note)
values ('7dca4b0b-b3b7-4ccf-8b82-912b90089e21', 'eo', '2026', 19900, 'E&O + Compliance Fee due 30 Sept 2026, not paid (Marlenyi, 12 Oct 2026)')
on conflict (agent_id, kind, period) do nothing;

-- The private card link now also says what is owed today.
drop function if exists public.get_billing_invite(uuid);
create function public.get_billing_invite(p_token uuid)
returns table(email text, full_name text, plan text, start_date date, card_saved boolean, owed_cents integer, owed_label text)
language sql security definer set search_path = public as $$
  select i.email, i.full_name, m.commission_plan, m.start_date::date, (i.card_saved_at is not null),
         coalesce((select sum(a.amount_cents)::int from realty_fee_arrears a where a.agent_id = i.agent_id and a.collected_at is null), 0),
         (select string_agg(case a.kind when 'eo' then a.period || ' E&O + Compliance Fee (past due)' end, ', ') from realty_fee_arrears a where a.agent_id = i.agent_id and a.collected_at is null)
  from realty_billing_invites i join realty_members m on m.user_id = i.agent_id
  where i.token = p_token and i.created_at > now() - interval '60 days'
    and m.status = 'active' and not coalesce(m.fee_exempt, false)
  limit 1;
$$;
revoke all on function public.get_billing_invite(uuid) from public;
grant execute on function public.get_billing_invite(uuid) to anon, authenticated;

-- Hub card screen: what the signed in agent owes today.
create or replace function public.my_card_due()
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount_cents)::int, 0) from realty_fee_arrears where agent_id = auth.uid() and collected_at is null;
$$;
revoke all on function public.my_card_due() from public, anon;
grant execute on function public.my_card_due() to authenticated;

-- Marked collected only by finalize-join after Stripe confirms the payment succeeded.
create or replace function public.mark_arrears_collected(p_token uuid, p_payment_id text)
returns integer language sql security definer set search_path = public as $$
  with i as (select agent_id from realty_billing_invites where token = p_token)
  update realty_fee_arrears a set collected_at = now(), payment_id = p_payment_id
  from i where a.agent_id = i.agent_id and a.collected_at is null and p_payment_id ~ '^pi_[A-Za-z0-9]+$'
  returning 1;
$$;
revoke all on function public.mark_arrears_collected(uuid, text) from public;
grant execute on function public.mark_arrears_collected(uuid, text) to anon, authenticated;
