import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Upload, CheckCircle2 } from "lucide-react";

const steps = ["Personal Details", "Education", "Professional", "Security", "Review & Agree"];

const RegisterIndividual = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", gender: "", homeAddress: "",
    passportFile: null as File | null,
    highestDegree: "", institution: "", graduationYear: "",
    completionLetterFile: null as File | null,
    profession: "", experience: "", currentCompany: "", position: "", workAddress: "",
    password: "", confirmPassword: "",
    agreement: false, confirmData: false,
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
    if (step === 0) return form.name && form.email && form.phone && form.gender;
    if (step === 1) return form.highestDegree && form.institution && form.graduationYear;
    if (step === 2) return form.profession && form.experience;
    if (step === 3) return passwordPolicy.every(p => p.ok) && form.password === form.confirmPassword;
    if (step === 4) return form.agreement && form.confirmData;
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
      await fetch("/api/auth/register/individual", { method: "POST", body: fd });
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

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <button onClick={() => navigate("/login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </button>
          <CardTitle style={{ fontFamily: "var(--font-display)" }}>Individual Registration</CardTitle>
          {/* Step Indicator */}
          <div className="flex items-center gap-1 mt-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
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
                <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select value={form.gender} onValueChange={v => set("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Home Address</Label><Input value={form.homeAddress} onChange={e => set("homeAddress", e.target.value)} /></div>
              <FileInput label="Passport Image" accept="image/*" fileKey="passportFile" />
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Highest Qualification *</Label>
                <Select value={form.highestDegree} onValueChange={v => set("highestDegree", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["PHD", "Masters", "Degree", "Diploma", "Certificate"].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Institution *</Label><Input value={form.institution} onChange={e => set("institution", e.target.value)} /></div>
                <div className="space-y-2"><Label>Year of Graduation *</Label><Input type="number" value={form.graduationYear} onChange={e => set("graduationYear", e.target.value)} /></div>
              </div>
              <FileInput label="Completion Letter" accept=".pdf,image/*" fileKey="completionLetterFile" />
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Profession *</Label><Input value={form.profession} onChange={e => set("profession", e.target.value)} /></div>
              <div className="space-y-2"><Label>Years of Experience *</Label><Input type="number" value={form.experience} onChange={e => set("experience", e.target.value)} /></div>
              <div className="space-y-2"><Label>Current Organization</Label><Input value={form.currentCompany} onChange={e => set("currentCompany", e.target.value)} /></div>
              <div className="space-y-2"><Label>Current Position</Label><Input value={form.position} onChange={e => set("position", e.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Work Address</Label><Input value={form.workAddress} onChange={e => set("workAddress", e.target.value)} /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Password *</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} className="pr-10" value={form.password} onChange={e => set("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
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
                  <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
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
                  <span>Name:</span><span className="text-foreground">{form.name}</span>
                  <span>Email:</span><span className="text-foreground">{form.email}</span>
                  <span>Phone:</span><span className="text-foreground">{form.phone}</span>
                  <span>Gender:</span><span className="text-foreground capitalize">{form.gender}</span>
                  <span>Qualification:</span><span className="text-foreground">{form.highestDegree}</span>
                  <span>Institution:</span><span className="text-foreground">{form.institution}</span>
                  <span>Profession:</span><span className="text-foreground">{form.profession}</span>
                  <span>Experience:</span><span className="text-foreground">{form.experience} years</span>
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
              </div>
            </div>
          )}

          {/* Navigation */}
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

export default RegisterIndividual;
