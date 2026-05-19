import DashboardSidebar from "@/app/components/dashboard-sidebar";
import DashboardNavbar from "@/app/components/dashboard-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar />
      <div className="mr-[72px] flex min-h-screen flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
