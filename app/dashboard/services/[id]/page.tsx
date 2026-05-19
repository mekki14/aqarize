import { db } from "@/lib/db";
import { services, service_offerings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Phone, Star, ArrowRight, CheckCircle, Building2 } from "lucide-react";
import ServiceRequestForm from "@/app/components/service-request-form";

export default async function ServiceProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rows = await db.select().from(services).where(eq(services.id, id));
  if (rows.length === 0) notFound();

  const provider = rows[0];

  const offerings = await db
    .select()
    .from(service_offerings)
    .where(eq(service_offerings.providerId, provider.id));

  function formatPrice(price: string | null) {
    if (!price) return "";
    return new Intl.NumberFormat("ar-DZ", { maximumFractionDigits: 0 }).format(Number(price));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <Link href="/dashboard/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-4 h-4" />
          العودة إلى الخدمات
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold">{provider.companyName || "مزود خدمة"}</h1>
              {provider.verified && (
                <Badge variant="secondary" className="bg-success/10 text-success">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  موثق
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {provider.serviceType || "خدمات عقارية"}
              </Badge>
              {provider.rating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  {provider.rating}
                </span>
              )}
              {provider.phone && (
                <span className="inline-flex items-center gap-1" dir="ltr">
                  <Phone className="w-3.5 h-3.5" />
                  {provider.phone}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {provider.description || "لا يوجد وصف"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border/20">
          <ServiceRequestForm
            providerId={provider.id}
            providerName={provider.companyName || "مزود خدمة"}
            serviceType={provider.serviceType || "خدمات عقارية"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-warning fill-warning" />
            <h2 className="font-bold">التقييم</h2>
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-bold mb-1">{provider.rating ?? "—"}</p>
            <p className="text-sm text-muted-foreground">من 5 نجوم</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="font-bold">الخدمات المقدمة ({offerings.length})</h2>
          </div>
          {offerings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">لم يتم إضافة خدمات بعد</p>
          ) : (
            <ul className="space-y-3">
              {offerings.map((offering) => (
                <li key={offering.id} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{offering.title}</p>
                    {(offering.priceMin || offering.priceMax) && (
                      <p className="text-xs text-muted-foreground">
                        {offering.priceMin && formatPrice(offering.priceMin)}
                        {offering.priceMin && offering.priceMax && " - "}
                        {offering.priceMax && formatPrice(offering.priceMax)}
                        {" "}د.ج
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
