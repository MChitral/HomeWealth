import { Home, FileText, GitCompare, DollarSign, Receipt, Shield, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/shared/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/shared/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Mortgage", url: "/mortgage", icon: Receipt },
  { title: "Scenarios", url: "/scenarios", icon: FileText },
  { title: "Comparison", url: "/comparison", icon: GitCompare },
  { title: "Cash Flow", url: "/cash-flow", icon: DollarSign },
  { title: "Emergency Fund", url: "/emergency-fund", icon: Shield },
] as const;

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <h1 className="text-xl font-semibold">Mortgage Strategy</h1>
        <p className="text-sm text-muted-foreground">Wealth Forecasting</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="space-y-3">
          {user && (
            <div className="text-sm">
              <p className="font-medium truncate">{user.email || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : ""}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

