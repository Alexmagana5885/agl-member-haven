import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, CalendarDays, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const invoices = [
  { id: "INV-2026-001", date: "12 Dec 2025", description: "Annual Membership Fee", amount: "KES 3,600", status: "Paid" },
  { id: "INV-2025-014", date: "12 Dec 2024", description: "Annual Membership Fee", amount: "KES 3,600", status: "Paid" },
  { id: "INV-2025-009", date: "15 Jun 2025", description: "Conference Registration - EA Library Innovation", amount: "KES 2,500", status: "Paid" },
  { id: "INV-2025-003", date: "20 Mar 2025", description: "Membership Premium", amount: "KES 7,200", status: "Paid" },
  { id: "INV-2024-011", date: "8 Aug 2024", description: "Workshop Fee - Data Management", amount: "KES 1,500", status: "Paid" },
  { id: "INV-2024-005", date: "12 Dec 2023", description: "Annual Membership Fee", amount: "KES 3,600", status: "Paid" },
];

const PaymentInvoicesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDownload = (invoiceId: string) => {
    toast({ title: "Downloading", description: `Preparing invoice ${invoiceId} for download...` });
    // In production this would call an API endpoint to generate/download the PDF
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <FileText className="h-5 w-5 text-accent-foreground" />
              Payment Invoices ({invoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Invoice #</th>
                    <th className="pb-3 font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 font-medium text-muted-foreground">Description</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Amount</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-3 font-medium text-foreground">{inv.id}</td>
                      <td className="py-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{inv.date}</span>
                      </td>
                      <td className="py-3 text-muted-foreground">{inv.description}</td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell">
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{inv.amount}</span>
                      </td>
                      <td className="py-3">
                        <Badge className="bg-green-600 text-white">{inv.status}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDownload(inv.id)}>
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
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

export default PaymentInvoicesPage;
