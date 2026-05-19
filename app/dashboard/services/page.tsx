import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Search, Phone, Star, Building2, CheckCircle } from "lucide-react";

export default async function ServicesPage() {
  let providers: Array<{
    id: string;
    companyName: string | null;
    phone: string | null;
    serviceType: string | null;
    description: string | null;
    verified: boolean;
    rating: string | null;
  }> = [];

  try {
    providers = await db.select().from(services);
  } catch {
    providers = [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">خدمات العقار</h1>
          <p className="text-sm text-muted-foreground mt-1">
            استعرض مزودي الخدمات المتخصصين لمساعدتك في بيع عقارك
          </p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث عن خدمة..."
            className="h-10 w-full sm:w-64 rounded-xl border border-input bg-background pl-3 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {["الكل", "تقييم", "تصوير", "تسويق", "قانوني", "استشارات", "تجهيز"].map((cat) => (
          <button key={cat} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat === "الكل" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            {cat}
          </button>
        ))}
      </div>

      {providers.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/40 p-12 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">لا يوجد مزودي خدمات مسجلين حالياً</p>
          <p className="text-sm text-muted-foreground/70">كن أول مزود خدمة ينضم إلى المنصة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <Link key={provider.id} href={`/dashboard/services/${provider.id}`} className="group bg-card rounded-2xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Building2 className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-bold text-sm truncate">{provider.companyName || "مزود خدمة"}</h3>
                    {provider.verified && <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />}
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">
                    {provider.serviceType || "خدمات عقارية"}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {provider.description || "لا يوجد وصف"}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {provider.phone && (
                    <span className="inline-flex items-center gap-0.5" dir="ltr">
                      <Phone className="w-3 h-3" />
                      {provider.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  <span className="text-xs font-bold">{provider.rating ?? "—"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 bg-primary rounded-2xl p-6 sm:p-8 text-primary-foreground">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-1">هل تقدم خدمات عقارية؟</h2>
            <p className="text-primary-foreground/80 text-sm">انضم إلى منصتنا كمزود خدمة واصِل إلى آلاف البائعين</p>
          </div>
          <Link href="/register">
            <Button variant="outline" size="lg" className="rounded-xl bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
              سجّل كمزود خدمة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
