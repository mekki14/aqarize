import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { savedProperties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { properties as mockProperties } from "@/app/data/properties";
import { Heart } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("ar-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function SavedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const savedRows = await db
    .select({ propertyId: savedProperties.propertyId })
    .from(savedProperties)
    .where(eq(savedProperties.userId, session.user.id));

  const savedPropertyIds = new Set(savedRows.map((r) => r.propertyId));
  const savedListings = mockProperties.filter((p) => savedPropertyIds.has(p.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">العقارات المحفوظة</h1>
        <span className="text-sm text-muted-foreground">{savedListings.length} عقار</span>
      </div>

      {savedListings.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/40 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">لم تقم بحفظ أي عقار بعد</p>
          <p className="text-xs text-muted-foreground">يمكنك حفظ العقارات التي تعجبك من صفحة الرئيسية</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedListings.map((property) => (
            <div
              key={property.id}
              className="bg-card rounded-xl border border-border/40 overflow-hidden hover:shadow-md transition-shadow"
            >
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm truncate">{property.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {property.wilayaName} • {property.type}
                </p>
                <p className="text-sm font-bold text-primary">
                  {formatPrice(property.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
