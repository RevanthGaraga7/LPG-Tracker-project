import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Square, Phone, MapPin, Fuel, Clock, Truck } from "lucide-react";

const statusColors: Record<string, string> = {
  booked: "bg-info text-info-foreground",
  assigned: "bg-warning text-warning-foreground",
  out_for_delivery: "bg-primary text-primary-foreground",
  delivered: "bg-accent text-accent-foreground",
};

const TOTAL_DEMO_STEPS = 12;

const SAMPLE_ORDERS = [
  {
    id: "demo-1",
    cylinder_type: "Standard 14.2kg",
    quantity: 2,
    delivery_address: "304, Sai Krupa Apt, Dadar West, Mumbai",
    status: "out_for_delivery",
    agent: { name: "Rajesh Kumar", phone: "+91 98765 43210", vehicle: "MH-12-AB-1234" },
    eta: "12 min",
  },
  {
    id: "demo-2",
    cylinder_type: "Commercial 19kg",
    quantity: 1,
    delivery_address: "Hotel Spice Garden, Parel, Mumbai",
  }]
export default function TrackOrder() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [agentProfiles, setAgentProfiles] = useState<Record<string, { full_name: string; phone: string }>>({});
  const [loading, setLoading] = useState(true);
  const [hasRealOrders, setHasRealOrders] = useState(false);

  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const demoInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["assigned", "out_for_delivery"])
        .order("created_at", { ascending: false });

      const activeOrders = orderData ?? [];
      setOrders(activeOrders);
      setHasRealOrders(activeOrders.length > 0);

      const agentIds = [...new Set(activeOrders.map((o) => o.agent_id).filter(Boolean))];

      if (agentIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", agentIds);

        const profMap: Record<string, { full_name: string; phone: string }> = {};
        (profiles ?? []).forEach((p) => {
          profMap[p.id] = { full_name: p.full_name, phone: p.phone ?? "" };
        });
        setAgentProfiles(profMap);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const startDemo = useCallback(() => {
    setDemoActive(true);
    setDemoStep(0);
    demoInterval.current = setInterval(() => {
      setDemoStep((prev) => {
        if (prev >= TOTAL_DEMO_STEPS - 1) {
          if (demoInterval.current) clearInterval(demoInterval.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  }, []);

  const stopDemo = useCallback(() => {
    setDemoActive(false);
    setDemoStep(0);
    if (demoInterval.current) clearInterval(demoInterval.current);
  }, []);

  useEffect(() => {
    return () => {
      if (demoInterval.current) clearInterval(demoInterval.current);
    };
  }, []);

  const showDemo = !hasRealOrders;
  const demoDelivered = demoStep >= TOTAL_DEMO_STEPS - 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Live Tracking</h1>
        {showDemo && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">SAMPLE DATA</Badge>
            {!demoActive ? (
              <Button size="sm" onClick={startDemo} className="gap-1">
                <Play className="h-3 w-3" /> Start Demo
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={stopDemo} className="gap-1">
                <Square className="h-3 w-3" /> Stop
              </Button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <>
          {/* ETA Banner */}
          {showDemo && demoActive && !demoDelivered && (
            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="py-3 flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary animate-pulse" />
                <div>
                  <p className="font-semibold text-sm">Agent is on the way!</p>
                  <p className="text-xs text-muted-foreground">
                    ETA: ~{Math.max(1, 12 - Math.floor(demoStep * 1.2))} min • {TOTAL_DEMO_STEPS - demoStep} stops remaining
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {showDemo && demoDelivered && (
            <Card className="bg-accent/20 border-accent/40">
              <CardContent className="py-3 flex items-center gap-3">
                <Fuel className="h-5 w-5 text-accent-foreground" />
                <p className="font-semibold text-sm">✅ Cylinder delivered successfully!</p>
              </CardContent>
            </Card>
          )}

          {/* Order Cards */}
          <div className="space-y-3">
            {(showDemo ? SAMPLE_ORDERS : orders).map((order) => {
              const isDemo = showDemo;
              const agent = isDemo ? (order as any).agent : null;
              const profile = !isDemo && order.agent_id ? agentProfiles[order.agent_id] : null;

              return (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-primary" />
                          <p className="font-medium">{order.cylinder_type} × {order.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <p>{order.delivery_address}</p>
                        </div>

                        {(agent || profile) && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm space-y-2 border border-border/50">
                            <p className="font-semibold flex items-center gap-2">
                              <Truck className="h-4 w-4 text-primary" />
                              {agent?.name || profile?.full_name}
                            </p>
                            {(agent?.phone || profile?.phone) && (
                              <p className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {agent?.phone || profile?.phone}
                              </p>
                            )}
                            {agent?.vehicle && <p className="text-xs text-muted-foreground">🚛 {agent.vehicle}</p>}
                            {isDemo && (order as any).eta && (
                              <p className="flex items-center gap-2 text-xs font-medium text-primary">
                                <Clock className="h-3 w-3" />
                                ETA: {(order as any).eta}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge className={statusColors[order.status] || "bg-gray-200"}>{(order.status || "booked").replace(/_/g, " ")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
