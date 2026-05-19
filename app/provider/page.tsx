import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { services, service_offerings, serviceRequests, users } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { Briefcase, Users, Star, TrendingUp, Plus, Clock, Eye, CheckCircle } from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "جديد", color: "bg-info/10 text-info", icon: Clock },
  contacted: { label: "تم التواصل", color: "bg-warning/10 text-warning", icon: Eye },
  closed: { label: "مغلق", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-destructive/10 text-destructive", icon: Clock },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar-DZ", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export default async function ProviderDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const provider = await db
    .select()
    .from(services)
    .where(eq(services.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] || null);

  const providerId = provider?.id;

  let totalLeads = 0;
  let newLeads = 0;
  let closedLeads = 0;
  let activeServices = 0;
  const recentLeads: Array<{
    id: number;
    name: string;
    serviceType: string;
    status: string;
    date: Date;
  }> = [];

  if (providerId) {
    const [leadsCount] = await db
      .select({ total: count() })
      .from(serviceRequests)
      .where(eq(serviceRequests.providerId, providerId));
    totalLeads = leadsCount?.total ?? 0;

    const [newCount] = await db
      .select({ total: count() })
      .from(serviceRequests)
      .where(and(eq(serviceRequests.providerId, providerId), eq(serviceRequests.status, "new")));
    newLeads = newCount?.total ?? 0;

    const [closedCount] = await db
      .select({ total: count() })
      .from(serviceRequests)
      .where(and(eq(serviceRequests.providerId, providerId), eq(serviceRequests.status, "closed")));
    closedLeads = closedCount?.total ?? 0;

    const [activeCount] = await db
      .select({ total: count() })
      .from(service_offerings)
      .where(and(eq(service_offerings.providerId, providerId), eq(service_offerings.status, "active")));
    activeServices = activeCount?.total ?? 0;

    const rows = await db
      .select({
        id: serviceRequests.id,
        serviceType: serviceRequests.serviceType,
        status: serviceRequests.status,
        createdAt: serviceRequests.createdAt,
        buyerName: sql<string>`coalesce(${users.name}, 'عميل')`,
      })
      .from(serviceRequests)
      .leftJoin(users, eq(serviceRequests.buyerId, users.id))
      .where(eq(serviceRequests.providerId, providerId))
      .orderBy(sql`${serviceRequests.createdAt} DESC`)
      .limit(5);

    recentLeads.push(
      ...rows.map((r) => ({
        id: r.id,
        name: r.buyerName || "عميل",
        serviceType: r.serviceType,
        status: r.status,
        date: r.createdAt,
      }))
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            مرحباً بعودتك، {session.user.name?.split(" ")[0] || "مستخدم"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {provider?.companyName || "مزود خدمة عقارية"}
          </p>
        </div>
        <Link
          href="/provider/services"
          className={buttonVariants({ size: "lg", className: "gap-2 rounded-xl" })}
        >
          <Plus className="w-4 h-4" />
          خدمة جديدة
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">الطلبات</span>
          </div>
          <p className="text-2xl font-bold">{totalLeads}</p>
          <p className="text-xs text-muted-foreground mt-1">+{newLeads} جديدة</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-success" />
            </div>
            <span className="text-xs text-muted-foreground">الخدمات النشطة</span>
          </div>
          <p className="text-2xl font-bold">{activeServices}</p>
          <p className="text-xs text-muted-foreground mt-1">خدمة متاحة للعملاء</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs text-muted-foreground">التقييم</span>
          </div>
          <p className="text-2xl font-bold">{provider?.rating ?? "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">من 5 نجوم</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-info" />
            </div>
            <span className="text-xs text-muted-foreground">معدل الإغلاق</span>
          </div>
          <p className="text-2xl font-bold">
            {totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">{closedLeads} طلب مغلق</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 p-5 sm:p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">أحدث الطلبات</h2>
          <Link href="/provider/leads" className="text-sm text-primary hover:underline font-medium">
            عرض الكل
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">لا توجد طلبات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="py-3 pr-4 text-muted-foreground font-medium text-xs text-right">العميل</th>
                  <th className="py-3 text-muted-foreground font-medium text-xs text-right">الخدمة</th>
                  <th className="py-3 text-muted-foreground font-medium text-xs text-right">الحالة</th>
                  <th className="py-3 text-muted-foreground font-medium text-xs text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const config = statusConfig[lead.status] || statusConfig.new;
                  const Icon = config.icon;
                  return (
                    <tr key={lead.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">{lead.name}</td>
                      <td className="py-3 text-muted-foreground">{lead.serviceType}</td>
                      <td className="py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", config.color)}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{formatDate(lead.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/provider/services" className="group bg-card rounded-2xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Briefcase className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold">إدارة الخدمات</h3>
              <p className="text-sm text-muted-foreground">أضف أو عدّل خدماتك المتاحة</p>
            </div>
          </div>
        </Link>

        <Link href="/provider/profile" className="group bg-card rounded-2xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success group-hover:text-success-foreground transition-colors">
              <Star className="w-6 h-6 text-success group-hover:text-success-foreground" />
            </div>
            <div>
              <h3 className="font-bold">الملف الشخصي</h3>
              <p className="text-sm text-muted-foreground">حدّث بيانات شركتك ومعلومات التواصل</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
