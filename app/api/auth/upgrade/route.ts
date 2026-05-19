import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, sellers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { companyName, phone, address, kycDocument } = body;

        if (!kycDocument) {
            return NextResponse.json({ error: "وثيقة الهوية (KYC) مطلوبة" }, { status: 400 });
        }

        if (!phone || !address) {
            return NextResponse.json({ error: "رقم الهاتف والعنوان مطلوبان" }, { status: 400 });
        }

        // Update user role to seller
        await db.update(users)
            .set({ role: "seller" })
            .where(eq(users.id, session.user.id));

        // Create seller record
        await db.insert(sellers).values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            companyName: companyName || null,
            phone,
            address,
            kycDocument,
            verified: false, // Maybe requires manual verification
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Upgrade error:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء ترقية الحساب" },
            { status: 500 }
        );
    }
}
