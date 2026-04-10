'use client'

import { useKioskFullscreen } from '@/hooks/useKioskFullscreen'

export function FullscreenGuard() {
  const { emFullscreen, entrarFullscreen } = useKioskFullscreen()

  if (emFullscreen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-secondary cursor-pointer"
      onClick={entrarFullscreen}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 text-center px-8 max-w-lg animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-white mb-4 font-display">Modo Quiosque</h1>
        <p className="text-xl text-gray-300 mb-10">Toque para ativar a tela cheia</p>
        <button className="bg-primary text-white text-2xl font-bold px-14 py-5 rounded-2xl shadow-2xl shadow-primary/40 hover:bg-primary-hover transition-colors active:scale-95">
          Ativar Tela Cheia
        </button>
      </div>
    </div>
  )
}
