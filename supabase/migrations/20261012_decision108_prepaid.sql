-- Decision 108 (12 Oct 2026): Milennys Vargas prepaid her monthly fee up to her next anniversary (Marlenyi, 6:39 PM).
-- Her first Stripe monthly charge is 28 Jan 2027, the same day her E&O renews. Charges nothing today.
alter table public.realty_members add column if not exists monthly_paid_through date;
update public.realty_members set monthly_paid_through = '2027-01-27' where user_id = 'f346659d-ea0c-40a0-b02f-e099cdb3cd41';

drop function if exists public.aari_member_status(text);
create function public.aari_member_status(p_email text)
returns table(status text, start_date date, fee_exempt boolean, monthly_paid_through date)
language sql security definer set search_path = public as $$
  select m.status::text, m.start_date::date, coalesce(m.fee_exempt, false), m.monthly_paid_through
  from realty_members m
  where m.role = 'agent' and lower(m.email) = lower(trim(p_email))
  order by (m.status = 'active') desc
  limit 1;
$$;
revoke all on function public.aari_member_status(text) from public;
grant execute on function public.aari_member_status(text) to anon, authenticated;

drop function if exists public.get_billing_invite(uuid);
create function public.get_billing_invite(p_token uuid)
returns table(email text, full_name text, plan text, start_date date, card_saved boolean, owed_cents integer, owed_label text, paid_through date)
language sql security definer set search_path = public as $$
  select i.email, i.full_name, m.commission_plan, m.start_date::date, (i.card_saved_at is not null),
         coalesce((select sum(a.amount_cents)::int from realty_fee_arrears a where a.agent_id = i.agent_id and a.collected_at is null), 0),
         (select string_agg(case a.kind when 'eo' then a.period || ' E&O + Compliance Fee (past due)' end, ', ') from realty_fee_arrears a where a.agent_id = i.agent_id and a.collected_at is null),
         m.monthly_paid_through
  from realty_billing_invites i join realty_members m on m.user_id = i.agent_id
  where i.token = p_token and i.created_at > now() - interval '60 days'
    and m.status = 'active' and not coalesce(m.fee_exempt, false)
  limit 1;
$$;
revoke all on function public.get_billing_invite(uuid) from public;
grant execute on function public.get_billing_invite(uuid) to anon, authenticated;

update public.realty_agent_subscriptions set notes = 'Aari Max 100%, monthly $99. Joined 2025-01-28. Monthly fee prepaid up to her next anniversary (Marlenyi, 12 Oct 2026); first Stripe monthly charge 28 Jan 2027. E&O + Compliance $199 renews 28 Jan 2027. Billing moves from SkySlope Books to Stripe the day she saves a card in the Hub (98a). Register 108.', updated_at = now() where id = '10e2e1bf-bb50-4430-be5e-03d9287b6736';

select m.full_name, m.monthly_paid_through, (select paid_through is null from public.aari_member_status('milennys.re@gmail.com') x, lateral (select x.monthly_paid_through as paid_through) y) as missing from realty_members m where m.user_id = 'f346659d-ea0c-40a0-b02f-e099cdb3cd41';
