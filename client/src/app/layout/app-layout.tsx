import { PropsWithChildren, CSSProperties } from "react";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { AppSidebar } from "@/widgets/navigation/app-sidebar";
import { Toaster } from "@/shared/ui/toaster";

const sidebarStyle: CSSProperties & Record<string, string> = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

