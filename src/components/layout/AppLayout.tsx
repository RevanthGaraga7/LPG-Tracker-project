import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Flame, Home, Package, Truck, BarChart3, LogOut, User, MapPin, Phone, Cylinder } from "lucide-react";

const navItems = {
  customer: [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/book", label: "Book Cylinder", icon: Package },
    { to: "/orders", label: "My Orders", icon: Truck },
    { to: "/track", label: "Track", icon: MapPin },
    { to: "/stock", label: "Stock", icon: Cylinder },
    { to: "/support", label: "Support", icon: Phone },
  ],
  agent: [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/agent/orders", label: "Assigned Orders", icon: Truck },
  ],
  admin: [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/admin/orders", label: "All Orders", icon: Package },
    { to: "/admin/agents", label: "Agents", icon: User },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const items = navItems[role ?? "customer"];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg">Smart LPG Booking System</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button variant={active ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border/50 px-4 py-2 flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}>
                <Button variant={active ? "secondary" : "ghost"} size="sm" className="gap-1.5 text-xs whitespace-nowrap">
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
