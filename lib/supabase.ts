import { createClient } from '@supabase/supabase-js'
import { Letter } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

/** letters テーブルに投稿を保存し、生成された UUID を返す */
export async function insertLetter(content: string, envelopeColor: string, senderToken: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('letters')
    .insert({ content, envelope_color: envelopeColor, is_ai: false, sender_token: senderToken })
    .select('id')
    .single()
  if (error) {
    console.error('insertLetter:', error.message)
    return null
  }
  return data.id as string
}

/**
 * 受信者トークンに基づいてスマート配信:
 * 1. 同じ人に同じ手紙は届かない
 * 2. 配信回数が少ない手紙（= まだリアクションをもらっていない）を優先
 * 3. SQL 関数が未作成の場合はシンプルクエリにフォールバック
 */
export async function fetchRandomLetter(
  excludeId: string,
  recipientToken: string,
): Promise<Letter | null> {
  // ── RPC によるスマート配信を試みる ──
  const rpc = await supabase.rpc('get_letter_for_recipient', {
    p_exclude_id: excludeId,
    p_token:      recipientToken,
    p_limit:      10,
  })

  if (!rpc.error && rpc.data && rpc.data.length > 0) {
    // 配信回数が最小のグループからランダムに1通選ぶ
    const minCount = (rpc.data[0] as any).delivery_count as number
    const topPool  = (rpc.data as any[]).filter((r) => r.delivery_count <= minCount + 1)
    const row      = topPool[Math.floor(Math.random() * topPool.length)]
    return {
      id:            row.id,
      content:       row.content,
      envelopeColor: row.envelope_color,
      createdAt:     row.created_at,
      type:          'received',
      isAI:          false,
    }
  }

  // ── フォールバック: シンプルクエリ（deliveries テーブル未作成時など） ──
  // このトークンにすでに届いた手紙IDを取得して除外
  const { data: delivered } = await supabase
    .from('deliveries')
    .select('letter_id')
    .eq('recipient_token', recipientToken)
  const deliveredIds = (delivered ?? []).map((r: { letter_id: string }) => r.letter_id)

  const baseQuery = supabase
    .from('letters')
    .select('id, content, envelope_color, is_ai, created_at')
    .neq('id', excludeId)
    .eq('is_ai', false)
    .neq('sender_token', recipientToken)
    .limit(50)

  const { data, error } = deliveredIds.length > 0
    ? await baseQuery.not('id', 'in', `(${deliveredIds.join(',')})`)
    : await baseQuery

  if (error || !data || data.length === 0) return null
  const row = data[Math.floor(Math.random() * data.length)]
  return {
    id:            row.id,
    content:       row.content,
    envelopeColor: row.envelope_color,
    createdAt:     row.created_at,
    type:          'received',
    isAI:          false,
  }
}

/** 配信を記録する（同一 letter_id + token は DB 側の UNIQUE 制約で重複防止） */
export async function recordDelivery(
  letterId: string,
  recipientToken: string,
): Promise<void> {
  if (!recipientToken) return
  await supabase.from('deliveries').insert({
    letter_id:       letterId,
    recipient_token: recipientToken,
  })
  // UNIQUE 違反（=すでに記録済み）はエラーを無視
}

export type ReactionRow = {
  id: string
  letter_id: string
  reaction_type: string
  comment: string | null
  created_at: string
}

/** 指定した手紙IDのリアクションを一括取得し、letter_id → ReactionRow[] のマップを返す */
export async function fetchLetterReactions(
  ids: string[],
): Promise<Map<string, ReactionRow[]>> {
  const map = new Map<string, ReactionRow[]>()
  if (ids.length === 0) return map
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .in('letter_id', ids)
  if (error || !data) return map
  for (const row of data as ReactionRow[]) {
    if (!map.has(row.letter_id)) map.set(row.letter_id, [])
    map.get(row.letter_id)!.push(row)
  }
  return map
}

/** reactions テーブルにリアクションを保存する */
export async function insertReaction(
  letterId: string,
  reactionType: string,
  comment: string | null,
): Promise<void> {
  const { error } = await supabase.from('reactions').insert({
    letter_id: letterId,
    reaction_type: reactionType,
    comment: comment || null,
  })
  if (error) console.error('insertReaction:', error.message)
}
