import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  useInactivityLogout();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4">
            <SidebarTrigger />
            <h1 className="font-display text-base font-semibold text-foreground">
              Association of Government Librarians
            </h1>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

