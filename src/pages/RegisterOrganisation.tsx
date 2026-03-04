import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Upload, CheckCircle2 } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const steps = ["Organization Details", "Location", "Classification", "Security", "Review & Agree"];

const RegisterOrganisation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [form, setForm] = useState({
    organizationName: "", organizationEmail: "", contactPerson: "", contactPhone: "",
    logoFile: null as File | null,
    registrationDate: "", organizationAddress: "",
    country: "", county: "", town: "",
    certificateFile: null as File | null,
    organizationType: "", startDate: "", whatYouDo: "",
    password: "", confirmPassword: "",
    agreement: false, confirmData: false, dataProtection: false,
  });

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const passwordPolicy = [
    { label: "Min 8 characters", ok: form.password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(form.password) },
    { label: "Lowercase", ok: /[a-z]/.test(form.password) },
    { label: "Number", ok: /\d/.test(form.password) },
    { label: "Special char", ok: /[^A-Za-z0-9]/.test(form.password) },
  ];

  const canNext = () => {
    if (step === 0) return form.organizationName && form.organizationEmail && form.contactPerson && form.contactPhone;
    if (step === 1) return form.country && form.county && form.town;
    if (step === 2) return form.organizationType;
    if (step === 3) return passwordPolicy.every(p => p.ok) && form.password === form.confirmPassword;
    if (step === 4) return form.agreement && form.confirmData && form.dataProtection;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v instanceof File) fd.append(k, v);
        else if (typeof v === "boolean") fd.append(k, String(v));
        else if (v) fd.append(k, v as string);
      });
      await fetch("API_BASE_URL/api/auth/register/organisation", { method: "POST", body: fd });
      toast({ title: "Registration Successful", description: "You can now log in" });
      navigate("/login");
    } catch {
      toast({ title: "Error", description: "Registration failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const FileInput = ({ label, accept, fileKey }: { label: string; accept: string; fileKey: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <label className="flex items-center gap-2 border border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate">
          {(form as any)[fileKey]?.name || "Choose file..."}
        </span>
        <input type="file" accept={accept} className="hidden" onChange={e => set(fileKey, e.target.files?.[0] || null)} />
      </label>
    </div>
  );

  const PwToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <button onClick={() => navigate("/login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </button>
          <CardTitle style={{ fontFamily: "var(--font-display)" }}>Organisation Registration</CardTitle>
          <div className="flex items-center gap-1 mt-4">
            {steps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-2 w-full rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Step {step + 1}: {steps[step]}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Organization Name *</Label><Input value={form.organizationName} onChange={e => set("organizationName", e.target.value)} /></div>
                <div className="space-y-2"><Label>Organization Email *</Label><Input type="email" value={form.organizationEmail} onChange={e => set("organizationEmail", e.target.value)} /></div>
                <div className="space-y-2"><Label>Contact Person *</Label><Input value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)} /></div>
                <div className="space-y-2"><Label>Contact Phone *</Label><Input value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Registration Date</Label><Input type="date" value={form.registrationDate} onChange={e => set("registrationDate", e.target.value)} /></div>
                <div className="space-y-2"><Label>Organization Address</Label><Input value={form.organizationAddress} onChange={e => set("organizationAddress", e.target.value)} /></div>
              </div>
              <FileInput label="Logo Image" accept="image/*" fileKey="logoFile" />
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Country *</Label><Input value={form.country} onChange={e => set("country", e.target.value)} /></div>
                <div className="space-y-2"><Label>County *</Label><Input value={form.county} onChange={e => set("county", e.target.value)} /></div>
                <div className="space-y-2"><Label>Town *</Label><Input value={form.town} onChange={e => set("town", e.target.value)} /></div>
              </div>
              <FileInput label="Registration Certificate (PDF)" accept=".pdf" fileKey="certificateFile" />
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Type *</Label>
                <Select value={form.organizationType} onValueChange={v => set("organizationType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="governmental">Governmental</SelectItem>
                    <SelectItem value="non-governmental">Non-Governmental</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Date Registered With AGL</Label><Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} /></div>
              <div className="space-y-2"><Label>What You Do</Label><Textarea rows={3} value={form.whatYouDo} onChange={e => set("whatYouDo", e.target.value)} placeholder="Describe your organization's activities..." /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Password *</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} className="pr-10" value={form.password} onChange={e => set("password", e.target.value)} />
                  <PwToggle show={showPw} toggle={() => setShowPw(!showPw)} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {passwordPolicy.map(p => (
                    <span key={p.label} className={`text-xs ${p.ok ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>{p.ok ? "✓" : "○"} {p.label}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Password *</Label>
                <div className="relative">
                  <Input type={showCpw ? "text" : "password"} className="pr-10" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                  <PwToggle show={showCpw} toggle={() => setShowCpw(!showCpw)} />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-destructive">Passwords do not match</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4 space-y-3 text-sm">
                <h4 className="font-semibold text-foreground">Review Your Details</h4>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <span>Organization:</span><span className="text-foreground">{form.organizationName}</span>
                  <span>Email:</span><span className="text-foreground">{form.organizationEmail}</span>
                  <span>Contact:</span><span className="text-foreground">{form.contactPerson}</span>
                  <span>Phone:</span><span className="text-foreground">{form.contactPhone}</span>
                  <span>Country:</span><span className="text-foreground">{form.country}</span>
                  <span>County:</span><span className="text-foreground">{form.county}</span>
                  <span>Town:</span><span className="text-foreground">{form.town}</span>
                  <span>Type:</span><span className="text-foreground capitalize">{form.organizationType}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox id="agree" checked={form.agreement} onCheckedChange={v => set("agreement", !!v)} />
                  <Label htmlFor="agree" className="text-sm leading-snug">I agree to the membership terms and conditions</Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="confirm" checked={form.confirmData} onCheckedChange={v => set("confirmData", !!v)} />
                  <Label htmlFor="confirm" className="text-sm leading-snug">I confirm that all submitted information is accurate</Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="dataprotect" checked={form.dataProtection} onCheckedChange={v => set("dataProtection", !!v)} />
                  <Label htmlFor="dataprotect" className="text-sm leading-snug">I acknowledge and agree to the data protection policy</Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canNext() || submitting}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> {submitting ? "Submitting..." : "Submit Registration"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterOrganisation;
