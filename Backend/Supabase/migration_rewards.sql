-- ─────────────────────────────────────────────────────────────────────────────
-- StanLore Rewards Migration (Stars & Moon system)
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Add stars column to profiles ──────────────────────────────────────────
alter table profiles
    add column if not exists stars       int     default 0,
    add column if not exists last_login  date    default null,
    add column if not exists total_cards int     default 0;


-- ── 2. Add star_cost to photocards ───────────────────────────────────────────
-- common = 5, uncommon = 15, rare = 30
alter table photocards
    add column if not exists star_cost   int  default 5,
    add column if not exists is_uncommon boolean default false;

-- Set costs based on existing is_rare flag
update photocards set star_cost = 30 where is_rare = true;
update photocards set star_cost = 5  where is_rare = false;


-- ── 3. Star transactions log ──────────────────────────────────────────────────
-- Every earn or spend event is recorded here.
-- Frontend reads this to show "how did I earn these stars?" history.
create table if not exists star_transactions (
                                                 id          serial primary key,
                                                 user_id     uuid not null references profiles(id) on delete cascade,
    amount      int  not null,        -- positive = earned, negative = spent
    reason      text not null,        -- "daily_login" | "first_card" | "era_complete" | "trade" | "catalog_purchase" | "profile_setup"
    card_id     int  references photocards(id) on delete set null,
    created_at  timestamptz default now()
    );

alter table star_transactions enable row level security;
create policy "stars_own_read"   on star_transactions for select using (auth.uid() = user_id);
create policy "stars_own_insert" on star_transactions for insert with check (auth.uid() = user_id);

create index if not exists idx_star_tx_user on star_transactions(user_id);


-- ── 4. Database function: earn stars ─────────────────────────────────────────
-- Call this from the frontend via supabase.rpc("earn_stars", { ... })
-- It atomically adds stars AND logs the transaction.
create or replace function earn_stars(
    p_user_id uuid,
    p_amount  int,
    p_reason  text,
    p_card_id int default null
)
returns int   -- returns new star balance
language plpgsql security definer as $$
declare
new_balance int;
begin
update profiles
set stars = stars + p_amount
where id = p_user_id
    returning stars into new_balance;

insert into star_transactions (user_id, amount, reason, card_id)
values (p_user_id, p_amount, p_reason, p_card_id);

return new_balance;
end;
$$;


-- ── 5. Database function: spend stars (buy a card) ───────────────────────────
-- Atomically: checks balance → deducts stars → inserts collection row → logs tx
create or replace function spend_stars_for_card(
    p_user_id uuid,
    p_card_id int,
    p_cost    int
)
returns json
language plpgsql security definer as $$
declare
current_stars int;
    new_balance   int;
begin
    -- Check balance
select stars into current_stars from profiles where id = p_user_id;

if current_stars < p_cost then
        return json_build_object('success', false, 'error', 'insufficient_stars',
                                 'balance', current_stars, 'cost', p_cost);
end if;

    -- Deduct stars
update profiles
set stars = stars - p_cost, total_cards = total_cards + 1
where id = p_user_id
    returning stars into new_balance;

-- Add to collection
insert into collection (user_id, card_id, status)
values (p_user_id, p_card_id, 'owned')
    on conflict (user_id, card_id) do update set status = 'owned';

-- Log transaction
insert into star_transactions (user_id, amount, reason, card_id)
values (p_user_id, -p_cost, 'catalog_purchase', p_card_id);

return json_build_object('success', true, 'new_balance', new_balance);
end;
$$;


-- ── 6. Database function: daily login bonus ───────────────────────────────────
-- Call once per session. If last_login < today, grants ⭐1 and updates date.
create or replace function claim_daily_login(p_user_id uuid)
returns json
language plpgsql security definer as $$
declare
last_day date;
    today    date := current_date;
    new_bal  int;
begin
select last_login into last_day from profiles where id = p_user_id;

if last_day is not distinct from today then
        return json_build_object('granted', false, 'reason', 'already_claimed_today');
end if;

update profiles
set last_login = today, stars = stars + 1
where id = p_user_id
    returning stars into new_bal;

insert into star_transactions (user_id, amount, reason)
values (p_user_id, 1, 'daily_login');

return json_build_object('granted', true, 'stars_earned', 1, 'new_balance', new_bal);
end;
$$;


-- ── 7. Seed: give existing users a starter balance ────────────────────────────
update profiles set stars = 50 where stars = 0;
-- 50 stars = enough to get 1 rare (30) + 1 common (5) card to start
