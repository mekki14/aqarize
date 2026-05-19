"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UpgradePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = new FormData(e.currentTarget);
        const body = {
            companyName: form.get("companyName"),
            phone: form.get("phone"),
            address: form.get("address"),
            kycDocument: form.get("kycDocument"),
        };

        try {
            const res = await fetch("/api/auth/upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "حدث خطأ");
                return;
            }

            router.push("/dashboard/properties/new");
            router.refresh();
        } catch {
            setError("حدث خطأ في الاتصال");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="mb-8">
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-4">
                    ← العودة إلى لوحة التحكم
                </Link>
                <h1 className="text-2xl font-bold mb-2">ترقية الحساب إلى بائع</h1>
                <p className="text-muted-foreground">
                    يجب ترقية حسابك إلى بائع لتتمكن من إضافة عقارات. يرجى تقديم المعلومات ووثيقة إثبات الهوية (KYC).
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="space-y-4 rounded-lg border border-border/40 p-6">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">اسم الشركة أو الوكالة (اختياري)</Label>
                        <Input id="companyName" name="companyName" placeholder="مثال: وكالة الأمل العقارية" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف *</Label>
                        <Input id="phone" name="phone" required placeholder="مثال: 0555555555" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">العنوان *</Label>
                        <Input id="address" name="address" required placeholder="الشارع، الحي..." />
                    </div>

                    <div className="space-y-2 mt-6">
                        <Label htmlFor="kycDocument">وثيقة إثبات الهوية (KYC) *</Label>
                        <p className="text-xs text-muted-foreground mb-2">يرجى إدخال رابط صورة بطاقة التعريف الوطنية أو جواز السفر.</p>
                        <Input id="kycDocument" name="kycDocument" required placeholder="https://example.com/id-document.jpg" type="url" />
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12">
                    {loading ? "جاري الترقية..." : "ترقية الحساب"}
                </Button>
            </form>
        </div>
    );
}
