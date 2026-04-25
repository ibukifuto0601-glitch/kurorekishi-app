-- ============================================================
-- migration: letters テーブルに sender_token を追加
-- 自分が送った手紙が自分に届かないようにするため
-- Supabase ダッシュボード → SQL Editor に貼り付けて Run
-- ============================================================

alter table letters add column if not exists sender_token text;

create index if not exists letters_sender_token_idx on letters(sender_token);

-- ============================================================
-- スマート配信関数を更新（sender_token による自己除外を追加）
-- ============================================================
create or replace function get_letter_for_recipient(
  p_exclude_id text,
  p_token      text,
  p_limit      int default 20
)
returns table (
  id             uuid,
  content        text,
  envelope_color text,
  is_ai          boolean,
  created_at     timestamptz,
  delivery_count bigint
)
language sql
security definer
as $$
  select
    l.id,
    l.content,
    l.envelope_color,
    l.is_ai,
    l.created_at,
    count(d.id) as delivery_count
  from letters l
  left join deliveries d on d.letter_id = l.id
  where l.is_ai = false
    -- 自分が今送った手紙を除外（UUID 形式のみ）
    and (
      p_exclude_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or l.id != p_exclude_id::uuid
    )
    -- 送信者トークンが一致する手紙を除外（自分の全手紙が届かない）
    and (l.sender_token is null or l.sender_token != p_token)
    -- このトークンにすでに届いた手紙を除外
    and l.id not in (
      select letter_id from deliveries where recipient_token = p_token
    )
  group by l.id, l.content, l.envelope_color, l.is_ai, l.created_at
  order by delivery_count asc, l.created_at asc
  limit p_limit
$$;
