import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "newPassword">("email");
  const [email, setEmail] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordPolicy = [
    { label: "Min 8 characters", ok: newPassword.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "Lowercase letter", ok: /[a-z]/.test(newPassword) },
    { label: "A number", ok: /\d/.test(newPassword) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast({ title: "Error", description: "Enter your email", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      toast({ title: "Code Sent", description: "Check your email for the verification code" });
      setOtpOpen(true);
    } catch {
      toast({ title: "Error", description: "Failed to send code", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otp.length < 6) { toast({ title: "Error", description: "Enter the full 6-digit code", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-code`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code: otp }) });
      if (!res.ok) throw new Error();
      setOtpOpen(false);
      setStep("newPassword");
      toast({ title: "Verified", description: "Set your new password" });
    } catch {
      toast({ title: "Invalid Code", description: "The code you entered is incorrect", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPolicy.every(p => p.ok)) { toast({ title: "Weak Password", description: "Meet all password requirements", variant: "destructive" }); return; }
    if (newPassword !== confirmPassword) { toast({ title: "Mismatch", description: "Passwords do not match", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/set-new-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: newPassword, code: otp }) });
      toast({ title: "Success", description: "Password reset successfully" });
      navigate("/login");
    } catch {
      toast({ title: "Error", description: "Failed to reset password", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-2">
            {step === "email" ? <Mail className="h-6 w-6 text-primary" /> : <ShieldCheck className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle style={{ fontFamily: "var(--font-display)" }}>
            {step === "email" ? "Reset Password" : "Set New Password"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {step === "email" ? "Enter your email to receive a verification code" : "Create a strong new password"}
          </p>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input id="reset-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Sending..." : "Send Verification Code"}</Button>
              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type={showPw ? "text" : "password"} className="pl-10 pr-10" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {passwordPolicy.map(p => (
                    <span key={p.label} className={`text-xs flex items-center gap-1 ${p.ok ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>
                      {p.ok ? "✓" : "○"} {p.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type={showCpw ? "text" : "password"} className="pl-10 pr-10" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-destructive">Passwords do not match</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Resetting..." : "Reset Password"}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* OTP Verification Dialog */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Enter Verification Code</DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-muted-foreground">We sent a 6-digit code to <strong>{email}</strong></p>
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleVerifyCode} className="w-full" disabled={submitting}>{submitting ? "Verifying..." : "Verify Code"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResetPassword;
