'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ENVELOPE_COLORS, SAMPLE_TEXTS } from '@/lib/types'
import { savePendingLetter, addToHistory, generateId, getOrCreateRecipientToken } from '@/lib/storage'
import { insertLetter } from '@/lib/supabase'
import { C, SHADOW } from '@/lib/tokens'
import BonfireAnimation from './BonfireAnimation'

export default function WritePage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [selectedColor, setSelectedColor] = useState('rose')
  const [sampleIdx, setSampleIdx] = useState(0)
  const [showingSample, setShowingSample] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showBonfire, setShowBonfire] = useState(false)

  const handleSampleToggle = () => {
    if (!showingSample) {
      setContent(SAMPLE_TEXTS[sampleIdx])
      setShowingSample(true)
    } else {
      const nextIdx = (sampleIdx + 1) % SAMPLE_TEXTS.length
      setSampleIdx(nextIdx)
      setContent(SAMPLE_TEXTS[nextIdx])
    }
  }

  const handleClearSample = () => {
    setContent('')
    setShowingSample(false)
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('なんか書いてよ〜！')
      return
    }
    if (content.trim().length < 10) {
      setError('もっと詳しく！（10文字以上ね）')
      return
    }
    setError('')
    setSending(true)

    const trimmed = content.trim()
    const senderToken = getOrCreateRecipientToken()
    // Supabase に保存して UUID を取得（失敗時はローカル ID にフォールバック）
    const supabaseId = await insertLetter(trimmed, selectedColor, senderToken)
    const id = supabaseId ?? generateId()

    const letter = {
      id,
      content: trimmed,
      envelopeColor: selectedColor,
      createdAt: new Date().toISOString(),
      isAI: false,
    }

    savePendingLetter(letter)
    addToHistory({ ...letter, type: 'sent' })
    setShowBonfire(true)
  }

  const colorDef = ENVELOPE_COLORS.find((c) => c.id === selectedColor)!

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Header */}
      <div className="text-center pt-2">
        <motion.div
          animate={{ rotate: [0, -4, 4, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="text-5xl mb-3 inline-block"
        >
          ✉️
        </motion.div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'rgba(255,255,255,0.95)' }}
        >
          黒歴史、お焚き上げしよ
        </h1>
        <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          あの頃の恥ずかしい自分、包み隠さず書いてみて
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: C.surface,
          boxShadow: `${SHADOW.high}, 0 0 60px rgba(255,100,10,0.08)`,
        }}
      >
        {/* Color stripe */}
        <div
          className="h-1 transition-colors duration-300"
          style={{ backgroundColor: colorDef.dark }}
        />

        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Textarea */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                if (error) setError('')
                if (showingSample && e.target.value !== content) setShowingSample(false)
              }}
              placeholder={'あの頃の黒歴史を正直に書いてみよう…\n例）授業中に先生のモノマネしてたら本物が後ろに立ってた'}
              rows={5}
              maxLength={200}
              className="w-full resize-none rounded-xl p-4 text-sm leading-relaxed transition-all duration-200"
              style={{
                border: `1.5px solid ${C.border}`,
                color: C.text,
                backgroundColor: '#fff',
              }}
            />
            <div
              className="absolute bottom-3 right-3 text-xs font-mono"
              style={{ color: C.muted, opacity: 0.5 }}
            >
              {content.length}/200
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium text-center"
                style={{ color: '#c4637a' }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Sample toggle */}
          <div className="flex gap-2 items-center flex-wrap">
            <button
              onClick={handleSampleToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
              style={{
                border: `1.5px solid ${C.primaryLight}`,
                color: C.primary,
                backgroundColor: 'transparent',
              }}
            >
              💡 {showingSample ? '次のやつ' : '例を見る'}
            </button>
            {showingSample && (
              <>
                <button
                  onClick={handleClearSample}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                  style={{
                    border: `1.5px solid ${C.border}`,
                    color: C.muted,
                  }}
                >
                  やっぱやめ
                </button>
                <span className="text-xs" style={{ color: C.muted }}>
                  これ参考に書いてみて！
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px dashed ${C.border}` }} />

          {/* Color picker */}
          <div>
            <p
              className="text-xs font-bold mb-3 tracking-wide uppercase"
              style={{ color: C.muted }}
            >
              カラーを選んで
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {ENVELOPE_COLORS.map((c) => {
                const isSelected = selectedColor === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    title={c.name}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <motion.div
                      animate={{ scale: isSelected ? 1.1 : 1, y: isSelected ? -2 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className="relative"
                      style={{ width: '52px', height: '36px' }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: c.bg,
                          boxShadow: isSelected ? `0 4px 14px rgba(0,0,0,0.22)` : SHADOW.low,
                          border: isSelected ? `2px solid ${c.dark}` : '1.5px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <div className="absolute inset-0" style={{ clipPath: 'polygon(0 100%, 50% 46%, 100% 100%)', backgroundColor: c.dark, opacity: 0.72 }} />
                        <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 50% 50%, 0 100%)', backgroundColor: c.dark, opacity: 0.42 }} />
                        <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)', backgroundColor: c.dark, opacity: 0.42 }} />
                        <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 54%)', backgroundColor: c.bg, filter: 'brightness(1.06)' }} />
                        <div
                          className="absolute"
                          style={{
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '12px', height: '12px',
                            backgroundColor: c.dark,
                            borderRadius: '48% 52% 55% 45% / 46% 54% 48% 52%',
                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.3)',
                            zIndex: 10,
                          }}
                        />
                      </div>
                    </motion.div>
                    <span
                      className="text-xs font-semibold transition-colors"
                      style={{ color: isSelected ? c.dark : C.muted }}
                    >
                      {c.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        onClick={handleSubmit}
        disabled={sending}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl font-bold text-white text-base tracking-wide transition-all"
        style={{
          backgroundColor: sending ? '#a8a29e' : C.primary,
          boxShadow: sending ? 'none' : '0 4px 20px rgba(196,99,122,0.4), 0 0 30px rgba(255,100,10,0.12)',
          cursor: sending ? 'not-allowed' : 'pointer',
        }}
      >
        {sending ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              className="inline-block"
            >
              ⏳
            </motion.span>
            送信中…
          </span>
        ) : (
          'えいっ！送る 🔥'
        )}
      </motion.button>

      <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        焚き火に投げ入れたら、煙の向こうから誰かの手紙が届くよ🔥
      </p>

      {showBonfire && (
        <BonfireAnimation
          envelopeColor={selectedColor}
          onComplete={() => router.push('/receive')}
        />
      )}
    </div>
  )
}
