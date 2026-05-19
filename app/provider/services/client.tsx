"use client";

import { useState, useCallback } from "react";
import { Briefcase, Plus, Pencil, Trash2, Eye, Star, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogPopup, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Offering {
  id: number;
  title: string;
  category: string;
  description: string;
  priceMin: string | null;
  priceMax: string | null;
  status: "active" | "paused";
  ordersCount: number;
}

interface Props {
  providerId: string;
  initialOfferings: Offering[];
  activeCount: number;
  totalOrders: number;
}

const CATEGORIES = ["تقييم", "تصوير", "تسويق", "قانوني", "استشارات", "تجهيز"];

const categoryColors: Record<string, string> = {
  "تقييم": "bg-info/10 text-info",
  "تصوير": "bg-success/10 text-success",
  "تسويق": "bg-warning/10 text-warning",
  "قانوني": "bg-destructive/10 text-destructive",
  "استشارات": "bg-primary/10 text-primary",
  "تجهيز": "bg-muted text-muted-foreground",
};

function formatPrice(price: string | null) {
  if (!price) return "";
  return new Intl.NumberFormat("ar-DZ", { maximumFractionDigits: 0 }).format(Number(price));
}

export default function ProviderServicesClient({ providerId, initialOfferings, activeCount, totalOrders }: Props) {
  const [offerings, setOfferings] = useState<Offering[]>(initialOfferings);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0], description: "", priceMin: "", priceMax: "" });

  const refresh = useCallback(async () => {
    const res = await fetch("/api/services/offerings");
    if (res.ok) {
      const data = await res.json();
      setOfferings(data.offerings ?? []);
    }
  }, []);

  const handleAdd = async () => {
    setLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/services/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          priceMin: form.priceMin || null,
          priceMax: form.priceMax || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await refresh();
      setAddDialogOpen(false);
      setForm({ title: "", category: CATEGORIES[0], description: "", priceMin: "", priceMax: "" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "فشل إنشاء الخدمة");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedOffering) return;
    setLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/services/offerings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOffering.id,
          title: form.title,
          category: form.category,
          description: form.description,
          priceMin: form.priceMin || null,
          priceMax: form.priceMax || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await refresh();
      setEditDialogOpen(false);
      setSelectedOffering(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "فشل تحديث الخدمة");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOffering) return;
    setLoading(true);
    try {
      await fetch(`/api/services/offerings?id=${selectedOffering.id}`, { method: "DELETE" });
      await refresh();
      setDeleteDialogOpen(false);
      setSelectedOffering(null);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (offering: Offering) => {
    const newStatus = offering.status === "active" ? "paused" : "active";
    await fetch("/api/services/offerings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: offering.id, status: newStatus }),
    });
    await refresh();
  };

  const openEdit = (offering: Offering) => {
    setSelectedOffering(offering);
    setForm({
      title: offering.title,
      category: offering.category,
      description: offering.description,
      priceMin: offering.priceMin ?? "",
      priceMax: offering.priceMax ?? "",
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">خدماتي</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة الخدمات التي تقدمها للبائعين</p>
        </div>
        <Button className="gap-2 rounded-xl" size="lg" onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          خدمة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">إجمالي الخدمات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{offerings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">إجمالي الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {offerings.map((offering) => (
          <div key={offering.id} className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-base">{offering.title}</h3>
                  <Badge variant="secondary" className={cn("text-xs", categoryColors[offering.category] || "bg-muted")}>
                    {offering.category}
                  </Badge>
                  <Badge variant="secondary" className={cn("text-xs", offering.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                    {offering.status === "active" ? "نشط" : "متوقف"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{offering.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {(offering.priceMin || offering.priceMax) && (
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {offering.priceMin && formatPrice(offering.priceMin)}
                        {offering.priceMin && offering.priceMax && " - "}
                        {offering.priceMax && formatPrice(offering.priceMax)}
                      </span>
                      {" "}د.ج
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{offering.ordersCount}</span> طلب
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="rounded-xl" title="تعديل" onClick={() => openEdit(offering)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:text-destructive" title="حذف" onClick={() => { setSelectedOffering(offering); setDeleteDialogOpen(true); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toggleStatus(offering)}>
                  {offering.status === "active" ? "إيقاف" : "تفعيل"}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {offerings.length === 0 && (
          <div className="bg-card rounded-2xl border border-border/40 p-12 text-center space-y-4">
            <p className="text-muted-foreground">لم تقم بإضافة أي خدمة بعد</p>
            <Button className="gap-2 rounded-xl" size="lg" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              إضافة خدمة
            </Button>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogPopup className="sm:max-w-md">
          <DialogTitle>إضافة خدمة جديدة</DialogTitle>
          <DialogDescription className="space-y-4 mt-3">
            <div className="space-y-2">
              <Label>عنوان الخدمة</Label>
              <Input placeholder="مثال: تقييم عقاري احترافي" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea placeholder="اشرح تفاصيل الخدمة..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="rounded-xl resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>السعر الأدنى (د.ج)</Label>
                <Input type="number" placeholder="5000" value={form.priceMin} onChange={(e) => setForm((p) => ({ ...p, priceMin: e.target.value }))} className="rounded-xl" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>السعر الأقصى (د.ج)</Label>
                <Input type="number" placeholder="50000" value={form.priceMax} onChange={(e) => setForm((p) => ({ ...p, priceMax: e.target.value }))} className="rounded-xl" dir="ltr" />
              </div>
            </div>
            {formError && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{formError}</div>}
          </DialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="rounded-xl" disabled={loading}>إلغاء</Button>
            <Button onClick={handleAdd} className="rounded-xl" disabled={loading || !form.title}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}</Button>
          </div>
        </DialogPopup>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogPopup className="sm:max-w-md">
          <DialogTitle>تعديل الخدمة</DialogTitle>
          <DialogDescription className="space-y-4 mt-3">
            <div className="space-y-2">
              <Label>عنوان الخدمة</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="rounded-xl resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>السعر الأدنى (د.ج)</Label>
                <Input type="number" value={form.priceMin} onChange={(e) => setForm((p) => ({ ...p, priceMin: e.target.value }))} className="rounded-xl" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>السعر الأقصى (د.ج)</Label>
                <Input type="number" value={form.priceMax} onChange={(e) => setForm((p) => ({ ...p, priceMax: e.target.value }))} className="rounded-xl" dir="ltr" />
              </div>
            </div>
            {formError && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{formError}</div>}
          </DialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl" disabled={loading}>إلغاء</Button>
            <Button onClick={handleEdit} className="rounded-xl" disabled={loading || !form.title}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}</Button>
          </div>
        </DialogPopup>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogPopup className="sm:max-w-md">
          <DialogTitle>حذف الخدمة</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من حذف خدمة &quot;{selectedOffering?.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl" disabled={loading}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}</Button>
          </div>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
