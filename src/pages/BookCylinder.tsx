import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Flame } from "lucide-react";

export default function BookCylinder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cylinderType, setCylinderType] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("=== BOOKING DEBUG ===");
    console.log("User:", user);
    console.log("User ID:", user?.id);
    console.log("Cylinder Type:", cylinderType);
    console.log("Quantity:", quantity);
    console.log("Address:", address);
    console.log("Loading:", loading);
    console.log("===================");
    
    if (!user) {
      console.error("No user logged in!");
      toast.error("Please login to book a cylinder");
      return;
    }
    
    if (!address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Inserting order with data:", {
        user_id: user.id,
        cylinder_type: cylinderType,
        quantity,
        delivery_address: address.trim(),
        status: "booked",
      });
      
      const { data, error } = await supabase.from("orders").insert({
        user_id: user.id,
        cylinder_type: cylinderType,
        quantity,
        delivery_address: address.trim(),
        status: "booked",
      }).select();

      console.log("Insert result:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        toast.error(`Failed to book: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log("Order created successfully:", data);
        toast.success("Cylinder booked successfully!");
        setBookingComplete(true);
        // Small delay to ensure the toast is seen before navigation
        setTimeout(() => {
          // Reset form
          setCylinderType("standard");
          setQuantity(1);
          setAddress("");
          setBookingComplete(false);
          // Navigate to orders
          navigate("/orders", { replace: true });
        }, 1000);
      } else {
        console.warn("No data returned but no error");
        // Sometimes insert succeeds but returns empty array
        // Try to fetch the latest order
        const { data: latestOrder } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .eq("delivery_address", address.trim())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (latestOrder) {
          toast.success("Cylinder booked successfully!");
          setBookingComplete(true);
          setTimeout(() => {
            setCylinderType("standard");
            setQuantity(1);
            setAddress("");
            setBookingComplete(false);
            navigate("/orders", { replace: true });
          }, 1000);
        } else {
          toast.error("Unable to verify booking. Please check your orders.");
        }
      }
    } catch (err: any) {
      console.error("Unexpected error during booking:", err);
      toast.error(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display">Book LPG Cylinder</CardTitle>
              <CardDescription>Place a new cylinder delivery order</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleBook} className="booking-form">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cylinder-type">Cylinder Type</Label>
              <Select name="cylinder_type" value={cylinderType} onValueChange={setCylinderType}>
                <SelectTrigger id="cylinder-type"><SelectValue placeholder="Select cylinder type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (14.2 kg)</SelectItem>
                  <SelectItem value="small">Small (5 kg)</SelectItem>
                  <SelectItem value="commercial">Commercial (19 kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity"
                name="quantity"
                type="number" 
                min={1} 
                max={10} 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Input 
                id="address"
                name="address"
                placeholder="Enter your full delivery address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !user || !address.trim()}
            >
              {loading ? "Booking..." : "Book Now"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
