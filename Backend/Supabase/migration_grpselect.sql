CREATE TABLE IF NOT EXISTS group_suggestions (
                                                 id          bigserial primary key,
                                                 group_name  text not null,
                                                 note        text,
                                                 user_id     uuid references profiles(id) on delete set null,
    email       text,
    votes       int default 1,         -- frequency counter
    created_at  timestamptz default now(),
    updated_at  timestamptz default now(),

    -- Unique on group name (case-insensitive) so duplicates just add votes
    CONSTRAINT group_suggestions_name_unique UNIQUE (lower(group_name))
    );

-- Public read- anyone can see what's been requested
alter table group_suggestions enable row level security;

create policy "anyone_can_read_suggestions"
    on group_suggestions for select
                                        using (true);

create policy "anyone_can_insert_suggestions"
    on group_suggestions for insert
    with check (true);

create policy "anyone_can_update_votes"
    on group_suggestions for update
                                               using (true);

-- ─── RPC: submit or upvote a suggestion ──────────────────────────────────────
-- If group already exists → increment votes
-- If new → insert fresh row
-- Returns the final row so UI can update optimistically
CREATE OR REPLACE FUNCTION submit_group_suggestion(
    p_group_name  text,
    p_note        text    DEFAULT NULL,
    p_user_id     uuid    DEFAULT NULL,
    p_email       text    DEFAULT NULL
)
RETURNS group_suggestions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
result group_suggestions;
BEGIN
INSERT INTO group_suggestions (group_name, note, user_id, email, votes)
VALUES (initcap(trim(p_group_name)), p_note, p_user_id, p_email, 1)
    ON CONFLICT (lower(group_name)) DO UPDATE
                                           SET votes      = group_suggestions.votes + 1,
                                           updated_at = now(),
                                           -- Keep note if new one provided
                                           note       = COALESCE(EXCLUDED.note, group_suggestions.note)
                                           RETURNING * INTO result;

RETURN result;
END;
$$;