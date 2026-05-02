import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  UserCircle,
  CheckCircle2,
  Mail,
  Loader2,
} from "lucide-react";
import { getProfileData, type ProfileData } from "@/services/api";
import avatarImg from "@/assets/AGLlogo.png";
import mpesaImg from "@/assets/mpesa.png";

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function OnlinePayments() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regDialogOpen, setRegDialogOpen] = useState(false);
  const [premDialogOpen, setPremDialogOpen] = useState(false);
  const [regPhone, setRegPhone] = useState("");
  const [premPhone, setPremPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfileData();
      setProfile(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const makePayment = async (
    endpoint: string,
    amount: number,
    phone: string,
    type: "registration" | "premium",
  ) => {
    if (!profile?.email) {
      toast({
        title: "Error",
        description: "Email not found",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        User_email: profile.email,
        phone_number: phone,
        amount,
      };

        // console.log(" Sending payment payload:", {
        //   endpoint,
        //   type,
        //   payload,
        // });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Payment Initiated",
          description: "Check your phone for M-Pesa PIN prompt",
        });
        if (type === "registration") setRegDialogOpen(false);
        else setPremDialogOpen(false);
        setRegPhone("");
        setPremPhone("");
      } else {
        toast({
          title: "Payment Failed",
          description: result.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Payments
          </h1>
          <p className="text-muted-foreground">
            Manage your membership payments securely with M-Pesa
          </p>
        </div>

        {/* Upper Section: User Details */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UserCircle className="h-6 w-6" />
              {profile?.name || "Member Profile"}
            </h2>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
              <img
                src={
                  profile?.image_path
                    ? `/uploads/${profile.image_path.replace(/^uploads[\/\\]/i, "")}`
                    : avatarImg
                }
                alt="Profile"
                className="h-24 w-24 rounded-full border-4 border-card object-cover shadow-lg flex-shrink-0"
              />
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center md:items-start p-4 rounded-lg bg-accent">
                    <Mail className="h-5 w-5 text-primary mb-2" />
                    <p className="text-sm font-medium">{profile?.email}</p>
                  </div>
                  <div
                    className={`flex flex-col items-center md:items-start p-4 rounded-lg bg-accent ${profile?.payments.fully_paid ? "border-green-200 ring-2 ring-green-200/50" : ""}`}
                  >
                    <CreditCard className="h-5 w-5 mb-2 text-primary" />
                    <p className="text-sm font-medium">
                      {profile?.payments.status || "N/A"}
                    </p>
                    {profile?.payments.fully_paid && (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    )}
                  </div>
                  <div className="flex flex-col items-center md:items-start p-4 rounded-lg bg-accent">
                    <CreditCard className="h-5 w-5 text-primary mb-2" />
                    <p className="text-sm font-medium">
                      KES{" "}
                      {profile?.payments.total_paid_this_year?.toLocaleString() ||
                        0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Paid This Year
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-accent">
                  <p className="text-sm">
                    <span className="font-medium">Next Payment: </span>
                    <span
                      className={
                        profile?.payments.fully_paid
                          ? "text-green-600"
                          : "text-orange-600"
                      }
                    >
                      {formatDate(profile?.payments.next_payment_date || "")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lower Section: Payment Forms */}
        <Card className="shadow-card">
          <CardHeader>
            <h3 className="text-xl font-bold">Make a Payment</h3>
            <p className="text-muted-foreground">
              Select payment type and enter your M-Pesa number
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Registration Payment */}
              <div className="group">
                <Button
                  onClick={() => setRegDialogOpen(true)}
                  className="w-full h-32 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all group-hover:scale-[1.02] relative overflow-hidden"
                >
                  <CreditCard className="h-8 w-8 mb-2" />
                  <div>
                    <div className="font-bold text-lg">Registration Fee</div>
                    <div className="text-sm opacity-90">KES 2,000</div>
                  </div>
                </Button>
              </div>

              {/* Premium Payment */}
              <div className="group">
                <Button
                  onClick={() => setPremDialogOpen(true)}
                  className="w-full h-32 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all group-hover:scale-[1.02] relative overflow-hidden"
                >
                  <CreditCard className="h-8 w-8 mb-2" />
                  <div>
                    <div className="font-bold text-lg">Annual Premium</div>
                    <div className="text-sm opacity-90">KES 3,600</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Payment Dialog */}
      <Dialog open={regDialogOpen} onOpenChange={setRegDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <img src={mpesaImg} alt="M-Pesa" className="h-10 w-auto" />
              Registration Payment
            </DialogTitle>
            <DialogDescription>
              Confirm payment of Two Thousand Kenyan Shillings (2,000 Ksh) as
              membership fees to the Association of Government Librarians.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-medium">
                User Email
              </Label>
              <Input
                id="reg-email"
                value={profile?.email || ""}
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="e.g. 0722000000"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-amount" className="text-sm font-medium">
                Amount
              </Label>
              <Input
                id="reg-amount"
                value="2000"
                readOnly
                className="bg-muted/50 font-mono text-lg"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRegDialogOpen(false);
                setRegPhone("");
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                makePayment(
                  "/api/payments/register-fee",
                  2000,
                  regPhone,
                  "registration",
                )
              }
              disabled={submitting || !regPhone || !profile?.email}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {submitting ? "Processing..." : "Make Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Payment Dialog */}
      <Dialog open={premDialogOpen} onOpenChange={setPremDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <img src={mpesaImg} alt="M-Pesa" className="h-10 w-auto" />
              Premium Payment
            </DialogTitle>
            <DialogDescription>
              Confirm payment of 3,600 Ksh as annual membership fees to the
              Association of Government Librarians.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="prem-email" className="text-sm font-medium">
                User Email
              </Label>
              <Input
                id="prem-email"
                value={profile?.email || ""}
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prem-phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="prem-phone"
                type="tel"
                placeholder="e.g. 0722000000"
                value={premPhone}
                onChange={(e) => setPremPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prem-amount" className="text-sm font-medium">
                Amount
              </Label>
              <Input
                id="prem-amount"
                value="3600"
                readOnly
                className="bg-muted/50 font-mono text-lg"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPremDialogOpen(false);
                setPremPhone("");
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                makePayment(
                  "/api/payments/premium/pay",
                  3600,
                  premPhone,
                  "premium",
                )
              }
              disabled={submitting || !premPhone || !profile?.email}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {submitting ? "Processing..." : "Make Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
