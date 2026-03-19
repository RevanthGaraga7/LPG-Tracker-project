import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Truck, Package, CheckCircle } from "lucide-react";

const statusFlow: Record<string, string> = {
  assigned: "out_for_delivery",
  out_for_delivery: "delivered",
};

const statusColors: Record<string, string> = {
  assigned: "bg-warning text-warning-foreground",
  out_for_delivery: "bg-primary text-primary-foreground",
  delivered: "bg-accent text-accent-foreground",
};

export default function AgentDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("agent_id", user.id)
      .in("status", ["assigned", "out_for_delivery", "delivered"])
      .order("updated_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Order marked as ${newStatus.replace(/_/g, " ")}`);
      fetchOrders();
    }
  };

  const active = orders.filter((o) => o.status !== "delivered");
  const completed = orders.filter((o) => o.status === "delivered");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Agent Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Total Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{active.length}</p>
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
              <p className="text-2xl font-display font-bold">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Assigned Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders assigned to you.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{order.cylinder_type} × {order.quantity}</p>
                    <p className="text-xs text-muted-foreground">{order.delivery_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[order.status] ?? ""}>{order.status.replace(/_/g, " ")}</Badge>
                    {statusFlow[order.status] && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, statusFlow[order.status])}>
                        Mark {statusFlow[order.status].replace(/_/g, " ")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
