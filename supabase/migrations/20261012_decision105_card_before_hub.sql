-- Decision 105 (12 Oct 2026, Marlenyi: A). Signing and a card on file come before the Hub opens.
-- my_card_gate: for the signed in agent only, returns the token of their unsaved card invite
-- (active, not fee exempt, no card saved yet), else null. The Hub gate locks on that token.
create or replace function public.my_card_gate()
returns uuid language sql stable security definer set search_path = public as $$
  select i.token
  from realty_billing_invites i
  join realty_members m on m.user_id = i.agent_id
  where i.agent_id = auth.uid()
    and m.status = 'active' and not coalesce(m.fee_exempt, false)
    and i.card_saved_at is null
    and i.created_at > now() - interval '60 days'
    and not exists (select 1 from realty_billing_invites s where s.agent_id = i.agent_id and s.card_saved_at is not null)
  order by i.created_at desc
  limit 1;
$$;
revoke all on function public.my_card_gate() from public, anon;
grant execute on function public.my_card_gate() to authenticated;
