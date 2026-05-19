import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ProviderProfileClient from "./client";

export default async function ProviderProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const provider = await db
    .select()
    .from(services)
    .where(eq(services.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] || null);

  return (
    <ProviderProfileClient
      userName={session.user.name || "مزود خدمة"}
      userEmail={session.user.email}
      userImage={session.user.image ?? null}
      initialProfile={
        provider
          ? {
              companyName: provider.companyName || "",
              phone: provider.phone || "",
              address: provider.address || "",
              serviceType: provider.serviceType || "",
              description: provider.description || "",
            }
          : null
      }
    />
  );
}
