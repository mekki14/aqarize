import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  try {
    const provider = await db
      .select()
      .from(services)
      .where(eq(services.userId, session.user.id))
      .limit(1)
      .then((rows) => rows[0] || null);

    return Response.json({ provider });
  } catch {
    return Response.json({ error: "فشل جلب بيانات مزود الخدمة" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  try {
    const body = await request.json();
    const { companyName, phone, address, serviceType, description } = body;

    if (!companyName || !serviceType) {
      return Response.json({ error: "اسم الشركة ونوع الخدمة مطلوبان" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(services)
      .where(eq(services.userId, session.user.id))
      .limit(1)
      .then((rows) => rows[0]);

    if (existing) {
      const [updated] = await db
        .update(services)
        .set({
          companyName,
          phone: phone || null,
          address: address || null,
          serviceType,
          description: description || null,
          updatedAt: new Date(),
        })
        .where(eq(services.userId, session.user.id))
        .returning();

      return Response.json({ provider: updated });
    }

    const id = crypto.randomUUID();
    const [created] = await db
      .insert(services)
      .values({
        id,
        userId: session.user.id,
        companyName,
        phone: phone || null,
        address: address || null,
        serviceType,
        description: description || null,
      })
      .returning();

    return Response.json({ provider: created }, { status: 201 });
  } catch {
    return Response.json({ error: "فشل حفظ بيانات مزود الخدمة" }, { status: 500 });
  }
}
