import {
  Home,
  FileText,
  GitCompare,
  DollarSign,
  Receipt,
  Shield,
  CreditCard,
  TrendingUp,
} from "lucide-react";
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
} from "@/shared/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Mortgage", url: "/mortgage", icon: Receipt },
  { title: "HELOC", url: "/heloc", icon: CreditCard },
  { title: "Scenarios", url: "/scenarios", icon: FileText },
  { title: "Comparison", url: "/comparison", icon: GitCompare },
  { title: "Cash Flow", url: "/cash-flow", icon: DollarSign },
  { title: "Emergency Fund", url: "/emergency-fund", icon: Shield },
  { title: "Smith Maneuver", url: "/smith-maneuver", icon: TrendingUp },
] as const;

export function AppSidebar() {
  const [location] = useLocation();

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
                    aria-label={item.title}
                  >
                    <Link href={item.url} aria-label={item.title}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
