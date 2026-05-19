"use client";

import { usePathname } from "next/navigation";
import { useMapMode } from '@/app/lib/map-mode-context'

export default function Footer() {
  const pathname = usePathname();
  const { isMapMode } = useMapMode()
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/provider") || isMapMode) return null;

  return (
    <footer className="bg-white border-t border-zinc-200 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-zinc-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        © {new Date().getFullYear()} أقررايز. جميع الحقوق محفوظة.
        <a href="/join-service-provider" className="text-zinc-700 hover:text-zinc-900 font-medium">
          انضم كمزود خدمة
        </a>
      </div>
    </footer>
  );
}
