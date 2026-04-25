'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ENVELOPE_COLORS } from '@/lib/types'
import { playCrackle, playIgnite } from '@/lib/sounds'

type Phase = 'falling' | 'touching' | 'burning' | 'particles' | 'done'

interface Props {
  envelopeColor: string
  onComplete: () => void
}

function Flame({ left, w, h, c1, c2, dur, delay, blur = 4 }: {
  left: string; w: number; h: number
  c1: string; c2: string; dur: number; delay: number; blur?: number
}) {
  return (
    <motion.div
      style={{
        position: 'absolute', bottom: 0, left,
        width: w, height: h,
        background: `radial-gradient(ellipse at 48% 88%, ${c1} 0%, ${c2} 55%, transparent 100%)`,
        borderRadius: '48% 52% 20% 20% / 62% 62% 38% 38%',
        transformOrigin: '50% 100%',
        filter: `blur(${blur}px)`,
      }}
      animate={{
        scaleY: [1, 1.32, 0.78, 1.25, 0.88, 1.18, 1],
        scaleX: [1, 0.72, 1.22, 0.80, 1.15, 0.85, 1],
        rotate: [0, -6, 8, -4, 5, -2, 0],
        opacity: [0.9, 1, 0.85, 1, 0.88, 0.95, 0.9],
      }}
      transition={{ repeat: Infinity, duration: dur, ease: 'easeInOut', delay }}
    />
  )
}

function Smoke({ left, delay }: { left: string; delay: number }) {
  return (
    <motion.div
      style={{
        position: 'absolute', bottom: 0, left,
        width: 36, height: 80,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(160,140,130,0.22), transparent)',
        filter: 'blur(10px)',
        pointerEvents: 'none',
      }}
      animate={{
        y: [0, -180],
        x: [0, 18, -12, 22, -8, 0],
        opacity: [0, 0.5, 0.35, 0.2, 0],
        scale: [0.4, 1.2, 1.8, 2.4],
      }}
      transition={{ repeat: Infinity, duration: 3.5 + delay, delay, ease: 'easeOut' }}
    />
  )
}

function Ember({ x, delay, size, bottom = 155 }: { x: number; delay: number; size: number; bottom?: number }) {
  const hue = 25 + (Math.abs(x) % 3) * 15
  return (
    <motion.div
      style={{
        position: 'absolute', bottom, left: `calc(50% + ${x}px)`,
        width: size, height: size, borderRadius: '50%',
        backgroundColor: `hsl(${hue}, 100%, 68%)`,
        boxShadow: `0 0 ${size * 2}px hsl(${hue}, 100%, 60%)`,
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0.9, y: 0, x: 0 }}
      animate={{
        opacity: [0.9, 0.8, 0.4, 0],
        y: [0, -(90 + Math.abs(x) * 0.9)],
        x: [0, x * 0.35],
      }}
      transition={{ duration: 1.1 + delay * 0.25, delay, ease: 'easeOut' }}
    />
  )
}

// 手紙が爆発する際の火粒子
function BurnParticle({ angle, dist, size, color }: {
  angle: number; dist: number; size: number; color: string
}) {
  const rad = (angle * Math.PI) / 180
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: size, height: size, borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 ${size * 2.5}px ${color}`,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        pointerEvents: 'none',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(rad) * dist,
        y: Math.sin(rad) * dist,
        opacity: [1, 0.85, 0],
        scale: [1, 0.7, 0.15],
      }}
      transition={{ duration: 0.6, ease: [0.1, 0.7, 0.3, 1] }}
    />
  )
}

const FIRE_H = 310

const FLAME_CFG = [
  ['4%',  58, 72,  '#c03200', '#7a1600', 1.05, 0.00, 6],
  ['62%', 52, 65,  '#b52e00', '#721200', 0.98, 0.32, 6],
  ['13%', 54, 104, '#ff5200', '#cc2000', 0.78, 0.11, 4],
  ['48%', 60, 118, '#ff6400', '#dd3000', 0.70, 0.24, 4],
  ['70%', 46, 90,  '#ff4800', '#bb1e00', 0.86, 0.16, 5],
  ['23%', 50, 122, '#ffaa00', '#ff5200', 0.65, 0.06, 3],
  ['53%', 64, 136, '#ffba00', '#ff6600', 0.58, 0.13, 3],
  ['38%', 46, 112, '#ffa200', '#ff4200', 0.72, 0.19, 4],
  ['31%', 40, 125, '#ffcc00', '#ffaa00', 0.60, 0.09, 2],
  ['46%', 34, 104, '#ffdd44', '#ffcc00', 0.52, 0.04, 2],
  ['41%', 22, 85,  '#fff8d0', '#ffee80', 0.46, 0.07, 1],
  ['49%', 18, 70,  '#ffffff', '#fff5b0', 0.42, 0.02, 1],
] as const

export default function BonfireAnimation({ envelopeColor, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('falling')
  const [screenH, setScreenH] = useState(800)
  const colorDef = ENVELOPE_COLORS.find(c => c.id === envelopeColor) ?? ENVELOPE_COLORS[0]

  useEffect(() => { setScreenH(window.innerHeight) }, [])

  const embers = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      x: (i % 2 === 0 ? 1 : -1) * (10 + i * 9),
      delay: i * 0.055,
      size: 2 + (i % 4),
    }))
  , [])

  const extraEmbers = useMemo(() =>
    Array.from({ length: 36 }, (_, i) => ({
      x: (i % 2 === 0 ? 1 : -1) * (5 + i * 7),
      delay: i * 0.038,
      size: 2 + (i % 5),
      bottom: 145 + (i % 5) * 12,
    }))
  , [])

  const burnParticles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      angle: (i / 24) * 360 + i * 6,
      dist: 28 + (i % 6) * 18,
      size: 3 + (i % 4),
      color: ['#ffcc00', '#ff9900', '#ff5500', '#ffaa00', '#ff7700', '#ffdd44'][i % 6],
    }))
  , [])

  const smokePositions = useMemo(() =>
    ['30%', '45%', '55%', '68%'].map((left, i) => ({ left, delay: i * 0.6 }))
  , [])

  // falling(0) → touching(1.7) → burning(2.1) → particles(3.1) → done(3.6) → navigate(5.5)
  useEffect(() => {
    playCrackle()
    const t1 = setTimeout(() => { setPhase('touching'); playIgnite() }, 1700)
    const t2 = setTimeout(() => setPhase('burning'), 2100)
    const t3 = setTimeout(() => { setPhase('particles'); playCrackle() }, 3100)
    const t4 = setTimeout(() => setPhase('done'), 3600)
    const t5 = setTimeout(onComplete, 5500)
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [onComplete])

  const touchY = screenH - 270
  const burnY  = screenH - 220

  const letterY =
    phase === 'falling' ? touchY :
    phase === 'touching' ? touchY + 12 :
    burnY

  const letterRotate =
    phase === 'falling' ? 15 :
    phase === 'touching' ? 17 :
    phase === 'burning' ? 26 : 32

  const letterScale =
    phase === 'burning' ? 0.88 :
    phase === 'particles' ? 0.05 : 1

  const letterOpacity = phase === 'particles' ? 0 : 1

  const letterFilter =
    phase === 'touching' ? 'brightness(2.8)' :
    phase === 'burning' ? 'brightness(0.6)' :
    phase === 'particles' ? 'brightness(4)' :
    'brightness(1)'

  const letterTransition =
    phase === 'falling'   ? { duration: 1.6, ease: [0.18, 0, 0.88, 1] as const } :
    phase === 'touching'  ? { duration: 0.25, ease: 'easeOut' as const } :
    phase === 'burning'   ? { duration: 1.0, ease: [0.5, 0, 1, 0.8] as const } :
    { duration: 0.28, ease: [0.8, 0, 1, 1] as const }

  const fireScale = (phase === 'burning' || phase === 'particles') ? 1.45 : phase === 'touching' ? 1.18 : 1

  const showGlow     = phase === 'touching'
  const showScorch   = phase === 'touching' || phase === 'burning' || phase === 'particles'
  const showCharEdge = phase === 'burning'  || phase === 'particles'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'linear-gradient(to bottom, #020a14 0%, #050f20 35%, #081a20 60%, #0a1a0e 80%, #060c06 100%)',
        overflow: 'hidden',
      }}
    >
      {/* 星 */}
      {[...Array(32)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.15 + (i % 5) * 0.09, 0.55 + (i % 4) * 0.1, 0.15 + (i % 5) * 0.09] }}
          transition={{ repeat: Infinity, duration: 2 + (i % 5) * 0.6, delay: i * 0.13 }}
          style={{
            position: 'absolute',
            width: i % 7 === 0 ? 3 : 2, height: i % 7 === 0 ? 3 : 2,
            borderRadius: '50%', backgroundColor: 'white',
            top: `${2 + (i * 11) % 65}%`,
            left: `${(i * 23 + 5) % 100}%`,
          }}
        />
      ))}

      {/* 森のシルエット – 後列 */}
      <svg viewBox="0 0 1000 260" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '180px', zIndex: 1 }}>
        <path d="M0,260 L0,170 L15,170 L15,130 L35,80 L55,130 L55,120 L75,70 L95,120 L95,110 L115,58 L135,110 L135,100 L155,52 L175,100 L175,90 L195,48 L215,90 L215,150 L235,150 L235,98 L255,50 L275,98 L275,88 L295,44 L315,88 L315,78 L335,38 L355,78 L355,68 L375,32 L395,68 L395,120 L415,120 L415,72 L435,34 L455,72 L455,62 L475,26 L495,62 L495,52 L515,22 L535,52 L535,62 L555,26 L575,62 L575,72 L595,36 L615,72 L615,82 L635,44 L655,82 L655,72 L675,34 L695,72 L695,82 L715,46 L735,82 L735,92 L755,54 L775,92 L775,102 L795,60 L815,102 L815,112 L835,68 L855,112 L855,122 L875,76 L895,122 L895,132 L915,85 L935,132 L935,142 L955,104 L975,142 L975,170 L1000,170 L1000,260 Z" fill="#061006"/>
      </svg>

      {/* 森のシルエット – 前列 */}
      <svg viewBox="0 0 1000 180" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '130px', zIndex: 2 }}>
        <path d="M0,180 L0,120 L20,120 L20,92 L40,55 L60,92 L80,82 L100,46 L120,82 L140,72 L160,38 L180,72 L200,120 L220,120 L240,88 L260,50 L280,88 L300,78 L320,44 L340,78 L360,120 L380,120 L400,85 L420,48 L440,85 L460,74 L480,40 L500,74 L520,84 L540,48 L560,84 L580,120 L600,120 L620,88 L640,52 L660,88 L680,78 L700,44 L720,78 L740,120 L760,120 L780,88 L800,54 L820,88 L840,78 L860,46 L880,78 L900,120 L920,120 L940,92 L960,120 L1000,120 L1000,180 Z" fill="#020802"/>
      </svg>

      {/* ── 手紙 ── */}
      <AnimatePresence>
      {phase !== 'done' && (
      <motion.div
        key="letter"
        initial={{ y: -160, rotate: -10, opacity: 1, scale: 1, filter: 'brightness(1)' }}
        animate={{
          y: letterY,
          rotate: letterRotate,
          opacity: letterOpacity,
          scale: letterScale,
          filter: letterFilter,
        }}
        exit={{ opacity: 0, transition: { duration: 0 } }}
        transition={letterTransition}
        style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -75, width: 150, zIndex: 20 }}
      >
        <div style={{ position: 'relative' }}>
          {/* 封筒本体 (WritePage のカラーピッカーと同じデザイン、150×104px にスケールアップ) */}
          <div style={{
            position: 'relative',
            width: 150,
            height: 104,
            backgroundColor: colorDef.bg,
            border: `2px solid ${colorDef.dark}`,
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.75), 0 4px 12px rgba(0,0,0,0.5)',
          }}>
            {/* 下フラップ */}
            <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 100%, 50% 46%, 100% 100%)', backgroundColor: colorDef.dark, opacity: 0.72 }} />
            {/* 左フラップ */}
            <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 50% 50%, 0 100%)', backgroundColor: colorDef.dark, opacity: 0.42 }} />
            {/* 右フラップ */}
            <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)', backgroundColor: colorDef.dark, opacity: 0.42 }} />
            {/* 上フラップ */}
            <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 100% 0, 50% 54%)', backgroundColor: colorDef.bg, filter: 'brightness(1.06)' }} />
            {/* 封印シール */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 35, height: 35,
              backgroundColor: colorDef.dark,
              borderRadius: '48% 52% 55% 45% / 46% 54% 48% 52%',
              boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.4)',
              zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              {colorDef.emoji}
            </div>
          </div>

          {/* オーバーレイ: 炎グロー（触れた瞬間の閃光） */}
          <AnimatePresence>
            {showGlow && (
              <motion.div
                key="glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.75, 0.35] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute', inset: -4, borderRadius: 7,
                  background: 'radial-gradient(ellipse at 50% 80%, rgba(255,175,30,1) 0%, rgba(255,100,0,0.9) 30%, rgba(200,50,0,0.45) 58%, transparent 78%)',
                  mixBlendMode: 'screen',
                  pointerEvents: 'none', zIndex: 10,
                }}
              />
            )}
          </AnimatePresence>

          {/* オーバーレイ: 焦げ（エッジから内側へ） */}
          <AnimatePresence>
            {showScorch && (
              <motion.div
                key="scorch"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'touching' ? 0.3 : 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: phase === 'touching' ? 0.2 : 1.1 }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: 3,
                  background: 'radial-gradient(ellipse at 50% 55%, transparent 8%, rgba(120,30,0,0.55) 44%, rgba(40,8,0,0.88) 68%, rgba(8,2,0,0.97) 100%)',
                  pointerEvents: 'none', zIndex: 8,
                }}
              />
            )}
          </AnimatePresence>

          {/* オーバーレイ: 四隅の炭化 */}
          <AnimatePresence>
            {showCharEdge && (
              <motion.div
                key="char-edge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75 }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: 3,
                  background: [
                    'radial-gradient(circle at 2% 2%, rgba(8,2,0,0.96) 0%, transparent 40%)',
                    'radial-gradient(circle at 98% 2%, rgba(8,2,0,0.93) 0%, transparent 40%)',
                    'radial-gradient(circle at 2% 98%, rgba(8,2,0,0.94) 0%, transparent 40%)',
                    'radial-gradient(circle at 98% 98%, rgba(8,2,0,0.96) 0%, transparent 40%)',
                  ].join(', '),
                  pointerEvents: 'none', zIndex: 9,
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      )}
      </AnimatePresence>

      {/* ── 燃焼パーティクル ── */}
      <AnimatePresence>
        {phase === 'particles' && (
          <motion.div
            key="burst"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: burnY + 52,
              left: '50%', marginLeft: -75,
              width: 150, height: 100,
              zIndex: 30, pointerEvents: 'none',
            }}
          >
            {burnParticles.map((p, i) => (
              <BurnParticle key={i} angle={p.angle} dist={p.dist} size={p.size} color={p.color} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 完了画面 ── */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              position: 'absolute', top: '18%', left: 0, right: 0,
              textAlign: 'center', zIndex: 50, padding: '0 24px',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.9, ease: 'easeInOut' }}
              style={{ fontSize: 62, lineHeight: 1 }}
            >
              🔥
            </motion.div>
            <p style={{
              fontSize: 21, fontWeight: 800, color: '#fff',
              margin: '16px 0 0',
              textShadow: '0 0 28px rgba(255,130,30,0.8)',
            }}>
              黒歴史を燃やした！
            </p>
            <motion.div
              initial={{ y: 40, opacity: 0, filter: 'grayscale(1) brightness(0.5)' }}
              animate={{ y: -10, opacity: 1, filter: 'grayscale(1) brightness(0.6)' }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.34, 1.2, 0.64, 1] }}
              style={{ marginTop: 22, display: 'inline-block', position: 'relative' }}
            >
              <div style={{
                width: 130, backgroundColor: '#888', borderRadius: 10,
                padding: '10px 14px', opacity: 0.6,
                boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
                margin: '0 auto',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#555' }} />
                  <div style={{ height: 5, width: 50, backgroundColor: '#666', borderRadius: 3 }} />
                </div>
                <div style={{ height: 5, backgroundColor: '#666', borderRadius: 3, marginBottom: 5 }} />
                <div style={{ height: 5, backgroundColor: '#5a5a5a', borderRadius: 3, marginBottom: 5 }} />
                <div style={{ height: 5, backgroundColor: '#555', borderRadius: 3, width: '55%' }} />
              </div>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -(20 + i * 8)], x: [(i % 2 === 0 ? 1 : -1) * i * 5, 0], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 + i * 0.3, delay: i * 0.2 }}
                  style={{
                    position: 'absolute',
                    top: `${20 + (i % 3) * 15}%`,
                    left: `${10 + i * 14}%`,
                    width: 4, height: 4, borderRadius: '50%',
                    backgroundColor: '#aaa',
                  }}
                />
              ))}
            </motion.div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 14, lineHeight: 1.7 }}>
              灰になって、どこかへ旅立ちます…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 焚き火シーン ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: FIRE_H }}>

        {/* 地面の発光（燃焼時に強化） */}
        <motion.div
          animate={{
            opacity: (phase === 'burning' || phase === 'particles') ? [0.6, 1.0, 0.65] : [0.3, 0.75, 0.3],
            scale:   (phase === 'burning' || phase === 'particles') ? [1.1, 1.38, 1.1] : [1, 1.18, 1],
          }}
          transition={{ repeat: Infinity, duration: 1.15, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: 112, left: '50%',
            marginLeft: '-130px',
            width: 260, height: 80, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,100,0,0.45), rgba(200,50,0,0.2), transparent)',
            filter: 'blur(22px)',
          }}
        />

        {/* 炎 */}
        <motion.div
          animate={{ scale: fireScale }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute', bottom: 126, left: '50%',
            marginLeft: '-100px',
            width: 200, height: 175,
          }}
        >
          {FLAME_CFG.map(([left, w, h, c1, c2, dur, delay, blur], i) => (
            <Flame
              key={i}
              left={left as string} w={w as number} h={h as number}
              c1={c1 as string} c2={c2 as string}
              dur={dur as number} delay={delay as number} blur={blur as number}
            />
          ))}
        </motion.div>

        {/* 煙 */}
        <div style={{ position: 'absolute', bottom: 225, left: '50%', transform: 'translateX(-50%)', width: 200 }}>
          {smokePositions.map((s, i) => (
            <Smoke key={i} left={s.left} delay={s.delay} />
          ))}
        </div>

        {/* 通常の火の粉 */}
        {phase === 'burning' && embers.map((e, i) => (
          <Ember key={i} x={e.x} delay={e.delay} size={e.size} />
        ))}

        {/* 強化された火の粉（燃焼爆発後） */}
        {(phase === 'particles' || phase === 'done') && extraEmbers.map((e, i) => (
          <Ember key={i} x={e.x} delay={e.delay} size={e.size} bottom={e.bottom} />
        ))}

        {/* 丸太 */}
        <div style={{ position: 'absolute', bottom: 120, left: '50%' }}>
          <div style={{
            position: 'absolute', width: 148, height: 21, backgroundColor: '#5c3a18',
            borderRadius: 10, transform: 'rotate(-9deg)', top: 0, left: -74,
            boxShadow: '0 4px 14px rgba(0,0,0,0.75)',
          }} />
          <div style={{
            position: 'absolute', width: 122, height: 21, backgroundColor: '#4a2e10',
            borderRadius: 10, transform: 'rotate(12deg)', top: 7, left: -48,
            boxShadow: '0 4px 14px rgba(0,0,0,0.75)',
          }} />
          <div style={{
            position: 'absolute', width: 148, height: 21,
            transform: 'rotate(-9deg)', top: 0, left: -74,
            borderRadius: 10, overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
            <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.15)' }} />
          </div>
        </div>

        {/* 地面 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 115,
          background: 'linear-gradient(to top, #020802 60%, transparent)',
        }} />
      </div>
    </motion.div>
  )
}
