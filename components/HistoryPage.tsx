'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getHistory, updateLetterReaction } from '@/lib/storage'
import { fetchLetterReactions, ReactionRow } from '@/lib/supabase'
import { Letter, ENVELOPE_COLORS } from '@/lib/types'
import EnvelopeAnimation from './EnvelopeAnimation'
import { C, SHADOW, APP_BG } from '@/lib/tokens'

const REACTION_LABELS: Record<string, string> = {
  '😂': '草', '🤝': 'わかる', '😱': 'やばい',
  '🥺': 'かわいい', '👏': 'えらい', '🔥': 'それな',
}

type Tab = 'received' | 'sent'

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function LetterCard({
  letter,
  reactions,
  onSelect,
}: {
  letter: Letter
  reactions?: ReactionRow[]
  onSelect: (l: Letter) => void
}) {
  const colorDef = ENVELOPE_COLORS.find((c) => c.id === letter.envelopeColor) ?? ENVELOPE_COLORS[0]
  const topReaction = reactions?.[0]

  return (
    <motion.button
      onClick={() => onSelect(letter)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl overflow-hidden transition-shadow"
      style={{ backgroundColor: C.surface, boxShadow: SHADOW.low }}
    >
      <div className="flex items-stretch">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: colorDef.dark }} />

        <div className="flex-1 px-4 py-3.5 flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
            style={{ backgroundColor: colorDef.light }}
          >
            {letter.type === 'sent' ? '✉️' : '💌'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs mb-0.5 font-semibold" style={{ color: C.muted }}>
              {letter.type === 'sent' ? '送ったやつ' : 'もらったやつ'}
              {letter.type === 'received' && letter.reaction && (
                <span className="ml-1">{letter.reaction}</span>
              )}
            </p>
            <p
              className="text-sm font-medium line-clamp-2 leading-snug"
              style={{ color: C.text }}
            >
              {letter.content}
            </p>
            {letter.comment && (
              <p className="text-xs mt-1 italic" style={{ color: C.muted }}>
                💬 {letter.comment}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="text-xs" style={{ color: C.muted, opacity: 0.6 }}>
              {formatDate(letter.createdAt)}
            </span>

            {letter.type === 'sent' ? (
              topReaction ? (
                /* リアクション届いたバッジ */
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(255,160,30,0.12)',
                    border: '1px solid rgba(255,160,30,0.3)',
                    color: 'rgba(200,120,10,1)',
                  }}
                >
                  <span>{topReaction.reaction_type}</span>
                  <span>{REACTION_LABELS[topReaction.reaction_type] ?? ''}</span>
                </div>
              ) : (
                /* まだ反応なし */
                <span
                  className="text-xs"
                  style={{ color: 'rgba(255,160,30,0.3)' }}
                >
                  🔥 待機中
                </span>
              )
            ) : (
              <span style={{ color: C.muted, opacity: 0.4 }}>›</span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// ── 送った手紙のリアクション表示セクション ──
function SentReactionSection({ reactions }: { reactions: ReactionRow[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,160,40,0.2)',
      }}
    >
      {/* ヘッダー */}
      <div
        className="px-5 py-3.5 flex items-center gap-2.5"
        style={{
          background: 'rgba(255,140,20,0.08)',
          borderBottom: '1px solid rgba(255,160,40,0.12)',
        }}
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="text-base leading-none"
        >
          🔥
        </motion.span>
        <p
          className="text-xs font-bold tracking-wide"
          style={{ color: 'rgba(255,185,80,0.9)' }}
        >
          誰かの焚き火に届いた反応
        </p>
      </div>

      {reactions.length === 0 ? (
        /* 未受信 */
        <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
          <motion.div
            animate={{ opacity: [0.3, 0.65, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.8 }}
            className="text-4xl"
          >
            🌫️
          </motion.div>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
            まだ誰の焚き火にも届いてないみたい…🔥
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            誰かが受け取ると反応がここに届くよ
          </p>
        </div>
      ) : (
        /* リアクション一覧 */
        <div className="px-5 py-4 flex flex-col gap-4">
          {reactions.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-4xl leading-none"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,60,0.55))' }}
                >
                  {r.reaction_type}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span
                    className="text-base font-bold leading-tight"
                    style={{ color: 'rgba(255,215,100,0.95)' }}
                  >
                    {REACTION_LABELS[r.reaction_type] ?? r.reaction_type}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    誰かが焚き火に投げ込んだ
                  </span>
                </div>
              </div>

              {r.comment && (
                <div
                  className="ml-1 px-4 py-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <p
                    className="text-sm italic leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.72)' }}
                  >
                    「{r.comment}」
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function HistoryPage() {
  const [history, setHistory] = useState<Letter[]>([])
  const [tab, setTab] = useState<Tab>('received')
  const [selected, setSelected] = useState<Letter | null>(null)
  const [reactionsMap, setReactionsMap] = useState<Record<string, ReactionRow[]>>({})

  useEffect(() => {
    const h = getHistory()
    setHistory(h)
    const sentIds = h.filter((l) => l.type === 'sent').map((l) => l.id)
    fetchLetterReactions(sentIds).then((map) =>
      setReactionsMap(Object.fromEntries(map)),
    )
  }, [])

  const filtered = history.filter((l) => l.type === tab)

  const handleReactionSave = (reaction: string, comment: string) => {
    if (!selected) return
    updateLetterReaction(selected.id, reaction, comment)
    const updated = { ...selected, reaction, comment }
    setSelected(updated)
    setHistory((prev) => prev.map((l) => (l.id === selected.id ? updated : l)))
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* ヘッダー */}
      <div className="text-center pt-2">
        <div className="text-5xl mb-3">📚</div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
          黒歴史アーカイブ
        </h1>
        <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          過去のやつ、全部ここにあるよ
        </p>
      </div>

      {/* タブ */}
      <div
        className="rounded-2xl p-1 flex gap-1"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {([['received', '💌 もらった'], ['sent', '✉️ 送った']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={
              tab === t
                ? { backgroundColor: C.surface, color: C.primary, boxShadow: SHADOW.low }
                : { color: 'rgba(255,255,255,0.4)' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="text-5xl" style={{ opacity: 0.25 }}>
            {tab === 'sent' ? '✉️' : '💌'}
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {tab === 'sent' ? 'まだ何も送ってないじゃん' : 'まだもらってないよ〜'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-right" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {filtered.length}件 / max30
          </p>
          {filtered.map((letter, i) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <LetterCard
                letter={letter}
                reactions={letter.type === 'sent' ? reactionsMap[letter.id] : undefined}
                onSelect={setSelected}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* モーダル */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: APP_BG }}
          >
            <div
              className="flex items-center justify-between px-5 flex-shrink-0"
              style={{ paddingTop: '52px', paddingBottom: '16px' }}
            >
              <h2 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {selected.type === 'sent' ? '送ったやつ' : 'もらったやつ'}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base transition-all active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-32 flex flex-col gap-4">
              <EnvelopeAnimation
                content={selected.content}
                envelopeColor={selected.envelopeColor}
                showReactions={selected.type === 'received'}
                initialReaction={selected.reaction}
                initialComment={selected.comment}
                onReactionSave={selected.type === 'received' ? handleReactionSave : undefined}
                readOnly={selected.type === 'sent'}
              />

              {/* 送った手紙 → Supabase リアクション表示 */}
              {selected.type === 'sent' && (
                <SentReactionSection
                  reactions={reactionsMap[selected.id] ?? []}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
