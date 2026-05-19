import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { services, serviceRequests, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import ProviderLeadsClient from "./client";

export default async function ProviderLeadsPage() {
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
            اذهب إلى الملف الشخصي
          </a>
        </div>
      </div>
    );
  }

  const rows = await db
    .select({
      id: serviceRequests.id,
      serviceType: serviceRequests.serviceType,
      message: serviceRequests.message,
      status: serviceRequests.status,
      createdAt: serviceRequests.createdAt,
      buyerName: users.name,
      buyerEmail: users.email,
    })
    .from(serviceRequests)
    .leftJoin(users, eq(serviceRequests.buyerId, users.id))
    .where(eq(serviceRequests.providerId, provider.id))
    .orderBy(desc(serviceRequests.createdAt));

  const leads = rows.map((r) => ({
    id: r.id,
    name: r.buyerName ?? "عميل",
    email: r.buyerEmail ?? "",
    service: r.serviceType,
    message: r.message ?? "",
    status: r.status as "new" | "contacted" | "closed" | "cancelled",
    date: r.createdAt.toISOString(),
  }));

  return <ProviderLeadsClient initialLeads={leads} />;
}
