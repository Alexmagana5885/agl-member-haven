import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CreditCard,
  CalendarDays,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { generatePremiumReceipt } from "@/components/payments/ReceiptGenerator";

// Types for the API response
interface PaymentDetails {
  paymentCode: string;
  amount: number;
  paymentDate: string;
}

interface Contacts {
  email: string;
  phone: string;
}

interface MemberPayment {
  id: number;
  name: string;
  contacts: Contacts;
  premiumFee: PaymentDetails;
  registrationFee: PaymentDetails | null;
  membershipType: string;
}

const MemberPaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<MemberPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/payments/member-premiums-payments", { credentials: "include" });
      
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      
      const result = await response.json();
      
      if (result.status === "success") {
        setPayments(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch payments");
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return dateStr;
  };

  const handleDownloadReceipt = (payment: MemberPayment) => {
    generatePremiumReceipt(payment);
  };

  // Filter payments based on search term
  const filteredPayments = payments.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.contacts.email.toLowerCase().includes(term) ||
      m.premiumFee.paymentCode.toLowerCase().includes(term) ||
      (m.registrationFee?.paymentCode?.toLowerCase().includes(term) ?? false)
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading payments...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-10 text-red-500">
                <XCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchPayments}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <CreditCard className="h-5 w-5 text-accent-foreground" />
                Member Premiums Payments
              </CardTitle>
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search using Payment Code, Member name or Member email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                {searchTerm ? "No payments match your search." : "No premium payments found."}
              </div>
            ) : (
              <div className="relative overflow-x-auto max-h-[70vh]">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead className="sticky top-0 z-20 bg-background">
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background">
                        #
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background">
                        Member
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background hidden sm:table-cell">
                        Contacts
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background">
                        Registration Fee
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background">
                        Premium Fee
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background hidden sm:table-cell">
                        Next Due
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background sticky right-0 z-30 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((m, i) => (
                      <tr
                        key={m.id || i}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                      >
                        <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-2 font-medium text-foreground">
                          {m.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({m.membershipType === 'organization' ? 'Org' : 'Personal'})
                          </span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                          <div className="flex flex-col text-xs">
                            <span>{m.contacts.email}</span>
                            <span>{m.contacts.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium text-foreground">
                          {m.registrationFee ? (
                            <div className="flex flex-col">
                              <span>{formatAmount(m.registrationFee.amount)}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(m.registrationFee.paymentDate)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-2 font-medium text-foreground">
                          <div className="flex flex-col">
                            <span>{formatAmount(m.premiumFee.amount)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(m.premiumFee.paymentDate)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium text-foreground hidden sm:table-cell">
                          {m.premiumFee.paymentDate ? (
                            <span className="text-xs">
                              {new Date(
                                new Date(m.premiumFee.paymentDate).setFullYear(
                                  new Date(m.premiumFee.paymentDate).getFullYear() + 1
                                )
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="py-3 px-2 sticky right-0 z-10 bg-background shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                          <button 
                            onClick={() => handleDownloadReceipt(m)}
                            className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 text-sm whitespace-nowrap"
                          >
                            <Download className="h-4 w-4" />
                            Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberPaymentsPage;

