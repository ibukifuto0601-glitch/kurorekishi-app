'use client'

import { motion } from 'framer-motion'

export default function WarmOverlay() {
  return (
    <motion.div
      animate={{ opacity: [0.04, 0.10, 0.05, 0.12, 0.04] }}
      transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 15, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(255,140,20,0.92) 0%, rgba(230,90,10,0.48) 22%, rgba(180,60,5,0.18) 44%, transparent 62%)',
      }}
    />
  )
}
