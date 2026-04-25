'use client'

import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { path: '/', label: '書く', emoji: '✍️' },
  { path: '/receive', label: '開く', emoji: '💌' },
  { path: '/history', label: 'きろく', emoji: '📚' },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 nav-safe">
      <div
        className="mx-4 mb-4 rounded-2xl px-2 py-1"
        style={{
          background: 'rgba(16, 12, 10, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center gap-0.5 px-6 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  background: isActive ? 'rgba(196,99,122,0.18)' : 'transparent',
                }}
              >
                <span className="text-xl leading-none">{item.emoji}</span>
                <span
                  className="text-xs font-bold tracking-wide transition-colors"
                  style={{ color: isActive ? '#c4637a' : 'rgba(255,255,255,0.45)' }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
