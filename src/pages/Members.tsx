import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Mail, Phone, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const members = [
  { name: "Dr. Amina Osei", email: "amina.osei@gov.ke", phone: "+254 712 345 678", joined: "12 Jan 2024", status: "Active" },
  { name: "Prof. James Kariuki", email: "j.kariuki@gov.ke", phone: "+254 723 456 789", joined: "5 Mar 2023", status: "Active" },
  { name: "Mary Wanjiku", email: "m.wanjiku@gov.ke", phone: "+254 734 567 890", joined: "18 Jul 2024", status: "Active" },
  { name: "John Odhiambo", email: "j.odhiambo@gov.ke", phone: "+254 745 678 901", joined: "2 Sep 2023", status: "Inactive" },
  { name: "Grace Muthoni", email: "g.muthoni@gov.ke", phone: "+254 756 789 012", joined: "29 Nov 2024", status: "Active" },
  { name: "Peter Kamau", email: "p.kamau@gov.ke", phone: "+254 767 890 123", joined: "14 Feb 2025", status: "Active" },
  { name: "Sarah Akinyi", email: "s.akinyi@gov.ke", phone: "+254 778 901 234", joined: "8 Jun 2024", status: "Inactive" },
  { name: "David Mutua", email: "d.mutua@gov.ke", phone: "+254 789 012 345", joined: "20 Aug 2025", status: "Active" },
];

const MembersPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Users className="h-5 w-5 text-accent-foreground" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">#</th>
                    <th className="pb-3 font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 font-medium text-muted-foreground">Email</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 font-medium text-foreground">{m.name}</td>
                      <td className="py-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>
                      </td>
                      <td className="py-3 text-muted-foreground hidden md:table-cell">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>
                      </td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{m.joined}</span>
                      </td>
                      <td className="py-3">
                        <Badge variant={m.status === "Active" ? "default" : "secondary"} className={m.status === "Active" ? "bg-green-600 text-white" : ""}>
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

export default MembersPage;
