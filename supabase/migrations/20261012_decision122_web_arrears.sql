-- Decision 122 (12 Oct 2026): a current agent who signs on joinaari.com pays any past due fee on the
-- card step, the same as in the Hub (Manual 68.1). The key is the signature id that realty-sign-ica-web
-- returns only to the signer, matched to the signer email and limited to a fresh signature, so a past
-- due amount can never be read from an email address alone.
create or replace function public.web_owed_for_signature(p_sig uuid, p_email text)
returns table(owed_cents integer, owed_label text)
language sql stable security definer set search_path = public as $$
  select coalesce((select sum(a.amount_cents)::int from realty_fee_arrears a where a.agent_id = s.agent_id and a.collected_at is null), 0),
         (select string_agg(case a.kind when 'eo' then a.period || ' E&O + Compliance Fee (past due)' end, ', ') from realty_fee_arrears a where a.agent_id = s.agent_id and a.collected_at is null)
  from realty_agreement_signatures s join realty_members m on m.user_id = s.agent_id
  where s.id = p_sig and s.source = 'website' and s.agent_id is not null
    and lower(s.signer_email) = lower(trim(p_email))
    and s.signed_at > now() - interval '2 hours'
    and m.status = 'active' and not coalesce(m.fee_exempt, false)
  limit 1;
$$;
revoke all on function public.web_owed_for_signature(uuid, text) from public;
grant execute on function public.web_owed_for_signature(uuid, text) to anon, authenticated;

create or replace function public.mark_arrears_collected_sig(p_sig uuid, p_payment_id text)
returns integer language sql security definer set search_path = public as $$
  with s as (select agent_id from realty_agreement_signatures where id = p_sig and source = 'website' and agent_id is not null and signed_at > now() - interval '6 hours')
  update realty_fee_arrears a set collected_at = now(), payment_id = p_payment_id
  from s where a.agent_id = s.agent_id and a.collected_at is null and p_payment_id ~ '^pi_[A-Za-z0-9]+$'
  returning 1;
$$;
revoke all on function public.mark_arrears_collected_sig(uuid, text) from public;
grant execute on function public.mark_arrears_collected_sig(uuid, text) to anon, authenticated;
