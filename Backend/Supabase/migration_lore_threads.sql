-- Run in Supabase SQL Editor
-- Creates lore_threads table so posts persist and are visible to all users

CREATE TABLE IF NOT EXISTS lore_threads (
                                            id         bigserial primary key,
                                            tag        text not null default 'Theory',
                                            title      text not null,
                                            body       text not null,
                                            author     text not null,
                                            group_id   text default 'bts',
                                            votes      int  default 0,
                                            comments   int  default 0,
                                            views      int  default 0,
                                            tags       text[] default '{}',
                                            created_at timestamptz default now()
    );

-- Everyone can read threads (guests + logged in)
alter table lore_threads enable row level security;

create policy "anyone_can_read_threads"
    on lore_threads for select
                                   using (true);

-- Only logged-in users can post
create policy "auth_users_can_post_threads"
    on lore_threads for insert
    with check (auth.uid() is not null);

-- Only logged-in users can update votes
create policy "auth_users_can_update_threads"
    on lore_threads for update
                                          using (auth.uid() is not null);