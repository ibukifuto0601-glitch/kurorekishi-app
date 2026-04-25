-- ========================================
-- 黒歴史お焚き上げアプリ — Supabase スキーマ
-- Supabase の SQL Editor に貼り付けて実行してください
-- ========================================

-- 手紙テーブル
create table if not exists letters (
  id             uuid primary key default gen_random_uuid(),
  content        text not null,
  envelope_color text not null default 'rose',
  is_ai          boolean not null default false,
  created_at     timestamptz not null default now()
);

-- リアクションテーブル
create table if not exists reactions (
  id            uuid primary key default gen_random_uuid(),
  letter_id     uuid not null references letters(id) on delete cascade,
  reaction_type text not null,  -- 'kusa' | 'wakaru' | 'erai' | 'kowai' | 'natsukashii'
  comment       text,           -- 一言コメント（任意）
  created_at    timestamptz not null default now()
);

-- インデックス（手紙ごとのリアクション検索を高速化）
create index if not exists reactions_letter_id_idx on reactions(letter_id);

-- ========================================
-- Row Level Security（RLS）
-- 匿名アプリなので誰でも読み書き可
-- ========================================

alter table letters   enable row level security;
alter table reactions enable row level security;

-- letters: 全員が読み書き可
create policy "letters_select" on letters for select using (true);
create policy "letters_insert" on letters for insert with check (true);

-- reactions: 全員が読み書き可
create policy "reactions_select" on reactions for select using (true);
create policy "reactions_insert" on reactions for insert with check (true);

-- ========================================
-- サンプルデータ（動作確認用・任意）
-- ========================================

-- insert into letters (content, envelope_color, is_ai) values
--   ('中2のとき自作の詩を学校の廊下に貼り出して誰にも反応してもらえなかった', 'rose', false),
--   ('好きな子に「俺、将来総理大臣になるから」って言ったことある', 'navy', false);
