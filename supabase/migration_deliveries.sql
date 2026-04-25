-- ============================================================
-- migration: 配信追跡テーブル + スマート配信 SQL 関数
-- Supabase ダッシュボード → SQL Editor に貼り付けて Run
-- ============================================================

-- 配信履歴テーブル（誰がどの手紙を受け取ったか）
create table if not exists deliveries (
  id              uuid primary key default gen_random_uuid(),
  letter_id       uuid not null references letters(id) on delete cascade,
  recipient_token text not null,
  delivered_at    timestamptz not null default now(),
  unique (letter_id, recipient_token)
);

create index if not exists deliveries_letter_id_idx  on deliveries(letter_id);
create index if not exists deliveries_token_idx      on deliveries(recipient_token);

alter table deliveries enable row level security;
create policy "deliveries_select" on deliveries for select using (true);
create policy "deliveries_insert" on deliveries for insert with check (true);

-- ============================================================
-- スマート配信関数
-- ・このトークンにまだ届いていない手紙だけを返す
-- ・配信回数が少ない（= まだ反応をもらっていない）手紙を優先
-- ・呼び出し側でトップ N 件からランダムに1通選ぶ
-- ============================================================
create or replace function get_letter_for_recipient(
  p_exclude_id text,   -- 自分が送った手紙の ID（UUID 文字列）
  p_token      text,   -- 受信者の匿名トークン
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
    -- 自分の手紙は除外（UUID でない旧形式 ID は無視）
    and (
      p_exclude_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or l.id != p_exclude_id::uuid
    )
    -- このトークンにすでに届いた手紙は除外
    and l.id not in (
      select letter_id from deliveries where recipient_token = p_token
    )
  group by l.id, l.content, l.envelope_color, l.is_ai, l.created_at
  -- 配信回数が少ない順 → 作成日が古い順（全員にリアクションが届くように）
  order by delivery_count asc, l.created_at asc
  limit p_limit
$$;
