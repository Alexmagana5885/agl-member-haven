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

      // console.log("Full API Response:", result);
      // console.log("Payments Array:", result.data);
      // console.log("First Payment:", result.data?.[0]);

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
          <CardHeader className="pb-3 flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <CreditCard className="h-5 w-5 text-accent-foreground" />
              Member Payments
            </CardTitle>

            <div className="w-80">
              <input
                type="text"
                placeholder="Search using Payment Code, Member name or Member email"
                className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payment records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Member
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">
                        Contacts
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">
                        Payment Code
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Payment Date
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Amount
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">
                        Payment Number
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
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
                        <td className="py-3 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 font-medium text-foreground">
                          {m.name}
                        </td>
                        <td className="py-3 text-muted-foreground hidden sm:table-cell">
                          <div className="flex flex-col text-xs">
                            <span>{m.contacts.email}</span>
                            <span>{m.contacts.phone}</span>
                          </div>
                        </td>

                        <td className="py-3 text-foreground hidden sm:table-cell">
                          {m.paymentCode}
                        </td>
                        <td className="py-3 text-muted-foreground">
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
                        <td className="py-3 font-medium text-foreground">
                          {formatAmount(m.amount)}
                        </td>
                        <td className="py-3 text-muted-foreground hidden sm:table-cell">
                          {m.paymentNumber}
                        </td>
                        <td className="py-3">
                          <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                            <Download className="h-5 w-5 text-white" />
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
