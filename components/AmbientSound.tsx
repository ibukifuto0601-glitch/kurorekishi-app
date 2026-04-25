'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { startAmbient, setAmbientVolume } from '@/lib/sounds'

export default function AmbientSound() {
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const stopRef = useRef<() => void>()
  const startedRef = useRef(false)

  useEffect(() => {
    const start = () => {
      if (startedRef.current) return
      startedRef.current = true
      stopRef.current = startAmbient()
      setStarted(true)
    }
    document.addEventListener('click', start, { once: true })
    document.addEventListener('touchstart', start, { once: true })
    return () => {
      document.removeEventListener('click', start)
      document.removeEventListener('touchstart', start)
      stopRef.current?.()
    }
  }, [])

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !muted
    setMuted(next)
    setAmbientVolume(next ? 0 : 1)
  }

  return (
    <AnimatePresence>
      {started && (
        <motion.button
          key="ambient-btn"
          onClick={toggle}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.3 }}
          title={muted ? '環境音をオンにする' : '環境音をオフにする'}
          style={{
            position: 'fixed',
            top: '14px',
            right: '14px',
            zIndex: 25,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(6,12,22,0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
