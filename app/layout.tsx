import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import Background from '@/components/Background'
import WarmOverlay from '@/components/WarmOverlay'
import AmbientSound from '@/components/AmbientSound'

export const metadata: Metadata = {
  title: '黒歴史交換',
  description: '中高生・大学生のための匿名黒歴史交換アプリ。あなたの恥ずかしい過去を手紙に込めて送ろう！',
  themeColor: '#0a180e',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Background />
        <WarmOverlay />
        <main style={{ position: 'relative', zIndex: 10, minHeight: '100dvh' }}>
          <div className="max-w-md mx-auto px-4 pt-8 pb-32">
            {children}
          </div>
        </main>
        <Navigation />
        <AmbientSound />
      </body>
    </html>
  )
}
