import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Package, Truck, Clock, CheckCircle, MapPin, Phone, Cylinder } from "lucide-react";

const statusColors: Record<string, string> = {
  booked: "bg-info text-info-foreground",
  assigned: "bg-warning text-warning-foreground",
  out_for_delivery: "bg-primary text-primary-foreground",
  delivered: "bg-accent text-accent-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [agentProfiles, setAgentProfiles] = useState<Record<string, { full_name: string; phone: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      const list = data ?? [];
      setOrders(list);

      // Fetch agent profiles for assigned orders
      const agentIds = [...new Set(list.map((o) => o.agent_id).filter(Boolean))];
      if (agentIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone").in("id", agentIds);
        const map: Record<string, { full_name: string; phone: string }> = {};
        (profiles ?? []).forEach((p) => { map[p.id] = { full_name: p.full_name, phone: p.phone ?? "" }; });
        setAgentProfiles(map);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ["booked", "assigned", "out_for_delivery"].includes(o.status||"booked")).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Customer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your LPG cylinder orders</p>
        </div>
        <Link to="/book">
          <Button className="gap-2">
            <Package className="h-4 w-4" />
            Book Cylinder
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{stats.delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link to="/track">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">Live Tracking</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/stock">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <Cylinder className="h-5 w-5 text-warning" />
              <span className="font-medium text-sm">Cylinder Stock</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/support">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <Phone className="h-5 w-5 text-accent" />
              <span className="font-medium text-sm">Customer Care</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders with Agent Details */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No orders yet. Book your first cylinder!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="p-3 rounded-lg border border-border/50 bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{order.cylinder_type} × {order.quantity}</p>
                      <p className="text-xs text-muted-foreground">{order.delivery_address}</p>
                      <p className="text-xs text-muted-foreground">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "Just now"}</p>
                    </div>
                    <Badge className={statusColors[order.status] || "bg-gray-200"}>{(order.status || "booked").replace(/_/g, " ")}</Badge>
                  </div>
                  {order.agent_id && agentProfiles[order.agent_id] && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{agentProfiles[order.agent_id].full_name}</span>
                      {agentProfiles[order.agent_id].phone && (
                        <span className="text-muted-foreground">• 📞 {agentProfiles[order.agent_id].phone}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
