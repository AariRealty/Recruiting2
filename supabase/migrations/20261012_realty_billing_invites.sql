-- Decision 94: after a current agent re signs ICA 5.1 in the Hub, they get one private link to save a card.
-- Applied only on Marlenyi's "deploy". Nothing is charged by this migration.
create table if not exists public.realty_billing_invites (
  token uuid primary key default gen_random_uuid(),
  agent_id uuid not null,
  email text not null,
  full_name text,
  plan text,
  signature_id uuid,
  created_at timestamptz not null default now(),
  emailed_at timestamptz,
  card_saved_at timestamptz
);
alter table public.realty_billing_invites enable row level security;

create or replace function public.get_billing_invite(p_token uuid)
returns table(email text, full_name text, plan text, start_date date, card_saved boolean)
language sql security definer set search_path = public as $$
  select i.email, i.full_name, m.commission_plan, m.start_date::date, (i.card_saved_at is not null)
  from realty_billing_invites i join realty_members m on m.user_id = i.agent_id
  where i.token = p_token and i.created_at > now() - interval '60 days'
    and m.status = 'active' and not coalesce(m.fee_exempt, false)
  limit 1;
$$;
revoke all on function public.get_billing_invite(uuid) from public;
grant execute on function public.get_billing_invite(uuid) to anon, authenticated;

create or replace function public.mark_billing_invite_saved(p_token uuid)
returns boolean language sql security definer set search_path = public as $$
  update realty_billing_invites set card_saved_at = coalesce(card_saved_at, now()) where token = p_token returning true;
$$;
revoke all on function public.mark_billing_invite_saved(uuid) from public;
grant execute on function public.mark_billing_invite_saved(uuid) to anon, authenticated;

drop function if exists public.aari_member_status(text);
create function public.aari_member_status(p_email text)
returns table(status text, start_date date, fee_exempt boolean)
language sql security definer set search_path = public as $$
  select m.status::text, m.start_date::date, coalesce(m.fee_exempt, false)
  from realty_members m
  where m.role = 'agent' and lower(m.email) = lower(trim(p_email))
  order by (m.status = 'active') desc
  limit 1;
$$;
revoke all on function public.aari_member_status(text) from public;
grant execute on function public.aari_member_status(text) to anon, authenticated;

create or replace function public.realty_billing_invite_on_sign()
returns trigger language plpgsql security definer set search_path = public as $$
declare m record; v_token uuid; v_secret text;
begin
  if new.record_origin is distinct from 'signed' or new.source is distinct from 'hub' or new.agent_id is null then return new; end if;
  select user_id, email, full_name, commission_plan, status, coalesce(fee_exempt, false) as fe into m
    from realty_members where user_id = new.agent_id;
  if m.user_id is null or m.status <> 'active' or m.fe then return new; end if;
  if exists (select 1 from realty_billing_invites where agent_id = new.agent_id and card_saved_at is not null) then return new; end if;
  insert into realty_billing_invites(agent_id, email, full_name, plan, signature_id)
    values (m.user_id, m.email, m.full_name, m.commission_plan, new.id) returning token into v_token;
  select value into v_secret from realty_config where key = 'digest_cron_secret';
  perform net.http_post(
    url := 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/functions/v1/realty-billing-invite',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-aari-cron', coalesce(v_secret, '')),
    body := jsonb_build_object('token', v_token)
  );
  return new;
end;
$$;

drop trigger if exists realty_billing_invite_after_sign on public.realty_agreement_signatures;
create trigger realty_billing_invite_after_sign
  after insert on public.realty_agreement_signatures
  for each row execute function public.realty_billing_invite_on_sign();
