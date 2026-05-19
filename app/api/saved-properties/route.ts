import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedProperties } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ propertyIds: [] });
  }

  const rows = await db
    .select({ propertyId: savedProperties.propertyId })
    .from(savedProperties)
    .where(eq(savedProperties.userId, session.user.id));

  return NextResponse.json({ propertyIds: rows.map((r) => r.propertyId) });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { propertyId } = await request.json();

  if (typeof propertyId !== "number") {
    return NextResponse.json({ error: "Invalid propertyId" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(savedProperties)
    .where(
      and(
        eq(savedProperties.userId, session.user.id),
        eq(savedProperties.propertyId, propertyId)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(savedProperties).values({
      userId: session.user.id,
      propertyId,
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const propertyId = Number(searchParams.get("propertyId"));

  if (!propertyId) {
    return NextResponse.json({ error: "Invalid propertyId" }, { status: 400 });
  }

  await db
    .delete(savedProperties)
    .where(
      and(
        eq(savedProperties.userId, session.user.id),
        eq(savedProperties.propertyId, propertyId)
      )
    );

  return NextResponse.json({ success: true });
}
