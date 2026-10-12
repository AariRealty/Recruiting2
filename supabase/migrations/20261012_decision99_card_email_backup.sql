-- Decision 99 (12 Oct 2026, Marlenyi: A). The save your card email is a backup only.
-- At signing: the invite is created (the Hub shows Save my card), no email.
-- Every hour: invites 24 hours old or more, still without a saved card and never emailed, get the email once.
-- Charges nothing.

create or replace function public.realty_billing_invite_on_sign()
returns trigger language plpgsql security definer set search_path = public as $$
declare m record;
begin
  if new.record_origin is distinct from 'signed' or new.source is distinct from 'hub' or new.agent_id is null then return new; end if;
  select user_id, email, full_name, commission_plan, status, coalesce(fee_exempt, false) as fe into m
    from realty_members where user_id = new.agent_id;
  if m.user_id is null or m.status <> 'active' or m.fe then return new; end if;
  if exists (select 1 from realty_billing_invites where agent_id = new.agent_id and card_saved_at is not null) then return new; end if;
  insert into realty_billing_invites(agent_id, email, full_name, plan, signature_id)
    values (m.user_id, m.email, m.full_name, m.commission_plan, new.id);
  return new;
end;
$$;

create or replace function public.realty_billing_invite_backup_run()
returns integer language plpgsql security definer set search_path = public as $$
declare r record; v_secret text; n integer := 0;
begin
  select value into v_secret from realty_config where key = 'digest_cron_secret';
  for r in
    select i.token from realty_billing_invites i
    where i.card_saved_at is null and i.emailed_at is null
      and i.created_at <= now() - interval '24 hours'
      and i.created_at >  now() - interval '60 days'
      and not exists (select 1 from realty_billing_invites s where s.agent_id = i.agent_id and s.card_saved_at is not null)
  loop
    perform net.http_post(
      url := 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/functions/v1/realty-billing-invite',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-aari-cron', coalesce(v_secret, '')),
      body := jsonb_build_object('token', r.token)
    );
    n := n + 1;
  end loop;
  return n;
end;
$$;
revoke all on function public.realty_billing_invite_backup_run() from public, anon, authenticated;

select cron.unschedule('realty-billing-invite-backup') where exists (select 1 from cron.job where jobname = 'realty-billing-invite-backup');
select cron.schedule('realty-billing-invite-backup', '20 * * * *', 'select public.realty_billing_invite_backup_run();');
