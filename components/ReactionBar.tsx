'use client'

import { useState } from 'react'
import { C } from '@/lib/tokens'

const REACTIONS = [
  { emoji: '😂', label: '草' },
  { emoji: '🤝', label: 'わかる' },
  { emoji: '😱', label: 'やばい' },
  { emoji: '🥺', label: 'かわいい' },
  { emoji: '👏', label: 'えらい' },
  { emoji: '🔥', label: 'それな' },
]

interface ReactionBarProps {
  initialReaction?: string
  initialComment?: string
  onSave: (reaction: string, comment: string) => void
}

export default function ReactionBar({ initialReaction, initialComment, onSave }: ReactionBarProps) {
  const [selectedReaction, setSelectedReaction] = useState(initialReaction ?? '')
  const [comment, setComment] = useState(initialComment ?? '')
  const [locked, setLocked] = useState(!!initialReaction)

  const handleSelect = (emoji: string) => {
    if (locked) return
    setSelectedReaction((prev) => (prev === emoji ? '' : emoji))
  }

  const handleSave = () => {
    if (locked) return
    onSave(selectedReaction, comment)
    setLocked(true)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-center gap-2">
        <p
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: C.muted }}
        >
          ひとことツッコミ
        </p>
        {locked && (
          <span
            className="text-xs font-bold"
            style={{ color: '#5a9e6f' }}
          >
            ✅ 送ったよ！
          </span>
        )}
      </div>

      {/* Reaction buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {REACTIONS.map((r) => {
          const isSelected = selectedReaction === r.emoji
          return (
            <button
              key={r.emoji}
              onClick={() => handleSelect(r.emoji)}
              disabled={locked}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150"
              style={{
                border: isSelected
                  ? `1.5px solid ${C.primary}`
                  : `1.5px solid ${C.border}`,
                backgroundColor: isSelected ? C.primaryLight : '#fff',
                transform: isSelected && !locked ? 'scale(1.08)' : 'scale(1)',
                opacity: locked && !isSelected ? 0.35 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
              }}
            >
              <span className="text-xl leading-none">{r.emoji}</span>
              <span
                className="text-xs font-medium"
                style={{ color: isSelected ? C.primaryDark : C.muted }}
              >
                {r.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Comment + send */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={comment}
          onChange={(e) => { if (!locked) setComment(e.target.value) }}
          placeholder={locked ? 'もう送ったよ' : 'ひとことツッコんでみて（なくてもOK）'}
          maxLength={50}
          disabled={locked}
          className="flex-1 px-3 py-2 text-sm rounded-xl transition-colors"
          style={{
            border: `1.5px solid ${C.border}`,
            backgroundColor: locked ? C.surface2 : '#fff',
            color: locked ? C.muted : C.text,
            cursor: locked ? 'not-allowed' : 'text',
          }}
        />
        <button
          onClick={handleSave}
          disabled={locked}
          className="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{
            backgroundColor: locked ? C.surface2 : C.primary,
            color: locked ? C.muted : '#fff',
            cursor: locked ? 'not-allowed' : 'pointer',
            boxShadow: locked ? 'none' : '0 2px 8px rgba(196,99,122,0.35)',
          }}
        >
          {locked ? '送ったよ' : '送る！'}
        </button>
      </div>
    </div>
  )
}
