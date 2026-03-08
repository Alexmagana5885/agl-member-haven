import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, CalendarCheck, CalendarClock, DollarSign, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitPayment } from "@/services/api";

type PaymentType = "fee" | "premium" | null;

const paymentInfo = {
  fee: { amount: "1", label: "membership registration fees" },
  premium: { amount: "3600", label: "annual membership premium" },
};

export function MembershipSection() {
  const [openPayment, setOpenPayment] = useState<PaymentType>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const info = openPayment ? paymentInfo[openPayment] : null;

  const handleClose = () => {
    setOpenPayment(null);
    setEmail("");
    setPhone("");
  };

  const handleConfirm = async () => {
    if (!openPayment || !info) return;
    setSubmitting(true);
    try {
      await submitPayment({ email, phone, amount: info.amount, type: openPayment });
      toast({ title: "Success", description: "Payment submitted successfully" });
      handleClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Payment failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <CreditCard className="h-5 w-5 text-accent-foreground" />
            Membership & Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard icon={CalendarCheck} label="Last Payment" value="12 Dec 2025" />
            <StatCard icon={CalendarClock} label="Next Payment" value="12 Dec 2026" />
            <StatCard icon={DollarSign} label="Last Amount Paid" value="KES 5,000" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpenPayment("fee")}>
              Pay Membership Fee
            </Button>
            <Button variant="outline" className="border-primary text-accent-foreground hover:bg-accent" onClick={() => setOpenPayment("premium")}>
              Pay Membership Premium
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!openPayment} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <CreditCard className="h-5 w-5 text-primary" />
              M-Pesa Payment
            </DialogTitle>
            <DialogDescription>
              Confirm that you are making a payment of <span className="font-semibold text-foreground">{info?.amount} Ksh</span> as {info?.label} to the Association of Government Librarians.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pay-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> User Email
              </Label>
              <Input id="pay-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Number
              </Label>
              <Input id="pay-phone" type="tel" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input readOnly value={`KES ${info?.amount || ""}`} className="bg-accent" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting} onClick={handleConfirm}>
              {submitting ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-accent/50 p-4 text-center">
      <Icon className="mx-auto mb-2 h-5 w-5 text-accent-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
