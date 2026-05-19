import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sellers, properties as dbProperties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";

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

const STATUS_STYLES: Record<string, string> = {
  available: "bg-success/10 text-success",
  sold: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
  reserved: "bg-info/10 text-info",
};

function formatPrice(price: number | string) {
  const num = typeof price === "string" ? Number(price) : price;
  return new Intl.NumberFormat("ar-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(num);
}

export default async function PropertiesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">عقاراتي</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة وإضافة العقارات الخاصة بك
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className={buttonVariants({ size: "lg", className: "gap-2 rounded-xl" })}
        >
          <Plus className="w-4 h-4" />
          إضافة عقار
        </Link>
      </div>

      {myProperties.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/40 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">لا توجد عقارات بعد</p>
            <p className="text-sm text-muted-foreground mt-1">
              قم بإضافة عقارك الأول للبدء
            </p>
          </div>
          <Link
            href="/dashboard/properties/new"
            className={buttonVariants({ size: "lg", className: "gap-2 rounded-xl" })}
          >
            <Plus className="w-4 h-4" />
            إضافة عقار
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProperties.map((property) => (
            <div
              key={property.id}
              className="bg-card rounded-xl border border-border/40 overflow-hidden hover:shadow-md transition-shadow group"
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
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm truncate">{property.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                    {PROPERTY_TYPE_NAMES[property.type] || property.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {property.city} - {property.address}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(property.price)}
                  </p>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      STATUS_STYLES[property.status] || "bg-muted text-muted-foreground"
                    )}
                  >
                    {STATUS_NAMES[property.status] || property.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                    تعديل
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
