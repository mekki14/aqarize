import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { serviceRequests, services } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  try {
    const body = await request.json();
    const { providerId, serviceType, message } = body;

    if (!providerId || !serviceType) {
      return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const provider = await db
      .select()
      .from(services)
      .where(eq(services.id, providerId))
      .limit(1);

    if (provider.length === 0) {
      return Response.json({ error: "مزود الخدمة غير موجود" }, { status: 404 });
    }

    const [req] = await db
      .insert(serviceRequests)
      .values({
        buyerId: session.user.id,
        providerId,
        serviceType,
        message: message || "",
      })
      .returning();

    return Response.json({ request: req }, { status: 201 });
  } catch {
    return Response.json({ error: "فشل إرسال الطلب" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  try {
    const asBuyer = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.buyerId, session.user.id))
      .orderBy(desc(serviceRequests.createdAt));

    return Response.json({ requests: asBuyer });
  } catch {
    return Response.json({ error: "فشل جلب الطلبات" }, { status: 500 });
  }
}
