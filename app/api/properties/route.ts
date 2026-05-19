import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized. Must be a seller to add properties." }, { status: 401 });
  }

  const seller = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!seller) {
    return NextResponse.json({ error: "Seller profile not found. Please upgrade your account." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, type, price, area, bedrooms, bathrooms, address, city, country, latitude, longitude, images, features, polygon, titleDeedDocument } = body;

  if (!title || !type || !price || !address || !city || !country || !titleDeedDocument) {
    return NextResponse.json({ error: "Missing required fields, including Title Deed document" }, { status: 400 });
  }

  const propertyId = crypto.randomUUID();
  await db.insert(properties).values({
    id: propertyId,
    sellerId: seller.id,
    title,
    description: description || null,
    type,
    price: String(price),
    area: area ? String(area) : null,
    bedrooms: bedrooms || null,
    bathrooms: bathrooms || null,
    address,
    city,
    country,
    latitude: latitude ? String(latitude) : null,
    longitude: longitude ? String(longitude) : null,
    images: images || null,
    features: features || null,
    polygon: polygon ? JSON.stringify(polygon) : null,
    titleDeedDocument,
  });

  return NextResponse.json({ success: true, id: propertyId });
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!seller) {
    return NextResponse.json({ properties: [] });
  }

  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.sellerId, seller.id));

  const parsed = rows.map((p) => ({
    ...p,
    polygon: p.polygon ? JSON.parse(p.polygon) : null,
  }));

  return NextResponse.json({ properties: parsed });
}
