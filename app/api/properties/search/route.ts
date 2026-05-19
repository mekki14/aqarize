import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq, gte, lte, and, sql, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type { Property, SearchResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const wilayaId = searchParams.get("wilayaId");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions = [eq(properties.status, "available")];

    if (wilayaId) {
        conditions.push(eq(properties.wilayaId, parseInt(wilayaId)));
    }
    if (type) {
        conditions.push(eq(properties.type, type as any));
    }
    if (minPrice) {
        conditions.push(gte(properties.price, minPrice));
    }
    if (maxPrice) {
        conditions.push(lte(properties.price, maxPrice));
    }
    if (bedrooms) {
        conditions.push(gte(properties.bedrooms, parseInt(bedrooms)));
    }

    const whereClause = and(...conditions);

    // Get filtered properties
    const rows = await db
        .select()
        .from(properties)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(properties.createdAt);

    // Get total count for pagination
    const totalResult = await db
        .select({ count: count() })
        .from(properties)
        .where(whereClause);
    const total = totalResult[0]?.count ?? 0;

    // Get counts per wilaya (unfiltered by wilaya, but respecting other filters)
    const wilayaConditions = conditions.filter(
        (_, i) => !wilayaId || i !== conditions.findIndex((c) => c === conditions.find((cc) => wilayaId && cc === c && i > 0))
    );
    // Simplified: get counts for all available properties
    const wilayaCountRows = await db
        .select({
            wilayaId: properties.wilayaId,
            count: count(),
        })
        .from(properties)
        .where(eq(properties.status, "available"))
        .groupBy(properties.wilayaId);

    const wilayaCounts: Record<number, number> = {};
    wilayaCountRows.forEach((r) => {
        if (r.wilayaId != null) {
            wilayaCounts[r.wilayaId] = r.count;
        }
    });

    // Get counts per type
    const typeCountRows = await db
        .select({
            type: properties.type,
            count: count(),
        })
        .from(properties)
        .where(eq(properties.status, "available"))
        .groupBy(properties.type);

    const typeCounts: Record<string, number> = {};
    typeCountRows.forEach((r) => {
        typeCounts[r.type] = r.count;
    });

    // Transform DB rows → Property interface
    const transformed: Property[] = rows.map((row, index) => ({
        id: offset + index + 1, // sequential numeric ID for frontend use
        dbId: row.id, // keep original UUID for API calls
        title: row.title,
        type: row.type,
        wilayaId: row.wilayaId ?? 0,
        wilayaName: row.wilayaName ?? row.city,
        price: Number(row.price),
        area: Number(row.area ?? 0),
        bedrooms: row.bedrooms ?? undefined,
        bathrooms: row.bathrooms ?? undefined,
        description: row.description ?? "",
        image: row.images?.[0] ?? "",
        images: row.images ?? [],
        center: row.latitude && row.longitude
            ? [Number(row.latitude), Number(row.longitude)]
            : [36.7538, 3.0588], // default to Algiers
        polygon: row.polygon ? JSON.parse(row.polygon) : [],
        address: row.address,
        status: row.status,
    }));

    const response: SearchResponse = {
        properties: transformed,
        total,
        page,
        limit,
        wilayaCounts,
        typeCounts,
    };

    return NextResponse.json(response);
}
