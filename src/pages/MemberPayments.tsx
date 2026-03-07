import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CreditCard,
  CalendarDays,
  Clock,
  Download,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { generateReceipt } from "@/components/payments/ReceiptGenerator";

interface PaymentContact {
  email: string;
  phone: string;
}

interface MemberPayment {
  id: number;
  name: string;
  contacts: PaymentContact;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentCode: string;
  membershipType: string;
}

const MemberPaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<MemberPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/payments/member-payments");

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const result = await response.json();

      if (result.status === "success") {
        setPayments(result.data);
      } else {
        setError(result.message || "Failed to fetch payments");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `Ksh ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading payments...</span>
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
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center text-red-500">
                <p>Error loading payments: {error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchPayments}
                >
                  Retry
                </Button>
              </div>
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
                Member Payments
              </CardTitle>
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search using Payment Code, Member name or Member email"
                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payment records found.
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
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background hidden sm:table-cell">
                        Payment Code
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background">
                        Payment Date
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background">
                        Amount
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background hidden sm:table-cell">
                        Payment Number
                      </th>
                      <th className="pb-3 px-2 font-medium text-muted-foreground bg-background sticky right-0 z-30 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((m, i) => (
                      <tr
                        key={m.id}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                      >
                        <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-2 font-medium text-foreground whitespace-nowrap">
                          {m.name}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                          <div className="flex flex-col text-xs whitespace-nowrap">
                            <span>{m.contacts.email}</span>
                            <span>{m.contacts.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-foreground hidden sm:table-cell whitespace-nowrap">
                          {m.paymentCode}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                          <div className="flex flex-col items-start text-xs">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {m.paymentDate.split(",")[0]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {m.paymentDate.split(",")[1]?.trim()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium text-foreground whitespace-nowrap">
                          {formatAmount(m.amount)}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                          {m.paymentNumber}
                        </td>
                        <td className="py-3 px-2 sticky right-0 z-10 bg-background shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                          <button
                            onClick={() => generateReceipt(m)}
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
