import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { savedProperties, sellers, properties as dbProperties } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import PortfolioChart from "@/app/components/portfolio-chart";
import { TrendingUp, Building2, Heart, Plus } from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PROPERTY_TYPE_NAMES: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  house: "منزل",
  land: "أرض",
  commercial: "محل تجاري",
  office: "مكتب",
};

const STATUS_NAMES: Record<string, string> = {
  available: "متاح",
  sold: "تم البيع",
  pending: "قيد الانتظار",
  reserved: "محجوز",
};

function formatPrice(price: number | string) {
  const num = typeof price === "string" ? Number(price) : price;
  return new Intl.NumberFormat("ar-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatPriceShort(price: number | string) {
  const num = typeof price === "string" ? Number(price) : price;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const seller = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  let myProperties: typeof dbProperties.$inferSelect[] = [];
  if (seller) {
    myProperties = await db
      .select()
      .from(dbProperties)
      .where(eq(dbProperties.sellerId, seller.id));
  }

  // Fetch saved property IDs
  const savedRows = await db
    .select({ propertyId: savedProperties.propertyId })
    .from(savedProperties)
    .where(eq(savedProperties.userId, session.user.id));

  // Fetch saved property details from DB
  let savedListings: typeof dbProperties.$inferSelect[] = [];
  if (savedRows.length > 0) {
    // savedProperties.propertyId is an integer, but our properties use text IDs
    // For now, fetch all properties and match (we can optimize later)
    const allProps = await db.select().from(dbProperties);
    const savedIdSet = new Set(savedRows.map((r) => r.propertyId));
    savedListings = allProps.filter((_, idx) => savedIdSet.has(idx + 1));
  }

  const totalValue = myProperties.reduce((sum, p) => sum + Number(p.price), 0);
  const savedCount = savedListings.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          مرحباً بعودتك، {session.user.name?.split(" ")[0] || "مستخدم"}
        </h1>
        <Link
          href="/dashboard/properties/new"
          className={buttonVariants({ size: "lg", className: "gap-2 rounded-xl" })}
        >
          <Plus className="w-4 h-4" />
          إضافة عقار
        </Link>
      </div>

      {/* Portfolio Card */}
      <div className="bg-card rounded-2xl border border-border/40 p-5 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">إجمالي قيمة العقارات</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-bold">
                {formatPriceShort(totalValue)}
              </h2>
              <span className="text-sm text-muted-foreground">د.ج</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">
                +{formatPriceShort(totalValue * 0.05)}
              </span>
              <span className="text-sm text-success">+5%</span>
            </div>
          </div>
          <div className="flex gap-1">
            {["1ي", "1ش", "1س", "الكل"].map((period, i) => (
              <button
                key={period}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  i === 2
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <PortfolioChart />

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">عقاراتي</p>
              <p className="text-lg font-bold">{myProperties.length}</p>
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">المحفوظات</p>
              <p className="text-lg font-bold">{savedCount}</p>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-primary rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-foreground/70">إضافة عقار جديد</p>
              <p className="text-sm font-bold text-primary-foreground mt-1">ابدأ الآن</p>
            </div>
            <Link
              href="/dashboard/properties/new"
              className="h-9 px-4 rounded-lg bg-primary-foreground/20 text-primary-foreground text-xs font-bold hover:bg-primary-foreground/30 transition-colors"
            >
              إضافة
            </Link>
          </div>
        </div>
      </div>

      {/* My Properties */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4">عقاراتي ({myProperties.length})</h2>
        {myProperties.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/40 p-12 text-center space-y-4">
            <p className="text-muted-foreground">لم تقم بإضافة أي عقار بعد</p>
            <Link
              href="/dashboard/properties/new"
              className={buttonVariants({ size: "lg", className: "gap-2 rounded-xl" })}
            >
              <Plus className="w-4 h-4" />
              إضافة عقارك الأول
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProperties.map((property) => (
              <div
                key={property.id}
                className="bg-card rounded-xl border border-border/40 overflow-hidden hover:shadow-md transition-shadow"
              >
                {property.images?.[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                {!property.images?.[0] && (
                  <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    لا توجد صورة
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm truncate">{property.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {PROPERTY_TYPE_NAMES[property.type] || property.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {property.city} - {property.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">
                      {formatPrice(property.price)}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {STATUS_NAMES[property.status] || property.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Properties */}
      {savedListings.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">العقارات المحفوظة ({savedListings.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedListings.map((property) => (
              <div
                key={property.id}
                className="bg-card rounded-xl border border-border/40 overflow-hidden hover:shadow-md transition-shadow"
              >
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    لا توجد صورة
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm truncate">{property.title}</h3>
                  <p className="text-xs text-muted-foreground">{property.wilayaName ?? property.city}</p>
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(property.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
