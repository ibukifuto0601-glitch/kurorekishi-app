'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ENVELOPE_COLORS, EnvelopeColorDef } from '@/lib/types'
import { C } from '@/lib/tokens'
import { playOpen } from '@/lib/sounds'
import ShareButtons from './ShareButtons'
import ReactionBar from './ReactionBar'

// ── ロウシール（蝋封）コンポーネント ──
function WaxSeal({ colorDef }: { colorDef: EnvelopeColorDef }) {
  return (
    <div style={{ position: 'relative', width: '64px', height: '64px' }}>
      {/* メインの蝋の塊（不均一な形） */}
      <div
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: colorDef.dark,
          borderRadius: '48% 52% 55% 45% / 46% 54% 48% 52%',
          boxShadow: [
            '3px 4px 12px rgba(0,0,0,0.45)',
            'inset 0 3px 6px rgba(255,255,255,0.22)',
            'inset 0 -3px 6px rgba(0,0,0,0.28)',
          ].join(', '),
          position: 'relative',
        }}
      >
        {/* 内側エンボス円 */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.45)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '17px',
              color: 'rgba(255,255,255,0.88)',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              userSelect: 'none',
              lineHeight: 1,
            }}
          >
            ✦
          </span>
        </div>
      </div>

      {/* 蝋の垂れ – 中央下 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-13px',
          left: '54%',
          transform: 'translateX(-50%)',
          width: '15px',
          height: '20px',
          backgroundColor: colorDef.dark,
          borderRadius: '35% 40% 55% 50% / 20% 20% 65% 55%',
          boxShadow: '1px 4px 7px rgba(0,0,0,0.28)',
        }}
      />
      {/* 蝋の垂れ – 右下 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          right: '7px',
          width: '10px',
          height: '13px',
          backgroundColor: colorDef.dark,
          borderRadius: '40% 40% 55% 55% / 30% 30% 60% 55%',
          boxShadow: '1px 3px 5px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  )
}

// ── メインコンポーネント ──
type Phase = 'sealed' | 'opening' | 'open'

interface EnvelopeAnimationProps {
  content: string
  envelopeColor: string
  showReactions?: boolean
  initialReaction?: string
  initialComment?: string
  onReactionSave?: (reaction: string, comment: string) => void
  onOpen?: () => void
  readOnly?: boolean
}

export default function EnvelopeAnimation({
  content,
  envelopeColor,
  showReactions = false,
  initialReaction,
  initialComment,
  onReactionSave,
  onOpen,
  readOnly = false,
}: EnvelopeAnimationProps) {
  const [phase, setPhase] = useState<Phase>('sealed')
  const colorDef = ENVELOPE_COLORS.find((c) => c.id === envelopeColor) ?? ENVELOPE_COLORS[0]

  const handleOpen = () => {
    if (phase !== 'sealed') return
    playOpen()
    setPhase('opening')
    setTimeout(() => {
      setPhase('open')
      onOpen?.()
    }, 900)
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      {/* ── 封筒 ── */}
      <div
        className="envelope-wrapper w-full max-w-[320px] cursor-pointer select-none"
        onClick={handleOpen}
      >
        <motion.div
          className="relative"
          style={{ width: '100%', paddingBottom: '62%', transformStyle: 'preserve-3d' }}
          animate={phase === 'sealed' ? { y: [0, -6, 0], rotateX: [2, -1, 2], rotateY: [-1, 2, -1] } : {}}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        >
          {/* ── 封筒の本体（四角・角なし） ── */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: colorDef.bg,
              boxShadow: '0 2px 4px rgba(0,0,0,0.18), 6px 12px 24px rgba(0,0,0,0.32), 0 24px 48px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {/* 下フラップ（三角・上向き） */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(0 100%, 50% 46%, 100% 100%)',
                backgroundColor: colorDef.dark,
                opacity: 0.72,
              }}
            />
            {/* 左フラップ（三角・右向き） */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(0 0, 50% 50%, 0 100%)',
                backgroundColor: colorDef.dark,
                opacity: 0.45,
              }}
            />
            {/* 右フラップ（三角・左向き） */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)',
                backgroundColor: colorDef.dark,
                opacity: 0.45,
              }}
            />

            {/* ロウシール */}
            <AnimatePresence>
              {phase === 'sealed' && (
                <motion.div
                  key="wax"
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.22 } }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginLeft: '-32px',
                    marginTop: '-32px',
                    zIndex: 25,
                  }}
                >
                  <WaxSeal colorDef={colorDef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── 上フラップ（尖った三角・アニメあり） ── */}
          <motion.div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 54%)',
              backgroundColor: colorDef.bg,
              filter: 'brightness(1.06)',
              transformOrigin: '50% 0%',
              zIndex: 15,
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.06)',
            }}
            animate={{
              clipPath:
                phase !== 'sealed'
                  ? 'polygon(0 0, 100% 0, 50% 0%)'
                  : 'polygon(0 0, 100% 0, 50% 54%)',
            }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* 開封エフェクト */}
          <AnimatePresence>
            {phase === 'opening' && (
              <>
                {['✨', '⭐', '💫', '🌟'].map((spark, i) => (
                  <motion.div
                    key={i}
                    className="absolute pointer-events-none text-xl"
                    style={{ left: `${15 + i * 22}%`, top: '12%', zIndex: 30 }}
                    initial={{ opacity: 0, y: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -44, scale: [0, 1.6, 0] }}
                    transition={{ delay: i * 0.1, duration: 0.85 }}
                  >
                    {spark}
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* タップヒント */}
      <AnimatePresence mode="wait">
        {phase === 'sealed' && (
          <motion.p
            key="tap-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="text-white/80 text-sm font-bold tracking-wide"
          >
            タップして開けて！✨
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── 便箋（リアルな紙） ── */}
      <AnimatePresence>
        {phase === 'open' && (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 28, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-[320px]"
            style={{
              backgroundColor: '#fffef5',
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.14), 0 24px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 6px rgba(0,0,0,0.04)',
            }}
          >
            {/* 上端カラーライン */}
            <div className="h-2" style={{ backgroundColor: colorDef.bg }} />

            {/* 紙の上端内側グラデーション（奥行き） */}
            <div
              style={{
                height: '18px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.045), transparent)',
                marginTop: '-2px',
              }}
            />

            {/* 本文エリア（罫線・余白線入り） */}
            <div className="relative letter-lines px-6 pt-3 pb-4">
              {/* 左の余白ライン（赤） */}
              <div
                className="absolute top-0 bottom-0"
                style={{ left: '48px', width: '1px', backgroundColor: 'rgba(255,80,80,0.18)' }}
              />
              <div className="relative z-10" style={{ paddingLeft: '16px' }}>
                {/* ヘッダー */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: colorDef.light }}
                  >
                    {colorDef.emoji}
                  </div>
                  <p className="text-xs font-bold" style={{ color: C.muted }}>だれかの黒歴史</p>
                </div>

                {/* 本文 */}
                <p className="leading-loose text-sm font-medium tracking-wide whitespace-pre-wrap" style={{ color: C.text }}>
                  {content}
                </p>
              </div>

              {/* 折り目の線（折り畳まれた便箋っぽく） */}
              <div
                className="absolute left-0 right-0"
                style={{ bottom: '33%', height: '1px', backgroundColor: 'rgba(0,0,0,0.04)' }}
              />
            </div>

            <div className="mx-6 border-t border-dashed" style={{ borderColor: C.border }} />

            <div className="px-6 py-4 flex flex-col gap-4">
              <ShareButtons content={content} />
              {showReactions && (
                <ReactionBar
                  initialReaction={initialReaction}
                  initialComment={initialComment}
                  onSave={onReactionSave ?? (() => {})}
                />
              )}
              {readOnly && initialReaction && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ backgroundColor: C.surface2 }}>
                  <span className="text-xl">{initialReaction}</span>
                  {initialComment && (
                    <span className="text-xs" style={{ color: C.text }}>{initialComment}</span>
                  )}
                </div>
              )}
            </div>

            {/* 下端カラーライン + ページカール */}
            <div
              style={{
                height: '28px',
                position: 'relative',
                background: `linear-gradient(to right, ${colorDef.bg}, ${colorDef.dark}, ${colorDef.bg})`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '28px',
                  height: '28px',
                  background: `linear-gradient(225deg, ${colorDef.light} 45%, rgba(0,0,0,0.10) 45%, rgba(0,0,0,0.06) 55%, #fffef5 55%)`,
                  boxShadow: '-2px -2px 5px rgba(0,0,0,0.10)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
