'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

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

// [left, w, h, c1, c2, dur, delay, blur]
const FLAMES = [
  ['5%',  60, 82,  '#c03200', '#7a1600', 1.05, 0.00, 6],
  ['60%', 54, 74,  '#b52e00', '#721200', 0.98, 0.32, 6],
  ['13%', 56, 112, '#ff5200', '#cc2000', 0.78, 0.11, 4],
  ['46%', 62, 126, '#ff6400', '#dd3000', 0.70, 0.24, 4],
  ['68%', 48, 96,  '#ff4800', '#bb1e00', 0.86, 0.16, 5],
  ['23%', 52, 130, '#ffaa00', '#ff5200', 0.65, 0.06, 3],
  ['52%', 66, 145, '#ffba00', '#ff6600', 0.58, 0.13, 3],
  ['37%', 48, 118, '#ffa200', '#ff4200', 0.72, 0.19, 4],
  ['31%', 42, 132, '#ffcc00', '#ffaa00', 0.60, 0.09, 2],
  ['46%', 36, 110, '#ffdd44', '#ffcc00', 0.52, 0.04, 2],
  ['41%', 24, 90,  '#fff8d0', '#ffee80', 0.46, 0.07, 1],
  ['49%', 18, 74,  '#ffffff', '#fff5b0', 0.42, 0.02, 1],
] as const

export default function Background() {
  const stars = useMemo(() =>
    Array.from({ length: 85 }, (_, i) => ({
      top: `${1 + (i * 7 + i % 11) % 62}%`,
      left: `${(i * 17 + 3) % 100}%`,
      size: i % 9 === 0 ? 3 : i % 5 === 0 ? 2 : 1.5,
      dur: 2 + (i % 5) * 0.7,
      delay: i * 0.09,
      baseOpacity: 0.25 + (i % 5) * 0.13,
      warm: i % 12 === 0,
    }))
  , [])

  const embers = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      x: (i % 2 === 0 ? 1 : -1) * (10 + i * 13),
      delay: i * 0.42,
      size: 1.5 + (i % 3) * 0.9,
      dur: 2.4 + (i % 4) * 0.55,
    }))
  , [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>

      {/* 夜空グラデーション */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #020c1a 0%, #061524 30%, #0a1e2a 55%, #0c200e 78%, #060c06 100%)',
      }} />

      {/* 星 */}
      {stars.map((s, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [s.baseOpacity, s.baseOpacity + 0.45, s.baseOpacity] }}
          transition={{ repeat: Infinity, duration: s.dur, delay: s.delay }}
          style={{
            position: 'absolute',
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            borderRadius: '50%',
            backgroundColor: s.warm ? '#ffd88a' : '#ffffff',
          }}
        />
      ))}

      {/* 月 */}
      <div style={{
        position: 'absolute', top: '7%', right: '10%',
        width: 32, height: 32, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #fffbe8, #f0e090)',
        boxShadow: '0 0 18px rgba(255,240,150,0.28), 0 0 44px rgba(255,230,100,0.10)',
      }} />

      {/* 森シルエット – 後列（薄め） */}
      <svg viewBox="0 0 1000 260" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px' }}>
        <path
          d="M0,260 L0,170 L15,170 L15,130 L35,80 L55,130 L55,120 L75,70 L95,120 L95,110
             L115,58 L135,110 L135,100 L155,52 L175,100 L175,90 L195,48 L215,90 L215,150
             L235,150 L235,98 L255,50 L275,98 L275,88 L295,44 L315,88 L315,78 L335,38 L355,78
             L355,68 L375,32 L395,68 L395,120 L415,120 L415,72 L435,34 L455,72 L455,62 L475,26
             L495,62 L495,52 L515,22 L535,52 L535,62 L555,26 L575,62 L575,72 L595,36 L615,72
             L615,82 L635,44 L655,82 L655,72 L675,34 L695,72 L695,82 L715,46 L735,82 L735,92
             L755,54 L775,92 L775,102 L795,60 L815,102 L815,112 L835,68 L855,112 L855,122
             L875,76 L895,122 L895,132 L915,85 L935,132 L935,142 L955,104 L975,142 L975,170
             L1000,170 L1000,260 Z"
          fill="#061006"
        />
      </svg>

      {/* 森シルエット – 前列（濃い） */}
      <svg viewBox="0 0 1000 180" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '150px' }}>
        <path
          d="M0,180 L0,120 L20,120 L20,92 L40,55 L60,92 L80,82 L100,46 L120,82 L140,72
             L160,38 L180,72 L200,120 L220,120 L240,88 L260,50 L280,88 L300,78 L320,44 L340,78
             L360,120 L380,120 L400,85 L420,48 L440,85 L460,74 L480,40 L500,74 L520,84 L540,48
             L560,84 L580,120 L600,120 L620,88 L640,52 L660,88 L680,78 L700,44 L720,78 L740,120
             L760,120 L780,88 L800,54 L820,88 L840,78 L860,46 L880,78 L900,120 L920,120 L940,92
             L960,120 L1000,120 L1000,180 Z"
          fill="#020802"
        />
      </svg>

      {/* ── 大きな焚き火 ── */}

      {/* 地面グロー */}
      <motion.div
        animate={{ opacity: [0.55, 0.92, 0.58, 0.96, 0.55], scale: [1, 1.22, 0.94, 1.18, 1] }}
        transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '48px',
          left: '50%',
          marginLeft: '-170px',
          width: 340, height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,120,20,0.88), rgba(220,70,5,0.48), transparent)',
          filter: 'blur(22px)',
        }}
      />

      {/* 炎コンテナ */}
      <div style={{
        position: 'absolute',
        bottom: '64px',
        left: '50%',
        marginLeft: '-160px',
        width: 320, height: 200,
      }}>
        {FLAMES.map(([left, w, h, c1, c2, dur, delay, blur], i) => (
          <Flame key={i}
            left={left as string} w={w as number} h={h as number}
            c1={c1 as string} c2={c2 as string}
            dur={dur as number} delay={delay as number} blur={blur as number}
          />
        ))}
      </div>

      {/* 丸太 */}
      <div style={{ position: 'absolute', bottom: '60px', left: '50%' }}>
        <div style={{
          position: 'absolute', width: 148, height: 20, backgroundColor: '#5c3a18',
          borderRadius: 10, transform: 'rotate(-9deg)', top: 0, left: -74,
          boxShadow: '0 4px 14px rgba(0,0,0,0.85)',
        }} />
        <div style={{
          position: 'absolute', width: 122, height: 20, backgroundColor: '#4a2e10',
          borderRadius: 10, transform: 'rotate(12deg)', top: 7, left: -48,
          boxShadow: '0 4px 14px rgba(0,0,0,0.85)',
        }} />
        <div style={{
          position: 'absolute', width: 148, height: 20,
          transform: 'rotate(-9deg)', top: 0, left: -74,
          borderRadius: 10, overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
          <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        </div>
      </div>

      {/* 火の粉 */}
      {embers.map((e, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            bottom: '88px',
            left: `calc(50% + ${e.x}px)`,
            width: e.size, height: e.size,
            borderRadius: '50%',
            backgroundColor: `hsl(${25 + (i % 4) * 12}, 100%, 65%)`,
            boxShadow: `0 0 ${e.size * 3}px hsl(${25 + (i % 4) * 12}, 100%, 55%)`,
          }}
          animate={{
            opacity: [0, 0.9, 0.6, 0.2, 0],
            y: [0, -(130 + Math.abs(e.x) * 0.85)],
            x: [0, e.x * 0.28],
          }}
          transition={{ repeat: Infinity, duration: e.dur, delay: e.delay, ease: 'easeOut' }}
        />
      ))}

      {/* 画面全体への暖かい揺らぎ光 */}
      <motion.div
        animate={{ opacity: [0.06, 0.13, 0.07, 0.15, 0.06] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 96%, rgba(255,110,10,0.72) 0%, rgba(200,70,5,0.32) 28%, rgba(150,50,5,0.10) 50%, transparent 68%)',
        }}
      />

    </div>
  )
}
