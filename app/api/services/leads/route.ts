import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { serviceRequests, services, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

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
  if (!providerId) return Response.json({ leads: [] });

  try {
    const rows = await db
      .select({
        id: serviceRequests.id,
        buyerId: serviceRequests.buyerId,
        providerId: serviceRequests.providerId,
        serviceType: serviceRequests.serviceType,
        message: serviceRequests.message,
        status: serviceRequests.status,
        createdAt: serviceRequests.createdAt,
        buyerName: users.name,
        buyerEmail: users.email,
      })
      .from(serviceRequests)
      .leftJoin(users, eq(serviceRequests.buyerId, users.id))
      .where(eq(serviceRequests.providerId, providerId))
      .orderBy(desc(serviceRequests.createdAt));

    return Response.json({ leads: rows });
  } catch {
    return Response.json({ error: "فشل جلب الطلبات" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const providerId = await getProviderId(session.user.id);
  if (!providerId) return Response.json({ error: "ملف مزود الخدمة غير موجود" }, { status: 400 });

  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) return Response.json({ error: "المعرف والحالة مطلوبان" }, { status: 400 });

    const [updated] = await db
      .update(serviceRequests)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(serviceRequests.id, id),
          eq(serviceRequests.providerId, providerId)
        )
      )
      .returning();

    if (!updated) return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    return Response.json({ lead: updated });
  } catch {
    return Response.json({ error: "فشل تحديث الطلب" }, { status: 500 });
  }
}
