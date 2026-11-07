import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Receipt,
  Settings,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { LoadingState } from "@/components/site/States";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStore } from "@/context/store";
import { images } from "@/data/images";
import { adminService } from "@/services/admin.service";
import { isBackendConnected } from "@/services/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Biriyani Babu" },
      { name: "description", content: "Biriyani Babu restaurant management." },
      { property: "og:title", content: "Admin — Biriyani Babu" },
      { property: "og:description", content: "Biriyani Babu restaurant management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", Icon: Receipt },
  { to: "/admin/products", label: "Products", Icon: UtensilsCrossed },
  { to: "/admin/customers", label: "Customers", Icon: Users },
  { to: "/admin/payments", label: "Payments", Icon: CreditCard },
  { to: "/admin/offers", label: "Offers & Banners", Icon: Megaphone },
  { to: "/admin/analytics", label: "Sales Analytics", Icon: BarChart3 },
  { to: "/admin/settings", label: "Restaurant Settings", Icon: Settings },
] as const;

function AdminLayout() {
  const [session, setSession] = useState<string | null | undefined>(undefined);
  useEffect(() => setSession(adminService.currentSession()), []);

  if (session === undefined) return <LoadingState />;
  if (!session) return <AdminLogin onSuccess={setSession} />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AdminSidebar
          email={session}
          onLogout={() => {
            adminService.logout();
            setSession(null);
          }}
        />
        <SidebarInset className="bg-muted/40">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur">
            <SidebarTrigger />
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-earth">
              {isBackendConnected ? "Live Database" : "Demo Preview (Requires Backend Auth)"}
            </span>
            <OpenStatus />
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              View website <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </header>
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function OpenStatus() {
  const { settings } = useStore();
  const open = settings.isOpen && settings.acceptingOrders;
  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
      <span className={`h-2 w-2 rounded-full ${open ? "bg-success" : "bg-destructive"}`} />
      {open ? "Accepting orders" : "Not accepting orders"}
    </span>
  );
}

function AdminSidebar({ email, onLogout }: { email: string; onLogout: () => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) =>
    to === "/admin" ? path === "/admin" || path === "/admin/" : path.startsWith(to);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="items-center py-4">
        <img
          src={images.logo}
          alt="Biriyani Babu"
          className={collapsed ? "h-9 w-9 object-contain" : "h-20 w-auto"}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ to, label, Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild isActive={isActive(to)} tooltip={label}>
                    <Link to={to}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && <p className="truncate px-2 text-xs text-sidebar-foreground/60">{email}</p>}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip="Sign out">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
