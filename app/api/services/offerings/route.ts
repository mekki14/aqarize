import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { service_offerings, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getProviderId(userId: string): Promise<string | null> {
  const provider = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.userId, userId))
    .limit(1);
  return provider[0]?.id ?? null;
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const providerId = await getProviderId(session.user.id);
  if (!providerId) return Response.json({ offerings: [] });

  try {
    const offerings = await db
      .select()
      .from(service_offerings)
      .where(eq(service_offerings.providerId, providerId));

    return Response.json({ offerings });
  } catch {
    return Response.json({ error: "فشل جلب الخدمات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const providerId = await getProviderId(session.user.id);
  if (!providerId) return Response.json({ error: "يجب إنشاء ملف مزود خدمة أولاً" }, { status: 400 });

  try {
    const body = await request.json();
    const { title, category, description, priceMin, priceMax } = body;

    if (!title || !category) {
      return Response.json({ error: "العنوان والتصنيف مطلوبان" }, { status: 400 });
    }

    const [offering] = await db
      .insert(service_offerings)
      .values({
        providerId,
        title,
        category,
        description: description || "",
        priceMin: priceMin ? String(priceMin) : null,
        priceMax: priceMax ? String(priceMax) : null,
      })
      .returning();

    return Response.json({ offering }, { status: 201 });
  } catch {
    return Response.json({ error: "فشل إنشاء الخدمة" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const providerId = await getProviderId(session.user.id);
  if (!providerId) return Response.json({ error: "ملف مزود الخدمة غير موجود" }, { status: 400 });

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return Response.json({ error: "معرف الخدمة مطلوب" }, { status: 400 });

    const { eq: eqOp, and } = await import("drizzle-orm");
    const [updated] = await db
      .update(service_offerings)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eqOp(service_offerings.id, id),
          eqOp(service_offerings.providerId, providerId)
        )
      )
      .returning();

    if (!updated) return Response.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    return Response.json({ offering: updated });
  } catch {
    return Response.json({ error: "فشل تحديث الخدمة" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const providerId = await getProviderId(session.user.id);
  if (!providerId) return Response.json({ error: "ملف مزود الخدمة غير موجود" }, { status: 400 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "معرف الخدمة مطلوب" }, { status: 400 });

    const { eq: eqOp, and } = await import("drizzle-orm");
    const [deleted] = await db
      .delete(service_offerings)
      .where(
        and(
          eqOp(service_offerings.id, Number(id)),
          eqOp(service_offerings.providerId, providerId)
        )
      )
      .returning();

    if (!deleted) return Response.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "فشل حذف الخدمة" }, { status: 500 });
  }
}
