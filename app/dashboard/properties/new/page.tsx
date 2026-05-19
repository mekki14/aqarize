"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { wilayas } from "@/app/data/wilayas";
import Link from "next/link";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const PropertyMapDrawer = dynamic(() => import("@/app/components/property-map-drawer"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-lg bg-muted/20 animate-pulse flex items-center justify-center text-sm text-muted-foreground">
      جاري تحميل الخريطة...
    </div>
  ),
});

const PROPERTY_TYPES = [
  { id: "apartment", name: "شقة" },
  { id: "villa", name: "فيلا" },
  { id: "house", name: "منزل" },
  { id: "land", name: "أرض" },
  { id: "commercial", name: "محل تجاري" },
  { id: "office", name: "مكتب" },
] as const;

const STEPS = [
  "المعلومات الأساسية",
  "تفاصيل العقار",
  "الموقع",
  "الصور",
  "وثائق الملكية"
];

export default function NewPropertyPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    images: "",
    titleDeedDocument: "",
  });

  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (currentStep === 0) {
      if (!formData.title || !formData.type || !formData.price) {
        setError("يرجى ملء جميع الحقول المطلوبة (العنوان، النوع، السعر)");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.address) {
        setError("يرجى ملء العنوان التفصيلي");
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.titleDeedDocument) {
        setError("يرجى إرفاق رابط عقد الملكية للمصادقة");
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  async function handleSubmit() {
    if (!validateStep()) return;

    setLoading(true);
    setError("");

    const body = {
      title: formData.title,
      type: formData.type,
      price: Number(formData.price),
      area: formData.area ? Number(formData.area) : undefined,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      description: formData.description || undefined,
      address: formData.address,
      city: formData.city,
      country: "الجزائر",
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
      images: formData.images
        ? formData.images.split("\n").map((s) => s.trim()).filter(Boolean)
        : undefined,
      polygon: polygonPoints.length > 0 ? polygonPoints : undefined,
      titleDeedDocument: formData.titleDeedDocument,
    };

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">جاري التحميل...</div>;
  }

  if ((session?.user as any)?.role !== "seller") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">ترقية الحساب مطلوبة</h2>
        <p className="text-muted-foreground mb-8">
          لإضافة عقار، تحتاج إلى الترقية إلى حساب بائع وإضافة وثيقة إثبات الهوية (KYC).
        </p>
        <Link href="/dashboard/upgrade">
          <Button size="lg">ترقية الحساب الآن</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-6">
          <ArrowRight className="w-4 h-4" />
          العودة إلى لوحة التحكم
        </Link>
        <h1 className="text-3xl font-bold">إضافة عقار جديد</h1>
        <p className="text-muted-foreground mt-2">اتبع الخطوات لإدراج عقارك بكل سهولة وبطريقة احترافية.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8 relative hidden sm:block">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -translate-y-1/2 rounded-full" />
        <div className="absolute top-1/2 right-0 h-0.5 bg-primary -translate-y-1/2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />

        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 
                    ${isActive ? "border-primary bg-background text-primary scale-110 shadow-sm" :
                      isCompleted ? "border-primary bg-primary text-primary-foreground" :
                        "border-muted bg-background text-muted-foreground"}`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-sm font-medium">{index + 1}</span>}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-xl shadow-sm p-6 sm:p-10 min-h-[400px] flex flex-col relative overflow-hidden">
        {/* Progress bar for mobile */}
        <div className="absolute top-0 right-0 w-full h-1 bg-border/50 sm:hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
            {error}
          </div>
        )}

        <div className="flex-1">
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
              <div>
                <h2 className="text-xl font-bold">المعلومات الأساسية</h2>
                <p className="text-sm text-muted-foreground">أدخل المعلومات الرئيسية التي تميز عقارك.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">عنوان الإعلان *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: فيلا فاخرة مع مسبح في درارية"
                  className="h-12 bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">نوع العقار *</Label>
                  <Select value={formData.type} onValueChange={(v) => handleSelectChange("type", v ?? "")}>
                    <SelectTrigger className="h-12 bg-background">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectPopup>
                      {PROPERTY_TYPES.map((pt) => (
                        <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">السعر (د.ج) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="مثال: 45000000"
                    className="h-12 bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
              <div>
                <h2 className="text-xl font-bold">تفاصيل العقار</h2>
                <p className="text-sm text-muted-foreground">أضف المواصفات الإضافية والوصف الكامل لمنح المشترين نظرة أوضح.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="area">المساحة (م²)</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    min="0"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="مثال: 320"
                    className="h-12 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">عدد الغرف</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="مثال: 5"
                    className="h-12 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">عدد الحمامات</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="مثال: 3"
                    className="h-12 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">تفاصيل أدق (الوصف)</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="حدثنا أكثر عن الميزات الرائعة في هذا العقار، قربه من المرافق، حالة البناء..."
                  className="resize-none bg-background"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
              <div>
                <h2 className="text-xl font-bold">الموقع على الخريطة والعنوان</h2>
                <p className="text-sm text-muted-foreground">حدد بدقة موقع العقار لتسهيل وصول المهتمين.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان التفصيلي *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="الشارع، الحي، المعالم القريبة..."
                  className="h-12 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label>الخريطة التفاعلية (ارسم حدود العقار إن أمكن)</Label>
                <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm">
                  <PropertyMapDrawer points={polygonPoints} onChange={setPolygonPoints} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
              <div>
                <h2 className="text-xl font-bold">معرض الصور</h2>
                <p className="text-sm text-muted-foreground">الصور الجذابة تزيد من فرص بيع أو تأجير عقارك.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">روابط الصور</Label>
                  <p className="text-xs text-muted-foreground pb-2">ضع رابط صورة واحدة في كل سطر. يفضل استخدام صور عالية الدقة وإضاءة جيدة.</p>
                  <Textarea
                    id="images"
                    name="images"
                    rows={6}
                    value={formData.images}
                    onChange={handleChange}
                    placeholder="https://example.com/front-view.jpg&#10;https://example.com/interior.jpg"
                    className="bg-background resize-none"
                  />
                </div>

                {formData.images.trim() && (
                  <div className="pt-4">
                    <p className="text-sm font-medium mb-3">معاينة الصور المدخلة:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.images.split('\n').map((url, i) => {
                        const trimmed = url.trim();
                        if (!trimmed) return null;
                        return (
                          <div key={i} className="aspect-square rounded-lg border border-border/50 overflow-hidden bg-muted relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={trimmed} alt={`Preview ${i}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/png?text=Invalid+URL';
                            }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
              <div className="mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">التحقق من الملكية <Check className="w-5 h-5 text-green-500" /></h2>
                <p className="text-sm text-muted-foreground">لضمان المصداقية، نطلب تقديم إثبات ملكية. هذه المعلومات لن تظهر للعامة.</p>
              </div>

              <div className="p-5 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titleDeedDocument" className="text-base">عقد الملكية (Title Deed) *</Label>
                  <p className="text-xs text-muted-foreground mb-2">يرجى إرفاق رابط آمن لصورة عقد الملكية العقاري للتحقق من العقار قبل نشره.</p>
                  <Input
                    id="titleDeedDocument"
                    name="titleDeedDocument"
                    type="url"
                    required
                    value={formData.titleDeedDocument}
                    onChange={handleChange}
                    placeholder="https://secure-storage.com/docs/my-deed.pdf"
                    className="h-12 bg-background border-primary/30 focus-visible:ring-primary/50"
                  />
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-xl mt-6">
                <h3 className="font-medium mb-4">مراجعة سريعة</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">العنوان</span>
                    <span className="font-medium">{formData.title || "-"}</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">السعر</span>
                    <span className="font-medium font-mono">{formData.price ? Number(formData.price).toLocaleString() + " د.ج" : "-"}</span>
                  </li>
                  <li className="flex justify-between pb-2">
                    <span className="text-muted-foreground">الموقع</span>
                    <span className="font-medium">{formData.address || "-"}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-10 pt-6 border-t border-border/50 flex justify-between items-center bg-card">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || loading}
            className="h-12 px-6"
          >
            السابق
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="h-12 px-8 gap-2 group shadow-md"
            >
              التالي
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-12 px-10 shadow-lg shadow-primary/25"
            >
              {loading ? "جاري المعالجة..." : "نشر العقار الآن"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
