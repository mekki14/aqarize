import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { services, service_offerings } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import ProviderServicesClient from "./client";

export default async function ProviderServicesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const provider = await db
    .select()
    .from(services)
    .where(eq(services.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] || null);

  if (!provider) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-card rounded-2xl border border-border/40 p-12 text-center space-y-4">
          <p className="text-muted-foreground text-lg">يجب إنشاء ملف مزود خدمة أولاً</p>
          <a href="/provider/profile" className="text-primary hover:underline text-sm">
            اذهب إلى الملف الشخصي لإنشاء حساب مزود خدمة
          </a>
        </div>
      </div>
    );
  }

  const offerings = await db
    .select()
    .from(service_offerings)
    .where(eq(service_offerings.providerId, provider.id));

  const [activeCount] = await db
    .select({ total: count() })
    .from(service_offerings)
    .where(and(eq(service_offerings.providerId, provider.id), eq(service_offerings.status, "active")));

  const totalOrders = offerings.reduce((sum, o) => sum + (o.ordersCount ?? 0), 0);

  return (
    <ProviderServicesClient
      providerId={provider.id}
      initialOfferings={offerings.map((o) => ({
        id: o.id,
        title: o.title,
        category: o.category,
        description: o.description ?? "",
        priceMin: o.priceMin ?? null,
        priceMax: o.priceMax ?? null,
        status: o.status as "active" | "paused",
        ordersCount: o.ordersCount ?? 0,
      }))}
      activeCount={activeCount?.total ?? 0}
      totalOrders={totalOrders}
    />
  );
}
