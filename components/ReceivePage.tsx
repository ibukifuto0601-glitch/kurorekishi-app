'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  getPendingLetter,
  clearPendingLetter,
  addToHistory,
  updateLetterReaction,
  generateId,
  getOrCreateRecipientToken,
} from '@/lib/storage'
import { fetchRandomLetter, recordDelivery, insertReaction } from '@/lib/supabase'
import { getRandomStory } from '@/lib/dummyData'
import EnvelopeAnimation from './EnvelopeAnimation'
import { Letter } from '@/lib/types'
import { C } from '@/lib/tokens'

type State = 'loading' | 'no-pending' | 'ready' | 'opened'

export default function ReceivePage() {
  const router = useRouter()
  const [state, setState] = useState<State>('loading')
  const [receivedLetter, setReceivedLetter] = useState<Letter | null>(null)
  const savedRef = useRef(false)
  const [ashRevealed, setAshRevealed] = useState(false)

  useEffect(() => {
    const pending = getPendingLetter()
    if (!pending) {
      setState('no-pending')
      return
    }

    // Supabase から他ユーザーの投稿をスマート取得、なければダミーにフォールバック
    const token = getOrCreateRecipientToken()
    fetchRandomLetter(pending.id, token).then((supabaseLetter) => {
      if (supabaseLetter) {
        // 配信を即記録（同じ手紙が再度届かないように）
        recordDelivery(supabaseLetter.id, token)
        setReceivedLetter(supabaseLetter)
      } else {
        const story = getRandomStory()
        setReceivedLetter({
          id: generateId(),
          content: story.content,
          envelopeColor: story.color,
          createdAt: new Date().toISOString(),
          type: 'received',
          isAI: true,
        })
      }
      setState('ready')
      setTimeout(() => setAshRevealed(true), 2200)
    })
  }, [])

  const handleEnvelopeOpen = () => {
    if (savedRef.current || !receivedLetter) return
    savedRef.current = true
    addToHistory(receivedLetter)
    clearPendingLetter()
    setState('opened')
  }

  const handleReactionSave = (reaction: string, comment: string) => {
    if (!receivedLetter) return
    const updated = { ...receivedLetter, reaction, comment }
    setReceivedLetter(updated)
    updateLetterReaction(receivedLetter.id, reaction, comment)
    // Supabase にも保存（ダミーデータ由来 isAI: true のときはスキップ）
    if (!receivedLetter.isAI) {
      insertReaction(receivedLetter.id, reaction, comment || null)
    }
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="text-4xl"
        >
          ✉️
        </motion.div>
      </div>
    )
  }

  if (state === 'no-pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="text-6xl"
        >
          📭
        </motion.div>
        <div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            まだ届いてないよ〜
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            先に自分の黒歴史を送ると、誰かのが届くよ！
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/')}
          className="px-8 py-3 rounded-2xl font-bold text-sm text-white transition-all"
          style={{
            backgroundColor: C.primary,
            boxShadow: '0 4px 20px rgba(196,99,122,0.4)',
          }}
        >
          書きに行く！ ✉️
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Header */}
      <div className="text-center pt-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="text-5xl mb-3 inline-block"
        >
          {ashRevealed ? '📬' : '🌫️'}
        </motion.div>
        <motion.h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'rgba(255,255,255,0.95)' }}
          animate={{ opacity: 1 }}
        >
          {ashRevealed ? '届いたよ！' : '灰から届いた…'}
        </motion.h1>
        <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {state === 'opened'
            ? 'セーブされたよ'
            : ashRevealed
            ? 'タップして開けてみて！'
            : '誰かの黒歴史が灰になって届いたよ'}
        </p>
      </div>

      {/* Envelope — 灰から色が戻るトランジション */}
      {receivedLetter && (
        <motion.div
          style={{
            filter: ashRevealed
              ? 'grayscale(0) brightness(1)'
              : 'grayscale(1) brightness(0.55) contrast(1.1)',
            transition: 'filter 1.8s ease',
          }}
        >
          <EnvelopeAnimation
            content={receivedLetter.content}
            envelopeColor={receivedLetter.envelopeColor}
            showReactions={state === 'opened'}
            initialReaction={receivedLetter.reaction}
            initialComment={receivedLetter.comment}
            onReactionSave={handleReactionSave}
            onOpen={handleEnvelopeOpen}
          />
        </motion.div>
      )}

      {/* Bottom actions */}
      {state === 'opened' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            ✉️ もう1通書く
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/history')}
            className="flex-1 py-3 rounded-2xl font-bold text-sm text-white transition-all"
            style={{
              backgroundColor: C.primary,
              boxShadow: '0 4px 16px rgba(196,99,122,0.35)',
            }}
          >
            📚 アーカイブみる
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
