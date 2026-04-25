'use client'

import { useState } from 'react'
import { C } from '@/lib/tokens'

interface ShareButtonsProps {
  content: string
}

export default function ShareButtons({ content }: ShareButtonsProps) {
  const [instaCopied, setInstaCopied] = useState(false)
  const [copied, setCopied] = useState(false)

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareText = `【黒歴史】${content}\n\n${siteUrl}\n#黒歴史 #あるある #黒歴史交換`

  const handleXShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleInstagramShare = async () => {
    try { await navigator.clipboard.writeText(shareText) } catch { /* ignore */ }
    setInstaCopied(true)
    setTimeout(() => setInstaCopied(false), 3000)
    window.open('instagram://app', '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shareText) } catch { /* ignore */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <p
        className="text-xs text-center font-semibold tracking-wide uppercase"
        style={{ color: C.muted }}
      >
        シェアしよ！
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={handleXShare}
          style={{ ...btnBase, backgroundColor: '#0f0f0f', color: '#fff' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <span style={{ fontWeight: 900, fontSize: '13px' }}>𝕏</span>
          ポスト
        </button>

        <button
          onClick={handleInstagramShare}
          style={{
            ...btnBase,
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            color: '#fff',
          }}
        >
          <span>📸</span>
          {instaCopied ? 'コピー済み！' : 'Instagram'}
        </button>

        <button
          onClick={handleCopy}
          style={{
            ...btnBase,
            backgroundColor: C.surface2,
            color: C.muted,
            border: `1.5px solid ${C.border}`,
          }}
        >
          <span>{copied ? '✅' : '📋'}</span>
          {copied ? 'コピーした！' : 'コピー'}
        </button>
      </div>

      {instaCopied && (
        <p
          className="text-xs text-center font-medium"
          style={{ color: C.primary }}
        >
          テキストをコピーしました！Instagramに貼り付けてね 📸
        </p>
      )}
    </div>
  )
}
