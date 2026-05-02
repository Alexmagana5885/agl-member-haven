import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AGLlogo from "@/assets/AGLlogo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memberType, setMemberType] = useState<"individual" | "organisation">("individual");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "", description: "Kindly fill in all fields", variant: "destructive" });
      return;
    }
    
    const payload = { email, password, memberType };
    console.log("[LOGIN] Payload being sent to backend:", payload);
    
    setSubmitting(true);
    try {
      console.log("[LOGIN] Sending request to:", `${API_BASE_URL}/api/auth/login`);
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      console.log("[LOGIN] Response status:", res.status);
      if (!res.ok) throw new Error("Login failed");
      toast({ title: "", description: "Welcome Back!!" });
      navigate("/dashboard");
    } catch (err) {
      console.error("[LOGIN] Error:", err);
      toast({ title: "Invalid email or password", description: "Kindly try Again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left/Welcome - top on small, left on lg */}
      <div className="w-full lg:w-1/2 bg-white order-1 p-8 lg:p-12 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <img src={AGLlogo} alt="AGL Logo" className="h-20 w-48 mx-auto object-contain" />
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600">
            Access your membership dashboard, and stay connected with the community.
          </p>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>
      </div>

      {/* Right/Form - bottom on small, right on lg */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white order-2 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/20 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2 pb-8">
            <CardTitle className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Sign In
            </CardTitle>
            <p className="text-white/80 text-sm">Choose your account type and sign in</p>
          </CardHeader>
          <CardContent className="bg-white/50 rounded-2xl p-8">
            <div className="flex gap-3 mb-8">
              <button
                type="button"
                onClick={() => setMemberType("individual")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-medium transition-all ${
                  memberType === "individual"
                    ? "border-blue-300 bg-blue-100 text-blue-900 shadow-md"
                    : "border-white/50 hover:border-white hover:bg-white/20"
                }`}
              >
                <User className="h-4 w-4" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => setMemberType("organisation")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-medium transition-all ${
                  memberType === "organisation"
                    ? "border-blue-300 bg-blue-100 text-blue-900 shadow-md"
                    : "border-white/50 hover:border-white hover:bg-white/20"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Organisation
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10 bg-white border-gray-200 shadow-sm" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 bg-white border-gray-200 shadow-sm" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/reset-password" className="text-sm text-blue-200 hover:text-white underline">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center pt-6 border-t border-white/30">
              <p className="text-sm text-gray-900">
                Don't have an account?{" "}
                <button onClick={() => setShowRegisterDialog(true)} className="text-blue-200 font-semibold hover:text-white underline">
                  Register
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Register As</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => { setShowRegisterDialog(false); navigate("/register/individual"); }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
            >
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
                <User className="h-7 w-7 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Individual</span>
              <span className="text-xs text-gray-600 text-center">Personal membership</span>
            </button>
            <button
              onClick={() => { setShowRegisterDialog(false); navigate("/register/organisation"); }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
            >
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Organisation</span>
              <span className="text-xs text-gray-600 text-center">Company membership</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
