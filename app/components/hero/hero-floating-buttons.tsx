'use client'

import { createPortal } from 'react-dom'
import { ArrowLeft, LogIn, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeroFloatingButtonsProps {
  isDrawerOpen: boolean
  onGoBack: () => void
  session: any
}

export function HeroFloatingButtons({ isDrawerOpen, onGoBack, session }: HeroFloatingButtonsProps) {
  const router = useRouter()

  if (!isDrawerOpen) return null

  return createPortal(
    <div
      className="fixed top-4 left-4 right-4 z-[60] flex items-center justify-end gap-3"
      style={{ pointerEvents: 'auto' }}
    >
      <button
        onClick={onGoBack}
        className="h-11 px-4 rounded-full bg-background/90 backdrop-blur-xl border border-border/40 shadow-lg flex items-center gap-2 hover:bg-background transition-all"
      >
        <ArrowLeft className="size-4" />
        <span className="text-sm font-medium">رجوع</span>
      </button>

      {session ? (
        <button
          onClick={() => router.push('/dashboard')}
          className="h-11 px-4 rounded-full bg-primary/90 backdrop-blur-xl text-primary-foreground shadow-lg flex items-center gap-2 hover:bg-primary transition-all"
        >
          <LayoutDashboard className="size-4" />
          <span className="text-sm font-medium">لوحة التحكم</span>
        </button>
      ) : (
        <button
          onClick={() => router.push('/login')}
          className="h-11 px-4 rounded-full bg-background/90 backdrop-blur-xl border border-border/40 shadow-lg flex items-center gap-2 hover:bg-background transition-all"
        >
          <LogIn className="size-4" />
          <span className="text-sm font-medium">تسجيل الدخول</span>
        </button>
      )}
    </div>,
    document.body
  )
}
