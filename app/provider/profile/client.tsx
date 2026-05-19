"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Save, CheckCircle, Loader2, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  companyName: string;
  phone: string;
  address: string;
  serviceType: string;
  description: string;
}

interface Props {
  userName: string;
  userEmail: string;
  userImage: string | null;
  initialProfile: ProfileData | null;
}

const SERVICE_TYPES = ["تقييم", "تصوير", "تسويق", "قانوني", "استشارات", "تجهيز"];

export default function ProviderProfileClient({ userName, userEmail, userImage, initialProfile }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProfileData>(
    initialProfile || {
      companyName: "",
      phone: "",
      address: "",
      serviceType: SERVICE_TYPES[0],
      description: "",
    }
  );

  const handleChange = (field: keyof ProfileData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/services/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل الحفظ");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const initials = userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase() || "?";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">الملف الشخصي</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة بيانات شركتك ومعلومات التواصل</p>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
        <CardContent className="relative -mt-10 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar className="w-20 h-20 border-4 border-background">
              <AvatarImage src={userImage || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{userName}</h2>
              <p className="text-sm text-muted-foreground">{form.companyName || "لم يتم إدخال اسم الشركة"}</p>
            </div>
            {initialProfile && (
              <Badge variant="secondary" className="bg-success/10 text-success shrink-0">
                <CheckCircle className="w-3 h-3 ml-1" />
                مسجل
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معلومات الشركة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input id="companyName" value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="rounded-xl pr-10" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">نوع الخدمة</Label>
                <select id="serviceType" value={form.serviceType} onChange={(e) => handleChange("serviceType", e.target.value)} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                  {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={userEmail} className="rounded-xl pr-10 opacity-60" dir="ltr" readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} className="rounded-xl pr-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الشركة</Label>
                <Textarea id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} className="rounded-xl resize-none" />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} className="rounded-xl gap-2" disabled={saving || !form.companyName || !form.serviceType}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "تم الحفظ" : saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">نبذة سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{form.companyName || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>{form.serviceType || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span dir="ltr">{form.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{userEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{form.address || "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
