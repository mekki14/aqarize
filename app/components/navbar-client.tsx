"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useMapMode } from '@/app/lib/map-mode-context'
import { signOut } from "@/lib/auth-client"
import { usePathname, useRouter } from "next/navigation"

interface UserSession {
  user: {
    id: string
    name: string
    email: string
    role?: string | null
  }
}

export default function NavbarClient({ session }: { session: UserSession | null }) {
  const { isMapMode } = useMapMode()
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  if (isMapMode || pathname.startsWith("/dashboard") || pathname.startsWith("/provider")) return null

  return (
    <header className="fixed top-0 z-[70] w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl">
          عقاري
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                لوحة التحكم
              </Link>

              <Button size="sm" variant="outline" onClick={handleSignOut}>
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                تسجيل الدخول
              </Link>
              <Button size="sm">
                <Link href="/register">
                  سجل الآن
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
