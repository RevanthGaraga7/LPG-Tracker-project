import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  booked: "bg-info text-info-foreground",
  assigned: "bg-warning text-warning-foreground",
  out_for_delivery: "bg-primary text-primary-foreground",
  delivered: "bg-accent text-accent-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const isMountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  const fetchOrders = useCallback(async (isManualRefresh = false) => {
  if (!user || fetching) return;

  setFetching(true);

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!isMountedRef.current) return;

    if (error) {
      toast.error(error.message || "Failed to load orders");
    } else {
      setOrders(data ?? []);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  } finally {
    if (isMountedRef.current) {
      setLoading(false);
      setRefreshing(false);
    }
    setFetching(false);
  }
}, [user, fetching]);
  
   
  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    setRefreshing(true);
    fetchOrders(true);
  }, [fetchOrders]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Initial fetch - always fresh
    console.log("Initial orders fetch");
    fetchOrders(false);

    // Set up real-time subscription
    const channel = supabase
      .channel("customer-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, () => {
        console.log("Real-time update received, refetching orders...");
        fetchOrders(false);
      })
      .subscribe();

    return () => { 
      console.log("Cleaning up orders subscription");
      isMountedRef.current = false;
      supabase.removeChannel(channel); 
    };
  }, [user, fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">My Orders</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No orders found.</p>
          <p className="text-sm text-muted-foreground mt-2">Book your first LPG cylinder to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="font-medium">{order.cylinder_type} × {order.quantity}</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    <p className="text-xs text-muted-foreground">Ordered: {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <Badge className={statusColors[order.status] || "bg-gray-200"}>{order.status.replace(/_/g, " ")}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
