"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogPopup, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, CheckCircle } from "lucide-react";

const CATEGORIES = ["تقييم", "تصوير", "تسويق", "قانوني", "استشارات", "تجهيز"];

interface AddOfferingFormProps {
  onSuccess?: () => void;
}

export default function AddOfferingForm({ onSuccess }: AddOfferingFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    description: "",
    priceMin: "",
    priceMax: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/services/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          priceMin: form.priceMin ? Number(form.priceMin) : null,
          priceMax: form.priceMax ? Number(form.priceMax) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل إنشاء الخدمة");
      }

      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setForm({ title: "", category: CATEGORIES[0], description: "", priceMin: "", priceMax: "" });
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 rounded-xl" size="lg" />}>
        <Plus className="w-4 h-4" />
        خدمة جديدة
      </DialogTrigger>
      <DialogPopup className="sm:max-w-md">
        <DialogTitle>إضافة خدمة جديدة</DialogTitle>
        <DialogDescription className="space-y-4 mt-3">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الخدمة</Label>
            <Input
              id="title"
              placeholder="مثال: تقييم عقاري احترافي"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">التصنيف</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              placeholder="اشرح تفاصيل الخدمة..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="priceMin">السعر الأدنى (د.ج)</Label>
              <Input
                id="priceMin"
                type="number"
                placeholder="5000"
                value={form.priceMin}
                onChange={(e) => handleChange("priceMin", e.target.value)}
                className="rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax">السعر الأقصى (د.ج)</Label>
              <Input
                id="priceMax"
                type="number"
                placeholder="50000"
                value={form.priceMax}
                onChange={(e) => handleChange("priceMax", e.target.value)}
                className="rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              تم إنشاء الخدمة بنجاح
            </div>
          )}
        </DialogDescription>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl" disabled={loading}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} className="rounded-xl" disabled={loading || !form.title || success}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
