import ProviderSidebar from "@/app/components/provider-sidebar";
import ProviderNavbar from "@/app/components/provider-navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Allow both "services" role and admin (no strict role check for now to avoid breakage)
  // In production you may want: if (session.user.role !== "services") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-muted/30">
      <ProviderSidebar />
      <div className="mr-[72px] flex min-h-screen flex-col">
        <ProviderNavbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
