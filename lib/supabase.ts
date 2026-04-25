import { createClient } from '@supabase/supabase-js'
import { Letter } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

/** letters テーブルに投稿を保存し、生成された UUID を返す */
export async function insertLetter(content: string, envelopeColor: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('letters')
    .insert({ content, envelope_color: envelopeColor, is_ai: false })
    .select('id')
    .single()
  if (error) {
    console.error('insertLetter:', error.message)
    return null
  }
  return data.id as string
}

/** 自分が送った手紙以外からランダムに1通取得する */
export async function fetchRandomLetter(excludeId: string): Promise<Letter | null> {
  const { data, error } = await supabase
    .from('letters')
    .select('id, content, envelope_color, is_ai, created_at')
    .neq('id', excludeId)
    .eq('is_ai', false)
    .limit(50)
  if (error || !data || data.length === 0) return null
  const row = data[Math.floor(Math.random() * data.length)]
  return {
    id: row.id,
    content: row.content,
    envelopeColor: row.envelope_color,
    createdAt: row.created_at,
    type: 'received',
    isAI: false,
  }
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
