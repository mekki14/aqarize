"use client";

import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
} from "@/components/ui/menu";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function ProviderNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur px-6 shrink-0">
      <span className="text-sm font-bold text-muted-foreground/60 select-none">
        لوحة مزود الخدمة
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          title="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
            2
          </span>
        </Button>

        <Menu>
          <MenuTrigger className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-tight">{user?.name || "مستخدم"}</p>
                <p className="text-xs text-muted-foreground leading-tight truncate max-w-[140px]">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </MenuTrigger>
          <MenuPopup align="end" className="w-48">
            <MenuItem onClick={() => router.push("/provider/profile")}>
              <Settings className="h-4 w-4" />
              الملف الشخصي
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              variant="destructive"
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </MenuItem>
          </MenuPopup>
        </Menu>
      </div>
    </header>
  );
}
