import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Flame } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading(false);

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials") ||
        error.message.toLowerCase().includes("invalid_grant") ||
        error.message.toLowerCase().includes("invalid")) {
      toast.error("No account found. Please register first.", {
        action: {
          label: "Register now",
          onClick: () => navigate("/register"),
        },
      });
    } else if (error.message.toLowerCase().includes("email not confirmed")) {
      toast.error("Please confirm your email before signing in. Check your inbox.");
    } else {
      toast.error(error.message);
    }
    return;
  }

  toast.success("Logged in successfully!");
  navigate("/dashboard");
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Flame className="h-6 w-6" />
          </div>
          <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your LPG Delivery account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
