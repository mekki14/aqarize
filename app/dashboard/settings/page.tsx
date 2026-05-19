"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">الإعدادات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة حسابك وإعداداتك الشخصية
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card rounded-2xl border border-border/40 p-6 space-y-4">
          <h2 className="font-semibold text-lg">الملف الشخصي</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" name="name" defaultValue="مستخدم" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" defaultValue="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+213 XXX XX XX XX" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="h-10">
                {saved ? "تم الحفظ ✓" : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-card rounded-2xl border border-border/40 p-6 space-y-4">
          <h2 className="font-semibold text-lg">الإشعارات</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-border" />
              <span className="text-sm">إشعارات الرسائل الجديدة</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-border" />
              <span className="text-sm">إشعارات العقارات المحفوظة</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded-sm border-border" />
              <span className="text-sm">النشرة البريدية الأسبوعية</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
