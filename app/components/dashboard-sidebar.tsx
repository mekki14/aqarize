"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Building2, Heart, Settings, LogOut, Briefcase } from "lucide-react";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard", icon: Home, label: "الرئيسية" },
  { href: "/dashboard/properties", icon: Building2, label: "عقاراتي" },
  { href: "/dashboard/saved", icon: Heart, label: "المحفوظات" },
  { href: "/dashboard/services", icon: Briefcase, label: "الخدمات" },
  { href: "/dashboard/settings", icon: Settings, label: "الإعدادات" },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[72px] bg-sidebar border-l border-sidebar-border flex-col items-center py-6 z-50 hidden md:flex">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">ع</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2 w-full px-3">
          {navItems.map((item) => {
            const isActive = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-3 w-full">
          <button
            onClick={() => signOut()}
            className="w-full aspect-square rounded-xl flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 z-50 md:hidden">
        {navItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0",
                isActive
                  ? "text-primary"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-sidebar-foreground hover:text-sidebar-accent-foreground transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] leading-tight">خروج</span>
        </button>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
