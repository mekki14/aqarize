import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";

export async function GET() {
  try {
    const providers = await db.select().from(services);
    return Response.json({ providers });
  } catch {
    return Response.json({ error: "فشل جلب مزودي الخدمة" }, { status: 500 });
  }
}
