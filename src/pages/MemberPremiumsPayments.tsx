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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const memberPayments = [
  {
    name: "Dr. Amina Osei",
    contacts: {
      email: "amina.osei@email.com",
      phone: "0712345678",
    },
    registrationFee: "Ksh 5,000",
    premiumFee: "Ksh 3,600",
    nextDue: "10 Jan 2027",
  },
  {
    name: "Prof. James Kariuki",
    contacts: {
      email: "j.kariuki@email.com",
      phone: "0713456789",
    },
    registrationFee: "Ksh 5,000",
    premiumFee: "Ksh 3,600",
    nextDue: "5 Dec 2026",
  },
  {
    name: "Mary Wanjiku",
    contacts: {
      email: "mary.wanjiku@email.com",
      phone: "0701234567",
    },
    registrationFee: "Ksh 5,000",
    premiumFee: "Ksh 3,600",
    nextDue: "18 Nov 2026",
  },
  {
    name: "John Odhiambo",
    contacts: {
      email: "j.odhiambo@email.com",
      phone: "0721122334",
    },
    registrationFee: "Ksh 5,000",
    premiumFee: "Ksh 3,600",
    nextDue: "2 Mar 2026",
  },
  {
    name: "Grace Muthoni",
    contacts: {
      email: "grace.muthoni@email.com",
      phone: "0715566778",
    },
    registrationFee: "Ksh 5,000",
    premiumFee: "Ksh 3,600",
    nextDue: "29 Jan 2027",
  },
  {
    name: "Peter Kamau",
    contacts: {
      email: "p.kamau@email.com",
      phone: "0729988776",
    },
    registrationFee: "Ksh 5,000",
    premiumFee: "Ksh 3,600",
    nextDue: "14 Feb 2027",
  },
  {
    name: "Sarah Akinyi",
    contacts: {
      email: "sarah.akinyi@email.com",
      phone: "0705566778",
    },
    registrationFee: "Ksh 5,000",
    premiumFee: "Ksh 3,600",
    nextDue: "8 Jun 2025",
  },
  {
    name: "David Mutua",
    contacts: {
      email: "d.mutua@email.com",
      phone: "0723344556",
    },
    registrationFee: "Ksh 5,000",
    premiumFee: "Ksh 3,600",
    nextDue: "20 Feb 2027",
  },
];

const MemberPaymentsPage = () => {
  const navigate = useNavigate();

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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <CreditCard className="h-5 w-5 text-accent-foreground" />
              Member Premiums Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    <th className="pb-3 font-medium text-muted-foreground">
                      Contacts
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Registration Fee
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Premium Fee
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">
                      Next Due
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Action{" "}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memberPayments.map((m, i) => (
                    <tr
                      key={i}
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
                      <td className="py-3 font-medium text-foreground">
                        {m.registrationFee}
                      </td>
                      <td className="py-3 font-muted-medium text-foreground">
                        {m.premiumFee}
                      </td>
                      <td className="py-3 font-medium text-foreground">
                        {m.nextDue}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberPaymentsPage;
