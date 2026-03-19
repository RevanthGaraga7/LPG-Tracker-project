import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame } from "lucide-react";

const cylinders = [
  { type: "Standard (14.2 kg)", price: "₹1,103", stock: 42, max: 50, color: "bg-primary" },
  { type: "Commercial (19 kg)", price: "₹2,101", stock: 18, max: 30, color: "bg-warning" },
  { type: "Small (5 kg)", price: "₹655", stock: 65, max: 80, color: "bg-accent" },
  { type: "Composite (10 kg)", price: "₹1,450", stock: 8, max: 20, color: "bg-info" },
];

export default function CylinderStock() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Cylinder Availability</h1>
      <p className="text-sm text-muted-foreground">Real-time stock levels at your nearest distribution center</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {cylinders.map((cyl) => {
          const pct = Math.round((cyl.stock / cyl.max) * 100);
          const low = pct < 30;
          return (
            <Card key={cyl.type} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Flame className="h-4 w-4 text-primary" />
                    {cyl.type}
                  </CardTitle>
                  <Badge variant={low ? "destructive" : "secondary"}>
                    {low ? "Low Stock" : "In Stock"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold">{cyl.price}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Available: {cyl.stock} units</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
