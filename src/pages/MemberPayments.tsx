import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, CalendarDays, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const memberPayments = [
  { name: "Dr. Amina Osei", lastPayment: "10 Jan 2026", amount: "Ksh 3,600", nextDue: "10 Jan 2027", status: "Paid" },
  { name: "Prof. James Kariuki", lastPayment: "5 Dec 2025", amount: "Ksh 7,200", nextDue: "5 Dec 2026", status: "Paid" },
  { name: "Mary Wanjiku", lastPayment: "18 Nov 2025", amount: "Ksh 3,600", nextDue: "18 Nov 2026", status: "Paid" },
  { name: "John Odhiambo", lastPayment: "2 Mar 2025", amount: "Ksh 3,600", nextDue: "2 Mar 2026", status: "Overdue" },
  { name: "Grace Muthoni", lastPayment: "29 Jan 2026", amount: "Ksh 3,600", nextDue: "29 Jan 2027", status: "Paid" },
  { name: "Peter Kamau", lastPayment: "14 Feb 2026", amount: "Ksh 7,200", nextDue: "14 Feb 2027", status: "Paid" },
  { name: "Sarah Akinyi", lastPayment: "8 Jun 2024", amount: "Ksh 3,600", nextDue: "8 Jun 2025", status: "Overdue" },
  { name: "David Mutua", lastPayment: "20 Feb 2026", amount: "Ksh 3,600", nextDue: "20 Feb 2027", status: "Paid" },
];

const MemberPaymentsPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <CreditCard className="h-5 w-5 text-accent-foreground" />
              Member Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">#</th>
                    <th className="pb-3 font-medium text-muted-foreground">Member</th>
                    <th className="pb-3 font-medium text-muted-foreground">Last Payment</th>
                    <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Next Due</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {memberPayments.map((m, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 font-medium text-foreground">{m.name}</td>
                      <td className="py-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{m.lastPayment}</span>
                      </td>
                      <td className="py-3 font-medium text-foreground">{m.amount}</td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell">{m.nextDue}</td>
                      <td className="py-3">
                        <Badge variant={m.status === "Paid" ? "default" : "destructive"} className={m.status === "Paid" ? "bg-green-600 text-white" : ""}>
                          {m.status === "Paid" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberPaymentsPage;
