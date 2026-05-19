import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        console.log("Session in set-role:", JSON.stringify(session));

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized", debug: "no session" }, { status: 401 });
        }

        const body = await req.json();
        const { role } = body;

        console.log("Role to set:", role);
        console.log("User ID:", session.user.id);

        const validRoles = ["buyer", "seller", "services"];
        if (!role || !validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        await db.update(users)
            .set({ role })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Set role error:", error);
        return NextResponse.json(
            { error: "Failed to set role", details: String(error) },
            { status: 500 }
        );
    }
}